---
name: mfg-inventory-management
description: Expert guidance on Manufacturing Cloud inventory data model — ProductItem, ProductItemTransaction, Location, Shipment, ProductTransfer, ProductRequired, ProductConsumed, ReturnOrder, SerializedProduct, ProductBatchItem, Inventory Search and Transfer (Criteria-Based Search and Filter), and the Product Inventory Searchable Field DPE. Use when user asks about inventory data model, configuring inventory search, ProductInventorySearchableField, transferring stock between locations, work order consumption, or serialized/batch tracking. NOT for allocation/reservation (use mfg-inventory-allocation) or counts (use inventory-count).
---

# Manufacturing Cloud Inventory Management (Overview & Search)

The inventory data model + the configurable Inventory Search and Transfer experience. Allocation and counts are separate modules.

## Data Model Map

```
Product2 + Location → ProductItem (qty at location)
                       ├── ProductItemTransaction (auto audit log)
                       ├── ProductBatchItem (batch tracking)
                       └── SerializedProduct (serial tracking)
                                  └── SerializedProductTransaction

ProductTransfer (between locations)
   └── ProductTransferState (for serialized goods)

Shipment (in-transit)
   └── ShipmentItem

Work Order →
   ├── ProductRequired (planned)
   ├── ProductConsumed (actual)
   └── ProductConsumedState

ReturnOrder
   ├── ReturnOrderLineItem
   └── ReturnOrderItemAdjustment

ProductInventorySearchableField (consolidated search index)
```

## Inventory Search Setup (the part most teams stumble on)

1. Searchable Object Configuration → searchable object = `ProductInventorySearchableField`, data sync = `Update Product Inventory Searchable Field Values` DPE (activated copy)
2. Map criteria fields (10 default fields)
3. Map result fields (display + aggregation + sort)
4. Search Action Configuration → Product Transfer LWC
5. Search Criteria Configuration → wires the above together
6. Run the DPE — **without this step, search returns nothing**
7. Drop Criteria-Based Search and Filter component on a page

## Default Search Configuration

| Aspect | Fields |
|--------|--------|
| Criteria | Product Family, Product ID, Location ID, Inventory Location Type, Model Name, Make Name, Model Year, Product Manufacturer Name, Product Version Name, Product Item ID |
| Display (List) | Product Name, Inventory Location Name, Total Quantity At Location, Total Quantity Unit Of Measure |
| Aggregation | Inventory Location Name, Inventory Location Type, Model Name, Make Name, Business Brand |
| Sort | Product Name, Product Manufacturer Name, Inventory Location Name, Inventory Location Type, Total Quantity At Location |

## Hard Rules

- DPE must run on a schedule, not ad-hoc — search staleness is the most common ticket
- `ProductItemTransaction` is auto-generated — never edit manually
- `ProductTransfer` updates source/destination ProductItem only when `Status = 'Completed'`
- For serialized goods, `ProductTransferState` records must be created — otherwise serial state is inconsistent
- `Product2.QuantityUnitOfMeasure` and `ProductItem.QuantityUnitOfMeasure` must match for aggregation to work

## Common SOQL

```sql
-- Stock at a location
SELECT Product2.Name, QuantityOnHand, QuantityUnitOfMeasure
FROM ProductItem WHERE LocationId = '<id>'

-- Recent ProductItemTransactions
SELECT TransactionType, Quantity, CreatedDate, ProductItem.Product2.Name
FROM ProductItemTransaction WHERE CreatedDate = LAST_N_DAYS:7

-- Open transfers
SELECT Id, SourceLocation.Name, DestinationLocation.Name, Status
FROM ProductTransfer WHERE Status NOT IN ('Completed','Cancelled')

-- Serialized in-transit
SELECT SerialNumber, Status, CurrentLocation.Name
FROM SerializedProduct WHERE Status = 'In Transit'

-- Work order consumption today
SELECT WorkOrder.WorkOrderNumber, Product2.Name, QuantityConsumed
FROM ProductConsumed WHERE CreatedDate = TODAY
```

## Troubleshooting Cheatsheet

| Symptom | First Check |
|---------|-------------|
| Search returns no results | DPE never run; or search component not linked to Search Criteria Config |
| Search results stale | DPE not scheduled |
| Aggregation rolls up to "Other" | Source fields null on most records |
| Transfer didn't move quantity | Transfer not in Completed status |
| Serialized status inconsistent | ProductTransferState records missing |
| Negative QuantityOnHand | Manual edits + concurrent consume — rely on transactions |
| Search Action button missing | Search Action Configuration not attached as Result Action |

## Related Modules

- `inventory-allocation` — reservation / allocation against ProductItem
- `inventory-count` — physical counts and variance
- `asset-service-lifecycle` — work order driven consumption
- `product-portfolio` — Product2 setup the inventory hangs off of

## When to Use This Skill

- Designing inventory data model
- Standing up Inventory Search and Transfer
- DPE search refresh failing
- Diagnosing why a transfer didn't update ProductItem
- Setting up serialized or batch tracking
- Auditing the inventory transaction trail

## Detailed Documentation

Use `get_mfg_module_docs` with slug `inventory-management`, or load the specific reference file
that matches the question:

| If the question is about... | Read |
|-----------------------------|------|
| Data model, key objects, search architecture | `knowledge/modules/inventory-management/references/concepts-and-architecture.md` |
| Step-by-step setup (enable, locations, search & transfer, DPE) | `knowledge/modules/inventory-management/references/create-and-configure.md` |
| Runtime flows, validation checklist, SOQL | `knowledge/modules/inventory-management/references/run-and-monitor.md` |
| Constraints, troubleshooting, best practices | `knowledge/modules/inventory-management/references/limits-and-gotchas.md` |
| High-level orientation | `knowledge/modules/inventory-management/overview.md` |
