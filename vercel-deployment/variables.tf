variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "my-app"
}

variable "framework" {
  description = "Framework preset for Vercel build detection"
  type        = string
  default     = "nextjs"
}

variable "git_repo_type" {
  description = "Git provider type (github, gitlab, bitbucket)"
  type        = string
  default     = "github"
}

variable "git_repo" {
  description = "Git repository in the format owner/repo"
  type        = string
  default     = "you/my-app"
}

variable "build_command" {
  description = "Command Vercel runs to build the project"
  type        = string
  default     = "npm run build"
}

variable "install_command" {
  description = "Command Vercel runs to install dependencies"
  type        = string
  default     = "npm install"
}

variable "output_directory" {
  description = "Directory where the build output is placed"
  type        = string
  default     = ".next"
}

variable "environment" {
  description = "Environment variables to set on the project"
  type = list(object({
    key    = string
    value  = string
    target = list(string)
  }))
  default = []
}

variable "domains" {
  description = "Domains to attach to the project (optional)"
  type = list(object({
    domain               = string
    redirect             = optional(string)
    redirect_status_code = optional(number, 308)
  }))
  default = []
}

variable "source_path" {
  description = "Path to the source code directory used for deployments (leave empty to skip vercel_deployment)"
  type        = string
  default     = ""
}

variable "production" {
  description = "Whether the deployment targets production"
  type        = bool
  default     = true
}
