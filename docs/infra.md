# Infrastructure

We are using terraform to manage our cloud infrastructure. You can find the configuration in the `infra` directory.

## Usage

In order to use terraform you'll have to install the terraform cli and log in to the organization.

To initialize terraform providers so that it can provision resources in AWS and Google Cloud, run

```
terraform init
```

Once you have changes you want to execute run the following command to see what will be created or changed.

```
terraform plan
```

To apply the infrastructure changes run

```
terrafrom apply
```
