output "stmp_url" {
  description = "The SMTP URL used to send emails."
  value       = "smtp://${aws_iam_access_key.smtp_user.id}:${aws_iam_access_key.smtp_user.secret}@email-smtp.us-east-1.amazonaws.com:587"
}
