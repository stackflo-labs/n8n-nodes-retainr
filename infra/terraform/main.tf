terraform {
  required_version = ">= 1.6"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.49"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.40"
    }
  }

  # Store state in Terraform Cloud or a local backend
  # For production: use remote backend (Terraform Cloud free tier)
  backend "local" {
    path = "terraform.tfstate"
  }
}

# ── Providers ─────────────────────────────────────────────────────────────────

provider "hcloud" {
  token = var.hetzner_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ── SSH Key ───────────────────────────────────────────────────────────────────

resource "hcloud_ssh_key" "deploy" {
  name       = "retainr-deploy"
  public_key = var.ssh_public_key
}

# ── VPS ───────────────────────────────────────────────────────────────────────

resource "hcloud_server" "retainr" {
  name        = "retainr-prod"
  server_type = "cx32"        # 4 vCPU, 8 GB RAM, ~€10/month
  image       = "ubuntu-24.04"
  location    = "fsn1"        # Falkenstein, Germany
  ssh_keys    = [hcloud_ssh_key.deploy.id]

  user_data = templatefile("${path.module}/cloud-init.yaml", {
    app_user    = "retainr"
    ssh_pub_key = var.ssh_public_key
  })

  labels = {
    env     = "production"
    project = "retainr"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [user_data]
  }
}

# ── Firewall ──────────────────────────────────────────────────────────────────

resource "hcloud_firewall" "retainr" {
  name = "retainr-firewall"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
    description = "SSH"
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
    description = "HTTP (Caddy redirect to HTTPS)"
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
    description = "HTTPS"
  }

  rule {
    direction  = "in"
    protocol   = "icmp"
    source_ips = ["0.0.0.0/0", "::/0"]
    description = "Ping"
  }
}

resource "hcloud_firewall_attachment" "retainr" {
  firewall_id = hcloud_firewall.retainr.id
  server_ids  = [hcloud_server.retainr.id]
}

# ── Volume (backups + PDF storage temp) ──────────────────────────────────────

resource "hcloud_volume" "retainr_data" {
  name      = "retainr-data"
  size      = 50
  server_id = hcloud_server.retainr.id
  automount = true
  format    = "ext4"

  lifecycle {
    prevent_destroy = true
  }
}

# ── Cloudflare DNS ────────────────────────────────────────────────────────────

data "cloudflare_zones" "retainr" {
  filter {
    name = "retainr.dev"
  }
}

locals {
  zone_id = data.cloudflare_zones.retainr.zones[0].id
  server_ip = hcloud_server.retainr.ipv4_address
}

# Root domain → web (Vercel handles this separately, or point here)
resource "cloudflare_record" "root" {
  zone_id = local.zone_id
  name    = "@"
  type    = "A"
  value   = local.server_ip
  proxied = true   # Cloudflare proxy = DDoS protection + WAF
  ttl     = 1      # Auto when proxied
}

resource "cloudflare_record" "www" {
  zone_id = local.zone_id
  name    = "www"
  type    = "CNAME"
  value   = "retainr.dev"
  proxied = true
  ttl     = 1
}

# API subdomain → VPS (proxied through Cloudflare)
resource "cloudflare_record" "api" {
  zone_id = local.zone_id
  name    = "api"
  type    = "A"
  value   = local.server_ip
  proxied = true
  ttl     = 1
}

# Cloudflare WAF rules for API protection
resource "cloudflare_ruleset" "retainr_waf" {
  zone_id     = local.zone_id
  name        = "retainr WAF"
  description = "Custom WAF rules for retainr.dev"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  rules {
    action      = "block"
    description = "Block common scanner paths"
    expression  = "(http.request.uri.path contains \"/wp-admin\") or (http.request.uri.path contains \"/phpMyAdmin\") or (http.request.uri.path contains \"/.env\")"
    enabled     = true
  }

  rules {
    action      = "challenge"
    description = "Challenge high-rate requesters to API"
    expression  = "(http.host eq \"api.retainr.dev\" and rate(http.request.uri.path, 60s) > 200)"
    enabled     = true
  }
}

# Cloudflare Page Rules: cache static, no-cache API
resource "cloudflare_page_rule" "api_no_cache" {
  zone_id  = local.zone_id
  target   = "api.retainr.dev/*"
  priority = 1

  actions {
    cache_level = "bypass"
  }
}
