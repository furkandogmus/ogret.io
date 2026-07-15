resource "aws_sesv2_email_identity" "sender" {
  email_identity = var.ses_domain
}

resource "aws_iam_policy" "ses_send_email" {
  name        = "${var.cluster_name}-ses-send-email"
  description = "Allow the ogret.io backend to send transactional email with Amazon SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ]
      Resource = aws_sesv2_email_identity.sender.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_ses" {
  role       = aws_iam_role.backend_irsa.name
  policy_arn = aws_iam_policy.ses_send_email.arn
}
