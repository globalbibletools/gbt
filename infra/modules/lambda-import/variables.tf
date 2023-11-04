variable "database_connection_string" {
  description = "Connection string to the database"
  type        = string
  sensitive   = true
}

variable "app_user_arn" {
  description = "ARN for the user for the app"
  type        = string
}
