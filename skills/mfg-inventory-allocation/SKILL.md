---
name: mfg-inventory-allocation
description: Expert guidance on Manufacturing Cloud Inventory States and Allocation — inventory reservation APIs, allocation/deallocation workflows, batch and serialized product allocation, async processing layer, and test data creation patterns. Use when user asks about inventory allocation, deallocation, inventory reservation, ProductItem quantities, InventoryReservation, InventoryItemReservation, InventoryBatchItemReservation, InventorySerializedProductReservation, or inventory states.
---

# Manufacturing Cloud Inventory States and Allocation

Inventory Allocation provides a mechanism for soft-reserving inventory for various types of demand (sales orders, work orders, etc.), ensuring accurate tracking of available, on-hand, and allocated stock. The system is decoupled from order types, built around dedicated reservation entities, and designed for high-volume concurrent transactions.

## Design Principles

- **Decoupling**: Allocation logic is decoupled from consuming systems (Sales Orders, Work Orders) — APIs are order-type agnostic
- **Scalability**: Async processing via Message Queue handles high-volume concurrent allocations
- **Flexibility**: Supports standard products, batched products, and serialized products
- **No validation on available qty**: The system does not block allocations when available quantity is insufficient (out of scope for initial release)

## Licensing & Access

| Requirement | Value |
|-------------|-------|
| Org perm | `InventoryAllocation` |
| Org preference | `InventoryAllocationEnabled` |
| Platform license | Inventory Allocation (`InventoryAllocation`) |
| User perm | `ManageInventoryAllocation` |
| User license | Inventory Allocation User (`InvAllocationUserPsl`) |
| Setup page | Inventory Allocation Settings |
| Access checks | `orgHasInventoryAllocationEnabled`, `userHasAccessToInventoryAllocation` |

## Key Objects

| Object | API Name | Purpose |
|--------|----------|---------|
| Product Item | `ProductItem` | Inventory stock at a location (QtyOnHand, QtyAllocated, QtyDamaged, QtyAvailable) |
| Inventory Reservation | `InventoryReservation` | Header — links to source (Order/WorkOrder/ReturnOrder) via polymorphic FK |
| Inventory Item Reservation | `InventoryItemReservation` | Line-level reservation per product + location |
| Inventory Batch Item Reservation | `InventoryBatchItemReservation` | Batch-level reservation (child of InventoryItemReservation) |
| Inventory Serialized Product Reservation | `InventorySerializedProductReservation` | Instance-level reservation for serialized products |
| Inventory Item Instance Reservation | `InventoryItemInstanceReservation` | 262 enhanced instance reservation (child of InventoryBatchItemReservation) |
| Product Item Additional Transaction | `ProductItemAdditionalTransaction` | Transaction log for all quantity state changes |
| Product Batch Item | `ProductBatchItem` | Inventory at batch level (ProductItem + ProductionBatch) |
| Serialized Product | `SerializedProduct` | Individual tracked product instance with AllocationStatus |
| Product Fulfilment Location | `ProductFulfilmentLocation` | Mapping of product to fulfillment location (for auto-allocation) |

## Entity Relationships (ERD)

```
Order / WorkOrder / ReturnOrder
  └── InventoryReservation (ReservationSource = poly FK to Order)
        └── InventoryItemReservation (per product + location)
              ├── InventoryBatchItemReservation (per batch, master-detail)
              │     └── InventoryItemInstanceReservation (per serialized product)
              └── InventorySerializedProductReservation (unbatched serialized)

ProductItem (ProductId + LocationId)
  ├── QtyOnHand, QtyAllocated, QtyDamaged, QtyInTransit, QtyOrdered
  ├── QtyAvailable = formula(QtyOnHand - QtyAllocated - QtyDamaged)
  ├── QtyStateRefreshDate
  └── ProductItemAdditionalTransaction (transaction log)

ProductBatchItem (ProductId + LocationId + ProductionBatch)
  ├── RemainingQuantity, QtyAllocated, QtyAvailable (formula)
  └── QtyStateRefreshDate

SerializedProduct
  ├── Status: [Available, Sent, Consumed, Damaged, Lost]
  └── AllocationStatus: [None, Allocated, Deallocated]
```

## Reservation Status Transitions

```
[API]  → Reservation In Progress
         → [System] Reserved
              → [API] Cancellation In Progress
                   → [System] Cancelled
```

- **Reservation In Progress**: Created by allocation API, pending async processing
- **Reserved**: System confirms after MQ processing updates ProductItem quantities
- **Cancellation In Progress**: Created by deallocation API
- **Cancelled**: System confirms after MQ processing reverses quantities

## APIs

### 1. Allocation API

**`POST connect/inventory/allocation`**

Supports 4 allocation patterns in a single request:

#### Pattern 1: Location-Level (v260 — standard products)
Allocates inventory directly at the location level. No batch or serialized info.
```json
{
  "allocationData": [{
    "sourceId": "<OrderId>",
    "items": [{
      "sourceItemId": "<OrderItemId>",
      "allocations": [{
        "sourceLocationId": "<LocationId>",
        "allocatedQuantity": 75
      }]
    }]
  }]
}
```
**Creates:** InventoryReservation → InventoryItemReservation

#### Pattern 2: Batch-Level (non-serialized)
Allocates by batch within a location.
```json
{
  "allocations": [{
    "sourceLocationId": "<LocationId>",
    "allocatedQuantity": 30,
    "batches": [
      { "batchItemId": "<ProductBatchItemId>", "quantity": 10 },
      { "batchItemId": "<ProductBatchItemId>", "quantity": 20 }
    ]
  }]
}
```
**Creates:** InventoryItemReservation → N x InventoryBatchItemReservation

#### Pattern 3: Serialized Product — Batch Allocation
Allocates specific serialized products within a batch.
```json
{
  "allocations": [{
    "sourceLocationId": "<LocationId>",
    "allocatedQuantity": 2,
    "batches": [{
      "batchItemId": "<ProductBatchItemId>",
      "quantity": 2,
      "batchedSerializedProductIds": ["<SP-1>", "<SP-2>"]
    }]
  }]
}
```
**Creates:** InventoryItemReservation → InventoryBatchItemReservation → N x InventorySerializedProductReservation

#### Pattern 4: Serialized Product — Non-Batch Allocation
Allocates serialized products not associated with any batch.
```json
{
  "allocations": [{
    "sourceLocationId": "<LocationId>",
    "allocatedQuantity": 2,
    "unbatchedSerializedProductIds": ["<SP-4>", "<SP-6>"]
  }]
}
```
**Creates:** InventoryItemReservation → N x InventorySerializedProductReservation

### 2. Deallocation API

**`POST connect/inventory/deallocation`**

Supports 5 deallocation patterns:

| Level | Scope | Required Fields |
|-------|-------|-----------------|
| Item-level | Deallocate ALL reservations for a line item | `sourceItemId` only |
| Location-level | Deallocate at specific locations | + `sourceLocationIds[]` |
| Batch-level (non-serialized) | Deallocate specific batches | + `batchItemIds[]` |
| Batch-level (serialized) | Deallocate serialized products in a batch | + `batchItemIds[]` + `serializedProductIds[]` |
| Serialized (unbatched) | Deallocate unbatched serialized products | + `serializedProductIds[]` |

**Deallocation behavior:**
- Sets matching reservation records to `Cancellation In Progress` → `Cancelled`
- Child reservations (batch-level, serialized-level) are cancelled based on request specificity
- SerializedProduct.AllocationStatus → `Deallocated`
- QtyAllocated decremented on ProductItem / ProductBatchItem after async processing

### 3. Get Allocation API

**`GET connect/inventory/allocation/{orderId}?pageNumber=1&pageSize=10`**

Returns allocation summary per line item with status:
- `NOT_ALLOCATED` / `PARTIALLY_ALLOCATED` / `FULLY_ALLOCATED`

Response includes:
- `totalRequiredQuantity` — line item quantity
- `totalRequestedAllocationQty` — total allocation requested
- `quantityAllocationPending` — sum of pending transactions
- `quantityAllocationCompleted` — sum of successful transactions
- `requestedAllocations[]` — what was requested per location
- `allocations[]` — what was actually reserved per location

For 262, the response also includes `batchReservations[]` and `instanceReservations[]`.

## Async Processing Architecture

```
Allocation API
  → Create InventoryItemReservation (status: Reservation In Progress)
  → Create ProductItemAdditionalTransaction (status: Pending)
  → Publish MQ message with impacted ProductItem IDs

MQ Handler (Inventory Processing Layer)
  → Acquire lock on ProductItem(s)
  → If locked: re-enqueue with 15s delay (max 3 retries, then fallback to manual sync)
  → Aggregate all Pending transactions for the ProductItem
  → Update ProductItem.QtyAllocated
  → Set transaction status = Success/Failure
  → Set reservation status = Reserved
  → Send in-app notification
```

## Auto Allocation

**Pre-requisite:** Create `ProductFulfilmentLocation` records mapping each product to its desired fulfillment location.

**Behavior:**
- UI-only action (no dedicated API yet)
- Uses ProductFulfilmentLocation data to auto-fill allocation preview
- User can review, edit, and save before committing

## Test Data Creation Patterns

### Foundation Data (Required for ALL tests)
```
Product2 → Location → ProductItem (QtyOnHand > 0)
Account → Order → OrderItem (per product line)
```

### Pattern A: Standard Product Allocation
```
Product2: "Generator" (non-serialized, non-batched)
Locations: "Chennai", "Surat"
ProductItem(Generator, Chennai): QtyOnHand=200
ProductItem(Generator, Surat): QtyOnHand=100
Order → OrderItem(Generator, qty=98)
→ Call allocation API with multi-location split
→ Verify: 2x InventoryItemReservation, QtyAllocated updated
```

### Pattern B: Batch-Level Allocation
```
Product2: "Motor" (batched, non-serialized)
Location: "Bangalore"
ProductionBatch: BATCH-001, BATCH-002
ProductBatchItem(Motor, Bangalore, BATCH-001): RemainingQty=100
ProductBatchItem(Motor, Bangalore, BATCH-002): RemainingQty=50
Order → OrderItem(Motor, qty=30)
→ Call allocation API with batches array
→ Verify: InventoryBatchItemReservation per batch, QtyAllocated on ProductBatchItem
```

### Pattern C: Serialized + Batch Allocation
```
Product2: "Circuit" (serialized, batched)
Location: "Bangalore"
ProductionBatch: PB-1
ProductBatchItem(Circuit, Bangalore, PB-1): RemainingQty=10
SerializedProduct: SP-1 (Status=Available, AllocationStatus=None, Batch=PB-1)
SerializedProduct: SP-2 (Status=Available, AllocationStatus=None, Batch=PB-1)
Order → OrderItem(Circuit, qty=2)
→ Call allocation API with batchedSerializedProductIds
→ Verify: InventorySerializedProductReservation, SP.AllocationStatus=Allocated
```

### Pattern D: Serialized Non-Batch Allocation
```
Product2: "iPhone" (serialized, no batch)
Location: "Hyderabad"
SerializedProduct: SP-4 (Status=Available, AllocationStatus=None, no batch)
SerializedProduct: SP-6 (Status=Available, AllocationStatus=None, no batch)
Order → OrderItem(iPhone, qty=2)
→ Call allocation API with unbatchedSerializedProductIds
→ Verify: InventorySerializedProductReservation, SP.AllocationStatus=Allocated
```

### Pattern E: Mixed Composite Request
Combine patterns A-D in a single API call with multiple items array.

### Pattern F: Deallocation after Allocation
Run any allocation pattern, then call deallocation API. Verify:
- Reservation status → Cancelled
- QtyAllocated decremented
- SerializedProduct.AllocationStatus → Deallocated (for serialized)

### Pattern G: Auto Allocation
```
ProductFulfilmentLocation records mapping products to locations
Order with multiple line items
→ Trigger auto-allocate from UI
→ Verify allocations match ProductFulfilmentLocation mapping
```

## Key Test Scenarios

| Category | Scenario |
|----------|----------|
| **Happy path** | Full allocation, partial allocation, multi-location split |
| **Status transitions** | ReservationInProgress → Reserved → CancellationInProgress → Cancelled |
| **Quantity math** | QtyAllocated incremented/decremented correctly on ProductItem and ProductBatchItem |
| **Serialized status** | AllocationStatus transitions: None → Allocated → Deallocated |
| **Async processing** | Transaction log records in ProductItemAdditionalTransaction (Pending → Success) |
| **Concurrency** | Two allocations targeting same ProductItem — lock/re-enqueue behavior |
| **Edge cases** | Allocate > QtyOnHand (warning, not blocked), already-allocated SP, invalid IDs |
| **Pagination** | Get Allocation API with pageNumber/pageSize, hasNext |
| **Backward compat** | v260 payload structure still works in v262 |

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| API returns 403 | Missing `ManageInventoryAllocation` perm or org pref disabled | Enable org pref + assign user perm |
| Allocation stuck in "Reservation In Progress" | MQ handler failed or lock contention | Check ProductItemAdditionalTransaction status; may need manual sync |
| QtyAllocated not updating | Async processing delayed under high volume | Check QtyStateRefreshDate; review transaction logs |
| SerializedProduct can't be allocated | AllocationStatus already "Allocated" or Status not "Available" | Deallocate first or check product status |
| Deallocation not reflecting | Cancellation still in progress | Wait for async processing; check transaction logs |
| Auto-allocate shows no preview | Missing ProductFulfilmentLocation records | Create mapping records for products |

## SOQL Quick Reference

```sql
-- Product items with allocated inventory
SELECT Id, Product2Id, Product2.Name, LocationId, Location.Name,
       QuantityOnHand, QuantityAllocated, QuantityAvailable, QuantityDamaged,
       QuantityStateRefreshDate
FROM ProductItem
WHERE QuantityAllocated > 0
ORDER BY Product2.Name

-- Inventory reservations for an order
SELECT Id, ReservationSource, UsageType, AsyncOperationInProgress
FROM InventoryReservation
WHERE ReservationSource = '<OrderId>'

-- Item reservations with status
SELECT Id, Product, ReservedAtLocation, Quantity, Status,
       ProductItem, ReservationDate, IsAutoReserved
FROM InventoryItemReservation
WHERE InventoryReservation.ReservationSource = '<OrderId>'

-- Batch-level reservations
SELECT Id, ProductBatchItem, Quantity, Status, ReservationDate, IsAutoReserved
FROM InventoryBatchItemReservation
WHERE InventoryItemReservation.InventoryReservation.ReservationSource = '<OrderId>'

-- Serialized product reservations
SELECT Id, SerializedProduct, Status, ReservationDate, IsAutoReserved
FROM InventorySerializedProductReservation
WHERE InventoryItemReservation.InventoryReservation.ReservationSource = '<OrderId>'

-- Pending transactions (async processing backlog)
SELECT Id, ProductItem, TransactionType, RelatedEntity, ProductItemState,
       Quantity, TransactionStatus, TransactionStatusMessage, TransactionDate
FROM ProductItemAdditionalTransaction
WHERE TransactionStatus = 'Pending'
ORDER BY TransactionDate ASC

-- Serialized products with allocation status
SELECT Id, Name, SerialNumber, Status, AllocationStatus, ProductItem, ProductionBatch
FROM SerializedProduct
WHERE AllocationStatus = 'Allocated'

-- Product batch items with allocation info
SELECT Id, ProductId, LocationId, ProductionBatch, RemainingQuantity,
       QuantityAllocated, QuantityAvailable, QtyStateRefreshDate
FROM ProductBatchItem
WHERE QuantityAllocated > 0

-- Product fulfilment location mappings (for auto-allocation)
SELECT Id, Product2Id, Product2.Name, LocationId, Location.Name
FROM ProductFulfilmentLocation
ORDER BY Product2.Name
```

> 📖 Source: Manufacturing Cloud — Inventory Allocation
