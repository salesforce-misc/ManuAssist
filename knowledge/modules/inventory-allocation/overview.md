# Inventory Allocation — Overview

Inventory Allocation provides soft-reservation of inventory for demand sources (sales orders, work orders, return orders). It tracks inventory states across standard, batched, and serialized products — ensuring accurate visibility into available, allocated, and damaged stock without blocking allocations at the API level.

> **Source of truth:** Verified against Salesforce Core release **264**. Modules: `industries-unified-inventory-*` (allocation feature) and `commerce-inventory-udd` (parent reservation entities, shared with Commerce/OM/ITAM).

## Business Value

- Reserve inventory for specific orders before physical shipment
- Support complex product types: standard, batch-tracked, and serialized
- Process high-volume concurrent allocations reliably via async message queue
- Track full transaction audit trail through `ProductItemAddlTrxn`
- Auto-allocate inventory based on product-fulfillment location mappings
- First-class invocability for **Catalog, Agentforce, Flow, and MCP** (API v66/67+)

## Design Principles

- **Decoupled**: Allocation APIs are order-type agnostic — works for `Order`, `WorkOrder`, `ReturnOrder` (resolved via `InventoryAllocationFactory` → `OrderAllocation` / `WorkOrderAllocation` / `ReturnOrderAllocation`)
- **Async**: MQ-based processing (`MessageQueueTypeEnum.INVENTORY_ALLOCATION`, Tier 2) handles high-volume concurrent reservations without contention
- **Non-blocking**: System does not block allocations when available quantity is insufficient (soft reservation)
- **Flexible**: Same API supports standard, batch, and serialized products
- **Concurrency-safe**: Per-source guard via `hasInProgressReservationsBySourceIds(...)` rejects overlapping in-flight requests with `ALLOCATION_ALREADY_IN_PROGRESS`

## Licensing and Access

| Requirement | Value | Notes |
|-------------|-------|-------|
| Org permission (internal) | `InventoryAllocation` | provisioned, extendedIndex 16 |
| Org permission (Experience Cloud) | `InventoryAllocationExperienceCloud` | extendedIndex 19 |
| Org preference | `InventoryAllocationEnabled` | Metadata API: `<InventoryAllocationSettings><enableInventoryAllocation>true</enableInventoryAllocation></InventoryAllocationSettings>` (min v260) |
| User permission (internal) | `ManageInventoryAllocation` | min API v260, gated on `orgHasInventoryAllocationEnabled` |
| User permission (Experience Cloud) | `ManageInventoryAllocationInExprcCloud` | min API v260 |
| Permission Set License (internal) | `force__InvAllocationUserPsl` | The `InventoryAllocationUser` perm set is delivered via this PSL |
| Permission Set License (Experience Cloud) | `force__InventoryAllocationExprcCloudPsl` | for partner/distributor users |
| Tooling/Metadata API surface | `PermissionsManageInventoryAllocation`, `PermissionsManageInventoryAllocationInExprcCloud` | on `PermissionSet`/`Profile` |

## Key Objects

| Object | Key Prefix | Min Ver | Purpose |
|--------|------------|---------|---------|
| `ProductItem` | `1iH` | — | Stock at a location — `QuantityOnHand`, `QuantityAllocated`, `QuantityDamaged`, etc. |
| `InventoryReservation` | `10r` | 242 | Header — links to source document via polymorphic FK (`ReservationSource`); shared with Commerce/OM/ITAM |
| `InventoryItemReservation` | `10s` | 242 (alloc fields v260) | Line-level reservation per product + location |
| `InventoryBatchItemReservation` | `1iM` | 262 | Batch-level reservation (master-detail child of `InventoryItemReservation`) |
| `InvItemInstanceReservation` | `2is` | 262 | Instance-level reservation for serialized products (this is the actual API name — NOT `InventorySerializedProductReservation`) |
| `ProductItemAddlTrxn` | — | — | Transaction journal for all quantity state changes (Allocated/Deallocated/Adjusted/Custom) |
| `ProductBatchItem` | — | — | Inventory at batch level (ProductItem + ProductionBatch) |
| `SerializedProduct` | — | — | Individual tracked product instance (lives in `fieldservice-udd`) |
| `ProductItemTransaction` | — | — | Historical transaction record per ProductItem |

> **Naming correction:** The serialized-instance reservation entity's correct API name is **`InvItemInstanceReservation`**, not `InventorySerializedProductReservation`. The `ItemInstance` FK is a domainSet supporting both `SerializedProduct` and `Asset`.

## Reservation Status Lifecycle

**`InventoryReservationStatus`** (parent of `InventoryItemReservation`):

```
RESERVATION_IN_PROGRESS  (default)
        │
        ▼
     RESERVED
        │
        ▼
CANCELLATION_IN_PROGRESS
        │
        ▼
    CANCELLED
```

**`InvItemInstReservationStatus`** (serialized instance — `InvItemInstanceReservation`):

```
ReservationInProgress (default) → Reserved → CancellationInProgress → Cancelled
                                          → ReservationFailed
```

**`InvBatchItemReservationStatus`** (batch reservation): mirrors the parent lifecycle.

End-to-end:

```
[API Call] → Reservation In Progress
               → [Async MQ via InventoryAllocationHandler] → Reserved
                                → [API Call] → Cancellation In Progress
                                                 → [Async MQ] → Cancelled
                                                              → ReservationFailed (on error)
```

Save hooks in `InventoryItemReservationFunctions` translate `Reserved`/`Cancelled` writes into `ProductItemAddlTrxn` rows of type `Allocated` / `Deallocated` (positive/negative quantity).

## ProductItem Quantity Fields

| Field | Meaning | Verified in core 264 |
|-------|---------|----------------------|
| `QuantityOnHand` | Physical stock count (DOUBLE, scale 2, required) | Yes |
| `QuantityAllocated` | Soft-reserved for open orders | Yes |
| `QuantityDamaged` | Quarantined / unusable stock | Yes |
| `QuantityUnitOfMeasure` | UoM for the quantities | Yes |
| `SerialNumber` | Set when item represents a single serialized product | Yes |

> **Important gap discovered in core search:** `QuantityUnreserved` and `QuantityReserved` are **NOT physical columns** on `ProductItem` in the current release. Reserved quantities are stored on the reservation rows themselves (`InventoryItemReservation.Quantity`) and aggregated at read time by `InventoryAllocationService.getInventoryAllocation`. The Get Allocation API surfaces `availableQuantity = ProductItem.QuantityOnHand` directly without subtracting reservations server-side.
>
> Treat any field labeled `QuantityAvailable` / `QuantityUnreserved` as an org-specific formula or roll-up, not a standard platform field.

## Allocation Patterns Supported

| Pattern | Products | API Request Shape |
|---------|----------|-------------------|
| Location-level | Standard (non-batch, non-serialized) | `sourceLocationId` + `allocatedQuantity` |
| Batch-level | Non-serialized batched products | + `batches[]` with `batchItemId` |
| Batch + serialized | Serialized products within a batch | + `batchedSerializedProductIds[]` |
| Unbatched serialized | Serialized products with no batch | + `unbatchedSerializedProductIds[]` |

| Product type | Quantity recorded on | Child records created |
|---|---|---|
| Non-serialized | `InventoryItemReservation.Quantity` | none |
| Serialized + non-batched | `InventoryItemReservation.Quantity = null` (managed by save hooks) | `InvItemInstanceReservation` per `unbatchedSerializedProductIds[]` |
| Serialized + batched | parent + `InventoryBatchItemReservation.Quantity` | `InvItemInstanceReservation` (with `InvBatchItemReservation` set) |

## API Endpoints (Connect REST)

| Operation | Endpoint | Min Ver | Aura Method |
|-----------|----------|---------|-------------|
| Allocate | `POST /connect/inventory/allocation` | 260 | `processAllocationRequest` |
| Deallocate | `POST /connect/inventory/deallocation` | 260 | `processDeallocationRequest` |
| Get Allocation Status | `GET /connect/inventory/allocation/{sourceId}` | 260 | `getInventoryAllocation` |
| Process Additional Transaction (manual reconcile) | `POST /connect/inventory/process-additional-transaction` | 262 | `processAdditionalTransactionRequest` |

All endpoints use the `InventoryAllocation` Apex wrapper class (auto-generated; not in the repo). See [api-reference.md](api-reference.md) for full request/response schemas.

## Source Document Types

The allocation engine selects a strategy by `sourceId` key prefix via `InventoryAllocationFactory`:

| Source | Strategy class | Line item entity | Line item fields |
|--------|---------------|------------------|------------------|
| `Order` | `OrderAllocation` | `OrderItem` | `Product2Id`, `Quantity` |
| `WorkOrder` | `WorkOrderAllocation` | `WorkOrderLineItem` | `Product2Id`, `Quantity` |
| `ReturnOrder` | `ReturnOrderAllocation` | `ReturnOrderLineItem` | `Product2Id`, `Quantity` |

## SOQL Quick Reference

```sql
-- ProductItems with allocated inventory
SELECT Id, Product2Id, Product2.Name, LocationId, Location.Name,
       QuantityOnHand, QuantityAllocated, QuantityDamaged
FROM ProductItem
WHERE QuantityAllocated > 0
ORDER BY Product2.Name

-- Inventory reservations for an order
SELECT Id, ReservationSource, InventoryUsageType, IsAsyncOperationInProgress,
       IsSuccess, ErrorCode, ErrorMessage
FROM InventoryReservation
WHERE ReservationSource = '<OrderId>'

-- Item reservations with status (note: Status is enum InventoryReservationStatus)
SELECT Id, Product.Name, ReservedAtLocation.Name, Quantity, Status,
       ReservationDateTime, IsAutoReserved, ProductItemId
FROM InventoryItemReservation
WHERE InventoryReservation.ReservationSource = '<OrderId>'

-- Batch-level reservations (v262+)
SELECT Id, InventoryItemReservationId, ProductBatchItemId, ProductItemId,
       Quantity, Status, ReservationDateTime, IsAutoReserved
FROM InventoryBatchItemReservation
WHERE InventoryItemReservation.InventoryReservation.ReservationSource = '<OrderId>'

-- Serialized-instance reservations (v262+)
SELECT Id, InventoryItemReservationId, InvBatchItemReservationId, ItemInstanceId,
       ProductItemId, ProductBatchItemId, Status, ReservationDateTime, IsAutoReserved
FROM InvItemInstanceReservation
WHERE InventoryItemReservation.InventoryReservation.ReservationSource = '<OrderId>'

-- Pending async transactions (processing backlog)
SELECT Id, ProductItem.Product2.Name, TransactionType, Quantity,
       Status, RelatedRecord, StateAffected
FROM ProductItemAddlTrxn
WHERE Status = 'Pending'
ORDER BY CreatedDate ASC

-- Serialized products that are allocated
SELECT Id, Name, SerialNumber, Status, AllocationStatus, ProductItem.Location.Name
FROM SerializedProduct
WHERE AllocationStatus = 'Allocated'

-- Batch items
SELECT Id, ProductId, Product.Name, LocationId, Location.Name,
       RemainingQuantity
FROM ProductBatchItem
```

## Related Documentation

- [api-reference.md](api-reference.md) — Full Connect REST schemas and validation rules
- [data-model.md](data-model.md) — Entity definitions, fields, and relationships
- [functional-flows.md](functional-flows.md) — End-to-end async flow, state transitions, exception handling
- [configuration.md](configuration.md) — Setup steps, troubleshooting, CBSF rules
