data "tls_certificate" "cluster" {
  url = module.eks.cluster_oidc_issuer_url
}

resource "aws_iam_openid_connect_provider" "cluster" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.cluster.certificates[0].sha1_fingerprint]
  url             = data.tls_certificate.cluster.url
}

resource "aws_iam_policy" "s3_access" {
  name        = "ogret-s3-access"
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
  name = "${var.cluster_name}-backend-irsa"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.cluster.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub" = "system:serviceaccount:dersplatform:backend"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_s3" {
  role       = aws_iam_role.backend_irsa.name
  policy_arn = aws_iam_policy.s3_access.arn
}
