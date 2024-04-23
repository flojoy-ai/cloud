# Deployment

The following deployment guide is made for deploying the infrastructures to Azure.

## 1. Setup Terraform and Azure CLI

[Install Terraform](https://developer.hashicorp.com/terraform/tutorials/azure-get-started/install-cli#install-terraform)

[Authenticate using the Azure CLI](https://developer.hashicorp.com/terraform/tutorials/azure-get-started/azure-build#authenticate-using-the-azure-cli)

Once Terraform has been installed and you have authenticated using the Azure CLI,
you can initialize the Terraform configuration by running:

```bash
terraform init
```

## 2. Setup an SSH key for the VM

Generate an SSH key pair (RSA) with name `flojoy_cloud`,
and place it under the `~/.ssh` directory.

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/flojoy_cloud
```

## 3. Plan and Apply

```bash
terraform plan
```

This will show you all the resources that will be created.
If you are happy with the plan, you can apply it by running:

```bash
terraform apply -auto-approve
```

This process will take a few minutes to complete.

## 4. Access the VM

To access the VM, we need to get the public IP address.

```bash
terraform state show azurerm_linux_virtual_machine.flojoy-cloud-vm | grep "public_ip_address\s"
```

Then you can access the VM by running:

```bash
ssh -i ~/.ssh/flojoy_cloud adminuser@<public_ip_address>
```

## 5. Clone the repository

Once you have logged into the VM, you can clone the repository by running:

```bash
git clone https://github.com/flojoy-ai/cloud.git
```

## 6. Install Nixpacks

We are using Nixpacks to build the Docker images for deployment.

Before that, we need to make sure Docker and Nixpacks are installed.

The Terraform script has already installed Docker for you. You can verify
the installation by running:

```bash
docker --version
```

(Note: it may take a couple minutes before Docker is actually installed)

You can install Nixpacks by running:

```bash
curl -sSL https://nixpacks.com/install.sh | bash
```

[Install Nixpacks](https://nixpacks.com/docs/install)

## 7. Build the Docker images

Let's first make sure Docker is running:

```bash
sudo systemctl start docker

```

To build `web` and `server`, run these 2 commands respectively on the root of the
repository:

```bash
cd cloud
nixpacks build . --config apps/web/nixpacks.toml --name flojoy-cloud-web
nixpacks build . --config apps/server/nixpacks.toml --name flojoy-cloud-server
```