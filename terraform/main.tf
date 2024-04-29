# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.0"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "flojoy-cloud-rg" {
  name     = "flojoy-cloud-rg"
  location = var.location
  tags = {
    environment = var.environment
  }
}

# Generate random value for the storage account name
resource "random_string" "storage_account_name" {
  length  = 8
  lower   = true
  numeric = false
  special = false
  upper   = false
}

resource "azurerm_virtual_network" "flojoy-cloud-vnet" {
  name                = "flojoy-cloud-vnet"
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  address_space       = ["10.123.0.0/16"]

  tags = {
    environment = var.environment
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
    environment = var.environment
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
    environment = var.environment
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
    environment = var.environment
  }
}

resource "azurerm_storage_account" "caddy-storage-account" {
  name                      = random_string.storage_account_name.result
  resource_group_name       = azurerm_resource_group.flojoy-cloud-rg.name
  location                  = azurerm_resource_group.flojoy-cloud-rg.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true
}

resource "azurerm_storage_share" "caddy-storage-share" {
  name                 = "caddy-storage-share"
  storage_account_name = azurerm_storage_account.caddy-storage-account.name
  quota                = 1
}

resource "azurerm_postgresql_flexible_server" "flojoy-cloud-postgres-server" {
  name                   = "flojoy-cloud-postgres-flexible-server"
  resource_group_name    = azurerm_resource_group.flojoy-cloud-rg.name
  location               = azurerm_resource_group.flojoy-cloud-rg.location
  version                = 12
  administrator_login    = "user"
  administrator_password = "password"
  storage_mb             = 32768
  sku_name               = "GP_Standard_D4s_v3"
  zone                   = "1"

  tags = {
    environment = var.environment
  }
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "flojoy-cloud-postgres-flexible-server-fw-rule" {
  name      = "flojoy-cloud-postgres-flexible-server-fw-rule"
  server_id = azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.id

  # allow-access-from-azure-services
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_postgresql_flexible_server_configuration" "flojoy-cloud-postgres-server-config" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.id
  value     = "PG_TRGM"
}

resource "azurerm_postgresql_flexible_server_database" "flojoy-cloud-postgres-db" {
  name      = "flojoy-cloud-postgres-flexible-db"
  server_id = azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.id
  charset   = "utf8"
  collation = "en_US.utf8"

  # prevent the possibility of accidental data loss
  lifecycle {
    # prevent_destroy = true
  }
}

resource "azurerm_container_group" "flojoy-cloud-server-container-group" {
  name                = "flojoy-cloud-server-container-group"
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name

  ip_address_type = "Public"
  os_type         = "Linux"
  restart_policy  = "Always"
  dns_name_label  = var.server-dns-name-label

  container {
    name   = "caddy-container"
    image  = "caddy"
    memory = "0.5"
    cpu    = "0.5"

    ports {
      port     = 80
      protocol = "TCP"
    }

    ports {
      port     = 443
      protocol = "TCP"
    }

    volume {
      name                 = "caddy-container-volume"
      mount_path           = "/data"
      storage_account_name = azurerm_storage_account.caddy-storage-account.name
      storage_account_key  = azurerm_storage_account.caddy-storage-account.primary_access_key
      share_name           = azurerm_storage_share.caddy-storage-share.name
    }

    commands = ["caddy", "reverse-proxy", "--from", "${var.server-dns-name-label}.${var.location}.azurecontainer.io", "--to", "localhost:3000"]
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

    environment_variables = {
      NODE_ENV     = "production"
      DATABASE_URL = "postgresql://${azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.administrator_login}:${azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.administrator_password}@${azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.name}.postgres.database.azure.com:5432/${azurerm_postgresql_flexible_server_database.flojoy-cloud-postgres-db.name}?sslmode=require"
      WEB_URI      = "${var.web-dns-name-label}.${var.location}.azurecontainer.io"
      JWT_SECRET   = var.jwt-secret

      ENTRA_TENANT_ID     = var.entra-tenant-id
      ENTRA_CLIENT_ID     = var.entra-client-id
      ENTRA_CLIENT_SECRET = var.entra-client-secret
      ENTRA_REDIRECT_URI  = "https://${var.server-dns-name-label}.${var.location}.azurecontainer.io/auth/entra/callback"
    }
  }
}

resource "azurerm_container_group" "flojoy-cloud-web-container-group" {
  name                = "flojoy-cloud-web-container-group"
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name

  ip_address_type = "Public"
  os_type         = "Linux"
  restart_policy  = "Always"
  dns_name_label  = var.web-dns-name-label

  container {
    name   = "caddy-container"
    image  = "caddy"
    memory = "0.5"
    cpu    = "0.5"

    ports {
      port     = 80
      protocol = "TCP"
    }

    ports {
      port     = 443
      protocol = "TCP"
    }

    volume {
      name                 = "caddy-container-volume"
      mount_path           = "/data"
      storage_account_name = azurerm_storage_account.caddy-storage-account.name
      storage_account_key  = azurerm_storage_account.caddy-storage-account.primary_access_key
      share_name           = azurerm_storage_share.caddy-storage-share.name
    }

    commands = ["caddy", "reverse-proxy", "--from", "${var.web-dns-name-label}.${var.location}.azurecontainer.io", "--to", "localhost:5173"]
  }

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
      VITE_SERVER_URL = "https://${var.server-dns-name-label}.${var.location}.azurecontainer.io"
    }
  }
}

