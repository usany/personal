# ---------------------------------------------------------------------------
# Vercel project
# ---------------------------------------------------------------------------
resource "vercel_project" "web" {
  name      = var.project_name
  framework = var.framework

  git_repository = {
    type = var.git_repo_type
    repo = var.git_repo
  }

  build_command    = var.build_command
  install_command  = var.install_command
  output_directory = var.output_directory

  dynamic "environment" {
    for_each = var.environment
    content {
      key    = environment.value.key
      value  = environment.value.value
      target = environment.value.target
    }
  }
}

# ---------------------------------------------------------------------------
# Domains (optional)
# ---------------------------------------------------------------------------
resource "vercel_project_domain" "main" {
  for_each = { for d in var.domains : d.domain => d }

  project_id = vercel_project.web.id
  domain     = each.key

  redirect             = each.value.redirect
  redirect_status_code = each.value.redirect_status_code
}

# ---------------------------------------------------------------------------
# Deployment (optional: only when source_path is provided)
# ---------------------------------------------------------------------------
data "vercel_project_directory" "src" {
  count = var.source_path != "" ? 1 : 0
  path  = var.source_path
}

resource "vercel_deployment" "prod" {
  count = var.source_path != "" ? 1 : 0

  project_id        = vercel_project.web.id
  files             = data.vercel_project_directory.src[0].files
  production        = var.production
  delete_on_destroy = true
}
