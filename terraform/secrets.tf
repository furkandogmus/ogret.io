resource "random_password" "jwt" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "database" {
  name                    = "/ogret/prod/db"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    password = var.db_password != "" ? var.db_password : random_password.db.result
    username = local.db_username
    url      = "jdbc:postgresql://${aws_db_instance.main.address}:${aws_db_instance.main.port}/${local.db_name}"
  })
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "/ogret/prod/jwt"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({ secret = random_password.jwt.result })
}

resource "aws_secretsmanager_secret" "aws" {
  name                    = "/ogret/prod/aws"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "aws" {
  secret_id     = aws_secretsmanager_secret.aws.id
  secret_string = jsonencode({ region = var.region })
}
