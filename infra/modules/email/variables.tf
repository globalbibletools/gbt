variable "smtp_user" {
  description = "The username for the smtp user account"
  type        = string
  default     = "smtp-user"
}

variable "mail_from_subdomain" {
  description = "The subdomain to use for the mail from domain"
  type        = string
  default     = "bounce"
}

variable "sns_topic" {
  description = "The SNS topic to use for bounces and complaints"
  type        = string
  default     = "ses-notifications"
}

variable "bounce_subscription_url" {
  description = "The URL to send bounces and complaints to"
  type        = string
}

variable "domain" {
  description = "The domain name used to send emails from"
  type        = string
}

variable "aws_route53_zone_id" {
  description = "The id of the route 53 zone for adding DNS records to"
  type        = string
}
