# Vercel Terraform

Deploy a Vercel project using the official `vercel/vercel` Terraform provider.

## Prerequisites

1. Create an API token at https://vercel.com/account/tokens
2. (Team accounts only) Note your Team ID from Settings → General

## Setup

```bash
cd vercel

# Set your API token
export VERCEL_API_TOKEN="your-token"

# (Optional) prepare your values file
cp terraform.tfvars.example terraform.tfvars
# ... edit terraform.tfvars ...

terraform init
terraform plan
terraform apply
```

## Notes

- The provider reads the token from the `VERCEL_API_TOKEN` environment variable.
- If `source_path` is left empty (`""`), only the project, env vars, and domains
  are managed. Connect your Git repo to Vercel and it will auto-deploy on push.
- If `source_path` points at your app directory, `vercel_deployment` will upload
  files and trigger a deployment on every apply. Use a remote backend so state
  is shared safely.
- Store `terraform.tfvars` out of version control if it contains secrets.
