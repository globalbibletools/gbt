variable "domain" {
  description = "The domain name used to send emails from"
  type        = string
}

variable "aws_route53_zone_id" {
  description = "The id of the route 53 zone for adding DNS records to"
  type        = string
}
