terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }

    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.21"
    }

    google = {
      source  = "hashicorp/google"
      version = "~> 5.4"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = var.google_project
  region  = "us-central-1"
}

locals {
  domain = "globalbibletools.com"
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

### DNS
resource "aws_route53_zone" "main" {
  name = local.domain
}

### Database
module "database" {
  source = "./modules/database"

  admin_prod_db_username = var.admin_prod_db_username
  admin_prod_db_password = var.admin_prod_db_password
  app_prod_db_username   = var.app_prod_db_username
  app_prod_db_password   = var.app_prod_db_password
}

### API Server Hosting
module "amplify" {
  source = "./modules/amplify"

  github_token          = var.github_token
  domain                = local.domain
  database_url          = module.database.connection_string
  email_server          = module.email.stmp_url
  translate_credentials = module.google_translate.credentials
  google_font_api_token = var.google_font_api_token
}

### Import Glosses Lambda and SQS Queue
module "lambda_import" {
  source = "./modules/lambda-import"

  database_connection_string = module.database.connection_string
  app_user_arn               = module.amplify.server_user_arn
}

### Email
module "email" {
  source = "./modules/email"

  domain              = local.domain
  aws_route53_zone_id = aws_route53_zone.main.id
}

### Google Translate API
module "google_translate" {
  source = "./modules/google-translate"
}
