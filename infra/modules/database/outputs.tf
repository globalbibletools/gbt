output "host" {
  description = "The hostname of the database server"
  value       = aws_db_instance.prod.address
}

output "port" {
  description = "The port number of the database server"
  value       = aws_db_instance.prod.port
}

output "connection_string" {
  description = "The postgresql connection string to the database server"
  value       = "postgresql://${var.app_prod_db_username}:${var.app_prod_db_password}@${aws_db_instance.prod.endpoint}/${postgresql_database.prod.name}?connection_limit=1"
  sensitive   = true
}
