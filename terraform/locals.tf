locals {
  name_prefix = var.cluster_name
  vpc_cidr    = "10.0.0.0/16"

  azs = ["${var.region}a", "${var.region}b", "${var.region}c"]

  public_subnets  = [for i, az in local.azs : cidrsubnet(local.vpc_cidr, 8, i)]
  private_subnets = [for i, az in local.azs : cidrsubnet(local.vpc_cidr, 8, i + 3)]

  db_name     = "dersplatform"
  db_username = "dersplatform"
  db_port     = 5432
}
