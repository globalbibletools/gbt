terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.1"
    }
  }

  required_version = ">= 1.2.0"
}

data "aws_caller_identity" "current" {}

# AWS service role for amplify
data "aws_iam_policy_document" "amplify_assume_role_policy" {
  version = "2012-10-17"
  statement {
    sid     = "assumerole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "amplify" {
  name               = var.amplify_role
  assume_role_policy = data.aws_iam_policy_document.amplify_assume_role_policy.json
}

# Policy for amplify role so that it can create logs in CloudWatch.
data "aws_iam_policy_document" "amplify_logging" {
  version = "2012-10-17"
  statement {
    sid    = "push"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/amplify/*:log-stream:*"]
  }
  statement {
    sid       = "create"
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup"]
    resources = ["arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/amplify/*"]
  }
  statement {
    sid       = "describe"
    effect    = "Allow"
    actions   = ["logs:DescribeLogGroups"]
    resources = ["arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:*"]
  }
}
resource "aws_iam_policy" "amplify_logging" {
  name   = "AmplifyLogging"
  policy = data.aws_iam_policy_document.amplify_logging.json
}
resource "aws_iam_role_policy_attachment" "amplify" {
  role       = aws_iam_role.amplify.name
  policy_arn = aws_iam_policy.amplify_logging.arn
}

# API server user and key for accessing AWS resources
resource "aws_iam_user" "app_prod" {
  name = var.api_user
}
resource "aws_iam_access_key" "app_prod" {
  user = aws_iam_user.app_prod.name
}

# Amplify configuration for API server
resource "aws_amplify_app" "api" {
  platform             = "WEB_COMPUTE"
  name                 = "gbt-api"
  repository           = var.repo
  access_token         = var.github_token
  iam_service_role_arn = aws_iam_role.amplify.arn

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

# Amplify branch to build and connect to api subdomain
resource "aws_amplify_branch" "api_main" {
  app_id      = aws_amplify_app.api.id
  branch_name = var.api_branch
  framework   = "Next.js - SSR"
  stage       = "PRODUCTION"
  environment_variables = {
    ACCESS_KEY_ID                = aws_iam_access_key.app_prod.id
    API_ORIGIN                   = "https://api.${var.domain}"
    DATABASE_URL                 = var.database_url
    EMAIL_FROM                   = "noreply@${var.domain}"
    EMAIL_SERVER                 = var.email_server
    GOOGLE_TRANSLATE_CREDENTIALS = var.translate_credentials
    LANGUAGE_IMPORT_QUEUE_URL    = var.queue_url
    ORIGIN_ALLOWLIST             = "https://api.${var.domain},https://interlinear.${var.domain}"
    REDIRECT_ORIGIN              = "https://interlinear.${var.domain}"
    SECRET_ACCESS_KEY            = aws_iam_access_key.app_prod.secret
  }
}
resource "aws_amplify_domain_association" "api" {
  app_id      = aws_amplify_app.api.id
  domain_name = var.domain

  sub_domain {
    branch_name = aws_amplify_branch.api_main.branch_name
    prefix      = "api"
  }
}

# Amplify configuration for interlinear server
resource "aws_amplify_app" "interlinear" {
  platform             = "WEB"
  name                 = "gbt-interlinear"
  repository           = var.repo
  access_token         = var.github_token
  iam_service_role_arn = aws_iam_role.amplify.arn

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
                - npx nx build web
          artifacts:
            baseDirectory: dist/packages/web
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
          buildPath: /
        appRoot: packages/web
  EOT

  custom_rule {
    source = "https://${var.domain}"
    status = "302"
    target = "https://interlinear.${var.domain}"
  }

  custom_rule {
    source = "/invite?token=<token>"
    status = "200"
    target = "/index.html?token=<token>"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }
}

# Amplify branch to build and connect to interlinear subdomain
resource "aws_amplify_branch" "interlinear_main" {
  app_id      = aws_amplify_app.interlinear.id
  branch_name = var.interlinear_branch
  framework   = "React"
  stage       = "PRODUCTION"
  environment_variables = {
    API_URL                = "https://api.${var.domain}"
    NX_GOOGLE_FONT_API_KEY = var.google_font_api_token
  }
}
resource "aws_amplify_domain_association" "interlinear" {
  app_id      = aws_amplify_app.interlinear.id
  domain_name = var.domain

  sub_domain {
    branch_name = aws_amplify_branch.interlinear_main.branch_name
    prefix      = "interlinear"
  }
}
