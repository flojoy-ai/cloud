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

resource "azurerm_subnet" "flojoy_cloud_subnet" {
  name                 = "flojoy_cloud_subnet"
  resource_group_name  = azurerm_resource_group.flojoy_cloud_rg.name
  virtual_network_name = azurerm_virtual_network.flojoy_cloud_vnet.name
  address_prefixes     = ["10.123.1.0/24"]
}

resource "azurerm_network_security_group" "flojoy_cloud_nsg" {
  name                = "flojoy_cloud_nsg"
  resource_group_name = azurerm_resource_group.flojoy_cloud_rg.name
  location            = azurerm_resource_group.flojoy_cloud_rg.location

  tags = {
    environment = "production"
  }
}

resource "azurerm_network_security_rule" "flojoy_cloud_nsr" {
  name                        = "flojoy_cloud_nsr"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "*"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.flojoy_cloud_rg.name
  network_security_group_name = azurerm_network_security_group.flojoy_cloud_nsg.name
}

