output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster CA data for kubeconfig"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.address
}

output "db_port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "db_password" {
  description = "RDS master password"
  value       = var.db_password != "" ? var.db_password : random_password.db.result
  sensitive   = true
}

output "s3_public_bucket" {
  description = "Public S3 bucket name"
  value       = aws_s3_bucket.public.id
}

output "s3_private_bucket" {
  description = "Private S3 bucket name"
  value       = aws_s3_bucket.private.id
}

output "backend_irsa_role_arn" {
  description = "IAM role ARN for backend IRSA"
  value       = aws_iam_role.backend_irsa.arn
}

output "ses_email_identity_arn" {
  description = "SES identity the backend is permitted to send from"
  value       = aws_sesv2_email_identity.sender.arn
}

output "ses_dkim_tokens" {
  description = "Publish these as CNAME records: <token>._domainkey.<ses_domain> -> <token>.dkim.amazonses.com"
  value       = aws_sesv2_email_identity.sender.dkim_signing_attributes[0].tokens
}

output "node_security_group_id" {
  description = "EKS node security group ID"
  value       = module.eks.node_security_group_id
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"
}
