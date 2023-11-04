variable "queue_name" {
  description = "the name of the queue store import jobs"
  type        = string
  default     = "gloss_import.fifo"
}

variable "lambda_role" {
  description = "The name of the role used by the lamdba function"
  type        = string
  default     = "import_glosses_lambda_role"
}

variable "lambda_source_dir" {
  description = "The directory of the lambda source code"
  type        = string
}

variable "lambda_handler" {
  description = "The handler function in the lambda source code"
  type        = string
  default     = "main.lambdaHandler"
}

variable "database_connection_string" {
  description = "Connection string to the database"
  type        = string
  sensitive   = true
}

variable "app_user_arn" {
  description = "ARN for the user for the app"
  type        = string
}
