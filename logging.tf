# ==============================================================================
# OCI Logging — resources managed by Terraform
#
# A Log Group is a logical container for logs. It lives in a compartment and
# holds one or more Logs (service logs, flow logs, custom/app logs).
# ==============================================================================
resource "oci_logging_log_group" "app_log_group" {
  count = var.enable_logging ? 1 : 0

  compartment_id = var.compartment_id
  display_name   = var.log_group_display_name
  description    = var.log_group_description

  freeform_tags = {
    "ManagedBy" = "Terraform"
  }
}

# ==============================================================================
# VCN Flow Log (SERVICE log)
#
# Captures network traffic metadata for a VCN's subnets: source/dest IP, ports,
# protocol, byte/packet counts, and the ACCEPT/REJECT decision per flow.
# This is the OCI-native equivalent of AWS VPC Flow Logs — the most common
# "check the logs" use case for networking troubleshooting.
#
# Source OCID resolution:
#   - create_new_vcn = true  -> uses the VCN created in networking.tf
#   - create_new_vcn = false -> uses var.vcn_id (an existing VCN OCID)
# ==============================================================================
resource "oci_logging_log" "vcn_flow_log" {
  count = (var.enable_logging && var.enable_flow_log) ? 1 : 0

  display_name       = var.flow_log_display_name
  log_group_id       = oci_logging_log_group.app_log_group[0].id
  log_type           = "SERVICE"
  is_enabled         = true
  retention_duration = var.log_retention_duration

  configuration {
    source {
      category    = "all" # "all" = accepted + rejected flows
      resource    = var.create_new_vcn ? oci_core_vcn.test_vcn[0].id : var.vcn_id
      service     = "flowlogs"
      source_type = "OCISERVICE"
    }
  }

  freeform_tags = {
    "ManagedBy" = "Terraform"
  }
}
