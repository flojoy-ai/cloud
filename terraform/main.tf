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

resource "azurerm_resource_group" "flojoy-cloud-rg" {
  name     = "flojoy-cloud-rg"
  location = "canadacentral"
  tags = {
    environment = "production"
  }
}

resource "azurerm_virtual_network" "flojoy-cloud-vnet" {
  name                = "flojoy-cloud-vnet"
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  address_space       = ["10.123.0.0/16"]

  tags = {
    environment = "production"
  }
}

resource "azurerm_subnet" "flojoy-cloud-subnet" {
  name                 = "flojoy-cloud-subnet"
  resource_group_name  = azurerm_resource_group.flojoy-cloud-rg.name
  virtual_network_name = azurerm_virtual_network.flojoy-cloud-vnet.name
  address_prefixes     = ["10.123.1.0/24"]
}

resource "azurerm_network_security_group" "flojoy-cloud-nsg" {
  name                = "flojoy-cloud-nsg"
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  location            = azurerm_resource_group.flojoy-cloud-rg.location

  tags = {
    environment = "production"
  }
}

resource "azurerm_network_security_rule" "flojoy-cloud-nsr" {
  name                        = "flojoy-cloud-nsr"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "*"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.flojoy-cloud-rg.name
  network_security_group_name = azurerm_network_security_group.flojoy-cloud-nsg.name
}

resource "azurerm_subnet_network_security_group_association" "flojoy-cloud-subnet-nsg-association" {
  subnet_id                 = azurerm_subnet.flojoy-cloud-subnet.id
  network_security_group_id = azurerm_network_security_group.flojoy-cloud-nsg.id
}

resource "azurerm_public_ip" "flojoy-cloud-public-ip" {
  name                = "flojoy-cloud-public-ip"
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  allocation_method   = "Dynamic"

  tags = {
    environment = "production"
  }
}

resource "azurerm_network_interface" "flojoy-cloud-nic" {
  name                = "flojoy-cloud-nic"
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name

  ip_configuration {
    name                          = "flojoy-cloud-nic-ip-configuration"
    subnet_id                     = azurerm_subnet.flojoy-cloud-subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.flojoy-cloud-public-ip.id
  }

  tags = {
    environment = "production"
  }
}

resource "azurerm_linux_virtual_machine" "flojoy-cloud-vm" {
  name                = "flojoy-cloud-vm"
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  size                = "Standard_DS1_v2"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.flojoy-cloud-nic.id
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/flojoy_cloud.pub")
  }

  tags = {
    environment = "production"
  }
}

resource "azurerm_postgresql_server" "flojoy-cloud-postgres-server" {
  name                         = "flojoy-cloud-postgres-server"
  resource_group_name          = azurerm_resource_group.flojoy-cloud-rg.name
  location                     = azurerm_resource_group.flojoy-cloud-rg.location
  sku_name                     = "B_Gen5_2"
  storage_mb                   = 5120
  version                      = 11
  administrator_login          = "postgresadmin"
  administrator_login_password = "P@ssw0rd1234"
  ssl_enforcement_enabled      = true

  tags = {
    environment = "production"
  }
}

resource "azurerm_postgresql_database" "flojoy-cloud-postgres-db" {
  name                = "flojoy-cloud-postgres-db"
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  server_name         = azurerm_postgresql_server.flojoy-cloud-postgres-server.name
  charset             = "UTF8"
  collation           = "English_United States.1252"

  # prevent the possibility of accidental data loss
  lifecycle {
    # prevent_destroy = true
  }
}

resource "azurerm_container_group" "flojoy-cloud-container-group" {
  name                = "flojoy-cloud-container-group"
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  ip_address_type     = "Public"
  os_type             = "Linux"
  restart_policy      = "Always"

  container {
    name   = "flojoy-cloud-web-container"
    image  = "flojoyai/cloud-web:latest"
    cpu    = 1
    memory = 2

    ports {
      port     = 5173
      protocol = "TCP"
    }

    environment_variables = {
      PORT            = 5173
      VITE_SERVER_URL = "http://localhost:3000"
    }
  }

  container {
    name   = "flojoy-cloud-server-container"
    image  = "flojoyai/cloud-server:latest"
    cpu    = 1
    memory = 2

    ports {
      port     = 3000
      protocol = "TCP"
    }
  }
}

