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

variable "github_token" {
  description = "Github Token"
  type        = string
  sensitive   = true
}
