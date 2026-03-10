output "server_ip" {
  description = "Public IPv4 address of the VPS"
  value       = scaleway_instance_ip.retainr.address
}

output "server_id" {
  description = "Scaleway instance server ID"
  value       = scaleway_instance_server.retainr.id
}

output "volume_id" {
  description = "Scaleway instance volume ID"
  value       = scaleway_instance_volume.retainr_data.id
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh retainr@${scaleway_instance_ip.retainr.address}"
}

