resource "oci_core_vcn" "test_vcn" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id


  cidr_block   = var.vcn_cidr_block
  display_name = var.vcn_display_name
  dns_label    = var.vcn_dns_label
}
