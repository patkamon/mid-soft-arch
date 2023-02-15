terraform {
    # Uncomment this to get it running in the CD pipeline.
     backend "azurerm" {
         resource_group_name  = "new_one"
         storage_account_name = "newflixtube"
         container_name       = "terraform"
         key                  = "terraform.tfstate"
     }
}