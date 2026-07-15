resource "aws_iam_policy" "s3_access" {
  name        = "${var.cluster_name}-s3-access"
  description = "S3 access for ogret.io backend"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ]
      Resource = [
        aws_s3_bucket.public.arn,
        "${aws_s3_bucket.public.arn}/*",
        aws_s3_bucket.private.arn,
        "${aws_s3_bucket.private.arn}/*",
      ]
    }]
  })
}

resource "aws_iam_role" "backend_irsa" {
  name = "${var.cluster_name}-backend-pod-identity"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "pods.eks.amazonaws.com"
      }
      Action = ["sts:AssumeRole", "sts:TagSession"]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_s3" {
  role       = aws_iam_role.backend_irsa.name
  policy_arn = aws_iam_policy.s3_access.arn
}

resource "aws_eks_pod_identity_association" "backend" {
  cluster_name    = module.eks.cluster_name
  namespace       = "dersplatform"
  service_account = "backend"
  role_arn        = aws_iam_role.backend_irsa.arn
}

resource "aws_iam_policy" "external_secrets" {
  name        = "${var.cluster_name}-external-secrets"
  description = "Read ogret.io runtime configuration from AWS Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetSecretValue"
      ]
      Resource = "${local.secrets_manager_arn_prefix}:secret:/ogret/prod/*"
    }]
  })
}

resource "aws_iam_role" "external_secrets" {
  name = "${var.cluster_name}-external-secrets-pod-identity"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "pods.eks.amazonaws.com"
      }
      Action = ["sts:AssumeRole", "sts:TagSession"]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "external_secrets" {
  role       = aws_iam_role.external_secrets.name
  policy_arn = aws_iam_policy.external_secrets.arn
}

resource "aws_eks_pod_identity_association" "external_secrets" {
  cluster_name    = module.eks.cluster_name
  namespace       = "external-secrets"
  service_account = "external-secrets"
  role_arn        = aws_iam_role.external_secrets.arn
}

data "http" "aws_load_balancer_controller_policy" {
  # Pinned upstream policy matching AWS Load Balancer Controller v2.14.1.
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.14.1/docs/install/iam_policy.json"
}

resource "aws_iam_policy" "aws_load_balancer_controller" {
  name        = "${var.cluster_name}-aws-load-balancer-controller"
  description = "Permissions required by AWS Load Balancer Controller"
  policy      = data.http.aws_load_balancer_controller_policy.response_body
}

resource "aws_iam_role" "aws_load_balancer_controller" {
  name = "${var.cluster_name}-aws-load-balancer-controller-pod-identity"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "pods.eks.amazonaws.com"
      }
      Action = ["sts:AssumeRole", "sts:TagSession"]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  role       = aws_iam_role.aws_load_balancer_controller.name
  policy_arn = aws_iam_policy.aws_load_balancer_controller.arn
}

resource "aws_eks_pod_identity_association" "aws_load_balancer_controller" {
  cluster_name    = module.eks.cluster_name
  namespace       = "kube-system"
  service_account = "aws-load-balancer-controller"
  role_arn        = aws_iam_role.aws_load_balancer_controller.arn
}
