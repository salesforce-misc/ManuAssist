---
description: Interactive wizard to configure and validate Manufacturing Cloud Inventory Management
arguments: "[check-type]"
---

# Configure Inventory Management

Interactive wizard to check and configure Product and Part Inventory, Inventory Search and Transfer, and inventory locations.

## Arguments

- `check-type` (optional): Focus area — `full`, `locations`, `products`, `search`, `transfers` (default: full)

## Instructions

### Step 1: Load Inventory Configuration and Validate Org

```
Read the inventory management configuration file:
/Users/sgrandhi/Documents/claudeForMFG/inventory-management-config.json
```

This config file contains:
- Complete data model for inventory objects
- Search and Transfer setup configuration
- Implementation steps and phase guidance
- Field mappings for searchable objects
- User permissions requirements
- Best practices
- **Org validation data from mfgsdb38** (validated 2026-05-04)

**Important:** Always check the `orgValidation` section in the config to see:
- Current inventory locations count (3400 locations across 5 types)
- Product items status (5741 items, 4552 with stock)
- Serialized products count (4437 units)
- Available permission sets
- Validated objects and field counts

### Step 2: Run Inventory Configuration Check

Check current org setup by querying key inventory objects and configurations.

**IMPORTANT:** Set target org to mfgsdb38 before running queries:
```bash
# All queries should use --target-org mfgsdb38
```

**Check Inventory Locations:**
```sql
SELECT Id, Name, LocationType, IsInventoryLocation, ParentLocationId
FROM Location
WHERE IsInventoryLocation = true
ORDER BY Name
LIMIT 10
```

**Expected baseline from mfgsdb38:**
- Total inventory locations: **3400**
- Location types distribution:
  - Warehouse: 1754 (51.6%)
  - Dealer Location: 1038 (30.5%)
  - Inventory Location: 475 (14.0%)
  - MANUFACTURING: 67 (2.0%)
  - LABORATORY: 66 (1.9%)

Report:
- Compare current counts with baseline
- Location types (Warehouse, Dealer Location, etc.)
- Parent-child location hierarchy
- WARN if counts differ significantly from baseline

**Check Product Items:**
```sql
SELECT COUNT(Id) total
FROM ProductItem
```

```sql
SELECT Id, Name, Product2.Name, Location.Name, QuantityOnHand, QuantityUnitOfMeasure
FROM ProductItem
WHERE QuantityOnHand > 0
ORDER BY QuantityOnHand DESC
LIMIT 10
```

**Expected baseline from mfgsdb38:**
- Total ProductItem records: **5741**
- ProductItems with stock (QuantityOnHand > 0): **4552** (79.3%)
- ProductItems without stock: **1189** (20.7%)

Report:
- Compare current counts with baseline
- Top 10 products by quantity on hand
- Stock coverage percentage
- Note: ProductItem uses Product2Id (not ProductId) - verified in org

**Check Product Transfers:**
```sql
SELECT Status, COUNT(Id) total
FROM ProductTransfer
WHERE CreatedDate = LAST_N_DAYS:90
GROUP BY Status
ORDER BY COUNT(Id) DESC
```

**Expected baseline from mfgsdb38:**
- Total ProductTransfer records: **0**
- Status: **Not configured yet**
- This indicates the org has inventory data but transfers haven't been set up

Report:
- Recent product transfer activity (last 90 days)
- Transfer status distribution
- **NOTE:** mfgsdb38 has NO transfers configured yet
- This is normal for orgs that track inventory but haven't enabled transfer workflows
- Recommend: Set up Inventory Search and Transfer feature to enable this

**Check Serialized Products:**
```sql
SELECT COUNT(Id) total
FROM SerializedProduct
```

```sql
SELECT Id, Name, Product2.Name, Location.Name, SerialNumber, Status
FROM SerializedProduct
WHERE Status = 'Available'
ORDER BY CreatedDate DESC
LIMIT 10
```

**Expected baseline from mfgsdb38:**
- Total SerializedProduct records: **4437**
- This is a significant number indicating heavy use of serialized inventory
- Ratio: 0.77 serialized products per ProductItem (high serialization rate)

Report:
- Compare current counts with baseline
- Recently added available serialized products
- Serialization rate (SerializedProducts / ProductItems ratio)
- INFO: This org heavily uses serialized products for tracking

### Step 3: Check Inventory Search Configuration

**Check Searchable Object Configuration:**
Query for existence of:
- Product Inventory Searchable Field object
- Update Product Inventory Searchable Field Values DPE template
- Search criteria configurations

```sql
SELECT Id, Name, SearchableObject
FROM SearchableObjectConfiguration
WHERE DeveloperName LIKE '%Inventory%'
```

Report:
- Whether Inventory Search is configured
- WARN if searchable object configuration missing

**Check Search Action Configuration:**
```sql
SELECT Id, Name, ActionType, ActionReference
FROM SearchActionConfiguration
WHERE Name LIKE '%Transfer%'
```

Report:
- Product Transfer action availability
- WARN if action not configured

### Step 4: Check User Permissions

```sql
SELECT PermissionSet.Name, COUNT(Id) total
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN ('ManufacturingSampleMgmtUserPsl', 'InventoryCountUserForExprcCloudPsl', 'InventoryCountManagerForExprcCloudPsl')
GROUP BY PermissionSet.Name
```

**Available Permission Sets in mfgsdb38:**
Based on org validation, these inventory-related permission sets exist:
- ManufacturingSampleMgmtUserPsl
- ManufacturingSampleMgmtForCmtyUserPsl
- InventoryCountUserForExprcCloudPsl
- InventoryCountManagerForExprcCloudPsl
- ManufacturingAdvancedAccountForecastPsl

**Note:** Standard permission set names differ from documentation:
- Use `ManufacturingSampleMgmtUserPsl` instead of `ManufacturingServiceUser`
- Use `InventoryCountUserForExprcCloudPsl` for inventory management users
- Use `InventoryCountManagerForExprcCloudPsl` for inventory managers

Report:
- Permission set assignments for inventory users
- Compare with available permission sets in org
- WARN if no users have inventory permissions assigned

### Step 5: Present Inventory Configuration Report

```
## Inventory Management Configuration Report for mfgsdb38

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Inventory Locations ✓ CONFIGURED
- Total locations: [count] (Baseline: 3400)
- Location types: [list]
  - Expected: Warehouse (1754), Dealer Location (1038), Inventory Location (475), MANUFACTURING (67), LABORATORY (66)
- Hierarchy depth: [levels]
- Variance from baseline: [+/- X%]
- Status: CONFIGURED - org has extensive location setup

### Product Items ✓ CONFIGURED
- Total products in inventory: [count] (Baseline: 5741)
- Products with stock: [count] (Baseline: 4552, 79.3%)
- Serialized products: [count] (Baseline: 4437)
- Serialization rate: [ratio] (Baseline: 0.77 per ProductItem)
- Variance from baseline: [+/- X%]
- Status: CONFIGURED - org actively tracks inventory
- Note: ProductItem uses Product2Id field (validated)

### Inventory Transfers ⚠ NOT CONFIGURED
- Recent transfers (90 days): [count] (Baseline: 0)
- By status: In Transit: [n], Delivered: [n], Cancelled: [n]
- Status: NOT CONFIGURED
- Note: Org has inventory data but no transfer workflows enabled yet

### Inventory Search and Transfer
- Searchable object configured: [Yes/No]
- DPE template active: [Yes/No]
- Search criteria configured: [Yes/No]
- Transfer action configured: [Yes/No]
- Status: [CONFIGURED / NOT CONFIGURED]

### Data Model Objects
From inventory-management-config.json:
✓ Product
✓ ProductItem
✓ ProductItemTransaction
✓ ProductRequest / ProductRequestLineItem
✓ ProductTransfer / ProductTransferState
✓ Shipment / ShipmentLineItem
✓ ProductRequired
✓ ProductConsumed / ProductConsumedState
✓ ReturnOrder / ReturnOrderLineItem / ReturnOrderItemAdjustment
✓ SerializedProduct / SerializedProductTransactions

### User Permissions
- ManufacturingServiceUser: [count] users
- InventoryAllocationUser: [count] users

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 6: Offer Implementation Guidance

**If no inventory locations exist:**
- Guide to App Launcher > Locations > New
- Explain Location Types: Warehouse, Distribution Lot, Vendor Standard Inventory, Distributor Standard Inventory
- Suggest creating parent-child hierarchy (e.g., Regional Warehouse → Local Distribution Centers)

**If no ProductItems exist:**
- Check if Products exist first
- Guide to creating Product records (App Launcher > Products)
- Explain ProductItem as junction: Product + Location = Inventory at that location
- Note: ProductItems are typically created by inventory management processes, not manually

**If Inventory Search not configured:**
- Present the 5-phase implementation plan from config file:
  1. Prepare Your Org (features, permissions, layouts)
  2. Create Searchable Object Configuration
  3. Create Search Action Configuration
  4. Create Search Criteria Configuration
  5. Add Search Component to Page

- Ask: "Would you like me to guide you through the Inventory Search and Transfer setup?"

**If no recent transfers:**
- INFO: This is expected for new implementations
- Explain how transfers work: ProductTransfer → ProductTransferState → ProductItemTransactions
- Guide to testing transfers using Inventory Search and Transfer component

**If DPE template not active:**
- Guide to Setup > Data Processing Engine Templates
- Find: "Update Product Inventory Searchable Field Values"
- Explain: This DPE keeps the searchable object synchronized with live inventory data

**If no permissions assigned:**
- Offer `list_users` + `assign_permission_set`
- Explain ManufacturingServiceUser vs InventoryAllocationUser

### Step 7: Provide Configuration Wizard

If user requests setup, walk through the implementation phases from config file:

**Phase 1: Prepare Your Org**
```
□ Enable required features in Setup
□ Assign ManufacturingServiceUser permission set
□ Assign InventoryAllocationUser permission set (if using allocation)
□ Customize page layouts for inventory objects
```

**Phase 2: Create Searchable Object Configuration**
```
□ Create searchable object: Product and Part Inventory Search
□ Select Product Inventory Searchable Field as base object
□ Activate Update Product Inventory Searchable Field Values DPE
□ Define criteria field mappings (from config)
□ Define result field mappings (from config)
```

**Phase 3: Create Search Action Configuration**
```
□ Create action: Product Transfer
□ Set API Name: Product__Transfer
□ Set Action Type: LightningWebComponent
□ Set Action Reference: Product Transfer
```

**Phase 4: Create Search Criteria Configuration**
```
□ Create config: Product and Parts Inventory Search and Transfer
□ Select Product Inventory Searchable Field
□ Select Product and Part Inventory Search configuration
□ Configure search criteria fields (from config)
□ Configure result display fields (from config)
□ Configure result aggregation fields (from config)
□ Configure result sorting fields (from config)
□ Select Product Transfer action
```

**Phase 5: Deploy to Page**
```
□ Open Manufacturing app Home page in Lightning App Builder
□ Add Criteria-Based Search and Filter component
□ Select Product and Parts Inventory Search and Transfer config
□ Save and activate page
```

### Step 8: Provide Testing Guidance

After configuration, guide user to test:

1. **Test Inventory Search:**
   - Navigate to Manufacturing app home page
   - Use search component to find products
   - Test filters: Product Family, Location Type, Make/Model
   - Verify results display correctly
   - Check aggregation grouping by Location Type

2. **Test Product Transfer:**
   - Select a product from search results
   - Click Product Transfer action
   - Select source and destination locations
   - Enter quantity to transfer
   - Verify ProductTransfer record created
   - Verify ProductItemTransactions created
   - Verify QuantityOnHand updated at both locations

3. **Test Serialized Product Transfer:**
   - Search for serialized products
   - Transfer serialized products (must transfer entire unit, no partial quantities)
   - Verify SerializedProduct.Location updated
   - Verify SerializedProductTransaction created

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable Inventory Management | Setup > Manufacturing Settings |
| Create Locations | App Launcher > Locations > New |
| View Products | App Launcher > Products |
| View Product Items | App Launcher > Product Items |
| View Product Transfers | App Launcher > Product Transfers |
| Configure Search | Setup > Criteria-Based Search and Filter |
| Configure DPE | Setup > Data Processing Engine Templates |
| Manage Permissions | Setup > Permission Sets |
| Lightning App Builder | Setup > Lightning App Builder |

## Configuration File Reference

The complete configuration is stored at:
```
/Users/sgrandhi/Documents/claudeForMFG/inventory-management-config.json
```

This file contains:
- **dataModel**: All inventory objects and their purposes
- **searchAndTransferSetup**: Complete field mappings and configurations
- **implementationSteps**: 5-phase deployment plan
- **userPermissions**: Required permission sets
- **bestPractices**: Guidance from Manufacturing Admin Guide

Refer to this file for:
- Field mapping details
- Complete list of search criteria fields
- Result display/aggregation/sorting fields
- DPE template configuration
- Object relationship diagrams

## IMPORTANT OBJECT REMINDERS

- Use `ProductItem` NOT `InventoryItem__c` or `StockItem__c`
- Use `ProductTransfer` NOT `InventoryTransfer__c`
- Use `SerializedProduct` NOT `SerializedProduct__c`
- Use `ProductItemTransaction` for tracking consumption/replenishment/adjustment/transfer
- Use `Location` with `IsInventoryLocation = true` for inventory locations
- Use `ProductInventorySearchableField` as the searchable object for Inventory Search

## Key Concepts

**Product vs ProductItem:**
- Product = What you sell (SKU, product catalog)
- ProductItem = Quantity of a Product at a specific Location

**Location Types:**
- Warehouse: Large storage facility
- Distribution Lot: Smaller distribution center
- Distributor Standard Inventory: External distributor inventory
- Vendor Standard Inventory: Supplier/vendor inventory

**Transfer States:**
- Product Transfer State tracks the lifecycle of a transfer
- ProductItemTransactions are auto-generated to update QuantityOnHand

**Serialized Products:**
- Track individual units by serial number
- Cannot transfer partial quantities (must transfer entire unit)
- Use for high-value items, warranty tracking, recall management

**Inventory Search Experience:**
- Built using Criteria-Based Search and Filter
- Requires searchable object configuration
- DPE keeps searchable object synchronized
- Supports aggregation/grouping by Location Type
- Enables Product Transfer action directly from search results
