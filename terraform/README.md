# Deployment

**Note: we are not actually using Terraform, this is just a placeholder for now.**

**The latest Docker images are hosted at [Flojoy's Docker Hub](https://hub.docker.com/repositories/flojoyai)**

---

The following deployment guide is made for deploying the infrastructures to Azure.

## 1. Setup Terraform and Azure CLI

[Install Terraform](https://developer.hashicorp.com/terraform/tutorials/azure-get-started/install-cli#install-terraform)

[Authenticate using the Azure CLI](https://developer.hashicorp.com/terraform/tutorials/azure-get-started/azure-build#authenticate-using-the-azure-cli)

Once Terraform has been installed and you have authenticated using the Azure CLI,
you can initialize the Terraform configuration by running:

```bash
terraform init
```

## 2. Setup some environment variables

Create a file called `secret.tfvars` next to the `main.tf` file with the
following content filled out:

```hcl
location    = "canadacentral"
environment = "production"

web-dns-name-label    = "flojoy-cloud-web"
server-dns-name-label = "flojoy-cloud-server"

entra-tenant-id     = ""
entra-client-id     = ""
entra-client-secret = ""

jwt-secret = "secret"
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

## 4. Access the deployed services

You deployed service will be accessible at
`https://<web-dns-name-label>.<location>.cloudapp.azure.com`
