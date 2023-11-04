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

data "aws_caller_identity" "current" {}

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
}

### DNS
resource "aws_route53_zone" "main" {
  name = local.domain
}

### Database
resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_default_security_group" "default" {
  vpc_id = aws_default_vpc.default.id

  ingress {
    protocol  = -1
    self      = true
    from_port = 0
    to_port   = 0
  }
  ingress {
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

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
  backup_window                = "09:12-09:42"
  backup_retention_period      = 3
  apply_immediately            = true
}

resource "postgresql_role" "app" {
  login    = true
  name     = var.app_prod_db_username
  password = var.app_prod_db_password
}

resource "postgresql_database" "prod" {
  name = "prod"
}

resource "postgresql_grant" "create" {
  database    = "prod"
  role        = postgresql_role.app.name
  schema      = "public"
  object_type = "database"
  privileges  = ["CREATE"]
}


### API Server Hosting
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

resource "aws_iam_role" "amplify" {
  name               = "amplify"
  assume_role_policy = data.aws_iam_policy_document.amplify_assume_role_policy.json
}

resource "aws_iam_policy" "amplify_logging" {
  name   = "AmplifyLogging"
  policy = data.aws_iam_policy_document.amplify_logging.json
}

resource "aws_iam_role_policy_attachment" "amplify" {
  role       = aws_iam_role.amplify.name
  policy_arn = aws_iam_policy.amplify_logging.arn
}

resource "aws_iam_user" "app_prod" {
  name = "app-prod"
}

resource "aws_iam_access_key" "app_prod" {
  user = aws_iam_user.app_prod.name
}

resource "aws_amplify_app" "api" {
  platform             = "WEB_COMPUTE"
  name                 = "gbt-api"
  repository           = "https://github.com/arrocke/gloss-translation"
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

resource "aws_amplify_branch" "api_main" {
  app_id      = aws_amplify_app.api.id
  branch_name = "main"
  framework   = "Next.js - SSR"
  stage       = "PRODUCTION"
  environment_variables = {
    ACCESS_KEY_ID                = aws_iam_access_key.app_prod.id
    API_ORIGIN                   = "https://api.${local.domain}"
    DATABASE_URL                 = local.prod_db_connection_string
    EMAIL_FROM                   = "noreply@${local.domain}"
    EMAIL_SERVER                 = "smtp://${aws_iam_access_key.smtp_user.id}:${aws_iam_access_key.smtp_user.secret}@email-smtp.us-east-1.amazonaws.com:587"
    GOOGLE_TRANSLATE_CREDENTIALS = google_service_account_key.default.private_key
    ORIGIN_ALLOWLIST             = "https://api.${local.domain},https://interlinear.${local.domain}"
    REDIRECT_ORIGIN              = "https://interlinear.${local.domain}"
    SECRET_ACCESS_KEY            = aws_iam_access_key.app_prod.secret
  }
}

resource "aws_amplify_domain_association" "api" {
  app_id      = aws_amplify_app.api.id
  domain_name = local.domain

  sub_domain {
    branch_name = aws_amplify_branch.api_main.branch_name
    prefix      = "api"
  }
}

### Interlinear server hosting
resource "aws_amplify_app" "interlinear" {
  platform             = "WEB"
  name                 = "gbt-interlinear"
  repository           = "https://github.com/arrocke/gloss-translation"
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
    source = "https://${local.domain}"
    status = "302"
    target = "https://interlinear.${local.domain}"
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

resource "aws_amplify_branch" "interlinear_main" {
  app_id      = aws_amplify_app.interlinear.id
  branch_name = "main"
  framework   = "React"
  stage       = "PRODUCTION"
  environment_variables = {
    API_URL                = "https://api.${local.domain}"
    NX_GOOGLE_FONT_API_KEY = var.google_font_api_token
  }
}

resource "aws_amplify_domain_association" "interlinear" {
  app_id      = aws_amplify_app.interlinear.id
  domain_name = local.domain

  sub_domain {
    branch_name = aws_amplify_branch.interlinear_main.branch_name
    prefix      = "interlinear"
  }

  sub_domain {
    branch_name = aws_amplify_branch.interlinear_main.branch_name
    prefix      = ""
  }
}

### Import Glosses Lambda and SQS Queue
data "aws_iam_policy_document" "gloss_import_queue_policy" {
  version = "2012-10-17"
  statement {
    sid    = "tail"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.import_glosses_lambda_role.arn]
    }
    actions   = ["sqs:DeleteMessage", "sqs:GetQueueAttributes", "sqs:ReceiveMessage"]
    resources = [aws_sqs_queue.gloss_import.arn]
  }
  statement {
    sid    = "head"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.app_prod.arn]
    }
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.gloss_import.arn]
  }
}

resource "aws_sqs_queue" "gloss_import" {
  name                        = "gloss_import.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 300
}

resource "aws_sqs_queue_policy" "gloss_import" {
  queue_url = aws_sqs_queue.gloss_import.id
  policy    = data.aws_iam_policy_document.gloss_import_queue_policy.json
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  version = "2012-10-17"
  statement {
    sid     = "assumerole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "import_glosses_lambda_role" {
  name               = "import_glosses_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
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

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  event_source_arn = aws_sqs_queue.gloss_import.arn
  enabled          = true
  function_name    = aws_lambda_function.test_lambda.arn
  batch_size       = 1
}

### Email
resource "aws_iam_user" "smtp_user" {
  name = "smtp-user"
}

resource "aws_iam_access_key" "smtp_user" {
  user = aws_iam_user.smtp_user.name
}

data "aws_iam_policy_document" "ses_send" {
  statement {
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = [aws_ses_domain_identity.default.arn]
  }
}

resource "aws_iam_policy" "ses_send" {
  name   = "SES-Send"
  policy = data.aws_iam_policy_document.ses_send.json
}

resource "aws_iam_user_policy_attachment" "smtp_user" {
  user       = aws_iam_user.smtp_user.name
  policy_arn = aws_iam_policy.ses_send.arn
}

resource "aws_ses_domain_identity" "default" {
  domain = local.domain
}

resource "aws_route53_record" "ses_verification" {
  zone_id = aws_route53_zone.main.id
  name    = "_amazonses.${local.domain}"
  type    = "TXT"
  records = [aws_ses_domain_identity.default.verification_token]
  ttl     = "600"
}

resource "aws_ses_domain_identity_verification" "example_verification" {
  domain = aws_ses_domain_identity.default.id

  depends_on = [aws_route53_record.ses_verification]
}

resource "aws_ses_domain_dkim" "default" {
  domain = aws_ses_domain_identity.default.domain
}

resource "aws_route53_record" "ses_dkim_record" {
  count   = 3
  zone_id = aws_route53_zone.main.id
  name    = "${aws_ses_domain_dkim.default.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = "600"
  records = ["${aws_ses_domain_dkim.default.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

resource "aws_ses_domain_mail_from" "default" {
  domain           = aws_ses_domain_identity.default.domain
  mail_from_domain = "bounce.${aws_ses_domain_identity.default.domain}"
}

resource "aws_route53_record" "ses_domain_mail_from_mx" {
  zone_id = aws_route53_zone.main.id
  name    = aws_ses_domain_mail_from.default.mail_from_domain
  type    = "MX"
  ttl     = "600"
  records = ["10 feedback-smtp.us-east-1.amazonses.com"]
}

resource "aws_route53_record" "ses_domain_mail_from_txt" {
  zone_id = aws_route53_zone.main.id
  name    = aws_ses_domain_mail_from.default.mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all"]
}

data "aws_iam_policy_document" "ses_notifications" {
  version = "2012-10-17"
  statement {
    sid    = "send"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.smtp_user.arn]
    }
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.ses_notifications.arn]
  }
}

resource "aws_sns_topic" "ses_notifications" {
  name = "ses-notifications"
}

resource "aws_sns_topic_subscription" "ses_notifications_to_server" {
  topic_arn = aws_sns_topic.ses_notifications.arn
  protocol  = "https"
  endpoint  = "https://api.${local.domain}/api/email/notifications"
  delivery_policy = jsonencode({
    "healthyRetryPolicy" : {
      "numRetries" : 3,
      "numNoDelayRetries" : null,
      "minDelayTarget" : 20,
      "maxDelayTarget" : 20,
      "numMinDelayRetries" : null,
      "numMaxDelayRetries" : null,
      "backoffFunction" : "linear"
    },
    "requestPolicy" : {
      "headerContentType" : "application/json"
    }
  })
}

resource "aws_sns_topic_policy" "ses_notifications" {
  arn    = aws_sns_topic.ses_notifications.arn
  policy = data.aws_iam_policy_document.ses_notifications.json
}

### Google Translate API
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
