---
description: Interactive wizard to validate and configure Service Console for Manufacturing — components, permission sets, OmniStudio, Timeline, Knowledge, CTI
arguments: "[check-type]"
---

# Configure Service Console

Interactive wizard to check and configure Service Console for Manufacturing.

## Arguments

- `check-type` (optional): `full` (default), `psl`, `omnistudio`, `timeline`, `knowledge`, `cti`, `layout`

## Instructions

### Step 1: Verify Org Connection

Use `check_mfg_setup`. If not connected, guide through `sf org login`.

### Step 2: Check Required PSLs

```sql
SELECT MasterLabel, TotalLicenses, UsedLicenses, Status
FROM PermissionSetLicense
WHERE MasterLabel IN (
  'Manufacturing Cloud for Service',
  'Industries Service Excellence',
  'Manufacturing Cloud Plus'
) OR MasterLabel LIKE '%OmniStudio%'
```

Report: which PSLs exist, capacity remaining. WARN if Manufacturing Cloud for Service or Industries Service Excellence missing.

### Step 3: Probe Service Console App

```sql
SELECT Id, Label, DeveloperName FROM AppDefinition
WHERE Label LIKE '%Service Console%' OR Label LIKE '%Manufacturing%'
ORDER BY Label
```

Report the consoles present. Confirm Service Console for Manufacturing exists.

### Step 4: Check Permission Set Assignments

```sql
SELECT PermissionSet.Name, COUNT(Id) cnt
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN (
  'IndustryServiceExcellence',
  'ServiceConsoleforManufacturing',
  'OmnistudioAdmin',
  'OmnistudioUser'
)
GROUP BY PermissionSet.Name
```

Report users assigned to each PS. WARN if Service Console permission set has zero assignments.

### Step 5: Probe OmniStudio Settings (best-effort)

```sql
SELECT Id, Name FROM PermissionSet WHERE Name = 'OmnistudioAdmin' LIMIT 1
```

If returned, OmniStudio is at least installed. Ask the user to confirm Setup → OmniStudio Settings → Standard OmniStudio Runtime is **on**.

### Step 6: Check Timeline Configurations

```sql
SELECT Id, Label, DeveloperName FROM TimelineCnfg__mdt LIMIT 50
```

Report Timeline configs. WARN if none beyond preconfigured Interaction Timeline.

### Step 7: Check Account Page Layout Coverage

> Note: Page layout assignments are not directly queryable — ask the user to confirm Setup → Object Manager → Account → Page Layouts has Orders + Assets + Cases related lists.

### Step 8: Check Engagement Interaction Volume

```sql
SELECT COUNT(Id) total FROM EngagementInteraction
SELECT COUNT(Id) recent FROM EngagementInteraction WHERE CreatedDate = LAST_N_DAYS:30
```

Report:
- Total interactions
- Last 30 days
- WARN if zero — CTI integration likely not wired up

### Step 9: Check Identity Verification Activity

```sql
SELECT COUNT(Id) total FROM IdentityVerification
```

Report. WARN if zero and CTI exists.

### Step 10: Check Knowledge Setup

```sql
SELECT COUNT(Id) published FROM KnowledgeArticleVersion WHERE PublishStatus = 'Online'
```

Report number of published articles. WARN if zero and Knowledge component is in scope.

### Step 11: Check Active Flows for Service Console Patterns

```sql
SELECT Id, MasterLabel, ProcessType, Status
FROM FlowDefinitionView
WHERE IsActive = true
  AND (MasterLabel LIKE '%Verify Customer%'
       OR MasterLabel LIKE '%Identity%'
       OR MasterLabel LIKE '%Engagement%')
```

Report active service-related flows. WARN if Verify Customer Identity flow inactive.

### Step 12: Present Configuration Report

```
## Service Console for Manufacturing Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Permission Set Licenses
- Manufacturing Cloud for Service: [yes/no, capacity]
- Industries Service Excellence: [yes/no, capacity]

### Permission Set Assignments
- Service Console for Manufacturing: [count] users
- Industries Service Excellence: [count] admins
- OmniStudio Admin: [count]

### App
- Service Console for Manufacturing app: [present/missing]

### Foundational Capabilities
- OmniStudio Standard Runtime: [on/off — confirm with user]
- Timeline configurations: [count]
- Knowledge published articles: [count]

### Activity
- Engagement Interactions (total): [count]
- Engagement Interactions (last 30 days): [count]
- Identity Verifications: [count]

### Active Flows
- Verify Customer Identity (or equivalent): [active/inactive]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 13: Offer Next Steps

**If PSL missing:**
- Direct user to Setup → Permission Set Licenses; offer to draft Salesforce support case if exhausted

**If Service Console PS unassigned:**
- Offer to bulk-assign via `assign_permission_set` to filtered users

**If OmniStudio Standard Runtime not confirmed:**
- Walk user through Setup → OmniStudio Settings

**If no Timeline configs:**
- Offer to walk through creating an Engagement Interaction Timeline anchored to Contact

**If Account page layout missing related lists:**
- Direct to Setup → Object Manager → Account → Page Layouts

**If Verify Customer Identity flow inactive:**
- Direct to Setup → Flows → activate

**If zero Engagement Interactions:**
- Discuss CTI integration plan; offer to research Service Cloud Voice or BYOT setup

**If all checks pass:**
- Confirm console is ready
- Suggest extending: Timeline on Account, Record Alerts on Sales Agreements, configure Actions for Renewals

## Admin Console Navigation

| Task | Path |
|------|------|
| App Manager | Setup → App Manager → Service Console for Manufacturing → Edit |
| OmniStudio Settings | Setup → OmniStudio Settings |
| Timeline | Setup → Timeline |
| Record Alerts | Setup → Record Alerts |
| Knowledge | Setup → Knowledge → Knowledge Settings |
| Open CTI | Setup → Service Cloud Voice / Open CTI |
| Page Layouts | Setup → Object Manager → Account → Page Layouts |

## IMPORTANT

- Standard OmniStudio Runtime is REQUIRED for Record Alerts
- Service Console renders blank components silently if OmniStudio Runtime is off
- Use `EngagementInteraction`, NOT `EngagementInteraction__c`
- Account page layout MUST include Order, Asset, Case related lists for snapshots to populate
- The console's preconfigured Interaction Timeline is anchored to **Contact** — if your business needs Account-anchored timelines, build a custom Timeline configuration
- Asset Service Console is a SEPARATE console — see `/mfg:configure-asset-service`
