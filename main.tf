# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "flojoy_cloud_rg" {
  name     = "flojou_cloud_rg"
  location = "canadacentral"
  tags = {
    environment = "production"
  }
}

resource "azurerm_virtual_network" "flojoy_cloud_vnet" {
  name                = "flojoy_cloud_vnet"
  resource_group_name = azurerm_resource_group.flojoy_cloud_rg.name
  location            = azurerm_resource_group.flojoy_cloud_rg.location
  address_space       = ["10.123.0.0/16"]

  tags = {
    environment = "production"
  }
}
