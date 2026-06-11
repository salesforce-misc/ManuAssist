---
description: Interactive wizard to configure Manufacturing Cloud Account Manager Targets — frequency, hierarchy, measures, default price book, distribution audit
arguments: "[check-type]"
---

# Configure Account Manager Targets

Interactive wizard to validate and configure Account Manager Targets.

## Arguments

- `check-type` (optional): `full` (default), `frequency`, `hierarchy`, `measures`, `distribution`, `limits`

## Instructions

### Step 1: Verify Org Connection

Use `check_mfg_setup`. If not connected, guide through `sf org login`.

### Step 2: Verify Standard Fiscal Year

```sql
SELECT FiscalYearStartMonth, UsesStartDateAsFiscalYearName FROM Organization LIMIT 1
```

If `UsesStartDateAsFiscalYearName = false` and a custom fiscal year is detected, **STOP** — Account Manager Targets is unavailable on custom fiscal calendars. Recommend switching to standard or skipping this module.

### Step 3: Probe Object Accessibility

```sql
SELECT COUNT() FROM AcctMgrTarget LIMIT 1
```

If the object is not accessible, the feature toggle is off — direct user to Setup → Account Manager Targets → Enabled.

### Step 4: Target Inventory

```sql
SELECT FiscalYear, Measure, COUNT(Id) cnt, SUM(TargetCurrencyValue) totalCurrency
FROM AcctMgrTarget
GROUP BY FiscalYear, Measure
ORDER BY FiscalYear DESC, Measure
```

Report by fiscal year and measure.

### Step 5: Measure Configuration

```sql
SELECT Id, Label, ApiName, IsActive FROM AcctMgrTargetMeasure ORDER BY Label
```

> Note: `AcctMgrTargetMeasure` may not be queryable in all editions. If query fails, use `describe_sobject` for the Measure field on `AcctMgrTarget` to read its picklist values.

Report measures defined and which are active. WARN if only `Revenue` exists (suggest CSAT, NPS, units for non-currency).

### Step 6: Hierarchy Check

```sql
-- Users with Manager set (if Manager hierarchy)
SELECT COUNT(Id) total FROM User WHERE IsActive = true AND ManagerId != null
```

```sql
SELECT COUNT(Id) total FROM User WHERE IsActive = true
```

If `ManagerId != null` count is much lower than total active users, WARN — Manager Hierarchy will exclude users without a manager.

### Step 7: Distribution Coverage

```sql
SELECT COUNT(Id) total FROM AcctMgrTargetDistribution
SELECT COUNT(Id) total FROM AcctMgrPeriodicTargetDistribution
```

Compute utilization:
- 10M cap on Periodic Distributions
- Utilization % = total / 10,000,000 * 100

WARN if > 70% utilization.

### Step 8: Invalid Assignments Detection

> Note: Detecting invalid assignments programmatically requires reading the target record's Invalid Team Assignments related list. From SOQL alone:

```sql
SELECT AssignedToUserId, AssignedToUser.Name, AssignedToUser.IsActive, COUNT(Id) cnt
FROM AcctMgrTarget
WHERE AssignedToUser.IsActive = false
GROUP BY AssignedToUserId, AssignedToUser.Name, AssignedToUser.IsActive
```

Report any targets assigned to inactive users — these are invalid.

### Step 9: Permission Coverage

```sql
SELECT COUNT(Id) usersWithPS
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN ('ManufacturingSalesUser','SalesAgreementsUser')
```

Report users likely able to manage targets.

### Step 10: Default Price Book

```sql
SELECT Id, Name, IsActive, IsStandard FROM Pricebook2 WHERE IsActive = true
```

Report active price books. WARN if user is distributing by product and no price book is active.

### Step 11: Present Configuration Report

```
## Account Manager Targets Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED / UNAVAILABLE-CUSTOM-FY]

### Fiscal Year
- Type: [Standard / Custom]
- Start Month: [n]

### Targets
- Total: [count]
- By Fiscal Year: [year: count, ...]
- By Measure: [measure: count, ...]
- Total target value: [currency]

### Hierarchy
- Active users: [count]
- Users with Manager set: [count]
- Manager hierarchy coverage: [percentage]%

### Distribution
- Distributions: [count]
- Periodic distributions: [count] / 10,000,000 cap → [utilization]%

### Invalid Assignments
- Targets assigned to inactive users: [count] ⚠

### Measures
- Defined: [count]
- Currency type: [count]
- Non-currency type: [count]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 12: Offer Next Steps

**If custom fiscal year detected:**
- WARN strongly. Offer to skip and proceed with other modules instead.

**If toggle off:**
- Walk through Setup → Account Manager Targets → Enabled.

**If only Revenue measure:**
- Offer to add CSAT, NPS, or Units measures via Object Manager.

**If hierarchy gaps:**
- Offer Manager assignment cleanup via `bulk_update_records` against User.ManagerId.

**If no targets exist:**
- Offer to walk through creating an initial FY target.

**If invalid assignments found:**
- List them; suggest Reassign or Move via the UI.

**If close to 10M cap:**
- Discuss archive strategy for old fiscal years.

**If all checks pass:**
- Confirm configuration is healthy.
- Suggest deploying CRM Analytics for Manufacturing for target dashboards.

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable feature | Setup → Account Manager Targets |
| Distribution frequency | Setup → Account Manager Targets → Distribution Frequency |
| Hierarchy choice | Setup → Account Manager Targets → Team Member Hierarchy |
| Default price book | Setup → Account Manager Targets → Price Book |
| Measures | Object Manager → Account Manager Target → Fields → Measure picklist |
| Periodic distribution limits | Setup → Account Manager Targets → Account Manager Periodic Target Distribution Limits |
| Manage targets | App Launcher → Account Manager Targets |

## IMPORTANT

- Use `AcctMgrTarget`, NOT `AccountManagerTarget__c`
- Custom fiscal year = feature unavailable
- Distribution frequency change applies only to NEW targets
- Hierarchy type change locks ALL EXISTING targets read-only
- Always **Propagate to Assignments** after editing parent target value
- Cloning skips assignments — manual redistribute required
- Periodic distribution capped at 10M records org-wide
