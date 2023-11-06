variable "db_instance_name" {
  description = "The name of the database instance in AWS"
  type        = string
  default     = "prod"
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  default     = "prod"
}

variable "admin_prod_db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "admin_prod_db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "app_prod_db_username" {
  description = "Database app user username"
  type        = string
  sensitive   = true
}

variable "app_prod_db_password" {
  description = "Database app user password"
  type        = string
  sensitive   = true
}
