# Inventory Management — Concepts & Architecture

---

> **Naming convention.** Several entities have UI labels that differ from their API name:
>
> - `ProductInvSearchableField` (API) ↔ "Product Inventory Searchable Field" (UI label)
> - `SearchableObjDataSyncInfo` (API) ↔ "Searchable Object Configuration" (UI label)
> - `SearchCriteriaConfiguration` (API) ↔ "Search Criteria Configuration" (UI label)
> - `SearchResultActionConfig` (API) ↔ "Search Action Configuration" (UI label)
>
> Use API names in SOQL and metadata; UI labels are what you see in Setup screens.

---

## What Is Inventory Management?

Inventory Management gives manufacturers and their service teams near real-time visibility into
product and part inventory across warehouses, distribution lots, vans, and customer sites. It
powers **transfers, returns, consumption tracking, and the inventory search experience** built on
the Manufacturing Cloud data model.

This module covers the **data model and search experience**. Allocation/reservation and physical
counts are separate modules — see Related Modules below.

---

## Why This Module Matters

- Field service techs need to know which van or warehouse has the part *now*
- Sales reps committing to a delivery date need to see what's in stock vs. on order
- Service teams completing a work order must record consumed parts to keep inventory accurate
- Recall / return campaigns require reliable serialized tracking

---

## Inventory Data Model

```
Product2 ─────────────┐
                      │
Location ─────────────┼──→ ProductItem (qty at a location)
                      │
                      └──→ ProductItemTransaction (audit trail)

ProductItem ──→ ProductBatchItem        (batch/lot tracking)
ProductItem ──→ SerializedProduct       (serial-number tracking)
                  │
                  └──→ SerializedProductTransaction

Product Transfer (between locations)
   ├── source location
   ├── destination location
   ├── qty + product
   └── ProductTransferState (when serials are attached)

Shipment (in-transit)
   └── ShipmentItem

Product Request (ordered/requested products)
   └── ProductRequestLineItem

Work Order driven:
   ├── ProductRequired         (planned)
   ├── ProductConsumed         (actuals)
   └── ProductConsumedState    (post-consumption state)

Return Order (repair / return / recall)
   ├── ReturnOrderLineItem
   └── ReturnOrderItemAdjustment
```

---

## Key Objects

| Object | Purpose |
|--------|---------|
| `Product2` | The SKU |
| `Location` | Warehouse, distribution lot, van, etc. |
| `ProductItem` | Quantity of a product at a location |
| `ProductItemTransaction` | Auto-generated record on every consume / replenish / adjust / transfer |
| `ProductBatchItem` | Batch-level tracking of a product item |
| `SerializedProduct` | Single serial number unit (status: In Stock, In Transit, Returned, etc.) |
| `SerializedProductTransaction` | State change of a serialized product |
| `ProductRequest` | Ordered or requested shipment |
| `ProductRequestLineItem` | Product line on a request |
| `ProductTransfer` | Transfer between locations |
| `ProductTransferState` | State of a transfer for serialized goods |
| `Shipment` | In-transit shipment between two locations |
| `ShipmentItem` | Product line on a shipment |
| `ProductRequired` | Planned consumption tied to a work order |
| `ProductConsumed` | Actual consumption on a work order |
| `ProductConsumedState` | Post-consumption state |
| `ReturnOrder` | Return order (repair/return/recall) |
| `ReturnOrderLineItem` | Line item on a return |
| `ReturnOrderItemAdjustment` | Price adjustment on a returned item |
| `ProductInvSearchableField` | Consolidated searchable view across the inventory data model (UI label: "Product Inventory Searchable Field") |

---

## Inventory Search and Transfer Architecture

The search experience is layered. The platform ships the data backbone and managed DPE; customers
declaratively configure the wiring and pick which fields show up.

| Layer | Component | Role |
|-------|-----------|------|
| Org pref | **Criteria Based Search And Filter** (Manufacturing Settings toggle) | Enables the platform capability and exposes the `Criteria-Based Search and Filter` LWC in Lightning App Builder |
| PSL | **Inventory Search And Transfer** | Grants users access to the Inventory Visibility module so they can search `ProductInvSearchableField` and initiate transfers |
| Data backbone | `ProductInvSearchableField` (UI label: "Product Inventory Searchable Field") | Consolidated searchable object joining `ProductItem` + `Product2` + `BusinessBrand` + `Location` (with parent-location self-join) attributes |
| DPE template | `UpdateProductInventorySearchableFieldValues` (managed; namespace `runtime_industries_fieldservice_inventorysearch`) | Populates `ProductInvSearchableField` from the underlying inventory data model |
| Sync wiring | `SearchableObjDataSyncInfo` (UI label: "Searchable Object Configuration") | Declares lookup/picklist field mappings and links the DPE to `ProductInvSearchableField` |
| Search wiring | `SearchCriteriaConfiguration` (UI label: "Search Criteria Configuration") | Defines criteria/display/aggregation/sort fieldsets and an `ActionList` of bound actions |
| Action wiring | `SearchResultActionConfig` (UI label: "Search Action Configuration") | Each entry declares one action (LWC like `ProductTransfer` or a custom flow) referenced from `SearchCriteriaConfiguration.ActionList` |
| UI surface | `Criteria-Based Search and Filter` LWC | Dragged onto a Lightning page; binds to a chosen `SearchCriteriaConfiguration` |

> There is **no OOTB-shipped `SearchCriteriaConfiguration`** for inventory — customers create their
> own and pick which fields appear as criteria, display, aggregation, and sort. The lists below are
> illustrative examples of what a customer might configure.

### Example Search Configuration Field Selections

**Example criteria fields:** Product Family, Product ID, Location ID, Inventory Location Type,
Model Name, Make Name, Model Year, Product Manufacturer Name, Product Version Name, Product Item ID

**Example display fields (List type):** Product Name, Inventory Location Name, Total Quantity At
Location, Total Quantity Unit Of Measure

**Example aggregation fields:** Inventory Location Name, Inventory Location Type, Model Name, Make
Name, Business Brand

**Example sort fields:** Product Name, Product Manufacturer Name, Inventory Location Name,
Inventory Location Type, Total Quantity At Location

---

## How `ProductInvSearchableField` Is Populated

The managed DPE template `UpdateProductInventorySearchableFieldValues` runs as a CRMA-platform
batch job and follows this pipeline:

```
ProductItem ──┬─ INNER JOIN Product2          (on ProductItem.Product2Id  = Product2.Id)
              ├─ LEFT  JOIN BusinessBrand     (on Product2.BusinessBrandId = BusinessBrand.Id)
              ├─ INNER JOIN Location          (on ProductItem.LocationId  = Location.Id)
              ├─ LEFT  JOIN Location (self)   (on Location.ParentLocationId = Location.Id)
              └─ LEFT  JOIN ProductInvSearchableField   (existing rows, for upsert)
                     │
                     └─→ UPSERT into ProductInvSearchableField (31 fields, keyed on Id)
```

**Inclusion rules:**

- One `ProductInvSearchableField` row per `ProductItem` (1:1 granularity)
- ProductItems whose `Product2Id` or `LocationId` is missing/deleted are **silently excluded**
  (driven by the two inner joins)
- `BusinessBrand` and parent location are optional enrichment (null-safe via left joins)

**Update behavior:**

- Operation = `Upsert` keyed on the existing `ProductInvSearchableField.Id`
- `isChangedRow=true` — rows are only written when source fields change since the last run
- The DPE has **no filters and no aggregations** — every qualifying ProductItem is included as-is
- `ProductItem.QuantityOnHand` is copied straight to `TotalQuantityAtLocation` (no roll-up across
  batches or serials)

**What the DPE does NOT do:**

- It does **not delete** `ProductInvSearchableField` rows when the underlying `ProductItem` is
  deleted
- It does **not aggregate** quantity across `ProductBatchItem` or `SerializedProduct` children
- It does **not filter** by ProductItem status, Active flag, or quantity threshold

### Writeback Field Mappings (source → `ProductInvSearchableField` target)

| Source object | Source field | Target field on `ProductInvSearchableField` |
|---------------|--------------|---------------------------------------------|
| `BusinessBrand` | `Name` | `BusinessBrandName` |
| `Product2` | `BusinessBrandId` | `BusinessBrandId` |
| `Location` | `Id` | `InventoryLocationId` |
| `Location` | `Name` | `InventoryLocationName` |
| `Location` | `LocationType` | `InventoryLocationType` |
| `Location` | `Latitude` | `InvLocationCoordLatitude` |
| `Location` | `Longitude` | `InvLocationCoordLongitude` |
| `Location` | `ParentLocationId` | `ParentInventoryLocationId` |
| `Location` (parent self-join) | `Name` | `ParentInventoryLocationName` |
| `Location` (parent self-join) | `LocationType` | `ParentInventoryLocationType` |
| `ProductItem` | `Id` | `ProductItemId` |
| `ProductItem` | `QuantityOnHand` | `TotalQuantityAtLocation` |
| `ProductItem` | `QuantityUnitOfMeasure` | `TotalQuantityUnitOfMeasure` |
| `Product2` | `Id` | `ProductId` |
| `Product2` | `Name` | `ProductName` |
| `Product2` | `Description` | `ProductDescription` |
| `Product2` | `Family` | `ProductFamily` |
| `Product2` | `HarmonizedSystemCode` | `HarmonizedSystemCode` |
| `Product2` | `IsEnvrPrtcRegCompliant` | `IsEnvrPrtcRegCompliant` |
| `Product2` | `IsSerialized` | `IsProductSerialized` |
| `Product2` | `MakeName` | `MakeName` |
| `Product2` | `ManufacturerName` | `ProductManufacturerName` |
| `Product2` | `ManufacturerPartNumber` | `ManufacturerPartNumber` |
| `Product2` | `ModelName` | `ModelName` |
| `Product2` | `ModelYear` | `ModelYear` |
| `Product2` | `ProductCategoryCode` | `ProductCategoryCode` |
| `Product2` | `ProductCode` | `ProductCode` |
| `Product2` | `ProductLineCode` | `ProductLineCode` |
| `Product2` | `UniversalProductCode` | `UniversalProductCode` |
| `Product2` | `VersionName` | `ProductVersionName` |
| `ProductInvSearchableField` (lookup) | `Id` | `Id` (upsert key — null inserts a new row) |

---

## Search-Time Mappings on `SearchableObjDataSyncInfo`

These mappings are **NOT** how `ProductInvSearchableField` rows are populated — that's the job of
the `UpdateProductInventorySearchableFieldValues` DPE described above.

`SearchableObjDataSyncInfo` declares mappings used by the **search component at query time**:

- `lookupMappings` — when results are returned, render related-record lookups as their `Name` field
- `picklistMappings` — align picklist value-sets between source objects and the searchable target
- `typeAheadMappings` — drive autocomplete behavior

The tables below show **example** mappings a customer would declare. Adjust to match your data
model.

**Criteria Field Mappings (example — `picklistMappings`)**

| Searchable Object Field | Source Object | Source Object Field |
|-------------------------|---------------|---------------------|
| InventoryLocationType | Location | ProductFamily |
| ParentInventoryLocationType | Location | LocationType |
| TotalQuantityUnitOfMeasure | ProductItem | QuantityUnitOfMeasure |

**Result Field Mappings (example, sampling — `lookupMappings`)**

| Searchable Object Field | Source Object | Source Object Field |
|-------------------------|---------------|---------------------|
| AccountName | ProductInvSearchableField | AccountId |
| BusinessBrandName | ProductInvSearchableField | BusinessBrandId |
| InventoryLocationName | ProductInvSearchableField | InventoryLocationId |
| Name | ProductInvSearchableField | ProductItemId |
| ParentInventoryLocationName | ProductInvSearchableField | ParentInventoryLocationId |
| ProductName | ProductInvSearchableField | ProductId |

---

## Permission Sets & Feature Toggle

| Permission Set / Toggle | Type | Used For |
|-------------------------|------|----------|
| **Criteria Based Search And Filter** | Org pref (Manufacturing Settings toggle) | Enables the platform capability and exposes the LWC in Lightning App Builder — applies org-wide, not per-user |
| **Inventory Search And Transfer** | PSL (per user) | Unlocks the Inventory Visibility module so users can search `ProductInvSearchableField` and initiate transfers |
| Custom permission with **Customize Application** | System | Configure search criteria, sync info, action records, and DPE |

---

## Related Modules

- **Inventory Allocation** — reserve product items for sales orders / work orders
- **Inventory Count** — physical inventory counts and variance reconciliation
- **Asset Service Lifecycle** — work orders consume inventory, parts return uses ReturnOrder
- **Sales Agreements** — committed quantities reference Product2 (no direct inventory link)
- **Product Portfolio** — Product2 setup the inventory data model hangs off of
