# Warranty Lifecycle Management — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Service license
- Asset records representing the installed base
- Product2 records for all warrantable products

## Configuration Steps

### Step 1: Enable Warranty Lifecycle Management
Go to **Setup > Manufacturing Settings > Enable Warranty Lifecycle Management** and toggle on.

### Step 2: Create Warranty Terms
Navigate to **App Launcher > Warranty Terms > New**:

Required fields:
- **Name**: Descriptive name (e.g., "Standard 24-Month Powertrain")
- **Warranty Type**: Standard, Extended, or Supplier
- **Duration**: e.g., 24
- **Duration Unit**: Months, Years
- **Effective Start / End Date**: When this term is offered

### Step 3: Add Coverage Details
For each `WarrantyTerm`, create `WarrantyTermCoverage` records:

| Coverage Type | Key Fields |
|--------------|-----------|
| Labor | Covered hours, labor rate cap |
| Parts | Parts reimbursement %, max amount |
| Expenses | Maximum expense reimbursement |

### Step 4: Link Warranty Terms to Products
Create `ProductWarrantyTerm` records to auto-assign warranties when assets are created:
1. Go to the Product2 record
2. Navigate to related list: Product Warranty Terms
3. Add a new record linking to the appropriate WarrantyTerm

When an Asset is created from this product, an `AssetWarranty` record is auto-created.

### Step 5: Manually Assign Warranties to Existing Assets
For installed base assets without auto-assignment:
1. Open the Asset record
2. Navigate to the Asset Warranties related list
3. Create a new `AssetWarranty` record:
   - WarrantyTermId
   - StartDate (typically installation or purchase date)
   - ExpirationDate (calculated from duration)

### Step 6: Assign Permission Sets
| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingServiceUser` | CSRs, warranty admins |
| `WarrantyManagementUser` | Warranty term administrators |

### Step 7: Configure Asset Lifecycle Tracking (Optional)
For advanced asset tracking:
- Create `AssetMilestone` records for key lifecycle events (installation, first service)
- Configure `AssetStatePeriod` records to track operational vs. downtime periods
- Set up `AssetDowntimePeriod` for SLA and warranty deduction calculations

## Validation Checklist

Run `check_warranty_config` to validate:
- [ ] Warranty Lifecycle Management enabled
- [ ] WarrantyTerm records created and active
- [ ] WarrantyTermCoverage records present (labor, parts, expenses)
- [ ] ProductWarrantyTerm records linking products to warranty terms
- [ ] AssetWarranty records on installed assets
- [ ] WarrantyManagementUser permission set assigned

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Can't create Warranty Terms | Missing `WarrantyManagementUser` permission set | Assign permission set to warranty admins |
| Asset not showing warranty | No `AssetWarranty` record linked | Create AssetWarranty manually or check ProductWarrantyTerm setup |
| Warranty not auto-assigned on asset creation | `ProductWarrantyTerm` not configured for the product | Create ProductWarrantyTerm linking Product2 to WarrantyTerm |
| Coverage details missing | `WarrantyTermCoverage` not configured | Add coverage records (labor, parts, expenses) to the WarrantyTerm |
| Expiration date wrong | StartDate or duration set incorrectly on AssetWarranty | Correct StartDate and recalculate ExpirationDate |
| Warranty visible but expired | Normal — ExpirationDate in the past | Create a renewal AssetWarranty with new dates |
| WarrantyClaim not available | Feature not enabled in this org | Use custom objects or contact Salesforce support for enablement |
