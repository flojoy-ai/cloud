variable "location" {
  type    = string
  default = "canadacentral"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "web-dns-name-label" {
  type    = string
  default = "flojoy-cloud-web"
}

variable "server-dns-name-label" {
  type    = string
  default = "flojoy-cloud-server"
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

variable "database-url" {
  type      = string
  sensitive = true
}

variable "jwt-secret" {
  type      = string
  sensitive = true
}
