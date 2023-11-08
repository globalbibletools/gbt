output "server_user_arn" {
  description = "The ARN of the AWS role connected to the server"
  value       = aws_iam_user.app_prod.arn
}
