terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }

  required_version = ">= 1.5.0"
}

provider "vercel" {
  # api_token defaults to the VERCEL_API_TOKEN environment variable.
  # Set it with: export VERCEL_API_TOKEN="your-token"
  #
  # Uncomment if you are deploying to a team account:
  # team = "team_xxxxxxxxxxxx"
}
