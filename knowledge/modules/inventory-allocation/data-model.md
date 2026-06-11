# Inventory Allocation — Data Model

> **Source:** Verified against Salesforce Core release **264** UDD entity definitions.

The inventory allocation data model spans **two modules**:
- `commerce-inventory-udd` — owns the parent `InventoryReservation` and `InventoryItemReservation` (shared with Commerce/OM and Service ITAM).
- `industries-unified-inventory-udd` — owns the Manufacturing-specific batch and instance reservation entities.

## Entity Hierarchy

```
InventoryReservation                      (10r) — header
└── InventoryItemReservation              (10s) — line per product+location
    ├── InventoryBatchItemReservation     (1iM) — batch-level (v262+)
    │   └── InvItemInstanceReservation    (2is) — serial within batch
    └── InvItemInstanceReservation        (2is) — serial without batch
```

## Entity Reference

### `InventoryReservation` (parent header)

| Attribute | Value |
|-----------|-------|
| Module | `commerce-inventory-udd` |
| Key prefix | `10r` |
| Min API version | 242 |
| File | `core/commerce-inventory-udd/.../InventoryReservation.entity.xml` |
| Sharing | Standard |
| Org access | `CommerceInventory.orgHasCommerceInventoryEnabled \|\| IndustriesUnifiedInventory.orgHasInventoryAllocationEnabledInternalOrExperience \|\| ServiceItam.orgHasHardwareAssetManagementEnabled` |

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `Name` | Auto-Number | Pattern: `IR-{0000}` |
| `ReservationDate` | DateTime | Required |
| `ReservationDurationInSeconds` | Number | TTL for the reservation |
| `ReservationIdentifier` | String | Unique |
| `ReservationSource` | Polymorphic FK | Domain set `ReservationSourceEntities` (Order/WorkOrder/ReturnOrder/etc.) |
| `IsAsyncOperationInProgress` | Boolean | True while MQ handler is processing |
| `IsSuccess` | Boolean | Outcome of last async operation |
| `ErrorMessage` | String | Last error |
| `ErrorCode` | String | Last error code |
| `InventoryUsageType` | Picklist | v260+ enum (`INVENTORY_ALLOCATION` for MFG flow) |

---

### `InventoryItemReservation` (line)

| Attribute | Value |
|-----------|-------|
| Module | `commerce-inventory-udd` |
| Key prefix | `10s` |
| Min API version | 242 (allocation-specific fields added in v260) |
| File | `core/commerce-inventory-udd/.../InventoryItemReservation.entity.xml` |
| Parent | `InventoryReservation` (master-detail) |

**Fields:**

| Field | Type | Min Ver | Notes |
|-------|------|---------|-------|
| `InventoryReservation` | Master-Detail | 242 | Parent |
| `ItemReservationSource` | Polymorphic FK | 242 | Domain set `ItemReservationSourceEntities` → OrderItem/WorkOrderLineItem/ReturnOrderLineItem |
| `Product` | FK Product2 | 242 | The product being reserved |
| `StockKeepingUnit` | String | 242 | SKU snapshot |
| `Quantity` | Number | 242 | **Required.** Null for pure-serialized lines (managed by save hooks) |
| `ReservedAtLocation` | Polymorphic FK | 242 | Location or LocationGroup |
| `ProductItem` | FK ProductItem | 260 | Specific stock record reserved against |
| `Status` | Enum `InventoryReservationStatus` | 260 | Lifecycle (see below) |
| `ReservationDateTime` | DateTime | 260 | When the reservation was created |
| `IsAutoReserved` | Boolean | 260 | Set by auto-allocation flows |
| `ErrorMessage` | String | 242 | Last error |
| `ErrorCode` | String | 242 | Last error code |

**Status enum** — `InventoryReservationStatus` (`core/commerce-inventory-api/.../InventoryReservationStatus.java`):

```
RESERVATION_IN_PROGRESS  (default)
        ↓
     RESERVED
        ↓
CANCELLATION_IN_PROGRESS
        ↓
    CANCELLED
```

---

### `InventoryBatchItemReservation` (batch-level)

| Attribute | Value |
|-----------|-------|
| Module | `industries-unified-inventory-udd` |
| Key prefix | `1iM` |
| Min API version | **262** |
| File | `core/industries-unified-inventory-udd/.../InventoryBatchItemReservation.entity.xml` |
| Parent | `InventoryItemReservation` (master-detail) |
| Sharing | `InvBatchItemResvShare` (settings index 35) |
| Org access | `orgHasInventoryAllocationEnabledInternalOrExperience` AND `orgHasBatchManagementEnabled` AND `orgHasDistributorManagementPilot` |

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `Name` | Auto-Number | `IBIR-{000000000}` |
| `InventoryItemReservation` | Master-Detail | Parent |
| `ProductBatchItem` | FK | **Required** — the specific batch |
| `ReservationItemSource` | Derived from parent | Polymorphic |
| `ProductItem` | Derived from parent | FK |
| `ReservationDateTime` | DateTime | Required |
| `Quantity` | Number | **Required** |
| `Status` | Enum `InvBatchItemReservationStatus` | Required |
| `IsAutoReserved` | Boolean | |

---

### `InvItemInstanceReservation` (serial-instance)

> **Naming note:** This is the canonical API name. Plugin docs that reference `InventorySerializedProductReservation` are using a docs-friendly alias — the actual SObject is `InvItemInstanceReservation`.

| Attribute | Value |
|-----------|-------|
| Module | `industries-unified-inventory-udd` |
| Key prefix | `2is` |
| Min API version | **262** |
| File | `core/industries-unified-inventory-udd/.../InvItemInstanceReservation.entity.xml` |
| Parent | `InventoryItemReservation` (master-detail) |
| Sharing | `InventoryItemInstResShare` (settings index 94) |
| Org access | `orgHasInventoryAllocationEnabledInternalOrExperience` |

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `Name` | Auto-Number | `IIIR-{000000000}` |
| `InventoryItemReservation` | Master-Detail | **Required** — parent |
| `InvBatchItemReservation` | FK | Optional; required when `orgHasBatchManagementEnabled` and reservation is batched |
| `ItemInstance` | Polymorphic FK | **Required** — domainSet `ItemInstanceDomainSet` (supports `SerializedProduct` AND `Asset`) |
| `ProductItem` | Derived | From parent `InventoryItemReservation` |
| `ProductBatchItem` | Derived | From `InvBatchItemReservation` |
| `ReservationItemSource` | Derived | From parent |
| `ReservationDateTime` | DateTime | Required |
| `Status` | Enum `InvItemInstReservationStatus` | Required |
| `IsAutoReserved` | Boolean | |

**Status enum** — `InvItemInstReservationStatus` (`core/industries-unified-inventory-udd/.../InvItemInstReservationStatus.java`):

```
ReservationInProgress (default)
        ↓
     Reserved
        ↓
CancellationInProgress
        ↓
    Cancelled

(plus failure path)
ReservationFailed
```

---

### `ProductItem` (stock at location)

| Attribute | Value |
|-----------|-------|
| Module | `fieldservice-udd` |
| File | `core/fieldservice-udd/java/resources/udd/fieldservice-udd/ProductItem.entity.xml` |

**Quantity fields confirmed in core 264:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `QuantityOnHand` | DOUBLE (scale 2) | yes | Physical stock count |
| `QuantityAllocated` | DOUBLE | no | Soft-reserved quantity |
| `QuantityDamaged` | DOUBLE | no | Quarantined/unusable |
| `QuantityUnitOfMeasure` | String | no | UoM |
| `SerialNumber` | String | no | Set when item represents a single serial |

> **Important:** `QuantityUnreserved` and `QuantityReserved` are NOT physical columns on `ProductItem` in core 264. The Get Allocation API returns `availableQuantity = QuantityOnHand` directly without subtracting reservations. If your org exposes these fields, they are formula/rollup fields added by config.

---

### `ProductItemAddlTrxn` (transaction journal)

| Attribute | Value |
|-----------|-------|
| Module | `industries-unified-inventory-udd` |
| File | `core/industries-unified-inventory-udd/.../ProductItemAddlTrxn.entity.xml` |
| Sharing | `ProductItemAddlTrxnShare` |

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `TransactionType` | Enum `ProductItemAddlTrxnType` | `Adjusted` / `Allocated` / `Deallocated` / `Custom` |
| `RelatedRecord` | FK | Points to `InventoryItemReservation` |
| `Quantity` | Number | Positive for allocate, negative for deallocate |
| `StateAffected` | Enum `ProductItemStateAffected` | Which `ProductItem` quantity field is impacted |
| `Status` | Enum `TransactionStatus` | `Pending` / `Completed` / `Failed` |

These rows are emitted by save hooks on `InventoryItemReservation` writes (in `commerce-inventory-impl/.../InventoryItemReservationFunctions.java`) and consumed by `ProductItemAddlTxnProcessor` to update `ProductItem` quantities.

---

### Related Entities (not allocation-owned but referenced)

| Entity | Owner module | Used as |
|--------|-------------|---------|
| `Order`, `OrderItem` | order-udd | `sourceId`/`sourceItemId` for sales orders |
| `WorkOrder`, `WorkOrderLineItem` | fieldservice-udd | `sourceId`/`sourceItemId` for work orders |
| `ReturnOrder`, `ReturnOrderLineItem` | order-udd | `sourceId`/`sourceItemId` for returns |
| `Location` | fieldservice-udd | `sourceLocationId` |
| `ProductBatchItem` | industries-unified-inventory-udd | Batch-level inventory record |
| `ProductionBatch` | industries-unified-inventory-udd | Production batch metadata |
| `SerializedProduct` | fieldservice-udd | One option for `ItemInstance` polymorphic FK |
| `Asset` | core | Other option for `ItemInstance` (ITAM scenarios) |

## Polymorphic Relationships

| Field | Domain set | Members |
|-------|-----------|---------|
| `InventoryReservation.ReservationSource` | `ReservationSourceEntities` | Order, WorkOrder, ReturnOrder, etc. |
| `InventoryItemReservation.ItemReservationSource` | `ItemReservationSourceEntities` | OrderItem, WorkOrderLineItem, ReturnOrderLineItem |
| `InventoryItemReservation.ReservedAtLocation` | (location-types) | Location, LocationGroup |
| `InvItemInstanceReservation.ItemInstance` | `ItemInstanceDomainSet` | SerializedProduct, Asset |

## Sharing Models

| Entity | Share Object | Settings Index |
|--------|--------------|----------------|
| `InventoryReservation` | Standard sharing | — |
| `InventoryItemReservation` | Implicit (master-detail) | — |
| `InventoryBatchItemReservation` | `InvBatchItemResvShare` | 35 |
| `InvItemInstanceReservation` | `InventoryItemInstResShare` | 94 |
| `ProductItemAddlTrxn` | `ProductItemAddlTrxnShare` | — |
| `ProductBatchItem` | `ProductBatchItemShare` | — |
| `ProductionBatch` | `ProductionBatchShare` | — |

## DTO / Service Interfaces

Located in `core/industries-unified-inventory-api/java/src/industries/inventoryallocation/`:

```
dto/
  InventoryReservation.java
  InventoryItemReservation.java
  InvItemInstanceReservation.java

service/
  InventoryReservationService.java
  InventoryItemReservationService.java
  InvItemInstanceReservationService.java
  ProductItemLockService.java
```

Implementations in `core/industries-unified-inventory-impl/.../inventoryallocation/service/`.
