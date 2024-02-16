terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.1"
    }
  }

  required_version = ">= 1.2.0"
}

# The SQS queue for processing gloss imports
# with the policy that gives api server access to put stuff in
# and the lambda to take stuff out.
resource "aws_sqs_queue" "gloss_import" {
  name                        = var.queue_name
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 300
}
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
      identifiers = [var.app_user_arn]
    }
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.gloss_import.arn]
  }
}
resource "aws_sqs_queue_policy" "gloss_import" {
  queue_url = aws_sqs_queue.gloss_import.id
  policy    = data.aws_iam_policy_document.gloss_import_queue_policy.json
}

# The policy and role for the lambda function
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
  name               = var.lambda_role
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}
resource "aws_iam_role_policy_attachment" "import_glosses_policy_attachment" {
  role       = aws_iam_role.import_glosses_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# The lambda function and queue trigger 
resource "aws_s3_bucket" "lambda" {
  bucket = "gbt-lambda"
}
resource "aws_lambda_function" "test_lambda" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = "import_glosses.zip"
  function_name = "import_glosses"
  handler       = var.lambda_handler
  role          = aws_iam_role.import_glosses_lambda_role.arn
  runtime       = "nodejs18.x"
  timeout       = 300
  memory_size   = 1024
  environment {
    variables = {
      DATABASE_URL = var.database_connection_string
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
