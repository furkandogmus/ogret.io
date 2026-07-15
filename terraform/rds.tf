resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds"
  description = "RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "${local.name_prefix}-rds" }
}

resource "aws_vpc_security_group_ingress_rule" "rds_eks" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = module.eks.node_security_group_id
  from_port                    = local.db_port
  to_port                      = local.db_port
  ip_protocol                  = "tcp"
  description                  = "EKS nodes to RDS"
}

resource "aws_vpc_security_group_egress_rule" "rds_all" {
  security_group_id = aws_security_group.rds.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "All outbound"
}

resource "aws_db_subnet_group" "main" {
  name       = local.name_prefix
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = local.name_prefix }
}

resource "aws_db_parameter_group" "main" {
  name   = local.name_prefix
  family = "postgres15"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }
}

resource "random_password" "db" {
  length  = 16
  special = false
}

resource "aws_db_instance" "main" {
  identifier             = local.name_prefix
  engine                 = "postgres"
  engine_version         = "15.13"
  instance_class         = var.db_instance_class
  db_name                = local.db_name
  username               = local.db_username
  password               = var.db_password != "" ? var.db_password : random_password.db.result
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  allocated_storage     = 20
  max_allocated_storage = 40
  storage_encrypted     = true
  storage_type          = "gp3"

  backup_retention_period = 0
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "${local.name_prefix}-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  auto_minor_version_upgrade = true
  apply_immediately          = true

  tags = { Name = local.name_prefix }
}
