---
description: Interactive wizard to configure and validate Manufacturing Cloud Warranty Lifecycle Management
arguments: "[check-type]"
---

# Configure Warranty Lifecycle Management

Interactive wizard to check and configure Warranty Terms, Claims, and adjudication.

## Arguments

- `check-type` (optional): Focus area — `full`, `terms`, `claims`, `assets`, `adjudication` (default: full)

## Instructions

### Step 1: Run Warranty Configuration Check

```
check_warranty_config()
```

This queries:
- WarrantyTerm records and active status
- WarrantyClaim status distribution
- Asset and AssetWarranty coverage
- ProductServiceCampaign records
- Permission set coverage

### Step 2: Check Warranty Terms

```sql
SELECT Id, Name, WarrantyType, WarrantyDuration, WarrantyDurationUnit, IsActive,
       WarrantyDurationIdUnit
FROM WarrantyTerm
ORDER BY Name
```

Report:
- All warranty terms and their active status
- Duration and coverage type (Labor, Parts, Expenses)
- WARN if no active terms

### Step 3: Check Asset Coverage

```sql
SELECT COUNT(Id) total FROM Asset WHERE Status = 'Purchased'
```

```sql
SELECT COUNT(Id) total FROM AssetWarranty WHERE IsActive = true
```

```sql
SELECT Asset.Name, Asset.Account.Name, WarrantyTerm.Name, StartDate, ExpirationDate
FROM AssetWarranty
WHERE IsActive = true
ORDER BY ExpirationDate ASC
LIMIT 10
```

Report:
- Total assets and how many have warranty coverage
- Upcoming warranty expirations

### Step 4: Check Claims Workflow

```sql
SELECT Status, COUNT(Id) total
FROM WarrantyClaim
GROUP BY Status
ORDER BY COUNT(Id) DESC
```

```sql
SELECT Id, Name, Status, TotalClaimedAmount, TotalApprovedAmount, Account.Name
FROM WarrantyClaim
WHERE Status = 'New'
ORDER BY CreatedDate DESC
LIMIT 10
```

Report:
- Claims by status
- Pending/new claims count
- WARN if many claims stuck in 'New' (automation may not be configured)

### Step 5: Present Warranty Report

```
## Warranty Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Warranty Terms
- Total: [count] ([active] active)
- Types: [Standard, Extended, Supplier]
- Status: [CONFIGURED / NOT CONFIGURED]

### Asset Coverage
- Total assets: [count]
- Assets with warranty: [count]
- Coverage rate: [%]

### Claims Processing
- Total claims: [count]
- By status: New: [n], In Review: [n], Approved: [n], Rejected: [n]
- Adjudication automation: [Configured / Not Configured]

### Permission Coverage
- ManufacturingServiceUser: [count] users
- WarrantyManagementUser: [count] users

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 6: Offer Next Steps

**If no Warranty Terms:**
- Guide to App Launcher > Warranty Terms > New
- Suggest creating: Standard (24-month), Extended (48-month), Supplier (parts-only)

**If assets have no warranty coverage:**
- Ask: "Would you like me to check how assets are structured and suggest the best way to link warranty terms?"
- Query Asset record types and suggest AssetWarranty creation approach

**If claims stuck in 'New':**
- Ask: "Is there a Flow or Process configured to route new claims to adjudicators?"
- Guide to Setup > Flows to create a warranty claim routing automation
- Mention Business Rules Engine for auto-adjudication rules

**If no WarrantyManagementUser assigned:**
- Offer `list_users` + `assign_permission_set`

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable Warranty Management | Setup > Manufacturing Settings |
| Warranty Terms | App Launcher > Warranty Terms |
| Warranty Claims | App Launcher > Warranty Claims |
| Business Rules Engine | Setup > Business Rules Engine |
| Product Service Campaigns | App Launcher > Product Service Campaigns |
| Asset Management | App Launcher > Assets |

## IMPORTANT OBJECT REMINDERS

- Use `WarrantyTerm` NOT `WarrantyTerm__c`
- Use `WarrantyClaim` NOT `WarrantyClaim__c` or `WarrantyRequest__c`
- Use `AssetWarranty` to link Assets to WarrantyTerms
- Use `ProductServiceCampaign` for product recalls and service campaigns
- Use `SupplierRecoveryContract` for supplier reimbursement agreements
