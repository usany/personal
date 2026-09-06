# Identity and access parameters
api_fingerprint      = "8b:09:1f:50:74:66:d5:c2:6d:2a:35:a9:59:e2:85:88"                                 # Fingerprint of OCI API private key
api_private_key_path = "~/.oci/oci_api_key.pem"                                                          # Path to OCI API private key
region               = "ap-chuncheon-1"                                                                  # OCI region where resources will be created
tenancy_id           = "ocid1.tenancy.oc1..aaaaaaaayiyrxysatpsvrjmkl3cpxh2ijzjmms4jy7x5vskamh2eh4hcaaeq" # Tenancy ID
user_id              = "ocid1.user.oc1..aaaaaaaaj3fxvv3unt6d7r2qepursbnzqaaa5tbknoymxvcxkrxgxy7cjk7a"    # User OCID

# VCN specific variables
create_new_vcn   = true                               # Set to true to create new VCN, false to use existing
compartment_id   = "REPLACE_BY_YOUR_COMPARTMENT_OCID" # Compartment ID where VCN will be created
vcn_cidr_block   = "10.0.0.0/16"                      # IPv4 CIDR blocks for VCN
vcn_display_name = "terraform_vcn_example"            # VCN display name
vcn_dns_label    = "terraformvcn"                     # VCN DNS label

# Configure for an existing VCN
public_subnet_id = "ocid1.subnet.oc1.ap-chuncheon-1.aaaaaaaaqonmvl7shu7rn56go3wdujo2vz7tarkpvlidcakya65vivw5ivba" # Public subnet OCID (if using existing)

# Private subnet variables
private_subnet_cidr_block                 = "10.0.1.0/24"                      # Private subnet CIDR block
private_subnet_display_name               = "terraform_private_subnet_example" # Private subnet name
private_subnet_prohibit_public_ip_on_vnic = false                              # Allow public IP on VNIC

# Public subnet variables
public_subnet_cidr_block                 = "10.0.2.0/24"                     # Public subnet CIDR block
public_subnet_display_name               = "terraform_public_subnet_example" # Public subnet name
public_subnet_prohibit_public_ip_on_vnic = false                             # Allow public IP on VNIC

# Compute variables
instance_shape              = "VM.Standard.E5.Flex"       # Shape of the compute instance
linux_instance_shape        = "VM.Standard.E2.1.Micro"    # Always Free shape: 1/8 OCPU and 1 GB memory
instance_flex_memory_in_gbs = 16                          # Memory in GB
instance_flex_ocpus         = 1                           # Number of OCPUs
instance_display_name       = "terraform_compute_example" # Instance display name

# SSH keys - https://docs.oracle.com/en/learn/generate_ssh_keys/index.html#introduction
public_ssh_key = "~/cloudshellkey.pub" # Path to public SSH key
# private_ssh_key = "~/cloudshellkey"    # Path to private SSH key (for reference)

# Instance creation flags
create_linux_instance   = true # Set to true to create a Linux instance
create_windows_instance = true # Set to true to create a Windows instance

# Image OCIDs - Replace with your region-specific image OCIDs
# Example for us-phoenix-1 region:
linux_image_ocid   = "ocid1.image.oc1.ap-chuncheon-1.aaaaaaaarnvxpm6huaivntpbo7altkvhudn4xporhukuqf2yjrgz2ucme25a"   # Oracle Linux 9 image OCID
windows_image_ocid = "REPLACE_BY_YOUR_REGION_WINDOWS_IMAGE_OCID" # Windows image OCID

# Popular region image OCIDs:
# Ashburn (us-east-1, iad)
#   Oracle Linux: ocid1.image.oc1.iad.aaaaaaaau7uaok7n5qd4nivgiyfatfdddhltmxddtfbyqg3bsg3fxk6z6aqq
#   Windows:      ocid1.image.oc1.iad.aaaaaaaamaaiupezxbrw6fji5ndk3jdujwhjuexcafheqjqf45g6nzyblz6a
#
# San Jose (us-sanjose-1)
#   Oracle Linux: ocid1.image.oc1.us-sanjose-1.aaaaaaaabjixxpfouczgpcnpvgny5pcqtgjgi3nincszbfdkd2xr4jvzahua
#   Windows:      ocid1.image.oc1.us-sanjose-1.aaaaaaaatmjlzoqw5gzohjvygzcm5rpugomxyfho5xi6subjchoxnxo4wcfa
#
# Toronto (ca-toronto-1)
#   Oracle Linux: ocid1.image.oc1.ca-toronto-1.aaaaaaaai6uhjrtajuuitl5hara5brnvwqvq4aebenmnbehv2cila75xbvzq
#   Windows:      ocid1.image.oc1.ca-toronto-1.aaaaaaaaeged3obrrmmwvyruvknszy23btvb2fqu7vn3c5azeecbj2prm64q
#
# For other regions, see: https://docs.oracle.com/en-us/iaas/images/
