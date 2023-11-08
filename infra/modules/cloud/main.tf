terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }

    google = {
      source  = "hashicorp/google"
      version = "~> 5.4"
    }
  }

  required_version = ">= 1.2.0"
}

### AWS
# Creates AWS role that can be assumed by Terraform Cloud
data "tls_certificate" "tfc_certificate" {
  url = "https://app.terraform.io"
}
resource "aws_iam_openid_connect_provider" "tfc_provider" {
  url             = data.tls_certificate.tfc_certificate.url
  client_id_list  = ["aws.workload.identity"]
  thumbprint_list = [data.tls_certificate.tfc_certificate.certificates[0].sha1_fingerprint]
}
data "aws_iam_policy_document" "tfc_assume_role_policy" {
  version = "2012-10-17"
  statement {
    sid     = "assumerole"
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.tfc_provider.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "app.terraform.io:aud"
      values   = [one(aws_iam_openid_connect_provider.tfc_provider.client_id_list)]
    }
    condition {
      test     = "StringLike"
      variable = "app.terraform.io:sub"
      values   = ["organization:${var.tfc_organization_name}:project:${var.tfc_project_name}:workspace:${var.tfc_workspace_name}:run_phase:*"]
    }
  }
}
resource "aws_iam_role" "tfc_role" {
  name               = "tfc-role"
  assume_role_policy = data.aws_iam_policy_document.tfc_assume_role_policy.json
}

# Policy for what AWS terraform role has access to
# TODO: replace with narrow polify
resource "aws_iam_role_policy_attachment" "tfc_policy_attachment" {
  role       = aws_iam_role.tfc_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

### Google Cloud
# These google cloud apis are necessary for Terraform to assume service role.
resource "google_project_service" "iam_credentials" {
  service = "iamcredentials.googleapis.com"
}
resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
}
resource "google_project_service" "cloud_resource_manager" {
  service = "cloudresourcemanager.googleapis.com"
}
resource "google_project_service" "service_usage" {
  service = "serviceusage.googleapis.com"
}

# Creates Google service role that can be assumed by Terraform Cloud
resource "google_iam_workload_identity_pool" "tfc_pool" {
  workload_identity_pool_id = "my-tfc-pool"
}
resource "google_iam_workload_identity_pool_provider" "tfc_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.tfc_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "my-tfc-provider-id"

  attribute_mapping = {
    "google.subject"                        = "assertion.sub",
    "attribute.aud"                         = "assertion.aud",
    "attribute.terraform_run_phase"         = "assertion.terraform_run_phase",
    "attribute.terraform_project_id"        = "assertion.terraform_project_id",
    "attribute.terraform_project_name"      = "assertion.terraform_project_name",
    "attribute.terraform_workspace_id"      = "assertion.terraform_workspace_id",
    "attribute.terraform_workspace_name"    = "assertion.terraform_workspace_name",
    "attribute.terraform_organization_id"   = "assertion.terraform_organization_id",
    "attribute.terraform_organization_name" = "assertion.terraform_organization_name",
    "attribute.terraform_run_id"            = "assertion.terraform_run_id",
    "attribute.terraform_full_workspace"    = "assertion.terraform_full_workspace",
  }
  oidc {
    issuer_uri = "https://app.terraform.io"
  }
  attribute_condition = "assertion.sub.startsWith(\"organization:${var.tfc_organization_name}:project:${var.tfc_project_name}:workspace:${var.tfc_workspace_name}\")"
}
resource "google_service_account" "tfc_service_account" {
  account_id   = "tfc-service-account"
  display_name = "Terraform Cloud Service Account"
}
resource "google_service_account_iam_member" "tfc_service_account_member" {
  service_account_id = google_service_account.tfc_service_account.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.tfc_pool.name}/*"
}

# Policy for what GCP terraform role has access to
# TODO: replace with narrow policy
resource "google_project_iam_member" "tfc_project_member" {
  project = var.gcp_project_id
  role    = "roles/owner"
  member  = "serviceAccount:${google_service_account.tfc_service_account.email}"
}
