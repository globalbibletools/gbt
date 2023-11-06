variable "tfc_organization_name" {
  description = "Org name for Terraform Cloud"
  type        = string
}

variable "tfc_project_name" {
  description = "Project name for Terraform Cloud"
  type        = string
}

variable "tfc_workspace_name" {
  description = "Workspace name for Terraform Cloud"
  type        = string
}

variable "gcp_project_id" {
  description = "Google cloud project ID"
  type        = string
}
