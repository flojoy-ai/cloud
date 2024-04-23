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
