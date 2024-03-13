resource "aws_s3_bucket" "this" {
  bucket = "gbt-landing"
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id
}

data "aws_iam_policy_document" "bucket_access" {
  statement {
    sid       = "AllowPublic"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/**"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
  statement {
    sid     = "GitHubDeploy"
    actions = ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject", "s3:ListBucketMultipartUploads", "s3:AbortMultipartUpload"]
    resources = [
      "${aws_s3_bucket.this.arn}/**",
      "${aws_s3_bucket.this.arn}"
    ]
    principals {
      type        = "AWS"
      identifiers = [var.github_role_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id

  policy = data.aws_iam_policy_document.bucket_access.json

  depends_on = [aws_s3_bucket_public_access_block.this]
}

locals {
  s3_origin_id = "${aws_s3_bucket.this.bucket}-origin"
}

resource "aws_cloudfront_function" "redirect_index" {
  name    = "redirect-index"
  runtime = "cloudfront-js-2.0"
  comment = "redirects to index.html"
  publish = true
  code    = <<EOT
  async function handler(event) {
    const request = event.request;
    const uri = request.uri;

    // Check whether the URI is missing a file name.
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Check whether the URI is missing a file extension.
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
  }
  EOT
}

resource "aws_cloudfront_distribution" "this" {
  aliases = ["globalbibletools.com"]


  # TODO: figure out how to redirect to index.html on not found
  # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/example-function-add-index.html
  # custom_error_response {
  #   response_page_path = "index.html"
  #   error_code         = 200
  # }

  enabled = true

  origin {
    origin_id   = local.s3_origin_id
    domain_name = aws_s3_bucket.this.bucket_domain_name
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1"]
    }
  }

  default_cache_behavior {
    target_origin_id = local.s3_origin_id
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.redirect_index.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.root.arn
    ssl_support_method  = "sni-only"
  }

  price_class = "PriceClass_All"
}

resource "aws_route53_record" "this" {
  zone_id = var.aws_route53_zone_id
  name    = ""
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_acm_certificate" "root" {
  domain_name       = "globalbibletools.com"
  validation_method = "DNS"
}

resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.root.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.aws_route53_zone_id
}

resource "aws_acm_certificate_validation" "root" {
  certificate_arn         = aws_acm_certificate.root.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}

