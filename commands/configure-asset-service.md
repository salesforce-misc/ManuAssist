---
description: Interactive wizard to validate and configure Manufacturing Cloud Asset Service Lifecycle — Asset Service Console, Pre-Work Estimation, Fleets, Asset Coverage, Service Parts Return, Connected Assets
arguments: "[check-type]"
---

# Configure Asset Service Lifecycle

Interactive wizard to check and configure the Asset Service Lifecycle stack.

## Arguments

- `check-type` (optional): `full` (default), `console`, `prework`, `fleet`, `coverage`, `parts-return`, `participants`, `campaigns`

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
  'Warranty Lifecycle Management Psl',
  'Claims Management Foundation'
)
```

Report PSL coverage. WARN on missing PSLs.

### Step 3: Asset Inventory

```sql
SELECT COUNT(Id) total FROM Asset
SELECT COUNT(Id) withParent FROM Asset WHERE ParentAssetId != null
SELECT COUNT(Id) withSerial FROM Asset WHERE SerialNumber != null
```

Report:
- Total assets
- With parent (hierarchy coverage)
- With serial number

### Step 4: Asset Participant Coverage

```sql
SELECT COUNT(Id) total FROM AssetAccountParticipant
SELECT COUNT(Id) total FROM AssetContactParticipant
```

Report participant counts. WARN if zero.

### Step 5: Asset Milestones & Warranties

```sql
SELECT COUNT(Id) total FROM AssetMilestone
SELECT COUNT(Id) total FROM AssetWarranty
SELECT COUNT(Id) active FROM AssetWarranty WHERE EndDate > TODAY
```

Report:
- Total milestones
- Total warranties; active vs. expired

### Step 6: Pre-Work Estimation App Check

```sql
SELECT Id, MasterLabel, NamespacePrefix FROM FlexiPage WHERE MasterLabel = 'Pre-Work Estimation' LIMIT 5
```

Report whether the Lightning page exists. WARN if missing — direct user to create via Lightning App Builder.

### Step 7: Document Generation Setup

```sql
SELECT Id, Name FROM DocumentTemplate WHERE Name = 'OrderDetails' LIMIT 1
```

Report. WARN if Pre-Work Estimation in scope but template missing.

### Step 8: Fleet Inventory

```sql
SELECT FleetType, Status, COUNT(Id) cnt FROM Fleet GROUP BY FleetType, Status
SELECT COUNT(Id) total FROM FleetAsset
SELECT COUNT(Id) total FROM FleetParticipant
```

Report fleet shape if any.

### Step 9: Service Parts Return Volume

```sql
SELECT Status, COUNT(Id) cnt FROM ReturnOrder GROUP BY Status
```

Report return order activity.

### Step 10: Product Service Campaigns

```sql
SELECT Status, COUNT(Id) cnt FROM ProductServiceCampaign GROUP BY Status
```

Report campaigns by status.

### Step 11: Active Work Orders & Claims tied to Assets

```sql
SELECT COUNT(Id) cnt FROM WorkOrder WHERE AssetId != null AND Status NOT IN ('Closed','Cancelled')
SELECT COUNT(Id) cnt FROM Claim WHERE AssetId != null AND Status NOT IN ('Closed','Cancelled')
```

Report active asset-linked work.

### Step 12: Permission Set Assignments

```sql
SELECT PermissionSet.Name, COUNT(Id) cnt
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN (
  'ServiceConsoleforManufacturing',
  'ClaimsManagementFoundation',
  'ServicePartReturnManagement',
  'WarrantyLifecycleManagementPsl',
  'UseFleetManagementFeatures'
)
GROUP BY PermissionSet.Name
```

Report user coverage by permission set.

### Step 13: Present Configuration Report

```
## Asset Service Lifecycle Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### PSLs
- Manufacturing Cloud for Service: [yes/no]
- Industries Service Excellence: [yes/no]
- Warranty Lifecycle Management Psl: [yes/no]
- Claims Management Foundation: [yes/no]

### Assets
- Total: [count]
- With hierarchy (ParentAssetId): [count]
- With serial number: [count]
- Account participants: [count]
- Contact participants: [count]
- Milestones: [count]
- Warranties (active): [count]

### Pre-Work Estimation
- Lightning page: [present/missing]
- OrderDetails Document Template: [present/missing]

### Fleet Management
- Fleets: [count] by type/status
- Fleet Assets: [count]
- Fleet Participants: [count]

### Activity
- Open work orders on assets: [count]
- Open claims on assets: [count]
- Return orders: [count] by status
- Product Service Campaigns: [count] by status

### Permission Coverage
- Service Console for Manufacturing: [count]
- Claims Management Foundation: [count]
- Service Part Return Management: [count]
- Use Fleet Management Features: [count]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 14: Offer Next Steps

**If PSLs missing:**
- Direct to Setup → Permission Set Licenses

**If Pre-Work Estimation page missing:**
- Walk user through Lightning App Builder creation:
  1. Setup → User Interface → Lightning App Builder → New
  2. App Page → label `Pre-Work Estimation`
  3. One Region → drop OmniScript component
  4. Type `team`, Subtype `createOrder`, Theme `Newport`
  5. Activate, add to Manufacturing app + Mobile Navigation

**If OrderDetails template missing but Pre-Work in scope:**
- Direct to Foundation Document Generation setup

**If hierarchy coverage low:**
- Suggest setting `ParentAssetId` for assets that are part of larger systems

**If no participants:**
- Direct to Object Manager → Asset Account/Contact Participant → ensure picklist values exist; offer to bulk-create participant records

**If fleets in scope but unconfigured:**
- Direct to Setup → Fleet Management → enable; walk through creating first Fleet → FleetAsset → FleetParticipant

**If recalls happen frequently:**
- Recommend Product Service Campaign workflow over manual work order creation

**If all checks pass:**
- Confirm asset service ready
- Suggest running `/mfg:configure-warranty` to round out the Service track

## Admin Console Navigation

| Task | Path |
|------|------|
| Asset Service Console app | Setup → App Manager → Asset Service Console for Manufacturing |
| Asset page customization | Setup → Object Manager → Asset → Lightning Record Pages |
| Asset Account Participant picklist | Setup → Object Manager → Asset Account Participant → Stakeholder Role |
| Pre-Work Estimation page | Setup → User Interface → Lightning App Builder |
| Document Generation | Setup → Document Generation → OrderDetails template |
| Fleet Management toggle | Setup → Fleet Management |
| Service Parts Return | Object Manager → Claim/Work Order → Quick Actions → New Service Part Return |
| Connected Assets toggle | Setup → Manufacturing Settings → Connected Assets |
| Product Service Campaign | App Launcher → Product Service Campaigns |

## IMPORTANT

- Use `Asset`, `AssetWarranty`, `Fleet`, `FleetAsset`, `FleetParticipant`, `ProductServiceCampaign` (no `__c`)
- Pre-Work Estimation is NOT delivered preconfigured — admins must create the Lightning App Page
- OmniScript component values: Type=`team`, Subtype=`createOrder`, Theme=`Newport`
- Record Alerts work on Fleet, NOT FleetAsset or FleetParticipant
- Service Parts Return quantity bounded by claim coverage payment detail or WOLI quantity
- Connected Assets requires Data Cloud
- Active Asset Count on Fleet only counts FleetAsset.Status = 'Active'
