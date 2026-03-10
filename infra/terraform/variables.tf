variable "scaleway_access_key" {
  description = "Scaleway IAM access key (SCW_ACCESS_KEY)"
  type        = string
  sensitive   = true
}

variable "scaleway_secret_key" {
  description = "Scaleway IAM secret key (SCW_SECRET_KEY)"
  type        = string
  sensitive   = true
}

variable "scaleway_project_id" {
  description = "Scaleway project ID (SCW_DEFAULT_PROJECT_ID)"
  type        = string
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
