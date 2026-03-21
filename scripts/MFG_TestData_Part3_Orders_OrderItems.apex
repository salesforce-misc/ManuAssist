/**
 * MFG_TestData_Part3_Orders_OrderItems.apex
 *
 * Creates realistic Manufacturing Cloud Orders and OrderItems covering
 * all 25 test scenarios for Inventory Allocation APIs.
 *
 * !! PREREQUISITE: Run Part 1 & Part 2 first, then REPLACE the IDs below !!
 *
 * Scenarios Covered:
 *   S1  - S9  : Happy Path Allocation
 *   E1  - E7  : Edge Cases / Negative Tests
 *   D1  - D7  : Deallocation Scenarios
 *   G1  - G7  : Get Allocation API
 *   P1  - P4  : Process Additional Transaction API
 *
 * Execute:
 *   sf apex run --file MFG_TestData_Part3_Orders_OrderItems.apex --target-org mfg@sdb38.org
 */

// ─────────────────────────────────────────────────────────────────────────────
// !! PASTE IDs from Part 1 output below !!
// ─────────────────────────────────────────────────────────────────────────────
Id pHydPumpId       = 'REPLACE_WITH_pHydPump.Id';
Id pHydFluidId      = 'REPLACE_WITH_pHydFluid.Id';
Id pServoMotorId    = 'REPLACE_WITH_pServoMotor.Id';
Id pPLCUnitId       = 'REPLACE_WITH_pPLCUnit.Id';
Id pPressureValveId = 'REPLACE_WITH_pPressureValve.Id';
Id pBearingId       = 'REPLACE_WITH_pBearing.Id';

Id locPuneId        = 'REPLACE_WITH_locPune.Id';
Id locChennaiId     = 'REPLACE_WITH_locChennai.Id';
Id locBangaloreId   = 'REPLACE_WITH_locBangalore.Id';
Id locMumbaiId      = 'REPLACE_WITH_locMumbai.Id';
Id locHyderabadId   = 'REPLACE_WITH_locHyderabad.Id';

// ProductItem IDs (for Process Additional Transaction P1/P2 reference)
Id piPumpPuneId     = 'REPLACE_WITH_piPumpPune.Id';
Id piFluidPuneId    = 'REPLACE_WITH_piFluidPune.Id';
Id piMotorBLRId     = 'REPLACE_WITH_piMotorBangalore.Id';

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT
// Using existing "Acme" account (customer: Acme Engineering Pvt. Ltd.)
// ─────────────────────────────────────────────────────────────────────────────
Id acctId = [SELECT Id FROM Account WHERE Name = 'Acme' LIMIT 1].Id;

// ─────────────────────────────────────────────────────────────────────────────
// PRICEBOOK — Standard Pricebook
// ─────────────────────────────────────────────────────────────────────────────
Id pbId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id;

// Build PricebookEntry map (create if missing)
List<Id> allProdIds = new List<Id>{
    pHydPumpId, pHydFluidId, pServoMotorId, pPLCUnitId, pPressureValveId, pBearingId
};
Map<Id,Id> prodToPbe = new Map<Id,Id>();
for (PricebookEntry pbe : [
    SELECT Id, Product2Id FROM PricebookEntry
    WHERE Pricebook2Id = :pbId AND Product2Id IN :allProdIds AND IsActive = true
]) {
    prodToPbe.put(pbe.Product2Id, pbe.Id);
}
List<PricebookEntry> newPbes = new List<PricebookEntry>();
for (Id pid : allProdIds) {
    if (!prodToPbe.containsKey(pid)) {
        PricebookEntry pbe = new PricebookEntry();
        pbe.Pricebook2Id = pbId;
        pbe.Product2Id   = pid;
        pbe.UnitPrice    = 1.0;
        pbe.IsActive     = true;
        newPbes.add(pbe);
    }
}
if (!newPbes.isEmpty()) {
    insert newPbes;
    for (PricebookEntry pbe : newPbes) prodToPbe.put(pbe.Product2Id, pbe.Id);
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// Naming: <CustomerCode>-SO-<YYYY>-<NNNN> (realistic sales order references)
// ─────────────────────────────────────────────────────────────────────────────

// Happy Path order — standard B2B customer order from Acme Engineering
Order ordHappyPath = new Order();
ordHappyPath.Name         = 'ACME-SO-2025-0047';
ordHappyPath.AccountId    = acctId;
ordHappyPath.Status       = 'Draft';
ordHappyPath.EffectiveDate = Date.today();
ordHappyPath.Pricebook2Id = pbId;
ordHappyPath.Description  = 'Happy Path: S1–S9 allocation scenarios';

// Edge Cases order — internal test order for boundary condition validation
Order ordEdgeCases = new Order();
ordEdgeCases.Name         = 'ACME-SO-2025-0048';
ordEdgeCases.AccountId    = acctId;
ordEdgeCases.Status       = 'Draft';
ordEdgeCases.EffectiveDate = Date.today();
ordEdgeCases.Pricebook2Id = pbId;
ordEdgeCases.Description  = 'Edge Cases: E1–E7 negative/boundary test scenarios';

// Deallocation order — pre-allocated order to test all deallocation patterns
Order ordDeallocation = new Order();
ordDeallocation.Name         = 'ACME-SO-2025-0049';
ordDeallocation.AccountId    = acctId;
ordDeallocation.Status       = 'Draft';
ordDeallocation.EffectiveDate = Date.today();
ordDeallocation.Pricebook2Id = pbId;
ordDeallocation.Description  = 'Deallocation: D1–D7 + G1–G6 get allocation status scenarios';

// Pagination order — large order with many line items to test paginated GET response
Order ordPagination = new Order();
ordPagination.Name         = 'ACME-SO-2025-0050';
ordPagination.AccountId    = acctId;
ordPagination.Status       = 'Draft';
ordPagination.EffectiveDate = Date.today();
ordPagination.Pricebook2Id = pbId;
ordPagination.Description  = 'Pagination: G7 — 12 line items for multi-page GET response';

insert new List<Order>{ ordHappyPath, ordEdgeCases, ordDeallocation, ordPagination };

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('Orders Created');
System.debug('══════════════════════════════════════════════════════');
System.debug('ordHappyPath   (ACME-SO-2025-0047) = ' + ordHappyPath.Id);
System.debug('ordEdgeCases   (ACME-SO-2025-0048) = ' + ordEdgeCases.Id);
System.debug('ordDeallocation(ACME-SO-2025-0049) = ' + ordDeallocation.Id);
System.debug('ordPagination  (ACME-SO-2025-0050) = ' + ordPagination.Id);

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ITEMS — HAPPY PATH (ordHappyPath)
// ─────────────────────────────────────────────────────────────────────────────
List<OrderItem> allItems = new List<OrderItem>();

// S1 — Location-level, single location
// Allocate 40 Hydraulic Pumps from Pune (QOH=150)
OrderItem oiS1 = new OrderItem();
oiS1.OrderId          = ordHappyPath.Id;
oiS1.Product2Id       = pHydPumpId;
oiS1.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiS1.Quantity         = 40;
oiS1.UnitPrice        = 18500.00;
oiS1.Description      = 'S1: Single-location allocation | 40 units from Pune';

// S2 — Location-level, multi-location
// Allocate 120 Hydraulic Pumps split across Pune(80) + Chennai(40)
OrderItem oiS2 = new OrderItem();
oiS2.OrderId          = ordHappyPath.Id;
oiS2.Product2Id       = pHydPumpId;
oiS2.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiS2.Quantity         = 120;
oiS2.UnitPrice        = 18500.00;
oiS2.Description      = 'S2: Multi-location allocation | 80 from Pune + 40 from Chennai';

// S3 — Batch-level, single batch (Non-serialized)
// Allocate 60 drums of Hydraulic Fluid from Pune, Batch LOT-2025-Q1-001
OrderItem oiS3 = new OrderItem();
oiS3.OrderId          = ordHappyPath.Id;
oiS3.Product2Id       = pHydFluidId;
oiS3.PricebookEntryId = prodToPbe.get(pHydFluidId);
oiS3.Quantity         = 60;
oiS3.UnitPrice        = 4200.00;
oiS3.Description      = 'S3: Batch single allocation | 60 drums LOT-2025-Q1-001 from Pune';

// S4 — Batch-level, multiple batches (Non-serialized)
// Allocate 150 drums from Pune: LOT-Q1-001(80) + LOT-Q1-002(70)
OrderItem oiS4 = new OrderItem();
oiS4.OrderId          = ordHappyPath.Id;
oiS4.Product2Id       = pHydFluidId;
oiS4.PricebookEntryId = prodToPbe.get(pHydFluidId);
oiS4.Quantity         = 150;
oiS4.UnitPrice        = 4200.00;
oiS4.Description      = 'S4: Batch multi allocation | LOT-Q1-001(80) + LOT-Q1-002(70) from Pune';

// S5 — Serialized, Non-batched
// Allocate 3 Servo Motors from Bangalore by serial numbers
OrderItem oiS5 = new OrderItem();
oiS5.OrderId          = ordHappyPath.Id;
oiS5.Product2Id       = pServoMotorId;
oiS5.PricebookEntryId = prodToPbe.get(pServoMotorId);
oiS5.Quantity         = 3;
oiS5.UnitPrice        = 95000.00;
oiS5.Description      = 'S5: Serialized non-batched | SM-BLR-2025-00101/102/103 from Bangalore';

// S6 — Serialized + Batched (using batchItemId)
// Allocate 2 PLC Units from Pune, LOT-A, by batchItemId + serial numbers
OrderItem oiS6 = new OrderItem();
oiS6.OrderId          = ordHappyPath.Id;
oiS6.Product2Id       = pPLCUnitId;
oiS6.PricebookEntryId = prodToPbe.get(pPLCUnitId);
oiS6.Quantity         = 2;
oiS6.UnitPrice        = 145000.00;
oiS6.Description      = 'S6: Serialized batched via batchItemId | PLC-PNE-2025-LTA-001/002 from Pune';

// S7 — Serialized + Batched (using batchId — system derives batchItemId)
// Allocate 3 PLC Units from Pune, LOT-B, by batchId
OrderItem oiS7 = new OrderItem();
oiS7.OrderId          = ordHappyPath.Id;
oiS7.Product2Id       = pPLCUnitId;
oiS7.PricebookEntryId = prodToPbe.get(pPLCUnitId);
oiS7.Quantity         = 3;
oiS7.UnitPrice        = 145000.00;
oiS7.Description      = 'S7: Serialized batched via batchId | PLC-PNE-2025-LTB-001/002/003 from Pune';

// S8 — Mixed allocation: all 4 patterns in single API request
// - Hydraulic Pump (standard, location-level, Pune)
// - Hydraulic Fluid (batched non-serial, Pune)
// - Servo Motor (serialized non-batch, Bangalore)
// - PLC Unit (serialized + batch, Pune)
OrderItem oiS8 = new OrderItem();
oiS8.OrderId          = ordHappyPath.Id;
oiS8.Product2Id       = pPressureValveId;
oiS8.PricebookEntryId = prodToPbe.get(pPressureValveId);
oiS8.Quantity         = 10;
oiS8.UnitPrice        = 8750.00;
oiS8.Description      = 'S8: Mixed multi-pattern in single API call | Valve + Serial from Bangalore';

// S9 — Inline deallocation within allocation request (deallocationLocationIds)
// Move allocation from Pune to Chennai for same line item
OrderItem oiS9 = new OrderItem();
oiS9.OrderId          = ordHappyPath.Id;
oiS9.Product2Id       = pHydPumpId;
oiS9.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiS9.Quantity         = 20;
oiS9.UnitPrice        = 18500.00;
oiS9.Description      = 'S9: Inline dealloc — deallocate Pune + allocate Chennai in same call';

allItems.addAll(new List<OrderItem>{
    oiS1, oiS2, oiS3, oiS4, oiS5, oiS6, oiS7, oiS8, oiS9
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ITEMS — EDGE CASES (ordEdgeCases)
// ─────────────────────────────────────────────────────────────────────────────

// E1 — Over-allocation: request 25 units from Hyderabad (only 8 available)
OrderItem oiE1 = new OrderItem();
oiE1.OrderId          = ordEdgeCases.Id;
oiE1.Product2Id       = pHydPumpId;
oiE1.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiE1.Quantity         = 25;
oiE1.UnitPrice        = 18500.00;
oiE1.Description      = 'E1: Over-allocation | Request 25 from Hyderabad (piPumpHyderabad, QOH=8) → EXPECT ERROR';

// E2 — Re-allocate already-allocated serialized product
// Allocate SM-BLR-2025-00107 to one order, then try allocating same serial to this order
OrderItem oiE2 = new OrderItem();
oiE2.OrderId          = ordEdgeCases.Id;
oiE2.Product2Id       = pServoMotorId;
oiE2.PricebookEntryId = prodToPbe.get(pServoMotorId);
oiE2.Quantity         = 1;
oiE2.UnitPrice        = 95000.00;
oiE2.Description      = 'E2: Already-allocated serial | Use SM-BLR-2025-00107 after it is already allocated → EXPECT ERROR';

// E3 — Serialized product in Consumed status
OrderItem oiE3 = new OrderItem();
oiE3.OrderId          = ordEdgeCases.Id;
oiE3.Product2Id       = pServoMotorId;
oiE3.PricebookEntryId = prodToPbe.get(pServoMotorId);
oiE3.Quantity         = 1;
oiE3.UnitPrice        = 95000.00;
oiE3.Description      = 'E3: Consumed SP | Use SM-BLR-2025-00108 (Status=Consumed) → EXPECT ERROR';

// E4 — BatchItem from wrong location
// Use a PBI from Chennai location but supply Pune as sourceLocationId in API
OrderItem oiE4 = new OrderItem();
oiE4.OrderId          = ordEdgeCases.Id;
oiE4.Product2Id       = pHydFluidId;
oiE4.PricebookEntryId = prodToPbe.get(pHydFluidId);
oiE4.Quantity         = 10;
oiE4.UnitPrice        = 4200.00;
oiE4.Description      = 'E4: Wrong-location batchItem | Use piFluidChennai BatchItem but sourceLocationId=Pune → EXPECT ERROR';

// E5 — Zero quantity
OrderItem oiE5 = new OrderItem();
oiE5.OrderId          = ordEdgeCases.Id;
oiE5.Product2Id       = pHydPumpId;
oiE5.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiE5.Quantity         = 1;  // Minimum 1 required by Salesforce; send 0 in API payload
oiE5.UnitPrice        = 18500.00;
oiE5.Description      = 'E5: Zero quantity | Send allocatedQuantity=0 in payload → EXPECT ERROR';

// E6 — Invalid sourceId (non-existent Order ID — supply in API payload directly)
// No OrderItem needed; use fake ID: 801000000000000AAA
// E7 — Invalid sourceItemId (non-existent OrderItem ID — supply in API payload directly)
// No OrderItem needed; use fake ID: 802000000000000AAA

allItems.addAll(new List<OrderItem>{ oiE1, oiE2, oiE3, oiE4, oiE5 });

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ITEMS — DEALLOCATION + GET ALLOCATION (ordDeallocation)
// ─────────────────────────────────────────────────────────────────────────────

// D1 — Full item-level deallocation (allocate first, then deallocate by sourceItemId only)
OrderItem oiD1 = new OrderItem();
oiD1.OrderId          = ordDeallocation.Id;
oiD1.Product2Id       = pHydPumpId;
oiD1.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiD1.Quantity         = 50;
oiD1.UnitPrice        = 18500.00;
oiD1.Description      = 'D1: Full item-level dealloc | Allocate Pune+Chennai, then deallocate all';

// D2 — Location-level deallocation (v260 format: sourceLocationIds array)
OrderItem oiD2 = new OrderItem();
oiD2.OrderId          = ordDeallocation.Id;
oiD2.Product2Id       = pHydPumpId;
oiD2.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiD2.Quantity         = 30;
oiD2.UnitPrice        = 18500.00;
oiD2.Description      = 'D2: Location-level dealloc v260 | Allocate Pune+Chennai, dealloc Chennai only (sourceLocationIds)';

// D3 — Location-level deallocation (v262 format: deallocations array)
OrderItem oiD3 = new OrderItem();
oiD3.OrderId          = ordDeallocation.Id;
oiD3.Product2Id       = pHydPumpId;
oiD3.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiD3.Quantity         = 25;
oiD3.UnitPrice        = 18500.00;
oiD3.Description      = 'D3: Location-level dealloc v262 | Use deallocations[{sourceLocationId}] format';

// D4 — Batch non-serialized deallocation
OrderItem oiD4 = new OrderItem();
oiD4.OrderId          = ordDeallocation.Id;
oiD4.Product2Id       = pHydFluidId;
oiD4.PricebookEntryId = prodToPbe.get(pHydFluidId);
oiD4.Quantity         = 80;
oiD4.UnitPrice        = 4200.00;
oiD4.Description      = 'D4: Batch non-serial dealloc | Allocate LOT-Q1-001 at Pune, then deallocate by batchItemIds';

// D5 — Batch + serialized deallocation
OrderItem oiD5 = new OrderItem();
oiD5.OrderId          = ordDeallocation.Id;
oiD5.Product2Id       = pPLCUnitId;
oiD5.PricebookEntryId = prodToPbe.get(pPLCUnitId);
oiD5.Quantity         = 2;
oiD5.UnitPrice        = 145000.00;
oiD5.Description      = 'D5: Batch+serial dealloc | Allocate LTA-001/002, then dealloc by batchItemIds+serializedProductIds';

// D6 — Serialized non-batched deallocation
OrderItem oiD6 = new OrderItem();
oiD6.OrderId          = ordDeallocation.Id;
oiD6.Product2Id       = pServoMotorId;
oiD6.PricebookEntryId = prodToPbe.get(pServoMotorId);
oiD6.Quantity         = 2;
oiD6.UnitPrice        = 95000.00;
oiD6.Description      = 'D6: Serial non-batch dealloc | Allocate SM-BLR-001/002, then dealloc by serializedProductIds';

// D7 — Mixed deallocation (all patterns in one request)
OrderItem oiD7 = new OrderItem();
oiD7.OrderId          = ordDeallocation.Id;
oiD7.Product2Id       = pPressureValveId;
oiD7.PricebookEntryId = prodToPbe.get(pPressureValveId);
oiD7.Quantity         = 8;
oiD7.UnitPrice        = 8750.00;
oiD7.Description      = 'D7: Mixed dealloc | Item-level + location + serial in single deallocation payload';

// G2 — GET: PARTIALLY_ALLOCATED status
// Allocate 30 of 100 required before calling GET
OrderItem oiG2 = new OrderItem();
oiG2.OrderId          = ordDeallocation.Id;
oiG2.Product2Id       = pHydPumpId;
oiG2.PricebookEntryId = prodToPbe.get(pHydPumpId);
oiG2.Quantity         = 100;
oiG2.UnitPrice        = 18500.00;
oiG2.Description      = 'G2: GET PARTIALLY_ALLOCATED | Allocate 30 of 100 → status=PARTIALLY_ALLOCATED';

// G3 — GET: FULLY_ALLOCATED status
OrderItem oiG3 = new OrderItem();
oiG3.OrderId          = ordDeallocation.Id;
oiG3.Product2Id       = pBearingId;
oiG3.PricebookEntryId = prodToPbe.get(pBearingId);
oiG3.Quantity         = 200;
oiG3.UnitPrice        = 145.00;
oiG3.Description      = 'G3: GET FULLY_ALLOCATED | Allocate all 200 → status=FULLY_ALLOCATED';

// G5 — GET with batchReservations in response
OrderItem oiG5 = new OrderItem();
oiG5.OrderId          = ordDeallocation.Id;
oiG5.Product2Id       = pHydFluidId;
oiG5.PricebookEntryId = prodToPbe.get(pHydFluidId);
oiG5.Quantity         = 50;
oiG5.UnitPrice        = 4200.00;
oiG5.Description      = 'G5: GET with batchReservations | Allocate by batch, verify batchReservations in response';

// G6 — GET with instanceReservations in response
OrderItem oiG6 = new OrderItem();
oiG6.OrderId          = ordDeallocation.Id;
oiG6.Product2Id       = pServoMotorId;
oiG6.PricebookEntryId = prodToPbe.get(pServoMotorId);
oiG6.Quantity         = 2;
oiG6.UnitPrice        = 95000.00;
oiG6.Description      = 'G6: GET with instanceReservations | Allocate serials, verify instanceReservations in response';

allItems.addAll(new List<OrderItem>{
    oiD1, oiD2, oiD3, oiD4, oiD5, oiD6, oiD7, oiG2, oiG3, oiG5, oiG6
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ITEMS — PAGINATION (ordPagination)
// 12 line items of Ball Bearings to test multi-page GET (page size = 5 → 3 pages)
// ─────────────────────────────────────────────────────────────────────────────
Integer[] bearingQtys = new Integer[]{
    500, 450, 400, 350, 300, 250, 200, 150, 100, 75, 50, 25
};
String[] lineRefs = new String[]{
    'LINE-01','LINE-02','LINE-03','LINE-04','LINE-05','LINE-06',
    'LINE-07','LINE-08','LINE-09','LINE-10','LINE-11','LINE-12'
};
for (Integer i = 0; i < 12; i++) {
    OrderItem oiPag = new OrderItem();
    oiPag.OrderId          = ordPagination.Id;
    oiPag.Product2Id       = pBearingId;
    oiPag.PricebookEntryId = prodToPbe.get(pBearingId);
    oiPag.Quantity         = bearingQtys[i];
    oiPag.UnitPrice        = 145.00;
    oiPag.Description      = 'G7: Pagination ' + lineRefs[i] + ' | Bearing qty=' + bearingQtys[i];
    allItems.add(oiPag);
}

insert allItems;

// ─────────────────────────────────────────────────────────────────────────────
// FINAL SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
System.debug('');
System.debug('══════════════════════════════════════════════════════════════════');
System.debug('PART 3 COMPLETE — Test Data Reference Card');
System.debug('══════════════════════════════════════════════════════════════════');

System.debug('');
System.debug('ORDERS (use as sourceId in API payloads):');
System.debug('  ordHappyPath    (S1–S9)  = ' + ordHappyPath.Id    + '  [ACME-SO-2025-0047]');
System.debug('  ordEdgeCases    (E1–E7)  = ' + ordEdgeCases.Id    + '  [ACME-SO-2025-0048]');
System.debug('  ordDeallocation (D1–G6)  = ' + ordDeallocation.Id + '  [ACME-SO-2025-0049]');
System.debug('  ordPagination   (G7)     = ' + ordPagination.Id   + '  [ACME-SO-2025-0050]');
System.debug('  INVALID ORDER (E6)       = 801000000000000AAA   [non-existent]');

System.debug('');
System.debug('ORDER ITEMS — Happy Path (sourceItemId in API):');
System.debug('  oiS1 = ' + oiS1.Id + '  S1: Single-location | 40 Pumps from Pune');
System.debug('  oiS2 = ' + oiS2.Id + '  S2: Multi-location  | 120 Pumps Pune(80)+Chennai(40)');
System.debug('  oiS3 = ' + oiS3.Id + '  S3: Single batch    | 60 Fluid drums LOT-Q1-001 Pune');
System.debug('  oiS4 = ' + oiS4.Id + '  S4: Multi batch     | 150 Fluid LOT-Q1-001(80)+LOT-Q1-002(70)');
System.debug('  oiS5 = ' + oiS5.Id + '  S5: Serial non-batch| 3 Motors SM-BLR-00101/102/103 Bangalore');
System.debug('  oiS6 = ' + oiS6.Id + '  S6: Serial + batch  | 2 PLCs LTA-001/002 via batchItemId Pune');
System.debug('  oiS7 = ' + oiS7.Id + '  S7: Serial + batch  | 3 PLCs LTB-001/002/003 via batchId Pune');
System.debug('  oiS8 = ' + oiS8.Id + '  S8: Mixed patterns  | Valve std+serial Bangalore');
System.debug('  oiS9 = ' + oiS9.Id + '  S9: Inline dealloc  | Dealloc Pune + alloc Chennai same call');

System.debug('');
System.debug('ORDER ITEMS — Edge Cases:');
System.debug('  oiE1 = ' + oiE1.Id + '  E1: Over-alloc      | 25 Pumps from Hyderabad (QOH=8) → ERROR');
System.debug('  oiE2 = ' + oiE2.Id + '  E2: Already-alloc   | SM-BLR-2025-00107 (alloc twice) → ERROR');
System.debug('  oiE3 = ' + oiE3.Id + '  E3: Consumed SP     | SM-BLR-2025-00108 (Consumed) → ERROR');
System.debug('  oiE4 = ' + oiE4.Id + '  E4: Wrong-loc batch | Chennai PBI + Pune sourceLocationId → ERROR');
System.debug('  oiE5 = ' + oiE5.Id + '  E5: Zero quantity   | allocatedQuantity=0 in payload → ERROR');
System.debug('  E6   = n/a (use sourceId=801000000000000AAA in payload → ERROR)');
System.debug('  E7   = n/a (use sourceItemId=802000000000000AAA in payload → ERROR)');

System.debug('');
System.debug('ORDER ITEMS — Deallocation:');
System.debug('  oiD1 = ' + oiD1.Id + '  D1: Full item-level dealloc');
System.debug('  oiD2 = ' + oiD2.Id + '  D2: Location-level dealloc (v260 sourceLocationIds)');
System.debug('  oiD3 = ' + oiD3.Id + '  D3: Location-level dealloc (v262 deallocations)');
System.debug('  oiD4 = ' + oiD4.Id + '  D4: Batch non-serial dealloc');
System.debug('  oiD5 = ' + oiD5.Id + '  D5: Batch+serial dealloc');
System.debug('  oiD6 = ' + oiD6.Id + '  D6: Serial non-batch dealloc');
System.debug('  oiD7 = ' + oiD7.Id + '  D7: Mixed dealloc');

System.debug('');
System.debug('ORDER ITEMS — Get Allocation:');
System.debug('  G1 = query ordDeallocation BEFORE any allocation → NOT_ALLOCATED');
System.debug('  oiG2 = ' + oiG2.Id + '  G2: Allocate 30 of 100 → PARTIALLY_ALLOCATED');
System.debug('  oiG3 = ' + oiG3.Id + '  G3: Allocate all 200 → FULLY_ALLOCATED');
System.debug('  G4 = check quantityAllocationPending after POST (before MQ processes)');
System.debug('  oiG5 = ' + oiG5.Id + '  G5: Batch alloc → verify batchReservations in response');
System.debug('  oiG6 = ' + oiG6.Id + '  G6: Serial alloc → verify instanceReservations in response');
System.debug('  G7 = GET ordPagination?pageNumber=1&pageSize=5 → 12 items / 3 pages');
System.debug('  E11 = use orderId=801000000000000AAA → ERROR');

System.debug('');
System.debug('PROCESS ADDITIONAL TRANSACTION API:');
System.debug('  P1: Valid IDs    → productItemIds=[' + piPumpPuneId + ',' + piFluidPuneId + ']');
System.debug('  P2: Partial      → productItemIds=[' + piPumpPuneId + ',0Co000000000000AAA]');
System.debug('  P3: Empty array  → productItemIds=[]');
System.debug('  P4: All invalid  → productItemIds=[0Co000000000000AAA,0Co111111111111AAA]');

System.debug('');
System.debug('LOCATION IDs (for sourceLocationId in payloads):');
System.debug('  Pune       = ' + locPuneId);
System.debug('  Chennai    = ' + locChennaiId);
System.debug('  Bangalore  = ' + locBangaloreId);
System.debug('  Mumbai     = ' + locMumbaiId);
System.debug('  Hyderabad  = ' + locHyderabadId + '  ← low-stock (E1)');
