# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.101.0"
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

resource "azurerm_container_app_environment" "flojoy-cloud-container-app-env" {
  name                = "flojoy-cloud-container-app-env"
  location            = azurerm_resource_group.flojoy-cloud-rg.location
  resource_group_name = azurerm_resource_group.flojoy-cloud-rg.name
}

resource "azurerm_container_app" "flojoy-cloud-web-container-app" {
  name                         = "flojoy-cloud-web"
  container_app_environment_id = azurerm_container_app_environment.flojoy-cloud-container-app-env.id
  resource_group_name          = azurerm_resource_group.flojoy-cloud-rg.name
  revision_mode                = "Single"


  ingress {
    target_port      = "5173"
    external_enabled = true

    traffic_weight {
      revision_suffix = "flojoy-cloud-web"
      percentage      = 100
    }
  }

  template {
    container {
      name   = "flojoy-cloud-web-container"
      image  = "flojoyai/cloud-web:latest"
      cpu    = "2.0"
      memory = "4.0Gi"

      env {
        name  = "PORT"
        value = 5173
      }
      env {
        name  = "VITE_SERVER_URL"
        value = "https://${var.server-uri}"
      }
    }
  }
}

resource "azurerm_container_app" "flojoy-cloud-server-container-app" {
  name                         = "flojoy-cloud-server"
  container_app_environment_id = azurerm_container_app_environment.flojoy-cloud-container-app-env.id
  resource_group_name          = azurerm_resource_group.flojoy-cloud-rg.name
  revision_mode                = "Single"

  ingress {
    target_port      = "3000"
    external_enabled = true
    traffic_weight {
      revision_suffix = "flojoy-cloud-server"
      percentage      = 100
    }
  }

  template {
    container {
      name   = "flojoy-cloud-server-container"
      image  = "flojoyai/cloud-server:latest"
      cpu    = "2.0"
      memory = "4.0Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "DATABASE_URL"
        value = "postgresql://${azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.administrator_login}:${azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.administrator_password}@${azurerm_postgresql_flexible_server.flojoy-cloud-postgres-server.name}.postgres.database.azure.com:5432/${azurerm_postgresql_flexible_server_database.flojoy-cloud-postgres-db.name}?sslmode=require"
      }
      env {
        name  = "WEB_URI"
        value = var.web-uri
      }
      env {
        name  = "JWT_SECRET"
        value = var.jwt-secret
      }
      env {
        name  = "ENTRA_TENANT_ID"
        value = var.entra-tenant-id
      }
      env {
        name  = "ENTRA_CLIENT_ID"
        value = var.entra-client-id
      }
      env {
        name  = "ENTRA_CLIENT_SECRET"
        value = var.entra-client-secret
      }
      env {
        name  = "ENTRA_REDIRECT_URI"
        value = "https://${var.server-uri}/auth/entra/callback"
      }
    }
  }
}

