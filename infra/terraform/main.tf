terraform {
  required_version = ">= 1.6"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.45"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.40"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

# ── Providers ─────────────────────────────────────────────────────────────────

provider "scaleway" {
  access_key = var.scaleway_access_key
  secret_key = var.scaleway_secret_key
  project_id = var.scaleway_project_id
  zone       = "fr-par-1"
  region     = "fr-par"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ── SSH Key ───────────────────────────────────────────────────────────────────

resource "scaleway_iam_ssh_key" "deploy" {
  name       = "retainr-deploy"
  public_key = var.ssh_public_key
}

# ── VPS ───────────────────────────────────────────────────────────────────────

resource "scaleway_instance_server" "retainr" {
  name  = "retainr-prod"
  type  = "DEV1-S"        # 2 vCPU, 2 GB RAM, 20 GB SSD, ~€7/month
  image = "ubuntu_jammy"  # Ubuntu 22.04 LTS
  zone  = "fr-par-1"      # Paris, France (GDPR-native)

  ip_id = scaleway_instance_ip.retainr.id

  root_volume {
    size_in_gb            = 20
    delete_on_termination = false
  }

  additional_volume_ids = [scaleway_instance_volume.retainr_data.id]

  user_data = {
    cloud-init = templatefile("${path.module}/cloud-init.yaml", {
      app_user    = "retainr"
      ssh_pub_key = var.ssh_public_key
    })
  }

  tags = ["env:production", "project:retainr"]

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [user_data]
  }
}

resource "scaleway_instance_ip" "retainr" {
  zone = "fr-par-1"
}

# ── Security Group (Firewall) ─────────────────────────────────────────────────

resource "scaleway_instance_security_group" "retainr" {
  name                    = "retainr-sg"
  inbound_default_policy  = "drop"
  outbound_default_policy = "accept"

  inbound_rule {
    action   = "accept"
    protocol = "TCP"
    port     = 22
  }

  inbound_rule {
    action   = "accept"
    protocol = "TCP"
    port     = 80
  }

  inbound_rule {
    action   = "accept"
    protocol = "TCP"
    port     = 443
  }

  inbound_rule {
    action   = "accept"
    protocol = "ICMP"
  }
}

resource "scaleway_instance_security_group_rules" "retainr" {
  security_group_id = scaleway_instance_security_group.retainr.id
}

# ── Additional Volume (pgdata + backups) ─────────────────────────────────────
# Instance volume — attached as /dev/sdb, mounted to /opt/retainr/data in cloud-init

resource "scaleway_instance_volume" "retainr_data" {
  name       = "retainr-data"
  type       = "b_ssd"   # Block SSD — persistent, survives server restart
  size_in_gb = 50
  zone       = "fr-par-1"

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
  zone_id   = data.cloudflare_zones.retainr.zones[0].id
  server_ip = scaleway_instance_ip.retainr.address
}

# Root domain → web
resource "cloudflare_record" "root" {
  zone_id = local.zone_id
  name    = "@"
  type    = "A"
  value   = local.server_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "www" {
  zone_id = local.zone_id
  name    = "www"
  type    = "CNAME"
  value   = "retainr.dev"
  proxied = true
  ttl     = 1
}

# API subdomain → VPS
resource "cloudflare_record" "api" {
  zone_id = local.zone_id
  name    = "api"
  type    = "A"
  value   = local.server_ip
  proxied = true
  ttl     = 1
}

# Analytics subdomain → Umami (via Dokploy/Traefik)
resource "cloudflare_record" "analytics" {
  zone_id = local.zone_id
  name    = "analytics"
  type    = "A"
  value   = local.server_ip
  proxied = true
  ttl     = 1
}

# Staging subdomains → same VPS, Traefik routes by hostname
resource "cloudflare_record" "staging_api" {
  zone_id = local.zone_id
  name    = "staging.api"
  type    = "A"
  value   = local.server_ip
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "staging_web" {
  zone_id = local.zone_id
  name    = "staging"
  type    = "A"
  value   = local.server_ip
  proxied = true
  ttl     = 1
}

# Dokploy management UI
resource "cloudflare_record" "dokploy" {
  zone_id = local.zone_id
  name    = "dokploy"
  type    = "A"
  value   = local.server_ip
  proxied = false  # Direct — Traefik handles TLS for Dokploy UI too
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

# Cloudflare Page Rules: no-cache API
resource "cloudflare_page_rule" "api_no_cache" {
  zone_id  = local.zone_id
  target   = "api.retainr.dev/*"
  priority = 1

  actions {
    cache_level = "bypass"
  }
}
