output "server_ip" {
  description = "Public IPv4 address of the VPS"
  value       = hcloud_server.retainr.ipv4_address
}

output "server_id" {
  description = "Hetzner server ID"
  value       = hcloud_server.retainr.id
}

output "volume_id" {
  description = "Hetzner volume ID"
  value       = hcloud_volume.retainr_data.id
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh retainr@${hcloud_server.retainr.ipv4_address}"
}
