output "list_ads" {
  value = data.oci_identity_availability_domains.ad.availability_domains
}

# Regions
output "linux_instance_region" {
  value = oci_core_instance.test_linux_instance.*.region
}

output "windows_instance_region" {
  value = oci_core_instance.test_windows_instance.*.region
}

# Networking
output "network_vcn_name" {
  value = oci_core_vcn.test_vcn.*.display_name
}

# Compute: Linux Test Instance
output "output_linux_instance_display_name" {
  value = oci_core_instance.test_linux_instance.*.display_name
}

output "output_linux_instance_public_ip" {
  value = oci_core_instance.test_linux_instance.*.public_ip
}

output "output_linux_instance_state" {
  value = oci_core_instance.test_linux_instance.*.state
}

# Compute: Windows Test Instance
output "output_windows_instance_display_name" {
  value = oci_core_instance.test_windows_instance.*.display_name
}

output "output_windows_instance_public_ip" {
  value = oci_core_instance.test_windows_instance.*.public_ip
}

output "output_windows_instance_state" {
  value = oci_core_instance.test_windows_instance.*.state
}

# Logging
output "output_log_group_id" {
  description = "OCID of the OCI Log Group"
  value       = oci_logging_log_group.app_log_group.*.id
}

output "output_log_group_display_name" {
  description = "Display name of the OCI Log Group"
  value       = oci_logging_log_group.app_log_group.*.display_name
}

output "output_flow_log_id" {
  description = "OCID of the VCN Flow Log"
  value       = oci_logging_log.vcn_flow_log.*.id
}
