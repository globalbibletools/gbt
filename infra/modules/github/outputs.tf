output "user_arn" {
  description = "The ARN of the user connected to GitHub Action"
  value       = aws_iam_user.github.arn
}
