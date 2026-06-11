# Inventory Allocation — Functional Flows

> **Source:** Verified against Salesforce Core release **264**.

This document traces the runtime behavior of the inventory allocation pipeline from API call to `ProductItem` quantity update.

## End-to-End Allocation Flow

```
[Client (LWC / Apex / Flow / Agentforce / MCP)]
   │  POST /connect/inventory/allocation
   ▼
InventoryAllocationResourceImpl.post(...)
   │  ① validate: source/items/locations/serialized IDs (3 stages, fail-fast per stage)
   │  ② block if hasInProgressReservationsBySourceIds(sourceIds)
   │     → "ALLOCATION_ALREADY_IN_PROGRESS"
   │  ③ build InventoryAllocationDetails per sourceId
   │     (List<InventoryAllocationItemInfo>)
   ▼
InventoryAllocationEnqueuer.enqueue(FeatureType.ALLOCATION, details)
   │  writes JSON blob + inserts MQ message
   │  type: MessageQueueTypeEnum.INVENTORY_ALLOCATION (Tier 2)
   │  duplicate sourceId in queue → InventoryAllocationUserException (rollback)
   ▼
[Async] InventoryAllocationHandler.handleMessage(...)
   │  SfdcCtx.user().establish(orgId, userId)
   │  inventoryAllocationService.getReservationBySource(sourceId)
   │     ├── null  → createReservationAndBulkCreateItemReservation(...)
   │     ├── exists, no item rows → bulkCreateItemReservation(reservation, details)
   │     └── exists, with item rows → bulkCreateAndUpdateItemReservation(...)
   │  DBContext.connection.commit()
   │  InventoryAllocationInAppNotificationUtil.createNotification(success=true)
   │  invokeProductItemAddlTxnProcess(itemReservations)
   │     └── ProductItemAddlTxnProcessor.processTransactions(productItemIds)
   │            ├── ProductItemLockManager.lockProductItems
   │            ├── ProductItemAddlTxnAggregator.aggregatePendingTransactions
   │            ├── ProductItemUpdateService.updateProductItemQuantities  ← updates ProductItem
   │            └── ProductItemLockManager.unLockProductItems (in finally)
   │  Items that didn't get a lock
   │     → ProductItemAddlTxnProcessEnqueuer.enqueue(... 15s delay)
   ▼
[On any exception]
   retry up to MAX_RETRIES=2
   (CommittedDequeueTransactionBehavior, CLONE_MESSAGE_DELAY=60s)
   On final failure → in-app failure notification
```

## Source Document Resolution

`InventoryAllocationFactory` is a singleton that picks the right strategy from `sourceId`:

```java
EntityInfo entity = UserContext.getUddInfo().getEntityInfoByKeyPrefixOrId(sourceId);
switch (entity.getApiName()) {
  case "Order":       return new OrderAllocation();
  case "WorkOrder":   return new WorkOrderAllocation();
  case "ReturnOrder": return new ReturnOrderAllocation();
}
```

`BaseAllocation` is the abstract strategy with hooks each subclass implements:

| Method | Purpose |
|--------|---------|
| `getChildEntityName()` | Line item entity (`OrderItem`, `WorkOrderLineItem`, …) |
| `getRelatedRecordFieldName()` | FK from line item to header |
| `getRelatedItemRecordFieldName()` | Field name used in queries |
| `getProductFieldName()` | Where `Product2Id` lives on the line item |
| `extractLineItemData(Entity)` | Pulls Product/Quantity from the SObject |
| `getChildSelectFields()` | SOQL fields to select |
| `getParentEntityName()` | Header entity name |
| `getParentIdField()` | Header FK on line item |

## Service Layer Orchestration

`InventoryAllocationService` is the central orchestrator (`core/industries-unified-inventory-impl/.../inventoryallocation/service/InventoryAllocationService.java`).

**First-time allocation for a `sourceId`:**

```
createReservationAndBulkCreateItemReservation(InventoryAllocationDetails)
  ├── creates InventoryReservation with InventoryUsageType = INVENTORY_ALLOCATION
  ├── bulk-creates InventoryItemReservation rows
  └── rolls back parent on child-create failure
```

**Incremental allocation/deallocation (existing reservation):**

`bulkCreateAndUpdateItemReservation(...)` is wrapped in `InventoryReservationContext.markAsSystemOperation()` and runs in **strict order** within one DB transaction:

| # | Operation |
|---|-----------|
| 1 | Create parent `InventoryItemReservation` rows (new line-item reservations) |
| 2 | Create child `InvItemInstanceReservation` rows (serialized instances) |
| 3 | Update parent `InventoryItemReservation` (status changes / quantity updates) |
| 4 | Update child `InvItemInstanceReservation` |

This ordering guarantees parent rows exist before children reference them, and avoids dependency conflicts on cascading status updates.

## Reservation Status Transitions

Implemented in `InventoryAllocationService.populateInventoryItemReservationList`:

| Trigger | New Status |
|---------|-----------|
| New allocation row | `RESERVATION_IN_PROGRESS` |
| Existing row updated with new quantity | `RESERVATION_IN_PROGRESS` |
| Location-level deallocation | `CANCELLATION_IN_PROGRESS` (parent + children via `InvItemInstanceAllocationInputData.addParentIdToUpdate`) |
| Item-level deallocation (no `productItemId`) | All matching `InventoryItemReservation` rows → `CANCELLATION_IN_PROGRESS` |
| Async MQ success | `RESERVED` or `CANCELLED` |
| Async MQ failure | `RESERVATION_IN_PROGRESS` retries; final → `ReservationFailed` (instance-level) |

Save hooks in `InventoryItemReservationFunctions` translate `Reserved`/`Cancelled` writes into `ProductItemAddlTrxn` rows of type `Allocated` / `Deallocated` (positive/negative quantity).

## Product Type Routing

| Product type | Quantity recorded on | Child records created | Service path |
|--------------|---------------------|----------------------|-------------|
| Non-serialized | `InventoryItemReservation.Quantity` | none | `bulkCreateItemReservation` |
| Serialized + non-batched (unbatched) | parent quantity null (managed by save hooks) | `InvItemInstanceReservation` per `unbatchedSerializedProductIds[]` | `InvItemInstanceAllocationService.createAllocation` |
| Serialized + batched | parent + `InventoryBatchItemReservation.Quantity` | `InvItemInstanceReservation` (with `InvBatchItemReservation` set) | batch path with instance children |

Routing is determined inside `bulkCreateItemReservation` — it builds `InvItemInstanceAllocationInputData` whenever `unbatchedSerializedProductIds` is non-empty and delegates to `InvItemInstanceAllocationService.createAllocation` / `updateAllocation`.

## Validation Pipeline

`InventoryAllocationValidationUtil` and `InventoryAllocationResourceImpl` execute three staged passes — each must fully pass before the next runs:

### Stage 1 — Source-level
- `sourceId` non-empty
- `sourceId` non-duplicate within payload
- `EntityInfo` resolves to `Order`, `ReturnOrder`, or `WorkOrder`
- Failure → `InventoryAllocationException(INVALID_SOURCE_ENTITY)`

### Stage 2 — Item-level
- `sourceItemId` non-empty
- `sourceItemId` non-duplicate per source
- Child records exist via `getItemRecords(...)` SOQL
- Failure → `InventoryAllocationException`

### Stage 3 — Detail-level
- `sourceLocationId` non-empty
- `sourceLocationId` non-duplicate per item
- `allocatedQuantity > 0`
- `serializedProductIds` non-empty when supplied
- For deallocation: serialized IDs already have reservations (`InventoryAllocationUtil.validateSerializedProductIdsHaveReservations`)
- Failure → `InventoryAllocationUserException` (`USER_REQUEST_ERROR`)

### Stage 4 — Concurrency Guard
- `inventoryItemReservationService.hasInProgressReservationsBySourceIds(sourceIds)` returns false
- Failure → `ALLOCATION_ALREADY_IN_PROGRESS`

## Async Reconciliation: ProductItem Quantity Update

After reservation rows commit, `InventoryAllocationHandler` invokes the additional-transaction processor (fire-and-forget):

```
ProductItemAddlTxnProcessor.processTransactions(productItemIds)
  ├── (acquired, unacquired) = productItemLockManager.lockProductItems(productItemIds)
  │     ↑ failed locks → re-enqueue with 15s delay
  ├── pending = productItemAddlTxnAggregator.aggregatePendingTransactions(acquired)
  │     ↑ sums Pending ProductItemAddlTrxn rows by product item
  ├── productItemUpdateService.updateProductItemQuantities(acquired, pending)
  │     ↑ applies deltas to QuantityOnHand / QuantityAllocated / QuantityDamaged
  └── productItemLockManager.unLockProductItems (in finally)
```

Why locks: prevents two concurrent reconciliations for the same `ProductItem` from clobbering each other's quantity deltas. Locks are not the same as the reservation row's `RESERVATION_IN_PROGRESS` status — they're a finer-grained mutex during reconciliation only.

## Deallocation Flow (Release)

`InventoryDeallocationResourceImpl` is structurally identical to allocation but produces `InventoryDeallocationItemInfo` and enqueues with `InventoryAllocationFeatureType.DEALLOCATION`.

The handler routes through `populateInventoryItemReservationList` which applies these rules:

| Input shape | Effect |
|-------------|--------|
| `productItemId` set, no `serializedProductIds` | Status to `CancellationInProgress` for that line + cascades to children |
| `productItemId` set + `serializedProductIds` | Only children of those serial IDs are deallocated (parent unchanged) |
| `productItemId == null` | All `InventoryItemReservation` rows under the `sourceItemId` go to `CancellationInProgress` |

`ProductItemAddlTrxn` rows of type `Deallocated` are emitted by save hooks and aggregated/applied identically to allocation.

## Get Allocation Status Flow

`GetInventoryAllocationResourceImpl.get(sourceId, ...)`:

1. Build `BaseAllocation` from `sourceId` (factory).
2. Paginate child line items via the strategy's `getChildSelectFields()`.
3. Call `InventoryAllocationService.getInventoryAllocation(BaseAllocation, allLineItemData, requestedAllocationStatus)`.
4. Service composes:
   - Per line item: `requestedAllocatedQuantity`, `successfulAllocatedQuantity`
   - Per location: `reservedQuantity`, `availableQuantity = ProductItem.QuantityOnHand`
   - Per instance (v262+): `instanceReservations[]`
   - `pendingAllocatedQuantity` from Pending `ProductItemAddlTrxn` rows
   - Overall status: `NotAllocated` / `PartiallyAllocated` / `FullyAllocated`

Read path is fully synchronous — does not enqueue or await async work.

## Exception Classes

All in `core/industries-unified-inventory-impl/.../inventoryallocation/exception/`:

| Class | Use |
|-------|-----|
| `InventoryAllocationException` | Generic structural error; carries `ApiErrorCodes` + `HttpStatusCode` + `errorDetails[]` |
| `InventoryAllocationUserException` | User-facing validation/business errors → `errorCode = "USER_REQUEST_ERROR"` |
| `InventoryAllocationMQException` | MQ enqueue / persistence failures |
| `InventoryAllocationProcessingException` | Async processor errors during `ProductItem` reconciliation; has `FailureType` enum |

## Async Pipeline Components

| Component | Path | Role |
|-----------|------|------|
| `InventoryAllocationEnqueuer` | `.../mq/enqueuer/InventoryAllocationEnqueuer.java` | Persists JSON-blob `InventoryAllocationDetails` and inserts MQ message; rejects in-flight duplicate `sourceId`s |
| `InventoryAllocationHandler` | `.../mq/handler/InventoryAllocationHandler.java` | Async consumer (Tier 2). `MAX_RETRIES=2`, `CLONE_MESSAGE_DELAY=60s` |
| `InventoryAllocationInAppNotificationUtil` | `.../mq/handler/notifications/...` | Posts in-app success/failure notifications |
| `ProductItemAddlTxnProcessEnqueuer` | `.../mq/enqueuer/...` | Re-enqueues `ProductItem`s whose lock acquisition failed (15s delay) |
| `ProductItemAddlTxnProcessHandler` | `.../mq/handler/...` | Async consumer for the reconciliation queue |
| `ProductItemAddlTxnProcessor` | `.../service/...` | Lock → aggregate Pending → update `ProductItem` → unlock |
| `ProductItemLockManager` | `.../service/...` | Acquires/releases per-product-item locks |
| `ProductItemUpdateService` | `.../service/...` | Applies aggregated deltas to `ProductItem` quantity columns |
| `ProductItemAddlTxnAggregator` | `.../service/...` | Sums Pending `ProductItemAddlTrxn` rows |
| `ProductItemAddlTxnFetchService` | `.../service/...` | Reads journal rows |

## Telemetry

Defined in `industries.unified.inventory.constants.InventoryAllocationTelemetryConstants`:

| Event | Fired |
|-------|-------|
| `ALLOCATION_API_SUCCESS` | After successful `processAllocationRequest` |
| `ALLOCATION_API_ERROR` | On allocation failure |
| `DEALLOCATION_API_SUCCESS` | After successful deallocation |
| `DEALLOCATION_API_ERROR` | On deallocation failure |
| `GET_ALLOCATION_API_SUCCESS` | After successful read |
| `GET_ALLOCATION_API_ERROR` | On read failure |

## End-to-End Sequence — Sales Order Allocation Example

Order `801xx0000000abc` has `OrderItem` `802xx0000000def` for 100 units of Product `01txx0000000xyz`. Allocate 60 units from `Warehouse A` (`1Loxx0000000ghi`).

```
1. Client → POST /connect/inventory/allocation
   { sourceId: 801xx..., items:[{ sourceItemId: 802xx..., 
     allocations:[{ sourceLocationId: 1Loxx..., allocatedQuantity: 60 }] }] }

2. InventoryAllocationResourceImpl
   - Stage 1-3 validation passes
   - hasInProgressReservationsBySourceIds([801xx...]) → false
   - InventoryAllocationDetails built
   - InventoryAllocationEnqueuer.enqueue(ALLOCATION, details)
   - Returns { isSuccess: true } (synchronously, before async work runs)

3. [Async ~ms-seconds later] InventoryAllocationHandler
   - getReservationBySource(801xx...) → null
   - createReservationAndBulkCreateItemReservation:
     * Insert InventoryReservation (Status=ReservationInProgress, UsageType=INVENTORY_ALLOCATION)
     * Insert InventoryItemReservation (Product=01txx..., Quantity=60, 
       ReservedAtLocation=1Loxx..., Status=ReservationInProgress)
   - DB commit
   - In-app "allocation success" notification

4. Save hook on InventoryItemReservation Reserved-state write
   - Inserts ProductItemAddlTrxn (type=Allocated, Quantity=+60, Status=Pending)

5. [Async] ProductItemAddlTxnProcessor.processTransactions([productItemId])
   - Lock product item
   - Aggregate Pending: total +60
   - Update ProductItem.QuantityAllocated += 60
   - Mark ProductItemAddlTrxn rows Status=Completed
   - Unlock

6. State after:
   - ProductItem: QuantityOnHand=200, QuantityAllocated=60
   - InventoryReservation: Status=Reserved, IsAsyncOperationInProgress=false
   - InventoryItemReservation: Status=Reserved
```

## End-to-End Sequence — Serialized Deallocation Example

Same Order, releasing serialized product `a0Bxx0000000jkl`:

```
1. Client → POST /connect/inventory/deallocation
   { deallocationData:[{ sourceId: 801xx..., items:[{ sourceItemId: 802xx...,
     deallocations:[{ sourceLocationId: 1Loxx..., 
       serializedProductIds: ["a0Bxx..."] }] }] }] }

2. Validation passes (incl. validateSerializedProductIdsHaveReservations)

3. [Async] InventoryAllocationHandler routes deallocation:
   - With serializedProductIds → only InvItemInstanceReservation rows
     for those serials → Status=CancellationInProgress
   - Parent InventoryItemReservation untouched

4. Save hook on instance status write
   - Inserts ProductItemAddlTrxn (type=Deallocated, Quantity=-1)

5. [Async] Reconciliation
   - ProductItem.QuantityAllocated -= 1
   - InvItemInstanceReservation.Status = Cancelled
   - SerializedProduct.AllocationStatus = None
```
