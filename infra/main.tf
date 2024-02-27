terraform {
  cloud {
    organization = "global-bible-tools"
    workspaces {
      name = "prod"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.1"
    }

    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.21"
    }

    google = {
      source  = "hashicorp/google"
      version = "~> 5.4"
    }

    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "github" {
  owner = "globalbibletools"
  token = var.github_token
}

provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = var.google_project
  region  = "us-central-1"
}

resource "google_project_service" "api_keys" {
  service = "apikeys.googleapis.com"
}

resource "google_apikeys_key" "webfonts_key" {
  name         = "webfont-key"
  display_name = "Web Fonts API Key"

  restrictions {
    api_targets {
      service = "webfonts.googleapis.com"
    }
  }
}

resource "google_apikeys_key" "webfonts_key_dev" {
  name         = "webfont-key-dev"
  display_name = "Web Fonts API Key (Dev)"

  restrictions {
    api_targets {
      service = "webfonts.googleapis.com"
    }
  }
}

provider "postgresql" {
  host            = module.database.host
  port            = module.database.port
  database        = "postgres"
  username        = var.admin_prod_db_username
  password        = var.admin_prod_db_password
  sslmode         = "require"
  connect_timeout = 15
  superuser       = false
}

resource "aws_route53_zone" "main" {
  name = var.domain
}

module "cloud" {
  source = "./modules/cloud"

  tfc_organization_name = "global-bible-tools"
  tfc_project_name      = "Default Project"
  tfc_workspace_name    = "prod"
  gcp_project_id        = var.google_project
}

module "database" {
  source = "./modules/database"

  admin_prod_db_username = var.admin_prod_db_username
  admin_prod_db_password = var.admin_prod_db_password
  app_prod_db_username   = var.app_prod_db_username
  app_prod_db_password   = var.app_prod_db_password
}

module "amplify" {
  source = "./modules/amplify"

  database_url          = module.database.connection_string
  domain                = var.domain
  email_server          = module.email.stmp_url
  github_token          = var.github_token
  google_font_api_token = google_apikeys_key.webfonts_key.key_string
  queue_url             = module.lambda_import.queue_url
  repo                  = var.repo
  translate_credentials = module.google_translate.credentials
}

module "lambda_import" {
  source = "./modules/lambda-import"

  database_connection_string = module.database.connection_string
  app_user_arn               = module.amplify.server_user_arn
}

module "email" {
  source = "./modules/email"

  domain                  = var.domain
  aws_route53_zone_id     = aws_route53_zone.main.id
  bounce_subscription_url = "https://api.${var.domain}/api/email/notifications"
}

module "google_translate" {
  source = "./modules/google-translate"
  service_user = {
    id   = "api-prod"
    name = "API Server"
  }
}

module "google_translate_dev" {
  source = "./modules/google-translate"
  service_user = {
    id   = "api-dev"
    name = "API Server (Dev)"
  }
}

module "github" {
  source = "./modules/github"
}

module "landing" {
  source = "./modules/landing"

  aws_route53_zone_id = aws_route53_zone.main.id
  github_user_arn     = module.github.user_arn
}
