variable "github_token" {
  description = "GitHub Token to connect repo to amplify"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "The domain name for the app"
  type        = string
}

variable "amplify_role" {
  description = "The AWS role to create for the amplify servers."
  type        = string
  default     = "amplify"
}

variable "api_user" {
  description = "The AWS user for the API server to access AWS resources"
  type        = string
  default     = "app-prod"
}

variable "api_branch" {
  description = "The branch to deploy the API server from"
  type        = string
  default     = "main"
}

variable "interlinear_branch" {
  description = "The branch to deploy the interlinear server from"
  type        = string
  default     = "main"
}

variable "repo" {
  description = "The GitHub repo to connect amplify to"
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
