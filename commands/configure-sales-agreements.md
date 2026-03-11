---
description: Interactive wizard to configure and validate Manufacturing Cloud Sales Agreements
arguments: "[check-type]"
---

# Configure Sales Agreements

Interactive wizard to check and configure Sales Agreement management.

## Arguments

- `check-type` (optional): Focus area — `full`, `record-types`, `products`, `schedules`, `permissions` (default: full)

## Instructions

### Step 1: Verify Org Connection

```
Use check_mfg_setup (or run_soql with a simple query) to verify org connection.
```

If not connected, guide the user through `sf org login web --alias my-mfg-org`.

### Step 2: Run Sales Agreement Configuration Check

```
check_sales_agreement_config()
```

This queries:
- SalesAgreement record count and status breakdown
- SalesAgreement record types
- SalesAgreementProduct and SalesAgreementProductSchedule coverage
- Recent agreements (latest 5)
- Manufacturing permission set assignments

Report the summary from the tool output.

### Step 3: Check Record Types

```sql
SELECT Id, Name, DeveloperName, IsActive
FROM RecordType
WHERE SobjectType = 'SalesAgreement'
ORDER BY Name
```

Report:
- Record types found and their active status
- WARN if no active record types (users cannot create agreements)

### Step 4: Check Price Book Setup

```sql
SELECT Id, Name, IsActive, IsStandard
FROM Pricebook2
WHERE IsActive = true
ORDER BY IsStandard DESC, Name
```

```sql
SELECT COUNT(Id) total FROM PricebookEntry WHERE IsActive = true
```

Report:
- Whether Standard Price Book is active
- Number of active price book entries
- WARN if no PricebookEntry records (products cannot be added to agreements)

### Step 5: Check Product Coverage

```sql
SELECT COUNT(Id) total FROM Product2 WHERE IsActive = true
```

```sql
SELECT COUNT(Id) total FROM SalesAgreementProduct
```

Report:
- Active product count
- Products linked to agreements

### Step 6: Check ERP Integration / Actuals

```sql
SELECT COUNT(Id) total FROM SalesAgreementProductSchedule WHERE ActualQuantity > 0
```

Report:
- Whether any actuals have been populated
- If ActualQuantity is 0 across all schedules, flag as potential ERP integration gap

### Step 7: Present Configuration Report

```
## Sales Agreement Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Record Types
- Sales Agreement record types: [count] ([names])
- Status: [CONFIGURED / NOT CONFIGURED]

### Products & Price Books
- Active products: [count]
- Price book entries: [count]
- Standard Price Book active: [Yes/No]

### Agreement Coverage
- Total agreements: [count]
- Active agreements: [count]
- With products: [count]
- With actuals populated: [count]

### Permission Coverage
- ManufacturingSalesUser: [count] users
- SalesAgreementsUser: [count] users

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 8: Offer Next Steps

**If no record types:**
- Guide to Setup > Object Manager > Sales Agreement > Record Types
- Suggest creating: Standard Agreement, Long-Term Contract, Program Agreement

**If no price book entries:**
- Guide to Products > Price Books > Standard Price Book > Add Products

**If no actuals:**
- Ask: "Is your ERP integrated with Salesforce? Actuals in SalesAgreementProductSchedule.ActualQuantity come from your ERP sync."
- Offer to show MuleSoft Accelerator documentation

**If permission sets not assigned:**
- Ask: "Want me to show you the users who need ManufacturingSalesUser assigned?"
- Run: `list_users` with profile filter
- Then offer `assign_permission_set`

**If all checks pass:**
- Confirm Sales Agreements are ready
- Suggest creating the first agreement if none exist

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable Sales Agreements | Setup > Manufacturing Settings |
| Create Record Types | Setup > Object Manager > Sales Agreement > Record Types |
| Page Layouts | Setup > Object Manager > Sales Agreement > Page Layouts |
| Permission Sets | Setup > Permission Sets > ManufacturingSalesUser |
| Price Books | App Launcher > Price Books |
| DPE for Forecasting | Setup > Data Processing Engine |

## IMPORTANT OBJECT REMINDERS

- Use `SalesAgreement` NOT `SalesAgreement__c` or `SalesContract__c`
- Use `SalesAgreementProduct` NOT `SalesAgreementProduct__c`
- Use `SalesAgreementProductSchedule` NOT `SalesAgreementSchedule__c`
- Actuals live on `SalesAgreementProductSchedule.ActualQuantity` — populated by ERP sync
