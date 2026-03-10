variable "hetzner_token" {
  description = "Hetzner Cloud API token (read+write)"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone:Edit + DNS:Edit permissions for retainr.dev"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key for VPS access (content of ~/.ssh/id_ed25519.pub)"
  type        = string
}
