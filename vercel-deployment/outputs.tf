output "project_id" {
  description = "ID of the Vercel project"
  value       = vercel_project.web.id
}

output "project_url" {
  description = "URL of the Vercel project"
  value       = "https://${var.project_name}.vercel.app"
}

output "deployment_url" {
  description = "URL of the latest deployment (empty when source_path is not set)"
  value       = length(vercel_deployment.prod) > 0 ? vercel_deployment.prod[0].url : ""
}

output "domains" {
  description = "Configured custom domains"
  value       = keys(var.domains)
}
