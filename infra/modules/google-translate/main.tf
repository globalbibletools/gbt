terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.4"
    }
  }

  required_version = ">= 1.2.0"
}

# Enable the translate api
resource "google_project_service" "cloud_translation" {
  service = "translate.googleapis.com"
}

# Service user for translate requests
resource "google_service_account" "default" {
  account_id   = var.service_user
  display_name = "Global Bible Tools API"
  description  = "Enables API server to use Google Translate"
}
resource "google_service_account_key" "default" {
  service_account_id = google_service_account.default.name
}
resource "google_service_account_iam_binding" "cloud_translate_user" {
  service_account_id = google_service_account.default.name
  role               = "roles/cloudtranslate.user"
  members            = []
}
