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
