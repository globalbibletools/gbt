output "github_role_arn" {
  description = "The ARN of the github role"
  value       = aws_iam_role.github_role.arn
}

