# VCN
resource "oci_core_vcn" "test_vcn" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id

  cidr_block   = var.vcn_cidr_block
  display_name = var.vcn_display_name
  dns_label    = var.vcn_dns_label
}

# Private Subnet
resource "oci_core_subnet" "private_subnet" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  cidr_block     = var.private_subnet_cidr_block
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn.*.id[0]

  display_name               = var.private_subnet_display_name
  prohibit_public_ip_on_vnic = var.private_subnet_prohibit_public_ip_on_vnic
}

# Public Subnet
resource "oci_core_subnet" "public_subnet" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  cidr_block     = var.public_subnet_cidr_block
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn.*.id[0]

  display_name               = var.public_subnet_display_name
  prohibit_public_ip_on_vnic = var.public_subnet_prohibit_public_ip_on_vnic
  route_table_id             = oci_core_route_table.test_route_table.*.id[0]
}

# Internet Gateway
resource "oci_core_internet_gateway" "test_internet_gateway" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id
  display_name   = "INTERNET_GW_FOR_${var.vcn_display_name}"
  vcn_id         = oci_core_vcn.test_vcn.*.id[0]
}

# Route Table
resource "oci_core_route_table" "test_route_table" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn.*.id[0]

  route_rules {
    #Required
    network_entity_id = oci_core_internet_gateway.test_internet_gateway.*.id[0]

    description      = "route rule internet access for ${var.vcn_display_name}"
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
  }
}

# Network Security Group
resource "oci_core_network_security_group" "test_nsg" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn.*.id[0]
  display_name   = "NETWORK_SECURITY_GROUP_${var.vcn_display_name}"
  freeform_tags  = { "Lab" = "Terraform 101 Guide" }
}
