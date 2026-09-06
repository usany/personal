# OCI Authentication Variables
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

# VCN Variables
variable "create_new_vcn" {
  description = "Boolean variable to specify whether to create a new VCN or to reuse an existing one"
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
  description = "Descriptive name for the VCN"
  type        = string
}

variable "vcn_dns_label" {
  description = "Descriptive alphanumeric name for the DNS"
  type        = string
}

variable "vcn_id" {
  description = "Existing VCN OCID if create_new_vcn = false"
  type        = string
}

variable "private_subnet_id" {
  description = "Existing private subnet OCID"
  type        = string
}

variable "public_subnet_id" {
  description = "Existing public subnet OCID"
  type        = string
}

# Subnet Variables
variable "private_subnet_cidr_block" {
  description = "OCI private subnet CIDR block range"
  type        = string
}

variable "private_subnet_display_name" {
  description = "Descriptive name for the private subnet"
  type        = string
}

variable "private_subnet_prohibit_public_ip_on_vnic" {
  description = "Prohibit public IP address on the VNIC"
  type        = bool
}

variable "public_subnet_cidr_block" {
  description = "OCI public subnet CIDR block range"
  type        = string
}

variable "public_subnet_display_name" {
  description = "Descriptive name for the public subnet"
  type        = string
}

variable "public_subnet_prohibit_public_ip_on_vnic" {
  description = "Prohibit public IP address on the VNIC"
  type        = bool
}

# Compute Variables
variable "instance_shape" {
  description = "Shape of the compute instance"
  type        = string
}

variable "linux_instance_shape" {
  description = "Shape of the Linux compute instance (Always Free: VM.Standard.E2.1.Micro with 1/8 OCPU and 1 GB)"
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "instance_flex_memory_in_gbs" {
  description = "Total amount of memory available to the instance, in gigabytes"
  type        = number
}

variable "instance_flex_ocpus" {
  description = "Total number of OCPUs available to the instance"
  type        = number
}

variable "instance_display_name" {
  description = "Descriptive name for the compute instance"
  type        = string
}

variable "public_ssh_key" {
  description = "Path to your public SSH key for provisioning the compute instance"
  type        = string
}

variable "create_linux_instance" {
  description = "Boolean variable to specify whether to provision a Linux instance"
  type        = bool
}

variable "create_windows_instance" {
  description = "Boolean variable to specify whether to provision a Windows instance"
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
