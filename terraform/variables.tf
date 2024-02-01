
variable "aws_region" {
  description = "The AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ami_id_linux" {
  description = "The AMI ID for Linux"
  type        = string
}

variable "instance_type_linux" {
  description = "The instance type for Linux"
  type        = string
}

variable "key_name" {
  description = "The key pair name"
  type        = string
}

variable "security_group_ids" {
  description = "The security group IDs"
  type        = list(string)
}
