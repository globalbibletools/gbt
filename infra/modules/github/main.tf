terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.1"
    }

    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.2.0"
}

resource "aws_iam_user" "github" {
  name = "github"
}
resource "aws_iam_access_key" "github" {
  user = aws_iam_user.github.name
}

resource "github_actions_secret" "aws_key_id" {
  repository      = "gbt"
  secret_name     = "AWS_KEY_ID"
  encrypted_value = aws_iam_access_key.github.id
}
resource "github_actions_secret" "aws_secret_key" {
  repository      = "gbt"
  secret_name     = "AWS_SECRET_KEY"
  encrypted_value = aws_iam_access_key.github.secret
}
