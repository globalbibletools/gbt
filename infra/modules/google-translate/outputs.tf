output "credentials" {
  description = "The credentials used to access the cloud translate API"
  value       = google_service_account_key.default.private_key
  sensitive   = true
}
