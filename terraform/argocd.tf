provider "helm" {
  kubernetes = {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.region]
    }
  }
}

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_chart_version
  namespace        = "argocd"
  create_namespace = true
  atomic           = true
  timeout          = 900

  set = [
    {
      name  = "server.service.type"
      value = "ClusterIP"
    },
    {
      name  = "configs.params.server.insecure"
      value = "true"
    }
  ]
}

resource "helm_release" "external_secrets" {
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  version          = var.external_secrets_chart_version
  namespace        = "external-secrets"
  create_namespace = true
  atomic           = true
  timeout          = 900

  depends_on = [
    aws_eks_pod_identity_association.external_secrets,
    helm_release.aws_load_balancer_controller
  ]
}

resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = var.aws_load_balancer_controller_chart_version
  namespace  = "kube-system"
  atomic     = true
  timeout    = 900

  set = [
    {
      name  = "clusterName"
      value = module.eks.cluster_name
    },
    {
      name  = "region"
      value = var.region
    },
    {
      name  = "vpcId"
      value = aws_vpc.main.id
    },
    {
      name  = "serviceAccount.name"
      value = "aws-load-balancer-controller"
    }
  ]

  depends_on = [aws_eks_pod_identity_association.aws_load_balancer_controller]
}

resource "tls_private_key" "argocd" {
  algorithm = "ED25519"
}

resource "terraform_data" "github_deploy_key" {
  triggers_replace = [
    tls_private_key.argocd.public_key_openssh
  ]

  provisioner "local-exec" {
    command = <<EOT
      KEYS=$(GITHUB_TOKEN="" gh repo deploy-key list --repo ${var.gitops_repository_url})
      KEY_ID=$(echo "$KEYS" | grep "${var.cluster_name} Argo CD" | awk '{print $1}')
      if [ ! -z "$KEY_ID" ]; then
        echo "Deleting old deploy key ID: $KEY_ID"
        GITHUB_TOKEN="" gh repo deploy-key delete "$KEY_ID" --repo ${var.gitops_repository_url}
      fi

      echo "${tls_private_key.argocd.public_key_openssh}" > argocd_deploy_key.pub
      GITHUB_TOKEN="" gh repo deploy-key add argocd_deploy_key.pub --repo ${var.gitops_repository_url} --title "${var.cluster_name} Argo CD"
      rm argocd_deploy_key.pub
    EOT
  }
}

resource "helm_release" "argocd_bootstrap" {
  name      = "ogret-gitops"
  chart     = "${path.module}/charts/argocd-bootstrap"
  namespace = "argocd"
  atomic    = true
  timeout   = 300

  set = [
    {
      name  = "repository.url"
      value = var.gitops_repository_url
    },
    {
      name  = "aws.region"
      value = var.region
    }
  ]

  set_sensitive = [{
    name  = "repository.sshPrivateKey"
    value = tls_private_key.argocd.private_key_openssh
  }]

  depends_on = [
    helm_release.argocd,
    helm_release.external_secrets,
    helm_release.aws_load_balancer_controller,
    terraform_data.github_deploy_key
  ]
}
