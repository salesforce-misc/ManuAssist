# Inventory Allocation — Connect REST API Reference

> **Source:** Verified against `core/industries-unified-inventory-connect-api/java/resources/unified-inventory-api.yaml` (Salesforce Core release 264).

All endpoints are gated by feature `InventoryAllocation` (min v260, internal-only) with:
- Static access check: `IndustriesUnifiedInventory.orgHasInventoryAllocationEnabledInternalOrExperience`
- User dynamic check: `userCanManageInventoryAllocationInternalOrExperience`

Available to: **Catalog, Agentforce, Flow, MCP** (API v66/67+).

## Endpoint Catalog

| Endpoint | Method | Resource Interface | Wrapper | Min Ver |
|----------|--------|-------------------|---------|---------|
| `/connect/inventory/allocation` | POST | `IInventoryAllocationResource` | `InventoryAllocation` | 260 |
| `/connect/inventory/deallocation` | POST | `IInventoryDeallocationResource` | `InventoryAllocation` | 260 |
| `/connect/inventory/allocation/{sourceId}` | GET | `IGetInventoryAllocationResource` | `InventoryAllocation` | 260 |
| `/connect/inventory/process-additional-transaction` | POST | `IProcessAdditionalTransactionResource` | `ProductInventoryAdditionalTransactionProcess` | 262 |
| `/connect/inventory/inbound` | POST | `IInventoryInboundResource` | `InventoryTransfer` | 260 |

> The Inbound endpoint is part of the Inventory Transfer family (separate gating: `userCanManageGoodsReceivedNoteInternalOrExperience`), included here for completeness.

---

## 1. Allocate

`POST /services/data/v{XX}.0/connect/inventory/allocation`

### Request Body

```json
{
  "allocationData": [
    {
      "sourceId": "801xx0000000abc",
      "items": [
        {
          "sourceItemId": "802xx0000000def",
          "allocations": [
            {
              "sourceLocationId": "1Loxx0000000ghi",
              "allocatedQuantity": 10,
              "unbatchedSerializedProductIds": ["a0Bxx0000000jkl"]
            }
          ],
          "deallocationLocationIds": [],
          "deallocations": [
            { "sourceLocationId": "1Loxx0000000mno", "serializedProductIds": [] }
          ]
        }
      ]
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `allocationData[]` | array | yes | One entry per source document |
| `allocationData[].sourceId` | string | yes | Order, ReturnOrder, or WorkOrder Id |
| `allocationData[].items[]` | array | yes | One entry per source line item |
| `items[].sourceItemId` | string | yes | OrderItem / ReturnOrderLineItem / WorkOrderLineItem Id |
| `items[].allocations[]` | array | yes | One entry per location to allocate against |
| `allocations[].sourceLocationId` | string | yes | Location Id holding the inventory |
| `allocations[].allocatedQuantity` | number | yes | Must be `> 0` |
| `allocations[].unbatchedSerializedProductIds[]` | string[] | optional | For non-batched serialized products |
| `items[].deallocationLocationIds[]` | string[] | optional | Legacy field (still supported) |
| `items[].deallocations[]` | array | optional | Mixed allocate+deallocate in one call |

### Response

```json
{
  "isSuccess": true,
  "errorCode": null,
  "errorMessage": null,
  "errorDetails": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `isSuccess` | boolean | Whether the request was accepted (note: this confirms enqueue, not async completion) |
| `errorCode` | string | e.g. `USER_REQUEST_ERROR`, `ALLOCATION_ALREADY_IN_PROGRESS` |
| `errorMessage` | string | Human-readable message |
| `errorDetails[]` | array | Per-item error breakdown |

---

## 2. Deallocate

`POST /services/data/v{XX}.0/connect/inventory/deallocation`

Structurally identical to allocation; produces `InventoryDeallocationItemInfo` and enqueues with `InventoryAllocationFeatureType.DEALLOCATION`.

### Request Body

```json
{
  "deallocationData": [
    {
      "sourceId": "801xx0000000abc",
      "items": [
        {
          "sourceItemId": "802xx0000000def",
          "deallocations": [
            {
              "sourceLocationId": "1Loxx0000000ghi",
              "serializedProductIds": ["a0Bxx0000000jkl"]
            }
          ]
        }
      ]
    }
  ]
}
```

### Deallocation Routing Rules

| Input | Effect |
|-------|--------|
| `productItemId` set, no `serializedProductIds` | Parent `InventoryItemReservation` → `CancellationInProgress`; cascades to all child instance reservations |
| `productItemId` set + `serializedProductIds` | Only the named child `InvItemInstanceReservation` rows go to `CancellationInProgress` (parent unchanged) |
| `productItemId == null` | All `InventoryItemReservation` rows under the `sourceItemId` go to `CancellationInProgress` |

`ProductItemAddlTrxn` rows of type `Deallocated` (negative quantity) are emitted by save hooks and reconciled by `ProductItemAddlTxnProcessor`.

---

## 3. Get Allocation Status

`GET /services/data/v{XX}.0/connect/inventory/allocation/{sourceId}?pageNumber=1&pageSize=50&status=PartiallyAllocated`

### Path & Query Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `sourceId` | yes | Order/WorkOrder/ReturnOrder Id |
| `pageNumber` | optional | 1-based page index |
| `pageSize` | optional | Items per page |
| `status` | optional | Filter — `NotAllocated`, `PartiallyAllocated`, `FullyAllocated` |

### Response Shape

```json
{
  "lineItems": [
    {
      "lineItemId": "802xx0000000def",
      "productId": "01txx0000000xyz",
      "productName": "Widget A",
      "isSerialised": false,
      "status": "PartiallyAllocated",
      "lineItemQuantity": 100,
      "requestedAllocatedQuantity": 60,
      "successfulAllocatedQuantity": 50,
      "pendingAllocatedQuantity": 10,
      "allocations": [
        {
          "locationId": "1Loxx0000000ghi",
          "locationName": "Warehouse A",
          "reservedQuantity": 50,
          "availableQuantity": 200,
          "instanceReservations": [
            {
              "itemInstanceId": "a0Bxx0000000jkl",
              "status": "Reserved"
            }
          ]
        }
      ]
    }
  ],
  "pagination": { "pageNumber": 1, "pageSize": 50, "totalCount": 1 }
}
```

> `availableQuantity` here equals `ProductItem.QuantityOnHand` directly — server-side does NOT subtract reservations. Clients must compute true availability if needed.
> `instanceReservations[]` was added in v262.

### Status Computation

`InventoryAllocationService.getInventoryAllocation` aggregates:
- `successfulAllocatedQuantity` — sum of `InventoryItemReservation.Quantity` where `Status = Reserved`
- `pendingAllocatedQuantity` — sum of pending `ProductItemAddlTrxn` rows
- `status` — `FullyAllocated` if `successful >= lineItemQuantity`, `PartiallyAllocated` if `> 0`, else `NotAllocated`

---

## 4. Process Additional Transaction (Manual Reconcile)

`POST /services/data/v{XX}.0/connect/inventory/process-additional-transaction` *(min v262)*

Synchronously invokes `ProductItemAddlTxnProcessor.processTransactions(productItemIds)`. Used when the async path didn't acquire a lock and `ProductItem` quantities are stale.

### Request

```json
{
  "productItemIds": ["1iHxx0000000abc", "1iHxx0000000def"],
  "forceUnlock": false
}
```

| Field | Description |
|-------|-------------|
| `productItemIds` | Items to reconcile |
| `forceUnlock` | When `true`, calls `ProductItemLockService.forceUnlockProductItems` first — recovery for stale locks |

---

## Validation Rules

Implemented in `InventoryAllocationValidationUtil` and `InventoryAllocationResourceImpl` — three staged passes, fail-fast per stage:

| Stage | Checks | Failure |
|-------|--------|---------|
| Source-level | `sourceId` non-empty, non-duplicate; `EntityInfo` resolves to Order/ReturnOrder/WorkOrder | `InventoryAllocationException` |
| Item-level | `sourceItemId` non-empty, non-duplicate; child records exist via `getItemRecords` | `InventoryAllocationException` |
| Detail-level | `sourceLocationId` non-empty, non-duplicate per item; `allocatedQuantity > 0`; `serializedProductIds` non-empty when supplied; serialized IDs already have reservations during deallocation | `InventoryAllocationUserException` |
| Concurrency | `inventoryItemReservationService.hasInProgressReservationsBySourceIds(sourceIds)` returns false | `ALLOCATION_ALREADY_IN_PROGRESS` |

## Error Codes

| Code | Source | Meaning |
|------|--------|---------|
| `USER_REQUEST_ERROR` | `InventoryAllocationUserException` | User-facing validation/business error |
| `ALLOCATION_ALREADY_IN_PROGRESS` | Concurrency check | Another reservation in `ReservationInProgress` or `CancellationInProgress` for this `sourceId` |
| `INVALID_SOURCE_ENTITY` | Source validation | `sourceId` not Order/ReturnOrder/WorkOrder |
| `INVALID_QUANTITY` | Detail validation | `allocatedQuantity <= 0` |
| `DUPLICATE_*` | Validation | Duplicate `sourceId`, `sourceItemId`, or `sourceLocationId` in payload |

## Telemetry Events

Declared in `industries.unified.inventory.constants.InventoryAllocationTelemetryConstants`:
- `ALLOCATION_API_SUCCESS` / `ALLOCATION_API_ERROR`
- `DEALLOCATION_API_SUCCESS` / `DEALLOCATION_API_ERROR`
- `GET_ALLOCATION_API_SUCCESS` / `GET_ALLOCATION_API_ERROR`

## Apex Surface

The YAML's `connect-hidden: [Apex]` is **not set** for the Allocation family, so the auto-generated Apex wrapper class is exposed:

```apex
ConnectApi.InventoryAllocationOutputRepresentation result =
    ConnectApi.InventoryAllocation.processAllocationRequest(input);

ConnectApi.InventoryDeallocationOutputRepresentation deallocResult =
    ConnectApi.InventoryAllocation.processDeallocationRequest(input);

ConnectApi.GetInventoryAllocationOutputRepresentation status =
    ConnectApi.InventoryAllocation.getInventoryAllocation(
        sourceId, pageNumber, pageSize, status);
```

The Apex code is generated from the YAML at build time (`wrapper: { class-name: InventoryAllocation }`).

## Reference File Paths (Salesforce Core)

```
core/industries-unified-inventory-connect-api/java/resources/unified-inventory-api.yaml
core/industries-unified-inventory-connect-impl/java/src/industries/unified/inventory/connect/impl/resource/
    InventoryAllocationResourceImpl.java
    InventoryDeallocationResourceImpl.java
    GetInventoryAllocationResourceImpl.java
    ProcessAdditionalTransactionResourceImpl.java
core/industries-unified-inventory-connect-impl/java/src/industries/unified/inventory/connect/impl/util/
    InventoryAllocationValidationUtil.java
```
