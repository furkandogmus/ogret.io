#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$SCRIPT_DIR/terraform"

echo "==> ogret.io Deployment Script"
echo ""

# ── Step 1: Terraform (infra) ──────────────────────────────────
echo "==> [1/4] Terraform init & apply..."
cd "$TF_DIR"
if [ ! -f terraform.tfvars ]; then
  echo "  No terraform.tfvars found. Creating from example..."
  cp terraform.tfvars.example terraform.tfvars
  echo "  ✏️  Edit terraform/terraform.tfvars with your values, then re-run."
  exit 1
fi

terraform init -upgrade -input=false
terraform apply -auto-approve

# ── Step 2: Capture outputs ─────────────────────────────────────
echo "==> [2/4] Capturing Terraform outputs..."
DB_ENDPOINT="$(terraform output -raw db_endpoint)"
DB_PORT="$(terraform output -raw db_port)"
DB_PASSWORD="$(terraform output -raw db_password)"
CLUSTER_NAME="$(terraform output -raw cluster_name)"
NODE_SG_ID="$(terraform output -raw node_security_group_id)"
S3_PUBLIC_BUCKET="$(terraform output -raw s3_public_bucket)"
S3_PRIVATE_BUCKET="$(terraform output -raw s3_private_bucket)"
IRSA_ROLE_ARN="$(terraform output -raw backend_irsa_role_arn)"

echo "  DB:    $DB_ENDPOINT:$DB_PORT"
echo "  S3:    $S3_PUBLIC_BUCKET / $S3_PRIVATE_BUCKET"
echo "  EKS:   $CLUSTER_NAME"

# ── Step 3: Configure kubectl ───────────────────────────────────
echo "==> [3/4] Configuring kubectl..."
aws eks update-kubeconfig --region eu-north-1 --name "$CLUSTER_NAME"

# ── Step 4: Deploy k8s manifests ────────────────────────────────
echo "==> [4/4] Deploying Kubernetes manifests..."

# Create namespace if it doesn't exist
kubectl create namespace dersplatform --dry-run=client -o yaml | kubectl apply -f -

# Create the secret with dynamic credentials
kubectl delete secret -n dersplatform dersplatform-secret --ignore-not-found
kubectl create secret generic dersplatform-secret -n dersplatform \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --from-literal=JWT_SECRET="$(openssl rand -base64 32)" \
  --from-literal=AWS_S3_ACCESS_KEY="" \
  --from-literal=AWS_S3_SECRET_KEY=""

# Annotate the backend SA with the IRSA role
kubectl annotate serviceaccount -n dersplatform backend \
  "eks.amazonaws.com/role-arn=$IRSA_ROLE_ARN" --overwrite

# Deploy using kustomize
kubectl apply -k "$SCRIPT_DIR/kubernetes/overlays/dev"

echo ""
echo "✅ Deployment complete!"
echo "   Load balancer URL will be ready in a few minutes."
echo "   Check: kubectl get ingress -n dersplatform"
