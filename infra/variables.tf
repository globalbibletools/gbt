variable "domain" {
  description = "The domain to connect everything to"
  type        = string
  default     = "globalbibletools.com"
}

variable "repo" {
  description = "The repo to deploy from"
  type        = string
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

variable "github_token" {
  description = "Github Token"
  type        = string
  sensitive   = true
}

variable "google_project" {
  description = "Google Project ID"
  type        = string
  sensitive   = true
}

variable "google_font_api_token" {
  description = "Google Font API Token"
  type        = string
  sensitive   = true
}
