# Manufacturing Cloud Administration — Official Help

This document summarises key administration topics for Manufacturing Cloud sourced from the official Salesforce Help portal.

## Enabling Manufacturing Cloud Features

All Manufacturing Cloud features are enabled in **Setup > Manufacturing Settings**. Key toggles:

| Feature | Setting Name |
|---------|-------------|
| Sales Agreements | Enable Sales Agreements |
| Advanced Account Forecasting | Enable Advanced Account Forecasting |
| Partner Visit Management | Enable Partner Visit Management |
| Warranty Lifecycle Management | Enable Warranty Lifecycle Management |
| Rebate Management | Enable Rebate Management |
| Inventory Allocation | InventoryAllocationEnabled (org preference) |

## Permission Sets

| Permission Set | License Requirement |
|---------------|-------------------|
| `ManufacturingSalesUser` | Manufacturing Cloud for Sales |
| `ManufacturingServiceUser` | Manufacturing Cloud for Service |
| `WarrantyManagementUser` | Manufacturing Cloud for Service |
| `RebateManagementUser` | Manufacturing Cloud for Sales |
| `InventoryAllocationUser` | Inventory Allocation add-on |
| `ManufacturingAnalyticsUser` | CRM Analytics for Manufacturing |

## Key Setup Paths

- **Sales Agreements**: Setup > Manufacturing Settings > Enable Sales Agreements
- **Forecasting (DPE)**: Setup > Data Processing Engine > Install AAF templates
- **Visit Templates**: App Launcher > Action Plan Templates
- **Warranty Terms**: App Launcher > Warranty Terms
- **Rebate Programs**: App Launcher > Rebate Programs

## Resources

- Official Help: https://help.salesforce.com/s/articleView?id=ind.mfg_manufacturing_cloud.htm
- Developer Guide: https://developer.salesforce.com/docs/atlas.en-us.mfg_dev_guide.meta/mfg_dev_guide/
- Admin PDF Guide: https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/manufacturing_admin.pdf
