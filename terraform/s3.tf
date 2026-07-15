resource "aws_s3_bucket" "public" {
  bucket = "${var.cluster_name}-public"
}

resource "aws_s3_bucket" "private" {
  bucket = "${var.cluster_name}-private"
}

resource "aws_s3_bucket_public_access_block" "public" {
  bucket = aws_s3_bucket.public.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public" {
  depends_on = [aws_s3_bucket_public_access_block.public]
  bucket     = aws_s3_bucket.public.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicRead"
      Effect    = "Allow"
      Principal = "*"
      Action    = ["s3:GetObject"]
      Resource  = ["${aws_s3_bucket.public.arn}/*"]
    }]
  })
}

resource "aws_s3_bucket_cors_configuration" "public" {
  bucket = aws_s3_bucket.public.id

  cors_rule {
    allowed_origins = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_headers = ["*"]
    max_age_seconds = 3600
  }
}
