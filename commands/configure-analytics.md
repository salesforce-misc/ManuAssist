---
description: Interactive wizard to configure Manufacturing Cloud analytics — Default Analytics Dashboard (Beta), CRM Analytics for Manufacturing, Statistical Order Forecasting, Einstein Discovery
arguments: "[check-type]"
---

# Configure Analytics for Manufacturing

Interactive wizard to validate and configure Manufacturing Cloud analytics offerings.

## Arguments

- `check-type` (optional): `full` (default), `default-dashboard`, `crma`, `permissions`, `data`, `dataflow`, `embedded`

## Instructions

### Step 1: Verify Org Connection

Use `check_mfg_setup`. If not connected, guide through `sf org login`.

### Step 2: Detect Analytics Entitlement

```sql
SELECT MasterLabel, TotalLicenses, UsedLicenses, Status
FROM PermissionSetLicense
WHERE MasterLabel LIKE '%Analytics%' OR MasterLabel LIKE '%CRMA%'
ORDER BY MasterLabel
```

Report:
- Default Analytics Dashboard (free) — always available with Manufacturing license
- CRM Analytics Plus — required for full app
- Manufacturing Analytics — required for full Manufacturing-flavored app
- WARN if user wants full CRMA but PSLs missing

### Step 3: Check Permission Set Assignments

```sql
SELECT PermissionSet.Name, COUNT(Id) cnt
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN (
  'AnalyticsViewOnlyEmbeddedApp',
  'CRMAnalyticsPlusAdmin',
  'CRMAnalyticsPlusUser',
  'ManufacturingAnalyticsAdmin',
  'ManufacturingAnalyticsUser'
)
GROUP BY PermissionSet.Name
```

Report user counts.

### Step 4: Check Data Prerequisites

```sql
SELECT COUNT(Id) sa FROM SalesAgreement
SELECT COUNT(Id) sap FROM SalesAgreementProduct
SELECT COUNT(Id) saps FROM SalesAgreementProductSchedule
SELECT COUNT(Id) af FROM AccountForecast
SELECT COUNT(Id) amt FROM AcctMgrTarget
SELECT COUNT(Id) rpm FROM RebateProgramMember
```

Report what data exists. WARN if Sales Agreement count = 0 (Default Dashboard renders blank).

For Einstein Discovery readiness:
- Sales Agreement Product Schedules ≥ 300 rows → "Maximize Sales Agreement Product Renewals" eligible
- Sales Agreement Product Schedules ≥ 300 rows → "Get Price Recommendations" eligible
- Forecast facts ≥ 300 rows → Statistical Order Forecasting eligible

### Step 5: Check Analytics Cloud Integration User FLS Hints

```sql
SELECT Id, Name, ProfileId, Profile.Name FROM User
WHERE Profile.Name LIKE '%Analytics%' AND IsActive = true
```

Report whether Analytics Cloud Integration User exists. Confirm with user that FLS has been set on Account, Sales Agreement, Forecast, Rebate fields. (Direct queries on Profile FLS are not reliable across releases.)

### Step 6: Detect Existing Embedded Dashboards

```sql
SELECT Id, MasterLabel, NamespacePrefix FROM FlexiPage
WHERE MasterLabel LIKE '%Manufacturing%' OR MasterLabel LIKE '%Analytics%'
```

Ask user if any of these pages have embedded CRM Analytics Dashboard components.

### Step 7: Decision Branch

Ask the user:
> Do you have CRM Analytics add-on licensing?
> - **No / Not sure** → recommend Default Analytics Dashboard path
> - **Yes** → recommend full CRM Analytics for Manufacturing path

### Step 8a: Default Dashboard Path Checks

If user chose Default:
- Confirm `AnalyticsViewOnlyEmbeddedApp` PS assigned to viewers
- Confirm Account FLS for Integration User on AccountNumber, Ownership, Rating
- Confirm Default Analytics Dashboards toggled in Manufacturing Settings
- Confirm CRM Analytics Dashboard component is on Manufacturing Home page

### Step 8b: CRM Analytics Path Checks

If user chose full:
- Confirm permission sets assigned (Plus Admin/User + Manufacturing Analytics Admin/User)
- Confirm comprehensive FLS on all required objects (use Field Accessibility view)
- Ask whether app has been created via Analytics Studio
- Ask whether dataflow has been scheduled
- Identify embedded dashboard placements

### Step 9: Present Configuration Report

```
## Analytics for Manufacturing Configuration Report

### Path Recommended
[Default Dashboard / Full CRM Analytics for Manufacturing]

### Entitlement
- Manufacturing Analytics PSL: [yes/no]
- CRM Analytics Plus: [yes/no]
- Free Default Dashboard: [available]

### Permission Coverage
- Analytics View Only Embedded App: [count]
- CRM Analytics Plus Admin: [count], User: [count]
- Manufacturing Analytics Admin: [count], User: [count]

### Data Prerequisites
- Sales Agreements: [count]
- Sales Agreement Products: [count]
- Sales Agreement Product Schedules: [count]
- Account Forecasts: [count]
- Account Manager Targets: [count]
- Rebate Program Members: [count]

### Einstein Discovery Eligibility
- Sales agreement story (≥ 300 rows): [eligible/insufficient]
- Forecast story (≥ 300 rows): [eligible/insufficient]

### Embedded Dashboards
- Manufacturing Home page: [present/missing]
- Other Lightning pages with CRM Analytics Dashboard: [list]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 10: Offer Next Steps

**If Default path & no Sales Agreement data:**
- Recommend creating sample Sales Agreements via `/mfg:configure-sales-agreements`

**If Default path & not enabled:**
- Walk user through Setup → Manufacturing → Sales Agreements → Enable Default Analytics Dashboards
- Then walk through embedding via Lightning App Builder

**If full path & permissions missing:**
- Offer to bulk-assign Plus + Manufacturing Analytics permission sets

**If full path & FLS uncertain:**
- Offer to walk through Setup → Object Manager → Sales Agreement → Set Field-Level Security for Integration User on all fields

**If full path & app not created:**
- Walk through Analytics Studio → Create App → Analytics for Manufacturing template
- Discuss wizard Q&A choices (hierarchy, order credit, currency)

**If Einstein Discovery insufficient data:**
- Skip Discovery for now; revisit when data volume crosses 300 rows

**If dataflow not scheduled:**
- Direct to Analytics Studio → Data Manager → Dataflows → schedule daily

**If all checks pass:**
- Confirm analytics ready
- Offer to draft a quarterly health-check checklist

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable CRM Analytics | Setup → Analytics → Getting Started |
| Default Dashboards toggle | Setup → Manufacturing → Sales Agreements |
| Set Up CRM Analytics for Manufacturing | Setup → quick find Set Up CRM Analytics for Manufacturing |
| Permission Sets | Setup → Permission Sets |
| Field-Level Security | Setup → Object Manager → [Object] → Fields → Set Field-Level Security |
| App Builder (embed dashboard) | Setup → Lightning App Builder |
| Analytics Studio | App Launcher → Analytics Studio |
| Dataflow scheduling | Analytics Studio → Data Manager → Dataflows |

## IMPORTANT

- Beta = no SLA. The Default Analytics Dashboard is delivered as-is.
- App install skips Einstein Discovery silently if < 300 rows — read post-install message
- App install **fails** if any required field is missing FLS for Analytics Cloud Integration User
- Match Analytics security predicate to Account Manager Targets hierarchy choice
- Schedule the dataflow — ad-hoc refresh leaves dashboards stale
- Default Dashboard requires Sales Agreement / Product / Schedule data to render
