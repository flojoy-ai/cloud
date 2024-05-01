variable "location" {
  type    = string
  default = "canadacentral"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "entra-client-id" {
  type      = string
  sensitive = true
}

variable "entra-client-secret" {
  type      = string
  sensitive = true
}

variable "entra-tenant-id" {
  type      = string
  sensitive = true
}

variable "jwt-secret" {
  type      = string
  sensitive = true
}

variable "web-uri" {
  type    = string
  default = "azure-flojoy-cloud-web.flojoy.ai"
}

variable "server-uri" {
  type    = string
  default = "azure-flojoy-cloud-server.flojoy.ai"
}
