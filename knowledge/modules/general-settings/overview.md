# General Settings — Overview

General Settings are the foundational, cross-cutting configurations that every Manufacturing Cloud feature depends on. Get these right before configuring any individual module — Sales Agreements, Forecasting, Warranty, and the others all assume the platform-level features below are already enabled and wired up.

## What's in General Settings

| Capability | Purpose |
|------------|---------|
| **Manufacturing License & Edition** | Activates the Manufacturing Cloud feature set on top of Enterprise / Unlimited / Developer Editions |
| **Permission Set Licenses** | License entitlements that gate which permission sets can be assigned (e.g., `ManufacturingSalesUser`, `WarrantyManagementUser`) |
| **Experience Cloud Sites** | External portals for distributors, dealers, and suppliers to view sales agreements, claims, visits, etc. |
| **Timeline** | Configurable chronological view used by Service Console, Account record pages, and Asset record pages |
| **Action Plans & Action Plan Templates** | Reusable task lists driving Partner Visits, Asset Service campaigns, and other guided processes |
| **Record Alerts** | Contextual alerts shown on Account, Asset, Sales Agreement, and Console pages |
| **Actionable Relationship Center (ARC)** | Graph visualization of relationships between accounts, assets, agreements, contacts |
| **Flow for Manufacturing** | Salesforce Flow building blocks the platform uses for activation, approval, and orchestration |
| **OmniStudio (FlexCards, OmniScripts, DataRaptors)** | Used by Pre-Work Estimation, Service Console components, and Experience Cloud pages |
| **Data Processing Engine (DPE)** | Background calculation engine for Account Forecasts, Manufacturing Programs, Inventory Searchable Field |

## Permission Set Licenses (PSLs)

PSLs are entitlement records on a User; permission sets that depend on a PSL cannot be assigned until the PSL is in place. Typical PSLs in a Manufacturing Cloud org:

| Permission Set License | Required For |
|------------------------|--------------|
| `Manufacturing Cloud for Sales` | `ManufacturingSalesUser`, `SalesAgreementsUser`, Account Forecasting features |
| `Manufacturing Cloud for Service` | `ManufacturingServiceUser`, Service Console for Manufacturing |
| `Industries Service Excellence` | Service Console components, Identity Verification, Audit Trail |
| `Warranty Lifecycle Management Psl` | `WarrantyManagementUser`, Claims, Service Part Returns, Supplier Recovery |
| `Claims Management Foundation` | Claim Coverages, Asset Account/Contact Participants |
| `Rebate Management User` | Rebate Programs |
| `Manufacturing Analytics` | CRM Analytics for Manufacturing app |
| `Manufacturing Partner Community User` | Distributor / dealer Experience Cloud users |

## SOQL Quick Reference — Detect What's Enabled

```sql
-- Permission Set Licenses provisioned in the org
SELECT MasterLabel, DeveloperName, TotalLicenses, UsedLicenses
FROM PermissionSetLicense
WHERE Status = 'Active'
ORDER BY MasterLabel

-- Users who hold each PSL
SELECT AssigneeId, Assignee.Name, PermissionSetLicense.MasterLabel
FROM PermissionSetLicenseAssign
WHERE PermissionSetLicense.MasterLabel LIKE '%Manufacturing%'

-- Active Experience Cloud sites
SELECT Id, Name, Status, UrlPathPrefix
FROM Network
WHERE Status = 'Live'

-- Action Plan Templates (active)
SELECT Id, Name, TargetEntityType, ActionPlanType, IsPublished
FROM ActionPlanTemplate
WHERE IsPublished = true

-- Flows that are active in this org (filter by name pattern)
SELECT Id, MasterLabel, ProcessType, Status
FROM FlowDefinitionView
WHERE IsActive = true
ORDER BY MasterLabel
```

## Edition & Licensing Notes

- Manufacturing Cloud requires **Enterprise**, **Unlimited**, or **Developer** Edition.
- CRM Analytics for Manufacturing is an **add-on** charge in Enterprise / Unlimited.
- OmniStudio runtime is bundled with Manufacturing Cloud; no separate license needed.
- Experience Cloud sites require Experience Cloud licenses for external users; internal partners can use platform licenses.

## Common Cross-Cutting Issues

| Symptom | Root Cause |
|---------|------------|
| Permission set won't assign | Underlying PSL not provisioned or already exhausted (UsedLicenses == TotalLicenses) |
| Console components blank | OmniStudio Standard Runtime not enabled in OmniStudio Settings |
| Timeline missing on record | Timeline not enabled in Setup, or anchored to wrong object |
| Action Plan Templates missing | `IsPublished = false` — templates must be published before reps can use them |
| ARC graph empty | No participant records (Asset Account/Contact Participants) created yet |
| DPE definitions failing silently | Field-level security gap on Bulk Job ID / Target Object API Name on Received Document |

See `configuration.md` for step-by-step setup.
