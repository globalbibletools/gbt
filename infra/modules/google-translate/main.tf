terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.4"
    }
  }

  required_version = ">= 1.2.0"
}

resource "google_service_account" "default" {
  account_id   = "global-bible-tools-api"
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

resource "google_project_service" "cloud_translation" {
  service = "translate.googleapis.com"
}
