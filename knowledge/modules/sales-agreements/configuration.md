# Sales Agreements — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Sales license
- Salesforce CLI authenticated to the org
- `ManufacturingSalesUser` permission set available

## Configuration Steps

### Step 1: Enable Sales Agreements
Go to **Setup > Manufacturing Settings > Enable Sales Agreements** and toggle on.

### Step 2: Create Record Types
Navigate to **Setup > Object Manager > Sales Agreement > Record Types**.

Recommended record types:
- `Standard` — general run-rate agreements
- `Long-Term Contract` — multi-year committed contracts
- `Program Agreement` — agreements tied to manufacturing programs

### Step 3: Configure Page Layouts
Add these fields to the Sales Agreement page layout:
- Account, Start Date, End Date, Status, Currency, Owner
- Agreement Type, Description

Add these related lists:
- Sales Agreement Products
- Sales Agreement Product Schedules
- Activity History

### Step 4: Set Up Price Books
Sales Agreement Products require an active Price Book:
1. Ensure `Pricebook2` records exist for the relevant currencies
2. Verify `PricebookEntry` records are active for each product
3. Link the Price Book to the Sales Agreement

### Step 5: Assign Permission Sets
```bash
# Assign ManufacturingSalesUser to account managers
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<ManufacturingSalesUserId>" \
  --target-org <alias>

# Assign SalesAgreementsUser for compliance tracking
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<SalesAgreementsUserId>" \
  --target-org <alias>
```

### Step 6: Create and Activate an Agreement
1. Create a `SalesAgreement` record with Account, Start Date, End Date
2. Add `SalesAgreementProduct` records — one per product line
3. Define `SalesAgreementProductSchedule` periods (monthly / quarterly / annual)
4. Set `Status = Active` to begin tracking actuals

### Step 7: Configure ERP Integration for Actuals
Actuals (fulfilled quantities) are written to `SalesAgreementProductSchedule`:
- **MuleSoft Accelerator for Manufacturing** — recommended for SAP/Oracle integrations
- **REST API** — direct write to `ActualQuantity` and `ActualRevenue` fields
- **Manual updates** — via Data Loader or Apex for non-integrated environments

## Validation Checklist

Run `check_sales_agreement_config` to validate:
- [ ] Sales Agreements feature enabled in Manufacturing Settings
- [ ] At least one Record Type configured
- [ ] Active SalesAgreement records exist
- [ ] SalesAgreementProduct records linked to agreements
- [ ] SalesAgreementProductSchedule records with planned quantities
- [ ] ManufacturingSalesUser permission set assigned to key users

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Users can't create agreements | Missing `ManufacturingSalesUser` or `SalesAgreementsUser` PS | Assign permission set |
| Actuals not updating | ERP integration not syncing to `SalesAgreementProductSchedule` | Check MuleSoft flows or API integration |
| Agreement stuck in Draft | No activation logic configured | Add Flow to set Status = Active, or activate manually |
| Products not visible on agreement | Price Book not linked or PricebookEntry inactive | Check Pricebook2 and PricebookEntry records |
| Agreement auto-expired | EndDate passed — Status auto-set to Expired | Renew: update EndDate and reactivate |
| Can't add custom Status values | Status is a restricted standard picklist | Use a custom field for additional status tracking |
| Schedules not generating | Agreement product added but no schedule created | Manually create SalesAgreementProductSchedule records or use automation |
| Currency mismatch on schedules | Agreement currency differs from Price Book currency | Ensure Price Book currency matches the agreement |
| Decimal planned quantity truncated to whole number on record detail page | Decimal metric config applied only to SalesAgreementProduct, not SalesAgreementProductSchedule | See below: Set Up Decimal Metrics for Sales Agreement Product Schedule |

## Decimal Quantities on Sales Agreement Product Schedule

### Symptom
- Decimal values (e.g., `8.5`) entered on the **Sales Agreement Product Schedule record detail page** are silently truncated to whole numbers (e.g., `8`) on save.
- The same decimal value saves correctly via the **Agreement Terms inline grid**.
- No error or warning is shown to the user.

### Root Cause
The `PlannedQuantity` field on `SalesAgreementProductSchedule` is defined as `Number(9, 0)` (0 decimal places), which causes truncation at the field level on the record detail page.

The decimal metric configuration (Default Decimal Scale = 2, "Quantity in Decimals" field) was applied to the **Sales Agreement Product** entity only. The **Sales Agreement Product Schedule** entity has a corresponding field mapping that must be configured independently.

### Fix — 2 Steps

**Step 1 — Configure decimal metrics for Sales Agreement Product Schedule**
Apply the same decimal metric configuration done for Sales Agreement Product to the **Sales Agreement Product Schedule** entity. Both entities have their own field mapping for decimal quantities and must each be set up separately.

Reference help doc: **Set Up Decimal Metrics for Sales Agreements**
`https://help.salesforce.com/s/articleView?id=ind.sa_admin_define_decimal_scale.htm&type=5`

**Step 2 — Add decimal fields to the page layout**
Add the relevant decimal quantity fields to the **Sales Agreement Product Schedule** page layout. Without these fields on the layout, decimal values won't be visible or editable on the record detail page.

### Verified Resolution
This configuration change was confirmed to resolve the issue. The user successfully applied the settings after following the above steps.

### Key Rule
> Whenever decimal metric configuration (Default Decimal Scale, Quantity in Decimals) is applied to **SalesAgreementProduct**, the **same configuration must also be applied to SalesAgreementProductSchedule**. Both entities have independent field mappings for decimal quantities.
