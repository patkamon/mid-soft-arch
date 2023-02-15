terraform {
    # Uncomment this to get it running in the CD pipeline.
     backend "azurerm" {
         resource_group_name  = "new_uniq_tube"
         storage_account_name = "flixtubeuniqq"
         container_name       = "flixtubecontainer"
         key                  = "terraform.tfstate"
     }
}