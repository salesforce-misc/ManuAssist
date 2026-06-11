---
description: Interactive wizard to validate Manufacturing Cloud foundational settings — PSLs, feature toggles, OmniStudio, Timeline, Action Plans, Experience Cloud
arguments: "[check-type]"
---

# Configure General Settings

Interactive wizard to check Manufacturing Cloud foundational configuration. Run this **before** any per-module configure command.

## Arguments

- `check-type` (optional): `full` (default), `psl`, `features`, `omnistudio`, `experience`, `templates`

## Instructions

### Step 1: Verify Org Connection

Use `check_mfg_setup` (or `run_soql` with a simple query). If not connected, guide the user through `sf org login web --alias my-mfg-org`.

### Step 2: Check Permission Set Licenses

```sql
SELECT MasterLabel, DeveloperName, TotalLicenses, UsedLicenses, Status
FROM PermissionSetLicense
WHERE Status = 'Active'
  AND (MasterLabel LIKE '%Manufacturing%'
       OR MasterLabel LIKE '%Warranty%'
       OR MasterLabel LIKE '%Industries Service%'
       OR MasterLabel LIKE '%Claims Management%'
       OR MasterLabel LIKE '%Rebate%')
ORDER BY MasterLabel
```

Report:
- Which Manufacturing-related PSLs exist
- Capacity remaining on each (`TotalLicenses - UsedLicenses`)
- WARN if any PSL is at capacity

### Step 3: Check Feature Toggles via Indirect Probes

Salesforce does not expose Manufacturing Settings toggles as queryable metadata, so probe each feature by checking if the corresponding standard objects are accessible.

```sql
SELECT COUNT() FROM SalesAgreement LIMIT 1
SELECT COUNT() FROM AccountForecast LIMIT 1
SELECT COUNT() FROM AcctMgrTarget LIMIT 1
SELECT COUNT() FROM Visit LIMIT 1
SELECT COUNT() FROM WarrantyTerm LIMIT 1
SELECT COUNT() FROM ProductItem LIMIT 1
SELECT COUNT() FROM ManufacturingProgram LIMIT 1
```

A failure (`sObject type 'X' is not supported`) means the feature toggle is off; success means it is on.

Report which features are enabled.

### Step 4: Check OmniStudio Runtime

```sql
SELECT Id, Name FROM PermissionSet WHERE Name = 'OmniStudioAdmin'
```

If returned, OmniStudio is at least installed. To check Standard Runtime, query:

```sql
SELECT Id, IsStandardRuntime__c FROM OrgPreference__c LIMIT 1
```

> Note: OmniStudio settings are not always queryable. If unsure, ask the user to verify Setup → OmniStudio Settings → Standard OmniStudio Runtime.

### Step 5: Check Timeline & Record Alerts Setup

```sql
-- Active Timeline configurations (custom metadata-driven)
SELECT Id, Label, DeveloperName FROM TimelineCnfg__mdt LIMIT 50
```

Report whether any Timeline configs exist beyond the preconfigured ones.

### Step 6: Check Active Action Plan Templates

```sql
SELECT Id, Name, TargetEntityType, ActionPlanType, IsPublished
FROM ActionPlanTemplate
ORDER BY IsPublished DESC, Name
```

Report:
- Total templates, published vs. draft
- WARN about any draft templates that field reps probably need

### Step 7: Check Experience Cloud Sites

```sql
SELECT Id, Name, Status, UrlPathPrefix
FROM Network
ORDER BY Status, Name
```

Report:
- Live sites (Status = 'Live')
- Sites in Preview / Inactive
- WARN if user mentioned partners/suppliers but no Live site exists

### Step 8: Check Active Flows for Manufacturing Patterns

```sql
SELECT Id, MasterLabel, ProcessType, Status
FROM FlowDefinitionView
WHERE IsActive = true
  AND (MasterLabel LIKE '%Manufacturing%'
       OR MasterLabel LIKE '%Verify Customer%'
       OR MasterLabel LIKE '%Identity%')
```

Report active Manufacturing-related flows.

### Step 9: Check Standard Fiscal Year

```sql
SELECT Id, FiscalYearStartMonth, UsesStartDateAsFiscalYearName
FROM Organization
LIMIT 1
```

If the org uses a custom fiscal year, WARN — Account Manager Targets requires standard fiscal year.

### Step 10: Present Configuration Report

```
## Manufacturing General Settings Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Permission Set Licenses
- Manufacturing Cloud for Sales: [available/missing], capacity: [used/total]
- Manufacturing Cloud for Service: ...
- Warranty Lifecycle Management Psl: ...
- Industries Service Excellence: ...
- Manufacturing Analytics: ...

### Feature Toggles
- Sales Agreements: [enabled/disabled]
- Account Forecasting: ...
- Account Manager Targets: ...
- Partner Visits: ...
- Warranty: ...
- Inventory Management: ...
- Manufacturing Programs: ...

### Foundational Capabilities
- OmniStudio: [installed/runtime status]
- Timeline configurations: [count]
- Action Plan Templates (published): [count]
- Live Experience Cloud sites: [count]
- Standard fiscal year: [yes/no]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 11: Offer Next Steps

**If PSL missing/exhausted:**
- Direct user to Setup → Company Information → Permission Set Licenses
- For exhausted PSL, suggest contacting Salesforce account team for additional capacity

**If feature toggle off:**
- Walk through Setup → Manufacturing Settings → toggle the missing feature

**If OmniStudio runtime off:**
- Setup → OmniStudio Settings → enable Standard OmniStudio Runtime
- Confirm by asking user to take a screenshot of the OmniStudio Settings page

**If no Action Plan Templates published:**
- Suggest using `/mfg:configure-visits` to build the first template

**If custom fiscal year:**
- WARN user that Account Manager Targets is unavailable
- Discuss whether the org can switch to standard fiscal year (rare and disruptive)

**If all checks pass:**
- Confirm general settings are ready
- Suggest the next configure command based on user's track (Sales / Service / both)

## Admin Console Navigation

| Task | Path |
|------|------|
| Permission Set Licenses | Setup → Company Information → Permission Set Licenses |
| Feature Toggles | Setup → Manufacturing Settings |
| OmniStudio Runtime | Setup → OmniStudio Settings |
| Timeline | Setup → Timeline |
| Record Alerts | Setup → Record Alerts |
| Action Plan Templates | App Launcher → Action Plan Templates |
| Actionable Relationship Center | Setup → Actionable Relationship Center |
| Experience Cloud Sites | Setup → Digital Experiences → All Sites |
| Fiscal Year | Setup → Company Information |

## IMPORTANT

- Always run general settings checks **before** module-specific wizards
- A missing PSL or disabled feature toggle masquerades as a "module bug" 90% of the time — check here first
- `Network` object is the API name for Experience Cloud sites
- `ActionPlanTemplate.IsPublished = true` is required for reps to use the template
