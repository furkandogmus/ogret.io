# AWS + EKS + Argo CD bootstrap

`terraform apply` provisions the VPC, EKS, RDS, S3, SES permissions, AWS
Secrets Manager entries, EKS Pod Identity associations, External Secrets, Argo
CD, and the Argo application for the private GitOps repository.

Before applying, provide the read-only SSH deploy key that Argo CD uses to
clone the GitOps repository without writing it to a file:

```bash
export TF_VAR_gitops_repository_ssh_private_key="$(pbpaste)"
terraform -chdir=terraform init
terraform -chdir=terraform apply
```

The bootstrap application syncs `apps/ogret` from the GitOps repository. The
GitOps repo must be merged before the first apply so that its production
Kustomize overlay and ExternalSecret definitions are available.
