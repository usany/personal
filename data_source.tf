data "oci_identity_availability_domains" "ad" {
    #Required
    compartment_id = var.tenancy_id
}
