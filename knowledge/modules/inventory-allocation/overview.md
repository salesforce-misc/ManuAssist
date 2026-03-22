# Inventory Allocation — Overview

Inventory Allocation provides soft-reservation of inventory for demand sources (sales orders, work orders, return orders). It tracks inventory states across standard, batched, and serialized products — ensuring accurate visibility into available, allocated, and damaged stock without blocking allocations at the API level.

## Business Value

- Reserve inventory for specific orders before physical shipment
- Support complex product types: standard, batch-tracked, and serialized
- Process high-volume concurrent allocations reliably via async message queue
- Track full transaction audit trail through `ProductItemAdditionalTransaction`
- Auto-allocate inventory based on product-fulfillment location mappings

## Design Principles

- **Decoupled**: Allocation APIs are order-type agnostic — works for Sales Orders, Work Orders, Return Orders
- **Async**: MQ-based processing handles high-volume concurrent reservations without contention
- **Non-blocking**: System does not block allocations when available quantity is insufficient (soft reservation)
- **Flexible**: Same API supports standard, batch, and serialized products

## Licensing and Access

| Requirement | Value |
|-------------|-------|
| Org permission | `InventoryAllocation` |
| Org preference | `InventoryAllocationEnabled` |
| Platform license | Inventory Allocation |
| User permission | `ManageInventoryAllocation` |
| Permission set | `InventoryAllocationUser` |

## Key Objects

| Object | Purpose |
|--------|---------|
| `ProductItem` | Stock at a location — QtyOnHand, QtyAllocated, QtyDamaged, QtyAvailable |
| `InventoryReservation` | Header — links to source document (Order, WorkOrder) via polymorphic FK |
| `InventoryItemReservation` | Line-level reservation per product + location |
| `InventoryBatchItemReservation` | Batch-level reservation (child of InventoryItemReservation) |
| `InventorySerializedProductReservation` | Instance-level reservation for serialized products |
| `ProductItemAdditionalTransaction` | Transaction log for all quantity state changes |
| `ProductBatchItem` | Inventory at batch level (ProductItem + ProductionBatch) |
| `SerializedProduct` | Individual tracked product instance with AllocationStatus |
| `ProductItemTransaction` | Historical transaction record per ProductItem |

## Reservation Status Lifecycle

```
[API Call] → Reservation In Progress
               → [Async MQ] → Reserved
                                → [API Call] → Cancellation In Progress
                                                 → [Async MQ] → Cancelled
```

## ProductItem Quantity Fields

| Field | Meaning |
|-------|---------|
| `QuantityOnHand` | Physical stock count |
| `QuantityAllocated` | Soft-reserved for open orders |
| `QuantityAvailable` | Formula: OnHand - Allocated - Damaged |
| `QuantityDamaged` | Quarantined / unusable stock |
| `QuantityStateRefreshDate` | Timestamp of last async update |

## Allocation Patterns Supported

| Pattern | Products | API Request Key |
|---------|---------|----------------|
| Location-level | Standard (non-batch, non-serialized) | `sourceLocationId` + `allocatedQuantity` |
| Batch-level | Non-serialized batched products | + `batches[]` with `batchItemId` |
| Batch + serialized | Serialized products within a batch | + `batchedSerializedProductIds[]` |
| Unbatched serialized | Serialized products with no batch | + `unbatchedSerializedProductIds[]` |

## API Endpoints

| Operation | Endpoint |
|-----------|---------|
| Allocate | `POST /connect/inventory/allocation` |
| Deallocate | `POST /connect/inventory/deallocation` |
| Get Allocation Status | `GET /connect/inventory/allocation/{orderId}` |

## SOQL Quick Reference

```sql
-- ProductItems with allocated inventory
SELECT Id, Product2Id, Product2.Name, LocationId, Location.Name,
       QuantityOnHand, QuantityAllocated, QuantityAvailable, QuantityDamaged
FROM ProductItem
WHERE QuantityAllocated > 0
ORDER BY Product2.Name

-- Inventory reservations for an order
SELECT Id, ReservationSource, UsageType, AsyncOperationInProgress, Status
FROM InventoryReservation
WHERE ReservationSource = '<OrderId>'

-- Item reservations with status
SELECT Id, Product2.Name, ReservedAtLocation.Name, Quantity, Status, ReservationDate
FROM InventoryItemReservation
WHERE InventoryReservation.ReservationSource = '<OrderId>'

-- Pending async transactions (processing backlog)
SELECT Id, ProductItem.Product2.Name, TransactionType, Quantity,
       TransactionStatus, TransactionStatusMessage, TransactionDate
FROM ProductItemAdditionalTransaction
WHERE TransactionStatus = 'Pending'
ORDER BY TransactionDate ASC

-- Serialized products that are allocated
SELECT Id, Name, SerialNumber, Status, AllocationStatus, ProductItem.Location.Name
FROM SerializedProduct
WHERE AllocationStatus = 'Allocated'

-- Batch items with allocation info
SELECT Id, ProductId, Product.Name, LocationId, Location.Name,
       RemainingQuantity, QuantityAllocated, QuantityAvailable
FROM ProductBatchItem
WHERE QuantityAllocated > 0
```
