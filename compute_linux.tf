resource "oci_core_instance" "test_linux_instance" {
  #Required
  count               = var.create_linux_instance ? 1 : 0
  availability_domain = data.oci_identity_availability_domains.ad.availability_domains[0].name
  compartment_id      = var.compartment_id

  create_vnic_details {
    assign_public_ip       = "true"
    display_name           = var.instance_display_name
    nsg_ids                = var.nsg_ids
    skip_source_dest_check = "false"
    subnet_id              = var.create_new_vcn ? oci_core_subnet.public_subnet[0].id : var.public_subnet_id
  }

  display_name = "${var.instance_display_name}_linux"
  metadata = {
    ssh_authorized_keys = "${file(var.public_ssh_key)}"
  }

  shape = var.instance_shape

  launch_options {
    boot_volume_type                    = "PARAVIRTUALIZED"
    firmware                            = "UEFI_64"
    is_consistent_volume_naming_enabled = "true"
    is_pv_encryption_in_transit_enabled = "true"
    network_type                        = "PARAVIRTUALIZED"
    remote_data_volume_type             = "PARAVIRTUALIZED"
  }

  source_details {
    #Required
    source_id   = var.linux_image_ocid
    source_type = "image"
  }

  preserve_boot_volume = false
}
