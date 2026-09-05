variable "api_fingerprint" {
  description = "Fingerprint of OCI API private key for Tenancy"
  type        = string
}

variable "api_private_key_path" {
  description = "Path to OCI API private key used for Tenancy"
  type        = string
}

variable "tenancy_id" {
  description = "Tenancy ID where to create resources for Tenancy"
  type        = string
}

variable "user_id" {
  description = "User ID that Terraform will use to create resources for Tenancy"
  type        = string
}

variable "region" {
  description = "OCI region where resources will be created for Tenancy"
  type        = string
}

#VCN specific variables
variable "create_new_vcn" {
  description = "Boolean variable to specify whether to create a new VCN or to reuse an existing one."
  type        = bool
}

variable "compartment_id" {
  description = "OCI compartment where resources will be created"
  type        = string
}

variable "vcn_cidr_block" {
  description = "The list of IPv4 CIDR blocks the VCN will use"
  type        = string
}

variable "vcn_display_name" {
  description = "provide a descriptive name for the VCN - this is what you will see displayed in the OCI console"
  type        = string
}

variable "vcn_dns_label" {
  description = "provide a descriptive alphanumeric name for the DNS - this is what you will see displayed in the OCI console"
  type        = string
}

variable "public_subnet_id" {
  description = "provide existing public subnet OCID"
  type        = string
}

variable "nsg_ids" {
  description = "List of existing Network Security Group OCIDs to attach to the instance VNICs (optional)."
  type        = list(string)
  default     = []
}

#Private subnet variables
variable "private_subnet_cidr_block" {
  description = "OCI private subnet CIDR block range"
  type        = string
}

variable "private_subnet_display_name" {
  description = "provide a descriptive name for the private subnet - this is what you will see displayed in the OCI console"
  type        = string
}

variable "private_subnet_prohibit_public_ip_on_vnic" {
  description = "Allow public IP address to the VNIC"
  type        = bool
}

#Public subnet variables
variable "public_subnet_cidr_block" {
  description = "OCI public subnet CIDR block range"
  type        = string
}

variable "public_subnet_display_name" {
  description = "provide a descriptive name for the public subnet - this is what you will see displayed in the OCI console"
  type        = string
}

variable "public_subnet_prohibit_public_ip_on_vnic" {
  description = "Allow public IP address to the VNIC"
  type        = bool
}

#Compute variables
variable "instance_shape" {
  description = "Shape of the compute instance"
  type        = string
}

variable "instance_create_vnic_details_assign_public_ip" {
  description = "To allow compute connectivity from internet"
  type        = bool
}

variable "instance_display_name" {
  description = "provide a descriptive name for the compute instance - this is what you will see displayed in the OCI console"
  type        = string
}

variable "public_ssh_key" {
  description = "Add your public ssh key - for provisioning your compute instance"
  type        = string
}

variable "private_ssh_key" {
  description = "Add your private ssh key - for accessing your compute instance after creation"
  type        = string
}

variable "create_linux_instance" {
  description = "Boolean variable to specify whether to provision a Linux instances"
  type        = bool
}

variable "create_windows_instance" {
  description = "Boolean variable to specify whether to provision a Windows instances"
  type        = bool
}

variable "windows_image_ocid" {
  description = "OCID of the Windows image to use"
  type        = string
}

variable "linux_image_ocid" {
  description = "OCID of the Linux image to use"
  type        = string
}

#Logging variables
variable "enable_logging" {
  description = "Whether to create OCI Logging resources (log group and flow log)"
  type        = bool
  default     = true
}

variable "log_group_display_name" {
  description = "Display name for the OCI Log Group - this is what you will see displayed in the OCI console"
  type        = string
  default     = "terraform_log_group"
}

variable "log_group_description" {
  description = "Description for the OCI Log Group"
  type        = string
  default     = "Log group managed by Terraform"
}

variable "enable_flow_log" {
  description = "Whether to create a VCN Flow Log. Requires a VCN OCID (either the newly created VCN or an existing VCN OCID)."
  type        = bool
  default     = true
}

variable "flow_log_display_name" {
  description = "Display name for the VCN Flow Log - this is what you will see displayed in the OCI console"
  type        = string
  default     = "vcn_flow_log"
}

variable "log_retention_duration" {
  description = "Number of days to retain log data (0 = keep forever)"
  type        = number
  default     = 30
}

variable "vcn_id" {
  description = "Existing VCN OCID. Required when create_new_vcn = false and enable_flow_log = true."
  type        = string
  default     = ""
}

