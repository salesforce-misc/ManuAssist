# Inventory Management — Create & Configure

Step-by-step setup for the Manufacturing Cloud inventory data model and the Inventory Search and
Transfer experience.

---

## Prerequisites

- General Settings configured (`general-settings`)
- Manufacturing Cloud license active
- Active `Product2` records with `Type` and `QuantityUnitOfMeasure` set
- Active `Location` records (warehouses, distribution lots, vans, customer sites)
- Customize Application permission for setup steps
- Permission to manage `ProductItem` records

---

## Step 1: Enable Inventory Management

Setup → **Manufacturing Settings** → toggle **Criteria Based Search And Filter**

---

## Step 2: Define Locations

App Launcher → **Locations** → New. Set:

- Location Type (Warehouse, Distribution Lot, Site, Van, Customer Site)
- Address
- Parent Location (optional, for hierarchy)
- Location Family / Product Family (used as searchable criterion)

---

## Step 3: Create Product Items

For each product at each location:

- App Launcher → **Product Items** → New
- `Product2Id`, `LocationId`, `QuantityOnHand`, `QuantityUnitOfMeasure`

---

## Step 4: Configure Page Layouts

Add to the relevant layouts:

- **ProductItem** page → Related: Product Item Transactions, Product Batch Items, Serialized Products
- **Location** page → Related: Product Items, Shipments, Product Transfers
- **Work Order** page → Related: Product Required, Product Consumed
- **Account** page → Related: Return Orders (for customer returns)

---

## Step 5: Assign Permission Sets

- **Inventory Search And Transfer** PSL — assign to users who run inventory searches and initiate
  transfers (this PSL unlocks the Inventory Visibility module)
- The org-level toggle **Criteria Based Search And Filter** (Step 1) enables the platform — it is
  an org pref, not a permission set, so it does not need per-user assignment
- Custom permission set granting object access to `ProductItem`, `ProductItemTransaction`,
  `ProductTransfer`, `Shipment`, `ReturnOrder` for inventory operators

---

## Step 6: Set Up Inventory Search and Transfer

### 6a. Create Searchable Object Configuration

- Setup → quick find **Searchable Object Configurations** → New
- Name: `Product and Part Inventory Search`
- Searchable Object: `ProductInvSearchableField` (UI label "Product Inventory Searchable Field")
- Data Sync Job: **Update Product Inventory Searchable Field Values** DPE template (activated copy)

### 6b. Configure Criteria Field Mappings

| Searchable Object Field | Source Object | Source Object Field |
|-------------------------|---------------|---------------------|
| InventoryLocationType | Location | ProductFamily |
| ParentInventoryLocationType | Location | LocationType |
| TotalQuantityUnitOfMeasure | ProductItem | QuantityUnitOfMeasure |

### 6c. Configure Result Field Mappings

| Searchable Object Field | Source Object | Source Object Field |
|-------------------------|---------------|---------------------|
| AccountName | ProductInvSearchableField | AccountId |
| BusinessBrandName | ProductInvSearchableField | BusinessBrandId |
| InventoryLocationName | ProductInvSearchableField | InventoryLocationId |
| Name | ProductInvSearchableField | ProductItemId |
| ParentInventoryLocationName | ProductInvSearchableField | ParentInventoryLocationId |
| ProductName | ProductInvSearchableField | ProductId |

### 6d. Run the DPE

- Setup → **Data Processing Engine** → activated **Update Product Inventory Searchable Field Values**
  definition → Run

### 6e. Create Search Result Action Config (`SearchResultActionConfig`)

- Name: `Product Transfer`
- API Name: `ProductTransfer` (the bundled `SearchResultActionConfig` ships under this exact name —
  no underscore variants)
- Action Type: `LightningWebComponent`
- Action Scope: `Global`
- Action Reference: `runtime_industries_fieldservice_inventorysearch/productTransferActionWrapper`

> **Automotive variant:** `ProductTransferVehicles` is the equivalent shipped action, referencing
> `industries_automotive/productTransferActionWrapper`.
>
> **Custom actions:** create an additional `SearchResultActionConfig` record pointing at a custom
> flow or LWC, then add its API name to `SearchCriteriaConfiguration.ActionList` (comma-separated)
> to wire it into the search.

### 6f. Create Search Criteria Configuration

- Name: `Product and Parts Inventory Search and Transfer`
- Searchable Object Configuration: link to the one above
- Criteria Fields: Product Family, Product ID, Location ID, Inventory Location Type, Model Name,
  Make Name, Model Year, Product Manufacturer Name, Product Version Name, Product Item ID
- Result Display Type: `List`
- Result Display Fields: Product Name, Inventory Location Name, Total Quantity At Location,
  Total Quantity Unit Of Measure
- Aggregation Fields: Inventory Location Name, Inventory Location Type, Model Name, Make Name,
  Business Brand
- Sort Fields: Product Name, Product Manufacturer Name, Inventory Location Name,
  Inventory Location Type, Total Quantity At Location
- Search Result Actions: Product Transfer (the action configuration above)

### 6g. Add Search Component to a Page

- Lightning App Builder → Manufacturing app → Home page (or any record page)
- Drop **Criteria-Based Search and Filter** component
- Search Configuration: `Product and Parts Inventory Search and Transfer`
- Save and activate

---

## Step 7: Schedule the Searchable Field DPE

Setup → Data Processing Engine → Update Product Inventory Searchable Field Values → schedule daily
(or hourly for high-velocity orgs).

> **Critical:** ad-hoc runs are not enough — search staleness is the most common ticket from this
> module. See `limits-and-gotchas.md`.

---

## Step 8: Set Up Serialized Tracking (if used)

- On `Product2`, set `IsSerialized = true` (or equivalent flag)
- Create `SerializedProduct` records per unit at the inventory location
- Link to `ProductItem` via lookup
- Use `SerializedProductTransaction` for movement audit (auto-generated)

---

## Step 9: Set Up Batch Tracking (if used)

- Create `ProductBatchItem` records under each `ProductItem`
- Track batch number, manufacture/expiry dates
