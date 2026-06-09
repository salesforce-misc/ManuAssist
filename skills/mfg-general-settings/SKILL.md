---
name: mfg-general-settings
description: Expert guidance on Manufacturing Cloud foundational settings — permission set licenses, feature toggles, OmniStudio, Timeline, Record Alerts, Action Plans, Experience Cloud, ARC, and DPE prerequisites. Use when user asks about enabling Manufacturing Cloud, missing Manufacturing Settings nodes, PSL assignment failures, OmniStudio runtime issues, Experience Cloud setup for partners/suppliers, or cross-module dependencies.
---

# Manufacturing Cloud General Settings

General Settings are the foundational, cross-cutting configurations every Manufacturing Cloud feature depends on. Configure them **before** any per-module wizard.

## Why This Matters

Almost every "module won't enable" / "permission set won't assign" / "console component is blank" support ticket traces back to a missed General Settings step. When in doubt, run through the dependency chain below before debugging individual modules.

## What's in General Settings

| Capability | Purpose |
|------------|---------|
| Manufacturing license & feature toggles | Activates Sales, Service, Warranty, Inventory, Programs |
| Permission Set Licenses (PSLs) | Entitlements gating permission set assignment |
| OmniStudio | FlexCards / OmniScripts / DataRaptors used by console components and Pre-Work Estimation |
| Timeline | Chronological view used by Service Console, Account, Asset pages |
| Record Alerts | Contextual alerts on Account, Asset, Sales Agreement, console pages |
| Action Plan Templates | Reusable task lists driving Partner Visits, Asset Service campaigns |
| Actionable Relationship Center (ARC) | Graph visualization of related accounts/assets/contacts |
| Experience Cloud sites | External portals for distributors, dealers, suppliers |
| Data Processing Engine (DPE) | Background calculation engine for Forecasts, Programs, Inventory Search |

## Required PSLs by Track

**Sales track:** Manufacturing Cloud for Sales

**Service track:** Manufacturing Cloud for Service, Industries Service Excellence, Warranty Lifecycle Management Psl, Claims Management Foundation

**Analytics:** Manufacturing Analytics

**Partners:** Manufacturing Partner Community User

## Configuration Order (don't skip steps)

1. Verify Manufacturing license — Setup → Manufacturing Settings node visible
2. Provision PSLs — Setup → Company Information → Permission Set Licenses
3. Toggle features — Setup → Manufacturing Settings (Sales Agreements, Forecasting, Warranty, etc.)
4. Enable OmniStudio Standard Runtime — Setup → OmniStudio Settings
5. Enable Timeline — Setup → Timeline
6. Enable Record Alerts — Setup → Record Alerts
7. Enable ARC — Setup → Actionable Relationship Center
8. Configure Flow defaults — Setup → Flows
9. Create Experience Cloud sites — Setup → Digital Experiences (if external users)
10. Verify standard fiscal year — Setup → Company Information (Account Manager Targets requires standard)
11. Configure Analytics Integration User FLS (if CRM Analytics in scope)
12. Assign permission sets to users

## Common Diagnostic SOQL

```sql
-- Are required PSLs in the org with capacity?
SELECT MasterLabel, TotalLicenses, UsedLicenses, Status
FROM PermissionSetLicense
WHERE MasterLabel LIKE '%Manufacturing%'
   OR MasterLabel LIKE '%Warranty%'
   OR MasterLabel LIKE '%Industries Service Excellence%'

-- Has a specific user been granted the right PSLs?
SELECT PermissionSetLicense.MasterLabel
FROM PermissionSetLicenseAssign
WHERE AssigneeId = '<UserId>'

-- Active Experience Cloud sites
SELECT Id, Name, Status, UrlPathPrefix FROM Network WHERE Status = 'Live'

-- Published Action Plan Templates
SELECT Id, Name, TargetEntityType FROM ActionPlanTemplate WHERE IsPublished = true
```

## Troubleshooting Quick Map

| Symptom | First Thing to Check |
|---------|----------------------|
| Manufacturing Settings node missing | License/SKU not provisioned — open support case |
| Can't assign Manufacturing permission set | Underlying PSL missing or capacity exhausted |
| Console component renders blank | OmniStudio Standard Runtime off |
| Timeline shows no events | Timeline disabled or anchored to wrong object |
| Action Plan Template invisible to reps | `IsPublished = false` |
| Account Manager Targets won't enable | Org on **custom** fiscal year (not supported) |
| DPE produces zero rows | Bulk Job ID / Target Object API Name FLS gap on Received Document |
| Experience Cloud user can't log in | Community license exhausted or `IsActive = false` |

## When to Recommend This Skill

- New org being set up for the first time
- Module-specific config keeps failing
- Permission set won't stick to a user
- Console / OmniScript components are blank
- Spinning up a partner/supplier portal
- Migrating from sandbox to production and feature toggles got missed

## Detailed Documentation

Use `get_mfg_module_docs` with slug `general-settings` for full setup reference, or `search_mfg_knowledge` for cross-module questions.
