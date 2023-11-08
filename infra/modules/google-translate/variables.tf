variable "service_user" {
  description = "The service user for the translate api"
  type = object({
    id   = string
    name = string
  })
}
