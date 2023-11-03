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
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

provider "postgresql" {
  host            = aws_db_instance.prod.address
  port            = aws_db_instance.prod.port
  database        = "postgres"
  username        = var.admin_prod_db_username
  password        = var.admin_prod_db_password
  sslmode         = "require"
  connect_timeout = 15
  superuser       = false
}

locals {
  prod_db_connection_string = "postgresql://${var.app_prod_db_username}:${var.app_prod_db_password}@${aws_db_instance.prod.endpoint}?connection_limit=1"
}


### Database

# TODO: security group settings

resource "aws_db_instance" "prod" {
  engine                       = "postgres"
  identifier                   = "prod"
  allocated_storage            = 20
  engine_version               = "14.9"
  instance_class               = "db.t3.micro"
  username                     = var.admin_prod_db_username
  password                     = var.admin_prod_db_password
  parameter_group_name         = "default.postgres14"
  skip_final_snapshot          = true
  publicly_accessible          = true
  performance_insights_enabled = true
  deletion_protection          = true
  storage_encrypted            = true

  # TODO: backups
}


resource "postgresql_role" "app" {
  login    = true
  name     = var.app_prod_db_username
  password = var.app_prod_db_password
}

resource "postgresql_database" "prod" {
  name = "prod"
}

### Server Hosting
resource "aws_amplify_app" "api" {
  platform     = "WEB_COMPUTE"
  name         = "gbt-api"
  repository   = "https://github.com/arrocke/gloss-translation"
  access_token = var.github_token

  build_spec = <<-EOT
    version: 1
    applications:
      - frontend:
          phases:
            preBuild:
              commands:
                - npm install
            build:
              commands:
                - env | grep -e EMAIL_SERVER -e DATABASE_URL -e EMAIL_FROM -e ORIGIN_ALLOWLIST -e API_ORIGIN -e REDIRECT_ORIGIN -e ACCESS_KEY_ID -e SECRET_ACCESS_KEY -e LANGUAGE_IMPORT_QUEUE_URL -e GOOGLE >> packages/api/.env.production
                - npx nx run db:prisma migrate deploy
                - npx nx build api
          artifacts:
            baseDirectory: dist/packages/api/.next
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
          buildPath: /
        appRoot: packages/api
  EOT

  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }
}

resource "aws_amplify_branch" "master" {
  app_id      = aws_amplify_app.api.id
  branch_name = "main"
  framework   = "Next.js - SSR"
  stage       = "PRODUCTION"
  environment_variables = {
    API_ORIGIN       = "https://api.globalbibletools.com"
    DATABASE_URL     = local.prod_db_connection_string
    EMAIL_FROM       = "noreply@globalbibletools.com"
    ORIGIN_ALLOWLIST = "https://api.globalbibletools.com,https://interlinear.globalbibletools.com"
    REDIRECT_ORIGIN  = "https://interlinear.globalbibletools.com"
  }
}

resource "aws_iam_role" "import_glosses_lambda_role" {
  name               = "import_glosses_lambda_role"
  assume_role_policy = <<EOT
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "lambda.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOT
}

resource "aws_iam_role_policy_attachment" "import_glosses_policy_attachment" {
  role       = aws_iam_role.import_glosses_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "import_glosses_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/packages/lambda-functions/"
  output_path = "${path.module}/../dist/import_glosses.zip"
}

resource "aws_lambda_function" "test_lambda" {
  filename         = "${path.module}/../dist/import_glosses.zip"
  function_name    = "import_glosses"
  handler          = "main.lambdaHandler"
  role             = aws_iam_role.import_glosses_lambda_role.arn
  source_code_hash = data.archive_file.import_glosses_zip.output_base64sha256
  runtime          = "nodejs18.x"
  timeout          = 300
  memory_size      = 1024
  environment {
    variables = {
      DATABASE_URL = local.prod_db_connection_string
    }
  }
  depends_on = [aws_iam_role_policy_attachment.import_glosses_policy_attachment]
}
