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
  account_id   = var.service_user.id
  display_name = var.service_user.name
  description  = "Enables API server to use Google Translate"
}
resource "google_service_account_key" "default" {
  service_account_id = google_service_account.default.name
}
data "google_project" "project" {
}
resource "google_project_iam_member" "project" {
  project = data.google_project.project.id
  role    = "roles/cloudtranslate.user"
  member  = google_service_account.default.member
}
