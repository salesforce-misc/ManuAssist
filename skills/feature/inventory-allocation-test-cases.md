# Inventory Allocation API — Test Cases & Data Creation Guide

## Table of Contents
1. [Foundation Data Setup](#1-foundation-data-setup)
2. [Test Data Factories](#2-test-data-factories)
3. [Allocation API Test Cases](#3-allocation-api-test-cases)
4. [Deallocation API Test Cases](#4-deallocation-api-test-cases)
5. [Get Allocation API Test Cases](#5-get-allocation-api-test-cases)
6. [Cross-Cutting Tests](#6-cross-cutting-tests)
7. [API Endpoints Reference](#7-api-endpoints-reference)

---

## 1. Foundation Data Setup

### 1.1 Org-Level Prerequisites

```
Org Perm          : InventoryAllocation = true
Org Preference    : InventoryAllocationEnabled = true
User Perm         : ManageInventoryAllocation = assigned to test user
Platform License  : InventoryAllocation
User License      : InvAllocationUserPsl
```

### 1.2 Entity Dependency Graph (Creation Order)

```
Step 1: Product2
Step 2: Location
Step 3: ProductItem              (FK: Product2, Location)
Step 4: ProductionBatch          (optional — for batch tests)
Step 5: ProductBatchItem         (FK: ProductItem, ProductionBatch — for batch tests)
Step 6: SerializedProduct        (FK: ProductItem, ProductionBatch — for serialized tests)
Step 7: Account
Step 8: Order                    (FK: Account)
Step 9: OrderItem                (FK: Order, Product2)
Step 10: ProductFulfilmentLocation (FK: Product2, Location — for auto-allocation tests)
```

### 1.3 Base Data Records

#### Products

| Variable Name | Product Name | IsActive | IsSerialized | IsBatched | Description |
|---------------|-------------|----------|-------------|-----------|-------------|
| `prodStandard` | Generator | true | false | false | Standard product — location-level allocation |
| `prodStandard2` | Motor | true | false | false | Second standard product — multi-item tests |
| `prodBatched` | Headlight | true | false | true | Batched product — non-serialized |
| `prodSerializedBatched` | Circuit Breaker | true | true | true | Serialized + batched product |
| `prodSerializedUnbatched` | iPhone | true | true | false | Serialized + non-batched product |

#### Locations

| Variable Name | Location Name | LocationType |
|---------------|-------------|-------------|
| `locChennai` | Chennai Warehouse | Warehouse |
| `locSurat` | Surat Warehouse | Warehouse |
| `locBangalore` | Bangalore Warehouse | Warehouse |
| `locHyderabad` | Hyderabad Warehouse | Warehouse |

#### Product Items (Inventory Stock)

| Variable Name | Product | Location | QtyOnHand | QtyAllocated | QtyDamaged |
|---------------|---------|----------|-----------|-------------|------------|
| `piGeneratorChennai` | Generator | Chennai | 200 | 0 | 0 |
| `piGeneratorSurat` | Generator | Surat | 100 | 0 | 0 |
| `piMotorBangalore` | Motor | Bangalore | 150 | 0 | 0 |
| `piHeadlightSurat` | Headlight | Surat | 300 | 0 | 0 |
| `piCircuitBangalore` | Circuit Breaker | Bangalore | 50 | 0 | 0 |
| `piIphoneHyderabad` | iPhone | Hyderabad | 20 | 0 | 0 |
| `piEmptyLocation` | Generator | Bangalore | 0 | 0 | 0 |

#### Production Batches (for batch tests)

| Variable Name | Batch Name | Product | ExpirationDate |
|---------------|-----------|---------|----------------|
| `batchHL001` | BATCH-HL-001 | Headlight | TODAY + 180 |
| `batchHL002` | BATCH-HL-002 | Headlight | TODAY + 90 |
| `batchCB001` | BATCH-CB-001 | Circuit Breaker | TODAY + 365 |
| `batchCB002` | BATCH-CB-002 | Circuit Breaker | TODAY + 120 |

#### Product Batch Items

| Variable Name | ProductItem | ProductionBatch | RemainingQty | QtyAllocated |
|---------------|-------------|-----------------|-------------|-------------|
| `pbiHL001Surat` | piHeadlightSurat | BATCH-HL-001 | 200 | 0 |
| `pbiHL002Surat` | piHeadlightSurat | BATCH-HL-002 | 100 | 0 |
| `pbiCB001Bang` | piCircuitBangalore | BATCH-CB-001 | 30 | 0 |
| `pbiCB002Bang` | piCircuitBangalore | BATCH-CB-002 | 20 | 0 |

#### Serialized Products — Batched (Circuit Breaker at Bangalore)

| Variable Name | SerialNumber | Product | ProductItem | Batch | Status | AllocationStatus |
|---------------|-------------|---------|-------------|-------|--------|-----------------|
| `spCB1` | SN-CB-001 | Circuit Breaker | piCircuitBangalore | BATCH-CB-001 | Available | None |
| `spCB2` | SN-CB-002 | Circuit Breaker | piCircuitBangalore | BATCH-CB-001 | Available | None |
| `spCB3` | SN-CB-003 | Circuit Breaker | piCircuitBangalore | BATCH-CB-002 | Available | None |
| `spCB4` | SN-CB-004 | Circuit Breaker | piCircuitBangalore | BATCH-CB-001 | Damaged | None |
| `spCB5` | SN-CB-005 | Circuit Breaker | piCircuitBangalore | BATCH-CB-002 | Available | Allocated |

#### Serialized Products — Unbatched (iPhone at Hyderabad)

| Variable Name | SerialNumber | Product | ProductItem | Batch | Status | AllocationStatus |
|---------------|-------------|---------|-------------|-------|--------|-----------------|
| `spIP1` | SN-IP-001 | iPhone | piIphoneHyderabad | null | Available | None |
| `spIP2` | SN-IP-002 | iPhone | piIphoneHyderabad | null | Available | None |
| `spIP3` | SN-IP-003 | iPhone | piIphoneHyderabad | null | Available | None |
| `spIP4` | SN-IP-004 | iPhone | piIphoneHyderabad | null | Available | None |
| `spIP5` | SN-IP-005 | iPhone | piIphoneHyderabad | null | Available | None |
| `spIP6` | SN-IP-006 | iPhone | piIphoneHyderabad | null | Damaged | None |
| `spIP7` | SN-IP-007 | iPhone | piIphoneHyderabad | null | Sent | None |
| `spIP8` | SN-IP-008 | iPhone | piIphoneHyderabad | null | Consumed | None |
| `spIP9` | SN-IP-009 | iPhone | piIphoneHyderabad | null | Lost | None |
| `spIP10` | SN-IP-010 | iPhone | piIphoneHyderabad | null | Available | Allocated |
| `spIP11` | SN-IP-011 | iPhone | piIphoneHyderabad | null | Available | Deallocated |
| `spIP12` | SN-IP-012 | iPhone | piIphoneChennai | null | Available | None |

> `spIP12` is at Chennai (different location) — used for location mismatch tests.

#### Orders

| Variable Name | Account | Description |
|---------------|---------|-------------|
| `order1` | Acme Corp | Primary test order |
| `order2` | Beta Inc | Secondary order — concurrent/multi-order tests |

#### Order Items

| Variable Name | Order | Product | Quantity | Description |
|---------------|-------|---------|----------|-------------|
| `oiGenerator` | order1 | Generator | 98 | Standard product line |
| `oiMotor` | order1 | Motor | 30 | Second standard product line |
| `oiHeadlight` | order1 | Headlight | 50 | Batched product line |
| `oiCircuit` | order1 | Circuit Breaker | 5 | Serialized + batched line |
| `oiIphone` | order1 | iPhone | 5 | Serialized + unbatched line |
| `oiGenerator2` | order2 | Generator | 60 | For concurrent allocation test |
| `oiIphone2` | order2 | iPhone | 3 | For concurrent SP allocation test |

#### Work Orders (for source type tests)

| Variable Name | Account | Description |
|---------------|---------|-------------|
| `workOrder1` | Acme Corp | WorkOrder source test |
| `woliIphone` | workOrder1 | iPhone, qty=2 |

#### Return Orders (for source type tests)

| Variable Name | Account | Description |
|---------------|---------|-------------|
| `returnOrder1` | Acme Corp | ReturnOrder source test |
| `roliGenerator` | returnOrder1 | Generator, qty=10 |

---

## 2. Test Data Factories

### 2.1 Apex Test Data Factory — Method Signatures

```java
@TestVisible
public class InventoryAllocationTestDataFactory {

    // ─── Products ───
    public static Product2 createProduct(String name, Boolean isActive);
    public static List<Product2> createProducts(Integer count);

    // ─── Locations ───
    public static Location createLocation(String name, String locationType);
    public static List<Location> createLocations(List<String> names);

    // ─── Product Items ───
    public static ProductItem createProductItem(
        Id productId, Id locationId,
        Decimal qtyOnHand, Decimal qtyAllocated, Decimal qtyDamaged
    );

    // ─── Production Batches ───
    public static ProductionBatch createBatch(String name, Date expirationDate);

    // ─── Product Batch Items ───
    public static ProductBatchItem createProductBatchItem(
        Id productItemId, Id productionBatchId,
        Decimal remainingQty, Decimal qtyAllocated
    );

    // ─── Serialized Products ───
    public static SerializedProduct createSerializedProduct(
        String serialNumber, Id productItemId, Id productionBatchId,
        String status, String allocationStatus
    );
    public static List<SerializedProduct> createAvailableUnbatchedSPs(
        Id productItemId, Integer count
    );
    public static List<SerializedProduct> createAvailableBatchedSPs(
        Id productItemId, Id batchId, Integer count
    );

    // ─── Orders ───
    public static Order createOrder(Id accountId);
    public static OrderItem createOrderItem(Id orderId, Id product2Id, Decimal quantity);

    // ─── Work Orders ───
    public static WorkOrder createWorkOrder(Id accountId);
    public static WorkOrderLineItem createWorkOrderLineItem(
        Id workOrderId, Id product2Id, Decimal quantity
    );

    // ─── Return Orders ───
    public static ReturnOrder createReturnOrder(Id accountId);
    public static ReturnOrderLineItem createReturnOrderLineItem(
        Id returnOrderId, Id product2Id, Decimal quantity
    );

    // ─── Product Fulfilment Location (auto-allocation) ───
    public static ProductFulfilmentLocation createFulfilmentLocation(
        Id product2Id, Id locationId
    );

    // ─── Composite Setup Methods ───

    /** Creates full standard product setup: Product + Location + ProductItem */
    public static Map<String, SObject> setupStandardProduct(
        String productName, String locationName, Decimal qtyOnHand
    );

    /** Creates full batched product setup: Product + Location + ProductItem + Batches + PBIs */
    public static Map<String, SObject> setupBatchedProduct(
        String productName, String locationName, Decimal qtyOnHand,
        List<String> batchNames, List<Decimal> batchQuantities
    );

    /** Creates full serialized+batched setup: above + SerializedProducts per batch */
    public static Map<String, SObject> setupSerializedBatchedProduct(
        String productName, String locationName, Decimal qtyOnHand,
        String batchName, Decimal batchQty, Integer spCount
    );

    /** Creates full serialized unbatched setup: Product + Location + ProductItem + SPs */
    public static Map<String, SObject> setupSerializedUnbatchedProduct(
        String productName, String locationName, Decimal qtyOnHand, Integer spCount
    );

    /** Creates Order with line items for given products */
    public static Map<String, SObject> setupOrder(
        Id accountId, Map<Id, Decimal> productQuantities
    );

    /** Complete test scenario: products + inventory + order — ready for API call */
    public static Map<String, SObject> setupFullScenario();
}
```

### 2.2 API Call Helper — Method Signatures

```java
@TestVisible
public class InventoryAllocationApiHelper {

    // ─── Allocation Payloads ───

    /** Location-level allocation (v260 standard) */
    public static String buildLocationAllocationPayload(
        Id sourceId,
        Id sourceItemId,
        List<AllocationEntry> allocations  // {sourceLocationId, allocatedQuantity}
    );

    /** Batch-level allocation (non-serialized) */
    public static String buildBatchAllocationPayload(
        Id sourceId,
        Id sourceItemId,
        Id sourceLocationId,
        Decimal allocatedQuantity,
        List<BatchEntry> batches  // {batchItemId, quantity}
    );

    /** Serialized batch allocation */
    public static String buildSerializedBatchAllocationPayload(
        Id sourceId,
        Id sourceItemId,
        Id sourceLocationId,
        Decimal allocatedQuantity,
        List<SerializedBatchEntry> batches  // {batchItemId/batchId, quantity, batchedSerializedProductIds}
    );

    /** Serialized non-batch allocation */
    public static String buildSerializedUnbatchedAllocationPayload(
        Id sourceId,
        Id sourceItemId,
        Id sourceLocationId,
        Decimal allocatedQuantity,
        List<Id> unbatchedSerializedProductIds
    );

    /** Mixed composite allocation (all types in one request) */
    public static String buildCompositeAllocationPayload(
        Id sourceId,
        List<ItemAllocation> items
    );

    // ─── Deallocation Payloads ───

    /** Item-level deallocation (deallocate everything) */
    public static String buildItemDeallocationPayload(
        Id sourceId, Id sourceItemId
    );

    /** Location-level deallocation */
    public static String buildLocationDeallocationPayload(
        Id sourceId, Id sourceItemId, List<Id> sourceLocationIds
    );

    /** Batch-level deallocation (non-serialized) */
    public static String buildBatchDeallocationPayload(
        Id sourceId, Id sourceItemId, Id sourceLocationId, List<Id> batchItemIds
    );

    /** Serialized product deallocation (batched or unbatched) */
    public static String buildSerializedDeallocationPayload(
        Id sourceId, Id sourceItemId, Id sourceLocationId, List<Id> serializedProductIds
    );

    // ─── API Execution ───

    public static HttpResponse callAllocationApi(String jsonPayload);
    public static HttpResponse callDeallocationApi(String jsonPayload);
    public static HttpResponse callGetAllocationApi(Id orderId, Integer pageNumber, Integer pageSize);

    // ─── Inner Classes ───

    public class AllocationEntry {
        public Id sourceLocationId;
        public Decimal allocatedQuantity;
    }

    public class BatchEntry {
        public Id batchItemId;
        public Decimal quantity;
    }

    public class SerializedBatchEntry {
        public Id batchItemId;
        public Id batchId;
        public Decimal quantity;
        public List<Id> batchedSerializedProductIds;
    }

    public class ItemAllocation {
        public Id sourceItemId;
        public List<Object> allocations;  // mixed types
    }
}
```

### 2.3 Assertion Helpers

```java
@TestVisible
public class InventoryAllocationAssertions {

    /** Verify InventoryReservation exists for source */
    public static InventoryReservation assertReservationExists(Id sourceId);

    /** Verify InventoryItemReservation count and status */
    public static List<InventoryItemReservation> assertItemReservations(
        Id reservationSourceId, Integer expectedCount, String expectedStatus
    );

    /** Verify InventoryBatchItemReservation count */
    public static void assertBatchReservations(
        Id inventoryItemReservationId, Integer expectedCount
    );

    /** Verify InventorySerializedProductReservation */
    public static void assertSerializedReservations(
        Id inventoryItemReservationId, Integer expectedCount, String expectedStatus
    );

    /** Verify ProductItem quantities after async processing */
    public static void assertProductItemQuantities(
        Id productItemId,
        Decimal expectedQtyAllocated,
        Decimal expectedQtyOnHand
    );

    /** Verify ProductBatchItem quantities */
    public static void assertBatchItemQuantities(
        Id productBatchItemId, Decimal expectedQtyAllocated
    );

    /** Verify SerializedProduct allocation status */
    public static void assertSerializedProductStatus(
        Id serializedProductId, String expectedAllocationStatus
    );

    /** Verify ProductItemAdditionalTransaction */
    public static void assertTransactionLog(
        Id productItemId, String expectedTransactionStatus, Integer expectedCount
    );

    /** Verify Get Allocation API response structure */
    public static void assertGetAllocationResponse(
        Map<String, Object> response,
        String expectedStatus,               // NOT_ALLOCATED | PARTIALLY_ALLOCATED | FULLY_ALLOCATED
        Decimal expectedTotalRequired,
        Decimal expectedAllocationCompleted
    );
}
```

---

## 3. Allocation API Test Cases

### 3.1 Location-Level Allocation (Standard Products)

```
Endpoint: POST connect/inventory/allocation
```

#### A-1: Single location, full allocation
```
Data:   piGeneratorChennai (QtyOnHand=200), oiGenerator (qty=98)
Input:  {
          sourceId: order1.Id,
          items: [{
            sourceItemId: oiGenerator.Id,
            allocations: [{
              sourceLocationId: locChennai.Id,
              allocatedQuantity: 98
            }]
          }]
        }
Assert:
  - InventoryReservation created (ReservationSource = order1.Id)
  - 1x InventoryItemReservation (qty=98, status=ReservationInProgress)
  - ProductItemAdditionalTransaction (status=Pending)
  - After async: piGeneratorChennai.QtyAllocated = 98
  - After async: IIR.Status = Reserved
  - GET API: status = FULLY_ALLOCATED
```

#### A-2: Single location, partial allocation
```
Data:   piGeneratorChennai (QtyOnHand=200), oiGenerator (qty=98)
Input:  allocatedQuantity: 40
Assert:
  - IIR.qty = 40
  - After async: piGeneratorChennai.QtyAllocated = 40
  - GET API: status = PARTIALLY_ALLOCATED
  - GET API: totalRequiredQuantity=98, totalRequestedAllocationQty=40
```

#### A-3: Multi-location split
```
Data:   piGeneratorChennai (QtyOnHand=200), piGeneratorSurat (QtyOnHand=100), oiGenerator (qty=98)
Input:  allocations: [
          {sourceLocationId: locChennai.Id, allocatedQuantity: 75},
          {sourceLocationId: locSurat.Id,   allocatedQuantity: 23}
        ]
Assert:
  - 2x InventoryItemReservation (75 + 23 = 98)
  - After async: piGeneratorChennai.QtyAllocated=75, piGeneratorSurat.QtyAllocated=23
  - GET API: status = FULLY_ALLOCATED
```

#### A-4: Multiple line items in one request
```
Data:   oiGenerator (qty=98), oiMotor (qty=30)
Input:  items: [
          {sourceItemId: oiGenerator.Id, allocations: [{locChennai, 98}]},
          {sourceItemId: oiMotor.Id,     allocations: [{locBangalore, 30}]}
        ]
Assert:
  - 1x InventoryReservation (shared for the order)
  - 2x InventoryItemReservation (one per line item)
```

#### A-5: Multiple orders in one request
```
Data:   order1 -> oiGenerator (qty=98), order2 -> oiGenerator2 (qty=60)
Input:  allocationData: [
          {sourceId: order1.Id, items: [{oiGenerator, [{locChennai, 98}]}]},
          {sourceId: order2.Id, items: [{oiGenerator2, [{locChennai, 60}]}]}
        ]
Assert:
  - 2x InventoryReservation (one per order)
  - After async: piGeneratorChennai.QtyAllocated = 158
```

#### A-6: Allocate zero quantity
```
Input:  allocatedQuantity: 0
Assert: Error response (invalid quantity)
```

#### A-7: Allocate negative quantity
```
Input:  allocatedQuantity: -10
Assert: Error response (invalid quantity)
```

#### A-8: Allocate decimal quantity
```
Data:   piGeneratorChennai (QtyOnHand=200.5)
Input:  allocatedQuantity: 50.25
Assert: Success — IIR.qty = 50.25
```

#### A-9: Allocate more than QtyOnHand (over-allocation)
```
Data:   piGeneratorChennai (QtyOnHand=10)
Input:  allocatedQuantity: 50
Assert: Success (no validation). After async: QtyAllocated=50, QtyAvailable=-40
```

#### A-10: Allocate from location with zero stock
```
Data:   piEmptyLocation (QtyOnHand=0)
Input:  allocatedQuantity: 10
Assert: Success. After async: QtyAllocated=10, QtyAvailable=-10
```

#### A-11: Duplicate allocation — same line item + location
```
Data:   IIR already exists (oiGenerator + locChennai, qty=50)
Input:  Same payload: oiGenerator + locChennai, allocatedQuantity=30
Assert: Additional IIR created (or existing updated). Total allocated = 80
```

#### A-12: Allocate beyond order quantity
```
Data:   oiGenerator (qty=100), already allocated 100
Input:  allocatedQuantity: 50 more
Assert: Success (no cap). GET API: totalRequestedAllocationQty=150 > totalRequired=100
```

#### A-13: Invalid sourceId
```
Input:  sourceId: "001INVALIDID000"
Assert: Error — Order not found
```

#### A-14: Invalid sourceItemId
```
Input:  sourceItemId: "002INVALIDID000"
Assert: Error — OrderItem not found
```

#### A-15: Invalid sourceLocationId
```
Input:  sourceLocationId: "131INVALIDID000"
Assert: Error — Location not found
```

#### A-16: Missing required fields
```
Test A-16a: Omit sourceId          → Error
Test A-16b: Omit sourceItemId      → Error
Test A-16c: Omit sourceLocationId  → Error
Test A-16d: Omit allocatedQuantity → Error (or derived from children)
```

#### A-17: Empty allocationData array
```
Input:  {"allocationData": []}
Assert: Error or no-op
```

#### A-18: Empty items array
```
Input:  {"allocationData": [{"sourceId": "...", "items": []}]}
Assert: Error or no-op
```

#### A-19: Empty allocations array
```
Input:  items: [{sourceItemId: "...", allocations: []}]
Assert: Error or no-op
```

#### A-20: Very large quantity
```
Input:  allocatedQuantity: 999999999
Assert: Success. No numeric overflow. QtyAllocated stored correctly
```

#### A-21: WorkOrder as source
```
Data:   workOrder1 -> woliIphone
Input:  sourceId: workOrder1.Id, sourceItemId: woliIphone.Id
Assert: InventoryReservation.ReservationSource = workOrder1.Id (poly FK resolves to WorkOrder)
```

#### A-22: ReturnOrder as source
```
Data:   returnOrder1 -> roliGenerator
Input:  sourceId: returnOrder1.Id, sourceItemId: roliGenerator.Id
Assert: InventoryReservation.ReservationSource = returnOrder1.Id
```

#### A-23: Same ProductItem from multiple orders
```
Data:   piGeneratorChennai (QtyOnHand=100)
Input:  order1 allocates 60, order2 allocates 60 (sequential)
Assert: Both succeed. After async: QtyAllocated=120
```

#### A-24: Concurrent allocation — same ProductItem
```
Data:   piGeneratorChennai (QtyOnHand=100)
Input:  Two simultaneous API calls, each allocating 80
Assert: Both API calls succeed. MQ handles lock contention via re-enqueue
        After async: QtyAllocated=160
```

#### A-25: No org perm
```
Setup:  InventoryAllocationEnabled = false
Input:  Any valid payload
Assert: 403 Forbidden / Access denied
```

#### A-26: No user perm
```
Setup:  User missing ManageInventoryAllocation
Input:  Any valid payload
Assert: 403 Forbidden / Access denied
```

#### A-27: Allocation with deallocationLocationIds in same request
```
Input:  items: [{sourceItemId, allocations: [{locChennai, 50}], deallocationLocationIds: [locSurat.Id]}]
Assert: Allocation to Chennai created. Existing reservation at Surat cancelled.
```

---

### 3.2 Batch-Level Allocation (Non-Serialized)

#### B-1: Single batch allocation
```
Data:   pbiHL001Surat (RemainingQty=200, QtyAllocated=0), oiHeadlight (qty=50)
Input:  allocations: [{
          sourceLocationId: locSurat.Id,
          allocatedQuantity: 50,
          batches: [{batchItemId: pbiHL001Surat.Id, quantity: 50}]
        }]
Assert:
  - IIR created (qty=50)
  - 1x InventoryBatchItemReservation (qty=50)
  - After async: pbiHL001Surat.QtyAllocated=50, piHeadlightSurat.QtyAllocated=50
```

#### B-2: Multi-batch split
```
Data:   pbiHL001Surat (200), pbiHL002Surat (100)
Input:  batches: [
          {batchItemId: pbiHL001Surat.Id, quantity: 30},
          {batchItemId: pbiHL002Surat.Id, quantity: 20}
        ]
Assert:
  - 2x IBIR records. Parent IIR.qty = 50
  - After async: pbiHL001Surat.QtyAllocated=30, pbiHL002Surat.QtyAllocated=20
  - piHeadlightSurat.QtyAllocated = 50 (rollup)
```

#### B-3: Batch allocation using batchId (not batchItemId)
```
Input:  batches: [{batchId: batchHL001.Id, quantity: 25}]
Assert: System derives pbiHL001Surat from batchId + location. IBIR created.
```

#### B-4: Batch exceeding remaining quantity
```
Data:   pbiHL002Surat (RemainingQty=10)
Input:  batches: [{batchItemId: pbiHL002Surat.Id, quantity: 50}]
Assert: Success (no validation). After async: QtyAllocated=50
```

#### B-5: Invalid batchItemId
```
Input:  batches: [{batchItemId: "INVALID", quantity: 10}]
Assert: Error response
```

#### B-6: Batch quantity sum != allocatedQuantity
```
Input:  allocatedQuantity: 100, batches sum to 80
Assert: Verify behavior — error or allocatedQuantity overridden by batch sum
```

#### B-7: Batch allocation with allocatedQuantity omitted
```
Input:  No allocatedQuantity field, batches: [{qty: 30}, {qty: 20}]
Assert: allocatedQuantity derived as 50
```

#### B-8: Rollup to ProductItem
```
Data:   piHeadlightSurat.QtyAllocated=0
Input:  Allocate 30 via batch
Assert: pbiHL001Surat.QtyAllocated=30 AND piHeadlightSurat.QtyAllocated=30
```

---

### 3.3 Serialized Product — Batch Allocation

#### C-1: Allocate SPs within a batch
```
Data:   spCB1, spCB2 (Available, None, BATCH-CB-001)
Input:  allocations: [{
          sourceLocationId: locBangalore.Id,
          allocatedQuantity: 2,
          batches: [{
            batchItemId: pbiCB001Bang.Id,
            quantity: 2,
            batchedSerializedProductIds: [spCB1.Id, spCB2.Id]
          }]
        }]
Assert:
  - IIR + IBIR + 2x ISPR
  - spCB1.AllocationStatus = Allocated
  - spCB2.AllocationStatus = Allocated
  - pbiCB001Bang.QtyAllocated = 2
```

#### C-2: Quantity < SP count
```
Input:  quantity: 1, batchedSerializedProductIds: [spCB1.Id, spCB2.Id]
Assert: Error or quantity overridden to 2
```

#### C-3: Quantity > SP count
```
Input:  quantity: 5, batchedSerializedProductIds: [spCB1.Id, spCB2.Id]
Assert: Error or quantity overridden to 2
```

#### C-4: Already-allocated SP
```
Data:   spCB5 (Available, AllocationStatus=Allocated)
Input:  batchedSerializedProductIds: [spCB5.Id]
Assert: Error — already allocated
```

#### C-5: Damaged SP
```
Data:   spCB4 (Status=Damaged, AllocationStatus=None)
Input:  batchedSerializedProductIds: [spCB4.Id]
Assert: Error — only Available SPs can be allocated
```

#### C-6: SP from wrong batch
```
Data:   spCB1 belongs to BATCH-CB-001
Input:  batchId: batchCB002.Id, batchedSerializedProductIds: [spCB1.Id]
Assert: Error — batch mismatch
```

#### C-7: SP from wrong location
```
Data:   spCB1 at Bangalore, sourceLocationId=Surat
Input:  batchedSerializedProductIds: [spCB1.Id]
Assert: Error — location mismatch
```

---

### 3.4 Serialized Product — Non-Batch Allocation (DEEP DIVE)

#### D-1: Single SP allocation
```
Data:   spIP1 (Available, None, unbatched, Hyderabad)
Input:  {
          sourceId: order1.Id,
          items: [{
            sourceItemId: oiIphone.Id,
            allocations: [{
              sourceLocationId: locHyderabad.Id,
              allocatedQuantity: 1,
              unbatchedSerializedProductIds: [spIP1.Id]
            }]
          }]
        }
Assert:
  - InventoryReservation (ReservationSource = order1)
  - InventoryItemReservation (qty=1, status=ReservationInProgress)
  - InventorySerializedProductReservation for spIP1
  - spIP1.AllocationStatus = Allocated
  - After async: piIphoneHyderabad.QtyAllocated = 1
```

#### D-2: Multiple SPs
```
Data:   spIP1, spIP2, spIP3 (all Available, None)
Input:  unbatchedSerializedProductIds: [spIP1.Id, spIP2.Id, spIP3.Id], allocatedQuantity: 3
Assert:
  - 3x ISPR records
  - IIR.qty = 3
  - All 3 SPs → AllocationStatus=Allocated
  - After async: piIphoneHyderabad.QtyAllocated = 3
```

#### D-3: Explicit allocatedQuantity matching count
```
Data:   spIP1, spIP2
Input:  allocatedQuantity: 2, unbatchedSerializedProductIds: [spIP1.Id, spIP2.Id]
Assert: Success. qty=2, 2x ISPR
```

#### D-4: allocatedQuantity omitted
```
Data:   spIP1, spIP2
Input:  No allocatedQuantity field, unbatchedSerializedProductIds: [spIP1.Id, spIP2.Id]
Assert: Quantity derived as 2
```

#### D-5: ProductItem rollup
```
Data:   piIphoneHyderabad.QtyAllocated=0
Input:  Allocate spIP1, spIP2, spIP3
Assert: After async: piIphoneHyderabad.QtyAllocated = 3
```

#### D-6: Get API for non-batch serialized
```
Precondition: D-2 completed and processed
Input:  GET connect/inventory/allocation/{order1.Id}
Assert:
  - allocationData contains entry for oiIphone
  - instanceReservations[] has 3 entries
  - Each has serialNumber, itemInstanceType=SerializedProduct, status=Allocated
  - batchReservations is null
```

#### D-7: Mixed line items in one call
```
Input:  items: [
          {sourceItemId: oiGenerator.Id, allocations: [{locChennai, 50}]},       // standard
          {sourceItemId: oiIphone.Id, allocations: [{locHyderabad, 2, unbatchedSerializedProductIds: [spIP1, spIP2]}]}
        ]
Assert: Both line items allocated correctly in single request
```

#### D-8: allocatedQuantity > SP count
```
Input:  allocatedQuantity: 5, unbatchedSerializedProductIds: [spIP1.Id, spIP2.Id]
Assert: Error or allocatedQuantity overridden to 2
```

#### D-9: allocatedQuantity < SP count
```
Input:  allocatedQuantity: 1, unbatchedSerializedProductIds: [spIP1.Id, spIP2.Id, spIP3.Id]
Assert: Error or allocatedQuantity overridden to 3
```

#### D-10: allocatedQuantity=0 with SPs
```
Input:  allocatedQuantity: 0, unbatchedSerializedProductIds: [spIP1.Id]
Assert: Error
```

#### D-11: Empty SP array
```
Input:  unbatchedSerializedProductIds: []
Assert: Error — no SPs to allocate
```

#### D-12: Single SP (minimum valid)
```
Input:  unbatchedSerializedProductIds: [spIP1.Id]
Assert: Success — 1x ISPR, qty=1
```

#### D-13: Already-allocated SP (AllocationStatus=Allocated)
```
Data:   spIP10 (Available, AllocationStatus=Allocated)
Input:  unbatchedSerializedProductIds: [spIP10.Id]
Assert: Error — cannot double-allocate
```

#### D-14: Deallocated SP (re-allocation)
```
Data:   spIP11 (Available, AllocationStatus=Deallocated)
Input:  unbatchedSerializedProductIds: [spIP11.Id]
Assert: Success — Deallocated SPs can be re-allocated. spIP11 → Allocated
```

#### D-15: SP Status=Sent
```
Data:   spIP7 (Status=Sent)
Input:  unbatchedSerializedProductIds: [spIP7.Id]
Assert: Error — only Available can be allocated
```

#### D-16: SP Status=Consumed
```
Data:   spIP8 (Status=Consumed)
Input:  unbatchedSerializedProductIds: [spIP8.Id]
Assert: Error
```

#### D-17: SP Status=Damaged
```
Data:   spIP6 (Status=Damaged)
Input:  unbatchedSerializedProductIds: [spIP6.Id]
Assert: Error
```

#### D-18: SP Status=Lost
```
Data:   spIP9 (Status=Lost)
Input:  unbatchedSerializedProductIds: [spIP9.Id]
Assert: Error
```

#### D-19: Mix valid + invalid SPs (Damaged in mix)
```
Data:   spIP1 (Available, None), spIP6 (Damaged, None)
Input:  unbatchedSerializedProductIds: [spIP1.Id, spIP6.Id]
Assert: Partial success (spIP1 allocated, spIP6 error) OR entire request fails — document actual behavior
```

#### D-20: Mix allocated + unallocated SPs
```
Data:   spIP10 (Available, Allocated), spIP1 (Available, None)
Input:  unbatchedSerializedProductIds: [spIP10.Id, spIP1.Id]
Assert: Partial success or full failure — document actual behavior
```

#### D-21: SP at wrong location
```
Data:   spIP12 (at Chennai), sourceLocationId=locHyderabad
Input:  unbatchedSerializedProductIds: [spIP12.Id]
Assert: Error — location mismatch
```

#### D-22: SP for wrong product
```
Data:   spIP1 linked to iPhone, sourceItemId=oiGenerator (Generator product)
Input:  unbatchedSerializedProductIds: [spIP1.Id]
Assert: Error — product mismatch
```

#### D-23: SP with no ProductItem
```
Data:   Create SP with ProductItem = null
Input:  unbatchedSerializedProductIds: [orphanSP.Id]
Assert: Error — orphaned SP
```

#### D-24: Batched SP sent as unbatched
```
Data:   spCB1 (has ProductionBatch = BATCH-CB-001)
Input:  unbatchedSerializedProductIds: [spCB1.Id]
Assert: Error — SP is batched, should use batchedSerializedProductIds
```

#### D-25: SPs from different locations in one allocation
```
Data:   spIP1 (Hyderabad), spIP12 (Chennai). sourceLocationId=locHyderabad
Input:  unbatchedSerializedProductIds: [spIP1.Id, spIP12.Id]
Assert: Error for spIP12 (wrong location)
```

#### D-26: SPs from different products
```
Data:   spIP1 (iPhone), create SP for Generator. sourceItemId=oiIphone
Input:  unbatchedSerializedProductIds: [spIP1.Id, spGeneratorSP.Id]
Assert: Error for spGeneratorSP (wrong product)
```

#### D-27: Non-existent SP Id
```
Input:  unbatchedSerializedProductIds: ["a]1ZZZZZZZZZZZZ"]
Assert: Error — not found
```

#### D-28: Duplicate SP Id in array
```
Input:  unbatchedSerializedProductIds: [spIP1.Id, spIP1.Id]
Assert: Error or deduplicated to single allocation
```

#### D-29: Null in SP array
```
Input:  unbatchedSerializedProductIds: [spIP1.Id, null, spIP2.Id]
Assert: Error or null ignored
```

#### D-30: Large SP count (100+)
```
Data:   Create 100 Available unbatched SPs
Input:  unbatchedSerializedProductIds: [sp1..sp100]
Assert: Success. IIR.qty=100. 100x ISPR. Async processes all
```

#### D-31: Wrong SObject type as SP Id
```
Input:  unbatchedSerializedProductIds: [account.Id]  // Account Id
Assert: Error — wrong object type
```

#### D-32: Both unbatched + batches in same allocation
```
Input:  allocations: [{
          sourceLocationId: locBangalore.Id,
          unbatchedSerializedProductIds: [spIP1.Id],
          batches: [{batchItemId: pbiCB001Bang.Id, quantity: 1}]
        }]
Assert: Error (mutually exclusive) or both processed — document behavior
```

#### D-33: Missing sourceLocationId
```
Input:  No sourceLocationId, unbatchedSerializedProductIds: [spIP1.Id]
Assert: Error — location required
```

#### D-34: Verify PIAT created
```
Precondition: D-1 completed
Assert: ProductItemAdditionalTransaction record exists
  - ProductItem = piIphoneHyderabad
  - TransactionStatus = Pending
  - TransactionType = Allocation (or relevant enum)
  - Quantity = 1
```

#### D-35: Verify PIAT after processing
```
Precondition: Wait for MQ processing
Assert: PIAT.TransactionStatus = Success
        piIphoneHyderabad.QtyAllocated updated
```

#### D-36: QtyStateRefreshDate updated
```
Precondition: After async processing of D-1
Assert: piIphoneHyderabad.QtyStateRefreshDate is a recent timestamp (within last few minutes)
```

#### D-37: IIR status transitions
```
Step 1: Call allocation API
Assert: IIR.Status = ReservationInProgress
Step 2: Wait for async
Assert: IIR.Status = Reserved
```

#### D-38: In-app notification
```
Precondition: After D-2 processed
Assert: User receives in-app notification for completed allocation
```

#### D-39: SP AllocationStatus set synchronously
```
Step 1: Call allocation API
Step 2: Immediately query SP (before async completes)
Assert: spIP1.AllocationStatus = Allocated (set synchronously, not waiting for MQ)
```

#### D-40: Two orders race for same SP
```
Data:   spIP1 (Available, None)
Input:  order1 + order2 both send unbatchedSerializedProductIds: [spIP1.Id] simultaneously
Assert: Exactly one succeeds. Second gets error. spIP1 allocated once only.
```

#### D-41: Allocate + Deallocate same SP simultaneously
```
Data:   spIP1 currently Allocated to order1
Input:  New allocation (order2) + deallocation (order1) for spIP1 at same time
Assert: Deterministic outcome. No data corruption. One operation wins.
```

#### D-42: Rapid sequential allocations
```
Data:   10 Available unbatched SPs
Input:  10 rapid sequential API calls, one SP each
Assert: After all async: piIphoneHyderabad.QtyAllocated=10. No lost updates.
```

#### D-43: MQ lock contention
```
Data:   Trigger concurrent allocations on piIphoneHyderabad
Assert: MQ re-enqueue observed (15s delay). Max 3 retries. Fallback to manual sync.
```

---

## 4. Deallocation API Test Cases

### 4.1 Serialized Non-Batch Deallocation

```
Endpoint: POST connect/inventory/deallocation
```

#### E-1: Deallocate specific SPs
```
Precondition: spIP1, spIP2 allocated via D-2
Input:  {
          deallocationData: [{
            sourceId: order1.Id,
            items: [{
              sourceItemId: oiIphone.Id,
              deallocations: [{
                sourceLocationId: locHyderabad.Id,
                serializedProductIds: [spIP1.Id, spIP2.Id]
              }]
            }]
          }]
        }
Assert:
  - ISPR status → Cancelled
  - spIP1.AllocationStatus = Deallocated
  - spIP2.AllocationStatus = Deallocated
  - After async: piIphoneHyderabad.QtyAllocated decremented by 2
```

#### E-2: Deallocate one of multiple SPs
```
Precondition: spIP1, spIP2, spIP3 allocated
Input:  serializedProductIds: [spIP1.Id]
Assert:
  - Only spIP1 deallocated
  - spIP2, spIP3 remain Allocated
  - IIR qty decremented by 1 (or reflected in Get API)
```

#### E-3: Item-level deallocation (all SPs)
```
Precondition: spIP1, spIP2, spIP3 allocated
Input:  sourceItemId: oiIphone.Id (no serializedProductIds, no location)
Assert:
  - ALL ISPRs cancelled
  - ALL SPs → Deallocated
  - IIR → Cancelled
```

#### E-4: Location-level deallocation
```
Precondition: SPs allocated at Hyderabad
Input:  sourceItemId + sourceLocationIds: [locHyderabad.Id]
Assert: All reservations at Hyderabad cancelled
```

#### E-5: Deallocate already-deallocated SP
```
Data:   spIP11 (AllocationStatus=Deallocated)
Input:  serializedProductIds: [spIP11.Id]
Assert: Error or no-op — no active reservation to cancel
```

#### E-6: Deallocate never-allocated SP
```
Data:   spIP4 (AllocationStatus=None)
Input:  serializedProductIds: [spIP4.Id]
Assert: Error — no matching reservation
```

#### E-7: Invalid SP Id in deallocation
```
Input:  serializedProductIds: ["INVALID_ID"]
Assert: Error
```

#### E-8: QtyAllocated decrement
```
Precondition: piIphoneHyderabad.QtyAllocated=3 (from 3 SPs)
Input:  Deallocate 2 SPs
Assert: After async: QtyAllocated=1
```

#### E-9: PIAT for deallocation
```
Precondition: E-1 completed
Assert: New ProductItemAdditionalTransaction with negative quantity (decrement)
```

#### E-10: Deallocate then re-allocate
```
Step 1: Deallocate spIP1 (→ Deallocated)
Step 2: Allocate spIP1 again (new order)
Assert: spIP1 → Allocated again. New ISPR. New IIR under new order.
```

#### E-11: Mixed valid + invalid SPs
```
Data:   spIP1 (Allocated), spIP4 (None — never allocated)
Input:  serializedProductIds: [spIP1.Id, spIP4.Id]
Assert: Partial success or full failure — document behavior
```

#### E-12: Status transition timing
```
Step 1: Call deallocation API
Assert: IIR.Status = CancellationInProgress
Step 2: Wait for async
Assert: IIR.Status = Cancelled
```

### 4.2 Other Deallocation Patterns

#### E-13: Item-level (standard product)
```
Precondition: Location-level allocation for Generator at Chennai
Input:  sourceItemId: oiGenerator.Id (no location, no SPs)
Assert: All IIRs for Generator cancelled
```

#### E-14: Location-level (standard product)
```
Precondition: Multi-location allocation (Chennai + Surat)
Input:  sourceLocationIds: [locChennai.Id]
Assert: Only Chennai IIR cancelled. Surat remains.
```

#### E-15: Batch-level (non-serialized)
```
Precondition: Batch allocation for Headlight (B-2)
Input:  deallocations: [{sourceLocationId: locSurat.Id, batchItemIds: [pbiHL001Surat.Id]}]
Assert: IBIR for pbiHL001Surat cancelled. pbiHL001Surat.QtyAllocated decremented.
```

#### E-16: Batch-level (serialized)
```
Precondition: Serialized batch allocation (C-1)
Input:  deallocations: [{sourceLocationId: locBangalore.Id, batchItemIds: [pbiCB001Bang.Id], serializedProductIds: [spCB1.Id]}]
Assert: spCB1 ISPR cancelled. spCB1 → Deallocated. IBIR qty decremented.
```

#### E-17: v260 backward compatibility
```
Precondition: v260-style allocation exists
Input:  sourceLocationIds: [locChennai.Id, locSurat.Id] (flat v260 format)
Assert: Works in v262 — reservations at both locations cancelled
```

#### E-18: No org perm
```
Setup:  InventoryAllocationEnabled = false
Input:  Any deallocation payload
Assert: 403 error
```

---

## 5. Get Allocation API Test Cases

```
Endpoint: GET connect/inventory/allocation/{orderId}?pageNumber=1&pageSize=10
```

#### F-1: No allocations
```
Input:  GET /allocation/{order1.Id}
Assert: All line items have status=NOT_ALLOCATED
```

#### F-2: Fully allocated standard
```
Precondition: A-1 completed
Assert: status=FULLY_ALLOCATED, totalRequiredQuantity=98, quantityAllocationCompleted=98
```

#### F-3: Partially allocated
```
Precondition: A-2 completed
Assert: status=PARTIALLY_ALLOCATED
```

#### F-4: Serialized non-batch response
```
Precondition: D-2 completed
Assert:
  - instanceReservations[]: 3 entries with serialNumber, itemInstanceType, status
  - batchReservations: null
  - reservedQuantity: 3.0
```

#### F-5: Batched non-serialized response
```
Precondition: B-2 completed
Assert:
  - batchReservations[]: 2 entries with productionBatch, reservedQuantity
  - instanceReservations: null or []
```

#### F-6: Batched + serialized response
```
Precondition: C-1 completed
Assert:
  - batchReservations[].instanceReservations[]: nested SP details
```

#### F-7: Pagination first page
```
Data:   Order with 15 line items, all allocated
Input:  pageNumber=1, pageSize=10
Assert: 10 results. meta.hasNext=true, meta.pageSize=10
```

#### F-8: Pagination second page
```
Input:  pageNumber=2, pageSize=10
Assert: 5 results. meta.hasNext=false
```

#### F-9: Page beyond data
```
Input:  pageNumber=10, pageSize=10
Assert: Empty results array
```

#### F-10: pageSize=1
```
Input:  pageSize=1
Assert: 1 result per page
```

#### F-11: Invalid orderId
```
Input:  GET /allocation/INVALID_ID
Assert: Error response
```

#### F-12: Pending quantities
```
Precondition: Allocation made, async NOT yet complete
Assert: quantityAllocationPending > 0, quantityAllocationCompleted = 0 (or partial)
```

#### F-13: Completed quantities
```
Precondition: Allocation fully processed
Assert: quantityAllocationPending=0, quantityAllocationCompleted = total
```

#### F-14: After partial deallocation
```
Precondition: 3 SPs allocated, 1 deallocated
Assert: status may change to PARTIALLY_ALLOCATED. reservedQuantity reflects current state.
```

#### F-15: WorkOrder as source
```
Input:  GET /allocation/{workOrder1.Id}
Assert: Same response structure as Order
```

---

## 6. Cross-Cutting Tests

#### G-1: Full lifecycle
```
Step 1: Allocate spIP1, spIP2, spIP3 to order1 (3 SPs)
Step 2: GET — verify FULLY_ALLOCATED
Step 3: Deallocate spIP1
Step 4: GET — verify PARTIALLY_ALLOCATED (2 remaining)
Step 5: Allocate spIP1 to order2
Step 6: GET order1 — 2 SPs. GET order2 — 1 SP.
Assert: All state transitions correct. QtyAllocated reflects net state.
```

#### G-2: Mixed composite request
```
Input:  Single API call with 4 items:
  - Generator: location-level (Chennai, 50)
  - Headlight: batch-level (BATCH-HL-001, 30)
  - Circuit Breaker: serialized+batch (spCB1, spCB2 in BATCH-CB-001)
  - iPhone: serialized unbatched (spIP1, spIP2)
Assert: All 4 patterns processed correctly. 4 IIRs under same InventoryReservation.
```

#### G-3: Source mismatch on deallocation
```
Precondition: Allocated under order1
Input:  Deallocation with sourceId=order2.Id
Assert: Error — no matching reservation under order2
```

#### G-4: Delete Order after allocation
```
Precondition: Active allocation against order1
Input:  Delete order1
Assert: Blocked (cascade restriction) or reservations orphaned — document behavior
```

#### G-5: Delete SP after allocation
```
Precondition: spIP1 is Allocated
Input:  Delete spIP1
Assert: Blocked — cannot delete SP in Allocated state
```

#### G-6: Update ProductItem after allocation
```
Precondition: piIphoneHyderabad has active allocations
Input:  Update piIphoneHyderabad.LocationId
Assert: Blocked per design doc
```

#### G-7: SP multi-cycle transitions
```
Cycle 1: None → Allocated (allocate) → Deallocated (deallocate)
Cycle 2: Deallocated → Allocated (re-allocate) → Deallocated (deallocate)
Assert: Each transition works. No stuck states. QtyAllocated correct at each step.
```

#### G-8: Bulk volume test
```
Data:   50 orders, each with 10 line items, each with 2 SPs = 1000 SPs
Input:  Single massive API call (or 50 calls)
Assert: All processed. Final QtyAllocated counts correct.
```

#### G-9: Response time under load
```
Input:  100 concurrent allocation requests
Assert: API latency acceptable. MQ processes within reasonable time.
```

#### G-10: No orphaned records on failure
```
Setup:  Force a mid-processing failure
Assert: No IIR/ISPR stuck in ReservationInProgress permanently.
        Transaction logs show failure status.
```

---

## 7. API Endpoints Reference

### Allocation
```
POST /services/data/vXX.0/connect/inventory/allocation

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Body: {
  "allocationData": [
    {
      "sourceId": "{OrderId | WorkOrderId | ReturnOrderId}",
      "items": [
        {
          "sourceItemId": "{OrderItemId | WorkOrderLineItemId | ReturnOrderLineItemId}",
          "allocations": [
            {
              "sourceLocationId": "{LocationId}",
              "allocatedQuantity": {Number},                        // optional if SPs provided
              "batches": [                                          // optional — for batch allocation
                {
                  "batchItemId": "{ProductBatchItemId}",            // or "batchId": "{ProductionBatchId}"
                  "quantity": {Number},
                  "batchedSerializedProductIds": ["{SPId}", ...]    // optional — for serialized+batch
                }
              ],
              "unbatchedSerializedProductIds": ["{SPId}", ...],     // optional — for serialized non-batch
              "deallocationLocationIds": ["{LocationId}", ...]      // optional — deallocate at these locations
            }
          ]
        }
      ]
    }
  ]
}
```

### Deallocation
```
POST /services/data/vXX.0/connect/inventory/deallocation

Body: {
  "deallocationData": [
    {
      "sourceId": "{OrderId | WorkOrderId | ReturnOrderId}",
      "items": [
        {
          "sourceItemId": "{OrderItemId}",
          // v260 format (backward compatible):
          "sourceLocationIds": ["{LocationId}", ...],
          // v262 format (granular):
          "deallocations": [
            {
              "sourceLocationId": "{LocationId}",
              "batchItemIds": ["{ProductBatchItemId}", ...],
              "serializedProductIds": ["{SerializedProductId}", ...]
            }
          ]
        }
      ]
    }
  ]
}
```

### Get Allocation
```
GET /services/data/vXX.0/connect/inventory/allocation/{orderId}?pageNumber={N}&pageSize={N}

Response: {
  "allocationData": [
    {
      "lineItemId": "{OrderItemId}",
      "status": "NOT_ALLOCATED | PARTIALLY_ALLOCATED | FULLY_ALLOCATED",
      "totalRequiredQuantity": {Number},
      "totalRequestedAllocationQty": {Number},
      "quantityAllocationPending": {Number},
      "quantityAllocationCompleted": {Number},
      "requestedAllocations": [
        {"locationId": "...", "quantity": N, "serialNumbers": []}
      ],
      "allocations": [
        {
          "locationId": "...",
          "locationName": "...",
          "reservedQuantity": N,
          "availableQuantity": N,
          "batchReservations": [
            {
              "batchReservationId": "...",
              "productionBatch": "BATCH-001",
              "reservedQuantity": N,
              "status": "Allocated",
              "instanceReservations": [
                {
                  "instanceReservationId": "...",
                  "itemInstanceId": "...",
                  "itemInstanceType": "SerializedProduct",
                  "serialNumber": "SN-12345",
                  "status": "Allocated"
                }
              ]
            }
          ],
          "instanceReservations": [
            {
              "instanceReservationId": "...",
              "itemInstanceId": "...",
              "itemInstanceType": "SerializedProduct",
              "serialNumber": "SN-12345",
              "status": "Allocated"
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "pageNumber": 1,
    "pageSize": 10,
    "hasNext": true
  }
}
```

---

## Test Case Summary

| Category | P0 | P1 | P2 | Total |
|----------|----|----|-----|-------|
| Location-level allocation (A-1 to A-27) | 8 | 7 | 8 | 23 |
| Batch-level allocation (B-1 to B-8) | 3 | 2 | 3 | 8 |
| Serialized-batch allocation (C-1 to C-7) | 2 | 3 | 2 | 7 |
| Serialized non-batch allocation (D-1 to D-43) | 12 | 16 | 14 | 42 |
| Deallocation (E-1 to E-18) | 8 | 6 | 1 | 15 |
| Get Allocation (F-1 to F-15) | 6 | 4 | 3 | 13 |
| Cross-cutting (G-1 to G-10) | 2 | 4 | 5 | 11 |
| **Total** | **41** | **42** | **36** | **119** |
