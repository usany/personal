resource "oci_core_vcn" "test_vcn" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id

  cidr_block   = var.vcn_cidr_block
  display_name = var.vcn_display_name
  dns_label    = var.vcn_dns_label
}

resource "oci_core_subnet" "private_subnet" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  cidr_block     = var.private_subnet_cidr_block
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn[0].id

  display_name               = var.private_subnet_display_name
  prohibit_public_ip_on_vnic = var.private_subnet_prohibit_public_ip_on_vnic
}

resource "oci_core_subnet" "public_subnet" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  cidr_block     = var.public_subnet_cidr_block
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn[0].id

  display_name               = var.public_subnet_display_name
  prohibit_public_ip_on_vnic = var.public_subnet_prohibit_public_ip_on_vnic
  route_table_id             = oci_core_route_table.test_route_table[0].id
}

resource "oci_core_internet_gateway" "test_internet_gateway" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn[0].id

  display_name = "INTERNET_GTWFOR_${var.vcn_display_name}"
}

resource "oci_core_route_table" "test_route_table" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn[0].id

  route_rules {
    #Required
    network_entity_id = oci_core_internet_gateway.test_internet_gateway[0].id
    description       = "route rule internet access for ${var.vcn_display_name}"
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
  }
}

resource "oci_core_network_security_group" "test_nsg" {
  count = (var.create_new_vcn) ? 1 : 0

  #Required
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.test_vcn[0].id

  display_name = "NETWORK_SECURITY_GROUP_${var.vcn_display_name}"
  freeform_tags = {
    "Lab" = "Terraform 101 Guide"
  }
}
