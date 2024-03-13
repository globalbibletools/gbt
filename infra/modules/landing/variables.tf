variable "aws_route53_zone_id" {
  description = "The id of the route 53 zone for adding DNS records to"
  type        = string
}

variable "github_role_arn" {
  description = "ARN for the github role used to deploy the landing site"
  type        = string
}
