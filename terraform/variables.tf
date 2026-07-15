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

variable "gitops_repository_url" {
  description = "SSH URL of the private GitOps repository Argo CD must synchronize"
  type        = string
  default     = "git@github.com:furkandogmus/ogret.io-gitops.git"
}

variable "gitops_repository_ssh_private_key" {
  description = "Read-only GitHub deploy key for the GitOps repository. Supply with TF_VAR_gitops_repository_ssh_private_key."
  type        = string
  sensitive   = true
}

variable "argocd_chart_version" {
  description = "Pinned Argo CD Helm chart version"
  type        = string
  default     = "7.8.26"
}

variable "external_secrets_chart_version" {
  description = "Pinned External Secrets Helm chart version"
  type        = string
  default     = "0.16.2"
}

variable "aws_load_balancer_controller_chart_version" {
  description = "Pinned AWS Load Balancer Controller Helm chart version"
  type        = string
  default     = "1.14.0"
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "ogret.io"
  }
}
