---
description: Interactive wizard to validate Manufacturing Cloud Inventory Management — data model, locations, ProductItem coverage, Inventory Search and Transfer, DPE health, serialized/batch tracking
arguments: "[check-type]"
---

# Configure Inventory Management

Interactive wizard to check and configure inventory data model + search experience.

> Note: This command focuses on the **inventory data model and search experience**. For allocation/reservation flow, use `/mfg:configure-inventory` (the existing allocation-focused command).

## Arguments

- `check-type` (optional): `full` (default), `data-model`, `search`, `dpe`, `serialized`, `transfers`, `consumption`

## Instructions

### Step 1: Verify Org Connection

Use `check_mfg_setup`. If not connected, guide through `sf org login`.

### Step 2: Confirm Inventory Management Toggle

```sql
SELECT COUNT() FROM ProductItem LIMIT 1
```

If error: feature off — direct user to Setup → Manufacturing Settings → Inventory Management.

### Step 3: Location Coverage

```sql
SELECT LocationType, COUNT(Id) cnt FROM Location GROUP BY LocationType
```

Report:
- Locations by type
- WARN if zero locations or only one type

### Step 4: ProductItem Coverage

```sql
SELECT COUNT(Id) total FROM ProductItem
```

```sql
SELECT Location.LocationType, COUNT(Id) cnt, SUM(QuantityOnHand) qty
FROM ProductItem
GROUP BY Location.LocationType
```

```sql
-- Active products without any ProductItem (potentially un-stocked)
SELECT COUNT(Id) cnt FROM Product2
WHERE IsActive = true
  AND Id NOT IN (SELECT Product2Id FROM ProductItem)
```

Report:
- Total ProductItems
- Distribution by location type
- Products active but never stocked

### Step 5: Inventory Search Configuration

```sql
-- Searchable object configurations
SELECT Id, MasterLabel, DeveloperName FROM SearchableObjectConfig__mdt LIMIT 25
```

```sql
-- Search criteria configurations
SELECT Id, MasterLabel, DeveloperName FROM SrchCriteriaConfig__mdt LIMIT 25
```

> Note: Custom Metadata for these may not be queryable. If queries fail, ask the user to confirm Setup → Searchable Object Configurations and Search Criteria Configurations.

Report what's configured. WARN if neither exists — search experience won't work.

### Step 6: Inventory Searchable Field Health

```sql
SELECT COUNT(Id) total FROM ProductInvSearchableField
```

```sql
SELECT COUNT(Id) recent FROM ProductInvSearchableField
WHERE LastModifiedDate = LAST_N_DAYS:7
```

> Note: API name may be `ProductInventorySearchableField` or `ProductInvSearchableField` depending on Salesforce release. Try both.

Report:
- Searchable field record count
- Recent updates (DPE health indicator)
- WARN if last update > 24h ago — DPE not running on cadence

### Step 7: DPE Definitions Active

```sql
SELECT Id, MasterLabel, DeveloperName, IsActive__c FROM DataProcessingEngineDef__mdt
```

> If not queryable, direct user to Setup → Data Processing Engine and look for **Update Product Inventory Searchable Field Values**.

Report whether the search refresh DPE is active and scheduled.

### Step 8: Inventory Transactions Volume

```sql
SELECT TransactionType, COUNT(Id) cnt
FROM ProductItemTransaction
WHERE CreatedDate = LAST_N_DAYS:30
GROUP BY TransactionType
```

Report transaction volume by type. WARN if zero — either no inventory activity or trigger broken.

### Step 9: Open Transfers

```sql
SELECT Status, COUNT(Id) cnt FROM ProductTransfer GROUP BY Status
```

Report transfers by status. Highlight long-stuck ones.

### Step 10: Serialized & Batch Tracking

```sql
SELECT Status, COUNT(Id) cnt FROM SerializedProduct GROUP BY Status
SELECT COUNT(Id) total FROM ProductBatchItem
```

Report whether serialized / batch tracking is in use.

### Step 11: Work Order Consumption

```sql
SELECT COUNT(Id) required FROM ProductRequired
SELECT COUNT(Id) consumed FROM ProductConsumed
```

Report consumption activity.

### Step 12: Return Orders

```sql
SELECT Status, COUNT(Id) cnt FROM ReturnOrder GROUP BY Status
```

Report return activity.

### Step 13: Permission Coverage

```sql
SELECT PermissionSet.Name, COUNT(Id) cnt
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN (
  'InventoryAllocationUser',
  'ManufacturingSalesUser',
  'ManufacturingServiceUser'
)
GROUP BY PermissionSet.Name
```

Report.

### Step 14: Present Configuration Report

```
## Inventory Management Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Data Model
- Locations: [count] across [n] types
- ProductItems: [count]
- Active products without inventory: [count]
- Serialized products: [count]
- Batch items: [count]

### Inventory Search
- Searchable Object Config: [present/missing]
- Search Criteria Config: [present/missing]
- ProductInventorySearchableField records: [count]
- DPE last run: [recent/stale]

### Activity (last 30 days)
- ProductItemTransactions: [count] by type
- ProductTransfers: [count] by status
- Open transfers stuck > 7 days: [count]
- Work order consumption events: [count]
- Return orders: [count] by status

### Permission Coverage
- Inventory Allocation User: [count] users

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 15: Offer Next Steps

**If feature off:**
- Direct to Setup → Manufacturing Settings → toggle Inventory Management

**If no Locations:**
- Walk user through creating warehouse / van / customer site location records

**If ProductInventorySearchableField empty:**
- Confirm DPE template is activated (`Update Product Inventory Searchable Field Values`)
- Run the DPE manually
- Schedule it daily via Setup → DPE

**If search component absent:**
- Walk through Lightning App Builder → Manufacturing Home → drop Criteria-Based Search and Filter component → bind to Search Criteria Configuration

**If transfers stuck:**
- List stuck transfers → ask user about destination location and inventory state at destination

**If consumption count zero on active work orders:**
- Check object permissions for `ProductConsumed`; verify work order completion flow

**If all checks pass:**
- Confirm inventory ready
- Suggest `/mfg:configure-inventory` (allocation) or `/mfg:configure-inventory-count` for additional capabilities

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable Inventory Management | Setup → Manufacturing Settings |
| Locations | App Launcher → Locations |
| ProductItems | App Launcher → Product Items |
| Searchable Object Config | Setup → Searchable Object Configurations |
| Search Criteria Config | Setup → Search Criteria Configurations |
| Search Action Config | Setup → Search Action Configurations |
| Data Processing Engine | Setup → Data Processing Engine |
| Search Component placement | Setup → Lightning App Builder |

## IMPORTANT

- Use `ProductItem`, `ProductItemTransaction`, `ProductTransfer`, `Shipment`, `ReturnOrder`, `SerializedProduct`, `ProductBatchItem` (no `__c`)
- The Update Product Inventory Searchable Field Values DPE is the lifeblood of search — must be **activated** and **scheduled**
- `ProductItemTransaction` is auto-generated — manual edits corrupt the audit trail
- Use `ProductTransfer` instead of editing `ProductItem.QuantityOnHand` directly
- Aggregation requires source fields populated — backfill `Location.LocationType` if rolling up to "Other"
- For allocation/reservation flow, use the existing `/mfg:configure-inventory` command
