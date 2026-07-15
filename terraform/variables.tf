variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "ogret-test"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "node_instance_type" {
  description = "EKS node instance type"
  type        = string
  default     = "t3.small"
}

variable "node_group_min_size" {
  description = "EKS node group min size"
  type        = number
  default     = 2
}

variable "node_group_max_size" {
  description = "EKS node group max size"
  type        = number
  default     = 4
}

variable "node_group_desired_size" {
  description = "EKS node group desired size"
  type        = number
  default     = 2
}

variable "ses_domain" {
  description = "Verified SES sending domain. Publish the DKIM DNS records shown after apply."
  type        = string
  default     = "ogret.io"
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "ogret.io"
  }
}
