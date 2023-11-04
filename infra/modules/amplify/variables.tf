variable "github_token" {
  description = "GitHub Token to connect repo to amplify"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "The domain name for the app"
  type        = string
}

variable "database_url" {
  description = "The postgresql connection string for the server."
  type        = string
  sensitive   = true
}

variable "email_server" {
  description = "The smtp url used to send email from the server"
  type        = string
  sensitive   = true
}

variable "translate_credentials" {
  description = "The credentials for the Google Cloud Translate API"
  type        = string
  sensitive   = true
}

variable "google_font_api_token" {
  description = "The token used to make requests agains the Google Fonts API"
  type        = string
  sensitive   = true
}
