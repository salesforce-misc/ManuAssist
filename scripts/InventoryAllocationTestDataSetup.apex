/**
 * InventoryAllocationTestDataSetup
 *
 * Anonymous Apex script to create comprehensive test data in sdb38mfg org
 * for testing all Inventory Allocation API scenarios (v260 + v262).
 *
 * Run via: sf apex run --file InventoryAllocationTestDataSetup.apex --target-org mfg@sdb38.org
 *
 * After running, copy the printed IDs into your API payloads.
 *
 * SCENARIOS COVERED:
 * ─────────────────────────────────────────────────
 * ALLOCATION API
 *   S1.  Happy path - location-level, single location
 *   S2.  Happy path - location-level, multi-location
 *   S3.  Batch allocation - single batch
 *   S4.  Batch allocation - multiple batches
 *   S5.  Serialized non-batched allocation
 *   S6.  Serialized batched allocation (using batchItemId)
 *   S7.  Serialized batched allocation (using batchId - derived)
 *   S8.  Mixed allocation - all types in single request
 *   S9.  Inline deallocation within allocation request (deallocationLocationIds)
 *   E1.  Edge - allocate quantity > available (ProductItem.QuantityOnHand insufficient)
 *   E2.  Edge - serialized product already Allocated
 *   E3.  Edge - serialized product in non-Available status (e.g. Consumed)
 *   E4.  Edge - batchItemId does not belong to the ProductItem's location
 *   E5.  Edge - allocate zero quantity
 *   E6.  Edge - invalid sourceId (non-existent Order)
 *   E7.  Edge - invalid sourceItemId (non-existent OrderItem)
 * ─────────────────────────────────────────────────
 * DEALLOCATION API
 *   D1.  Item-level deallocation (full dealloc across all locations)
 *   D2.  Location-level deallocation (v260 format - sourceLocationIds)
 *   D3.  Location-level deallocation (v262 format - deallocations array)
 *   D4.  Batch-level non-serialized deallocation
 *   D5.  Batch-level serialized deallocation
 *   D6.  Serialized non-batched deallocation
 *   D7.  Mixed deallocation in single request
 *   E8.  Edge - deallocate already-cancelled reservation
 *   E9.  Edge - deallocate non-existent sourceItemId
 *   E10. Edge - partial deallocation (only some locations)
 * ─────────────────────────────────────────────────
 * GET ALLOCATION API
 *   G1.  Status = NOT_ALLOCATED (no reservations created)
 *   G2.  Status = PARTIALLY_ALLOCATED (some qty allocated)
 *   G3.  Status = FULLY_ALLOCATED
 *   G4.  With pending transactions (before MQ processes)
 *   G5.  With batchReservations in response
 *   G6.  With instanceReservations in response
 *   G7.  Pagination (order with many line items)
 *   E11. Edge - invalid orderId
 * ─────────────────────────────────────────────────
 * PROCESS ADDITIONAL TRANSACTION API
 *   P1.  Valid ProductItemIds - success
 *   P2.  Partial success - mix of valid and invalid IDs
 *   P3.  Empty productItemIds array - validation error
 *   P4.  All invalid ProductItemIds - failure
 * ─────────────────────────────────────────────────
 */

// ============================================================
// UTILITY
// ============================================================
String DIV = '═══════════════════════════════════════════════════';

// ============================================================
// STEP 1: PRODUCTS
// ============================================================
System.debug(DIV);
System.debug('STEP 1: Creating Products...');

// Standard product (non-batched, non-serialized) - for S1, S2, E1, E5
Product2 pStandard = new Product2(
    Name = 'TEST_Generator_Standard',
    IsActive = true,
    Description = 'Standard product - non-batched, non-serialized (S1,S2,E1,E5)'
);

// Batched product (non-serialized) - for S3, S4, D4
Product2 pBatched = new Product2(
    Name = 'TEST_Motor_Batched',
    IsActive = true,
    Description = 'Batched product - non-serialized (S3,S4,D4)'
);

// Serialized non-batched product - for S5, D6
Product2 pSerializedNonBatch = new Product2(
    Name = 'TEST_iPhone_SerializedNonBatch',
    IsActive = true,
    Description = 'Serialized non-batched (S5,D6,E2,E3)'
);

// Serialized batched product - for S6, S7, D5
Product2 pSerializedBatched = new Product2(
    Name = 'TEST_CircuitBoard_SerializedBatch',
    IsActive = true,
    Description = 'Serialized batched (S6,S7,D5)'
);

// Mixed product (for S8, S9)
Product2 pMixed = new Product2(
    Name = 'TEST_Battery_Mixed',
    IsActive = true,
    Description = 'Mixed scenario product (S8,S9,D7)'
);

// Pagination product (many line items for G7)
Product2 pPagination = new Product2(
    Name = 'TEST_Bolt_Pagination',
    IsActive = true,
    Description = 'Pagination test product (G7)'
);

insert new List<Product2>{ pStandard, pBatched, pSerializedNonBatch, pSerializedBatched, pMixed, pPagination };
System.debug('Products created:');
System.debug('  pStandard (Generator)       = ' + pStandard.Id);
System.debug('  pBatched (Motor)             = ' + pBatched.Id);
System.debug('  pSerializedNonBatch (iPhone) = ' + pSerializedNonBatch.Id);
System.debug('  pSerializedBatched (Circuit) = ' + pSerializedBatched.Id);
System.debug('  pMixed (Battery)             = ' + pMixed.Id);
System.debug('  pPagination (Bolt)           = ' + pPagination.Id);

// ============================================================
// STEP 2: LOCATIONS
// ============================================================
System.debug(DIV);
System.debug('STEP 2: Creating Locations...');

Location locChennai = new Location(
    Name = 'TEST_Warehouse_Chennai',
    LocationType = 'Warehouse',
    IsInventoryLocation = true
);
Location locBangalore = new Location(
    Name = 'TEST_Warehouse_Bangalore',
    LocationType = 'Warehouse',
    IsInventoryLocation = true
);
Location locHyderabad = new Location(
    Name = 'TEST_Warehouse_Hyderabad',
    LocationType = 'Warehouse',
    IsInventoryLocation = true
);
Location locSurat = new Location(
    Name = 'TEST_Warehouse_Surat',
    LocationType = 'Warehouse',
    IsInventoryLocation = true
);
// Empty location - for E4 (batchItemId from wrong location)
Location locEmpty = new Location(
    Name = 'TEST_Warehouse_Empty',
    LocationType = 'Warehouse',
    IsInventoryLocation = true
);

insert new List<Location>{ locChennai, locBangalore, locHyderabad, locSurat, locEmpty };
System.debug('Locations created:');
System.debug('  locChennai   = ' + locChennai.Id);
System.debug('  locBangalore = ' + locBangalore.Id);
System.debug('  locHyderabad = ' + locHyderabad.Id);
System.debug('  locSurat     = ' + locSurat.Id);
System.debug('  locEmpty     = ' + locEmpty.Id);

// ============================================================
// STEP 3: PRODUCT ITEMS (inventory at location)
// ============================================================
System.debug(DIV);
System.debug('STEP 3: Creating ProductItems...');

// Standard product at 2 locations (for multi-location S2)
ProductItem piStandardChennai = new ProductItem(
    Product2Id = pStandard.Id,
    LocationId = locChennai.Id,
    QuantityOnHand = 100
);
ProductItem piStandardSurat = new ProductItem(
    Product2Id = pStandard.Id,
    LocationId = locSurat.Id,
    QuantityOnHand = 50
);
// Low stock for E1 - only 5 units (to test over-allocation)
ProductItem piStandardLow = new ProductItem(
    Product2Id = pStandard.Id,
    LocationId = locBangalore.Id,
    QuantityOnHand = 5
);

// Batched product at Bangalore
ProductItem piBatchedBangalore = new ProductItem(
    Product2Id = pBatched.Id,
    LocationId = locBangalore.Id,
    QuantityOnHand = 200
);
ProductItem piBatchedSurat = new ProductItem(
    Product2Id = pBatched.Id,
    LocationId = locSurat.Id,
    QuantityOnHand = 100
);

// Serialized non-batched at Hyderabad
ProductItem piSerializedNBHyd = new ProductItem(
    Product2Id = pSerializedNonBatch.Id,
    LocationId = locHyderabad.Id,
    QuantityOnHand = 20
);

// Serialized batched at Bangalore
ProductItem piSerializedBBangalore = new ProductItem(
    Product2Id = pSerializedBatched.Id,
    LocationId = locBangalore.Id,
    QuantityOnHand = 50
);

// Mixed product at Chennai and Bangalore
ProductItem piMixedChennai = new ProductItem(
    Product2Id = pMixed.Id,
    LocationId = locChennai.Id,
    QuantityOnHand = 80
);
ProductItem piMixedBangalore = new ProductItem(
    Product2Id = pMixed.Id,
    LocationId = locBangalore.Id,
    QuantityOnHand = 60
);

// Pagination product at Chennai
ProductItem piPaginationChennai = new ProductItem(
    Product2Id = pPagination.Id,
    LocationId = locChennai.Id,
    QuantityOnHand = 500
);

insert new List<ProductItem>{
    piStandardChennai, piStandardSurat, piStandardLow,
    piBatchedBangalore, piBatchedSurat,
    piSerializedNBHyd,
    piSerializedBBangalore,
    piMixedChennai, piMixedBangalore,
    piPaginationChennai
};
System.debug('ProductItems created:');
System.debug('  piStandardChennai        = ' + piStandardChennai.Id + ' (QOH=100)');
System.debug('  piStandardSurat          = ' + piStandardSurat.Id   + ' (QOH=50)');
System.debug('  piStandardLow[Bangalore] = ' + piStandardLow.Id     + ' (QOH=5  - E1 over-alloc)');
System.debug('  piBatchedBangalore       = ' + piBatchedBangalore.Id + ' (QOH=200)');
System.debug('  piBatchedSurat           = ' + piBatchedSurat.Id     + ' (QOH=100)');
System.debug('  piSerializedNBHyd        = ' + piSerializedNBHyd.Id  + ' (QOH=20)');
System.debug('  piSerializedBBangalore   = ' + piSerializedBBangalore.Id + ' (QOH=50)');
System.debug('  piMixedChennai           = ' + piMixedChennai.Id     + ' (QOH=80)');
System.debug('  piMixedBangalore         = ' + piMixedBangalore.Id   + ' (QOH=60)');
System.debug('  piPaginationChennai      = ' + piPaginationChennai.Id + ' (QOH=500)');

// ============================================================
// STEP 4: PRODUCT BATCH ITEMS (batch inventory)
// ============================================================
System.debug(DIV);
System.debug('STEP 4: Creating ProductBatchItems...');

// Batch PBI-1 at Bangalore (expires soon - FEFO priority)
ProductBatchItem pbiBatch1Bangalore = new ProductBatchItem(
    Name = 'TEST_PBI_Motor_Batch1_BLR',
    ProductId = pBatched.Id,
    ProductItemId = piBatchedBangalore.Id,
    LocationId = locBangalore.Id,
    RemainingQuantity = 80,
    IsActive = true
);
// Batch PBI-2 at Bangalore
ProductBatchItem pbiBatch2Bangalore = new ProductBatchItem(
    Name = 'TEST_PBI_Motor_Batch2_BLR',
    ProductId = pBatched.Id,
    ProductItemId = piBatchedBangalore.Id,
    LocationId = locBangalore.Id,
    RemainingQuantity = 120,
    IsActive = true
);
// Batch PBI-3 at Surat (for multi-location batch D4)
ProductBatchItem pbiBatch3Surat = new ProductBatchItem(
    Name = 'TEST_PBI_Motor_Batch3_SRT',
    ProductId = pBatched.Id,
    ProductItemId = piBatchedSurat.Id,
    LocationId = locSurat.Id,
    RemainingQuantity = 100,
    IsActive = true
);
// Serialized batched - PBI-Circuit at Bangalore
ProductBatchItem pbiCircuit1Bangalore = new ProductBatchItem(
    Name = 'TEST_PBI_Circuit_Batch1_BLR',
    ProductId = pSerializedBatched.Id,
    ProductItemId = piSerializedBBangalore.Id,
    LocationId = locBangalore.Id,
    RemainingQuantity = 30,
    IsActive = true
);
ProductBatchItem pbiCircuit2Bangalore = new ProductBatchItem(
    Name = 'TEST_PBI_Circuit_Batch2_BLR',
    ProductId = pSerializedBatched.Id,
    ProductItemId = piSerializedBBangalore.Id,
    LocationId = locBangalore.Id,
    RemainingQuantity = 20,
    IsActive = true
);
// Mixed product batch at Bangalore
ProductBatchItem pbiBatteryBatch1 = new ProductBatchItem(
    Name = 'TEST_PBI_Battery_Batch1_BLR',
    ProductId = pMixed.Id,
    ProductItemId = piMixedBangalore.Id,
    LocationId = locBangalore.Id,
    RemainingQuantity = 40,
    IsActive = true
);
// Wrong-location batch for E4 edge case (batchItemId from Empty location, used with Chennai PI)
ProductBatchItem pbiWrongLocation = new ProductBatchItem(
    Name = 'TEST_PBI_WrongLocation',
    ProductId = pStandard.Id,
    ProductItemId = piStandardChennai.Id,
    LocationId = locEmpty.Id,
    RemainingQuantity = 10,
    IsActive = true
);

insert new List<ProductBatchItem>{
    pbiBatch1Bangalore, pbiBatch2Bangalore, pbiBatch3Surat,
    pbiCircuit1Bangalore, pbiCircuit2Bangalore,
    pbiBatteryBatch1,
    pbiWrongLocation
};
System.debug('ProductBatchItems created:');
System.debug('  pbiBatch1Bangalore (Motor BLR)       = ' + pbiBatch1Bangalore.Id + ' (Qty=80)');
System.debug('  pbiBatch2Bangalore (Motor BLR)       = ' + pbiBatch2Bangalore.Id + ' (Qty=120)');
System.debug('  pbiBatch3Surat (Motor SRT)            = ' + pbiBatch3Surat.Id     + ' (Qty=100)');
System.debug('  pbiCircuit1Bangalore (Circuit BLR)   = ' + pbiCircuit1Bangalore.Id + ' (Qty=30)');
System.debug('  pbiCircuit2Bangalore (Circuit BLR)   = ' + pbiCircuit2Bangalore.Id + ' (Qty=20)');
System.debug('  pbiBatteryBatch1 (Battery BLR)       = ' + pbiBatteryBatch1.Id   + ' (Qty=40)');
System.debug('  pbiWrongLocation (E4 edge)            = ' + pbiWrongLocation.Id);

// ============================================================
// STEP 5: SERIALIZED PRODUCTS
// ============================================================
System.debug(DIV);
System.debug('STEP 5: Creating SerializedProducts...');

// Non-batched serialized (iPhones at Hyderabad) - Available status → for S5, D6
List<SerializedProduct> spNonBatched = new List<SerializedProduct>();
for (Integer i = 1; i <= 6; i++) {
    spNonBatched.add(new SerializedProduct(
        SerialNumber = 'TEST_SP_iPhone_HYD_' + String.valueOf(i).leftPad(3,'0'),
        Product2Id = pSerializedNonBatch.Id,
        ProductItemId = piSerializedNBHyd.Id,
        Status = 'Available'
    ));
}
// SP-007 = Already Allocated status → for E2
spNonBatched.add(new SerializedProduct(
    SerialNumber = 'TEST_SP_iPhone_HYD_007_ALREADY_ALLOCATED',
    Product2Id = pSerializedNonBatch.Id,
    ProductItemId = piSerializedNBHyd.Id,
    Status = 'Available'  // Will be updated after allocation to simulate E2
));
// SP-008 = Consumed status → for E3 (invalid status)
spNonBatched.add(new SerializedProduct(
    SerialNumber = 'TEST_SP_iPhone_HYD_008_CONSUMED',
    Product2Id = pSerializedNonBatch.Id,
    ProductItemId = piSerializedNBHyd.Id,
    Status = 'Consumed'
));
insert spNonBatched;
System.debug('SerializedProducts (iPhone - non-batched) created:');
for (SerializedProduct sp : spNonBatched) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id + ' (Status=' + sp.Status + ')');
}

// Batched serialized (Circuit boards at Bangalore) for Batch1 → S6, D5
List<SerializedProduct> spBatch1 = new List<SerializedProduct>();
for (Integer i = 1; i <= 4; i++) {
    spBatch1.add(new SerializedProduct(
        SerialNumber = 'TEST_SP_Circuit_BLR_B1_' + String.valueOf(i).leftPad(3,'0'),
        Product2Id = pSerializedBatched.Id,
        ProductItemId = piSerializedBBangalore.Id,
        Status = 'Available'
    ));
}
insert spBatch1;
System.debug('SerializedProducts (Circuit - Batch1) created:');
for (SerializedProduct sp : spBatch1) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id);
}

// Batched serialized for Batch2 → S7
List<SerializedProduct> spBatch2 = new List<SerializedProduct>();
for (Integer i = 1; i <= 3; i++) {
    spBatch2.add(new SerializedProduct(
        SerialNumber = 'TEST_SP_Circuit_BLR_B2_' + String.valueOf(i).leftPad(3,'0'),
        Product2Id = pSerializedBatched.Id,
        ProductItemId = piSerializedBBangalore.Id,
        Status = 'Available'
    ));
}
insert spBatch2;
System.debug('SerializedProducts (Circuit - Batch2) created:');
for (SerializedProduct sp : spBatch2) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id);
}

// Mixed product serialized at Bangalore → S8, D7
List<SerializedProduct> spMixed = new List<SerializedProduct>();
for (Integer i = 1; i <= 4; i++) {
    spMixed.add(new SerializedProduct(
        SerialNumber = 'TEST_SP_Battery_BLR_' + String.valueOf(i).leftPad(3,'0'),
        Product2Id = pMixed.Id,
        ProductItemId = piMixedBangalore.Id,
        Status = 'Available'
    ));
}
insert spMixed;
System.debug('SerializedProducts (Battery - Mixed) created:');
for (SerializedProduct sp : spMixed) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id);
}

// ============================================================
// STEP 6: PRICE BOOK ENTRIES (needed for Order)
// ============================================================
System.debug(DIV);
System.debug('STEP 6: Creating Pricebook Entries...');

Id stdPbId = Test.getStandardPricebookId();
// In non-test context, query the standard pricebook
List<Pricebook2> pbs = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
Id standardPricebookId = pbs.isEmpty() ? null : pbs[0].Id;

if (standardPricebookId == null) {
    System.debug('WARNING: Could not find Standard Pricebook. Skipping PricebookEntry creation.');
} else {
    List<PricebookEntry> pbes = new List<PricebookEntry>();
    for (Product2 p : new List<Product2>{ pStandard, pBatched, pSerializedNonBatch, pSerializedBatched, pMixed, pPagination }) {
        pbes.add(new PricebookEntry(
            Pricebook2Id = standardPricebookId,
            Product2Id   = p.Id,
            UnitPrice    = 100.0,
            IsActive     = true
        ));
    }
    insert pbes;
    System.debug('PricebookEntries created: ' + pbes.size());
}

// ============================================================
// STEP 7: ORDERS + ORDER LINE ITEMS
// ============================================================
System.debug(DIV);
System.debug('STEP 7: Creating Orders and OrderItems...');

List<Pricebook2> pbList = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
Id pbId = pbList.isEmpty() ? null : pbList[0].Id;

// Order for Happy Path scenarios (S1-S9)
Order orderHappyPath = new Order(
    Name         = 'TEST_Order_HappyPath_S1toS9',
    Status       = 'Draft',
    EffectiveDate = Date.today(),
    Pricebook2Id  = pbId
);

// Order for Edge Cases (E1-E10)
Order orderEdgeCases = new Order(
    Name         = 'TEST_Order_EdgeCases_E1toE10',
    Status       = 'Draft',
    EffectiveDate = Date.today(),
    Pricebook2Id  = pbId
);

// Order for Deallocation tests (D1-D7, G1-G6)
Order orderDealloc = new Order(
    Name         = 'TEST_Order_Deallocation_D1toD7',
    Status       = 'Draft',
    EffectiveDate = Date.today(),
    Pricebook2Id  = pbId
);

// Order for Pagination test (G7) - will have many line items
Order orderPagination = new Order(
    Name         = 'TEST_Order_Pagination_G7',
    Status       = 'Draft',
    EffectiveDate = Date.today(),
    Pricebook2Id  = pbId
);

insert new List<Order>{ orderHappyPath, orderEdgeCases, orderDealloc, orderPagination };
System.debug('Orders created:');
System.debug('  orderHappyPath  (S1-S9)   = ' + orderHappyPath.Id);
System.debug('  orderEdgeCases  (E1-E10)  = ' + orderEdgeCases.Id);
System.debug('  orderDealloc    (D1-D7)   = ' + orderDealloc.Id);
System.debug('  orderPagination (G7)      = ' + orderPagination.Id);

// Query PricebookEntries
Map<Id, Id> prodToPbe = new Map<Id, Id>();
if (pbId != null) {
    for (PricebookEntry pbe : [
        SELECT Id, Product2Id FROM PricebookEntry
        WHERE Pricebook2Id = :pbId
        AND Product2Id IN :new List<Id>{ pStandard.Id, pBatched.Id, pSerializedNonBatch.Id, pSerializedBatched.Id, pMixed.Id, pPagination.Id }
    ]) {
        prodToPbe.put(pbe.Product2Id, pbe.Id);
    }
}

List<OrderItem> orderItems = new List<OrderItem>();

// === HAPPY PATH ORDER ITEMS ===
// S1: Standard - single location (Chennai, qty 30)
OrderItem oiS1_Standard = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pStandard.Id,
    PricebookEntryId = prodToPbe.get(pStandard.Id),
    Quantity         = 30,
    UnitPrice        = 100.0,
    Description      = 'S1: Location-level single location'
);
// S2: Standard - multi-location (Chennai 40 + Surat 30 = 70)
OrderItem oiS2_MultiLoc = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pStandard.Id,
    PricebookEntryId = prodToPbe.get(pStandard.Id),
    Quantity         = 70,
    UnitPrice        = 100.0,
    Description      = 'S2: Location-level multi-location'
);
// S3: Batched single batch (PBI-1 at Bangalore, qty 50)
OrderItem oiS3_BatchSingle = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pBatched.Id,
    PricebookEntryId = prodToPbe.get(pBatched.Id),
    Quantity         = 50,
    UnitPrice        = 100.0,
    Description      = 'S3: Batch allocation - single batch'
);
// S4: Batched multi-batch (PBI-1 qty 30 + PBI-2 qty 40 = 70)
OrderItem oiS4_BatchMulti = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pBatched.Id,
    PricebookEntryId = prodToPbe.get(pBatched.Id),
    Quantity         = 70,
    UnitPrice        = 100.0,
    Description      = 'S4: Batch allocation - multiple batches'
);
// S5: Serialized non-batched (3 iPhones at Hyderabad)
OrderItem oiS5_SerialNB = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pSerializedNonBatch.Id,
    PricebookEntryId = prodToPbe.get(pSerializedNonBatch.Id),
    Quantity         = 3,
    UnitPrice        = 100.0,
    Description      = 'S5: Serialized non-batched'
);
// S6: Serialized batched using batchItemId (Circuit at Bangalore, 2 from Batch1)
OrderItem oiS6_SerialBatch = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pSerializedBatched.Id,
    PricebookEntryId = prodToPbe.get(pSerializedBatched.Id),
    Quantity         = 2,
    UnitPrice        = 100.0,
    Description      = 'S6: Serialized batched (batchItemId)'
);
// S7: Serialized batched using batchId (Circuit, 3 from Batch2 - derived)
OrderItem oiS7_SerialBatchId = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pSerializedBatched.Id,
    PricebookEntryId = prodToPbe.get(pSerializedBatched.Id),
    Quantity         = 3,
    UnitPrice        = 100.0,
    Description      = 'S7: Serialized batched (batchId - derived)'
);
// S8: Mixed (Battery: standard Chennai + batched Bangalore + serial Bangalore)
OrderItem oiS8_Mixed = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pMixed.Id,
    PricebookEntryId = prodToPbe.get(pMixed.Id),
    Quantity         = 15,
    UnitPrice        = 100.0,
    Description      = 'S8: Mixed allocation all patterns'
);
// S9: Inline deallocation (deallocate loc A + allocate loc B in same request)
OrderItem oiS9_InlineDealloc = new OrderItem(
    OrderId          = orderHappyPath.Id,
    Product2Id       = pStandard.Id,
    PricebookEntryId = prodToPbe.get(pStandard.Id),
    Quantity         = 20,
    UnitPrice        = 100.0,
    Description      = 'S9: Inline dealloc in allocation request'
);

orderItems.addAll(new List<OrderItem>{
    oiS1_Standard, oiS2_MultiLoc, oiS3_BatchSingle, oiS4_BatchMulti,
    oiS5_SerialNB, oiS6_SerialBatch, oiS7_SerialBatchId,
    oiS8_Mixed, oiS9_InlineDealloc
});

// === EDGE CASE ORDER ITEMS ===
// E1: Over-allocation - qty 20 but only 5 available at Bangalore
OrderItem oiE1_OverAlloc = new OrderItem(
    OrderId          = orderEdgeCases.Id,
    Product2Id       = pStandard.Id,
    PricebookEntryId = prodToPbe.get(pStandard.Id),
    Quantity         = 20,
    UnitPrice        = 100.0,
    Description      = 'E1: Over-allocation (20 requested, only 5 available at Bangalore)'
);
// E2: Already allocated serialized product
OrderItem oiE2_AlreadyAlloc = new OrderItem(
    OrderId          = orderEdgeCases.Id,
    Product2Id       = pSerializedNonBatch.Id,
    PricebookEntryId = prodToPbe.get(pSerializedNonBatch.Id),
    Quantity         = 1,
    UnitPrice        = 100.0,
    Description      = 'E2: Already allocated serialized product'
);
// E3: Consumed serialized product
OrderItem oiE3_Consumed = new OrderItem(
    OrderId          = orderEdgeCases.Id,
    Product2Id       = pSerializedNonBatch.Id,
    PricebookEntryId = prodToPbe.get(pSerializedNonBatch.Id),
    Quantity         = 1,
    UnitPrice        = 100.0,
    Description      = 'E3: Serialized product in Consumed status'
);
// E4: Wrong location batchItemId
OrderItem oiE4_WrongLocBatch = new OrderItem(
    OrderId          = orderEdgeCases.Id,
    Product2Id       = pStandard.Id,
    PricebookEntryId = prodToPbe.get(pStandard.Id),
    Quantity         = 10,
    UnitPrice        = 100.0,
    Description      = 'E4: batchItemId from wrong location'
);
// E5: Zero quantity
OrderItem oiE5_ZeroQty = new OrderItem(
    OrderId          = orderEdgeCases.Id,
    Product2Id       = pStandard.Id,
    PricebookEntryId = prodToPbe.get(pStandard.Id),
    Quantity         = 1,  // 1 required by Salesforce, API will send 0
    UnitPrice        = 100.0,
    Description      = 'E5: Zero quantity allocation attempt'
);

orderItems.addAll(new List<OrderItem>{
    oiE1_OverAlloc, oiE2_AlreadyAlloc, oiE3_Consumed,
    oiE4_WrongLocBatch, oiE5_ZeroQty
});

// === DEALLOCATION ORDER ITEMS ===
// One item per deallocation scenario type
OrderItem oiD1 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pStandard.Id, PricebookEntryId=prodToPbe.get(pStandard.Id), Quantity=40, UnitPrice=100.0, Description='D1: Item-level full dealloc' );
OrderItem oiD2 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pStandard.Id, PricebookEntryId=prodToPbe.get(pStandard.Id), Quantity=30, UnitPrice=100.0, Description='D2: Location-level v260 format' );
OrderItem oiD3 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pStandard.Id, PricebookEntryId=prodToPbe.get(pStandard.Id), Quantity=25, UnitPrice=100.0, Description='D3: Location-level v262 format' );
OrderItem oiD4 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pBatched.Id, PricebookEntryId=prodToPbe.get(pBatched.Id), Quantity=60, UnitPrice=100.0, Description='D4: Batch non-serial dealloc' );
OrderItem oiD5 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pSerializedBatched.Id, PricebookEntryId=prodToPbe.get(pSerializedBatched.Id), Quantity=2, UnitPrice=100.0, Description='D5: Batch serialized dealloc' );
OrderItem oiD6 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pSerializedNonBatch.Id, PricebookEntryId=prodToPbe.get(pSerializedNonBatch.Id), Quantity=2, UnitPrice=100.0, Description='D6: Serial non-batch dealloc' );
OrderItem oiD7 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pMixed.Id, PricebookEntryId=prodToPbe.get(pMixed.Id), Quantity=10, UnitPrice=100.0, Description='D7: Mixed dealloc' );
// G2: Partially allocated order item (need qty 50, will only allocate 20)
OrderItem oiG2 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pStandard.Id, PricebookEntryId=prodToPbe.get(pStandard.Id), Quantity=50, UnitPrice=100.0, Description='G2: PARTIALLY_ALLOCATED status' );
// G3: Fully allocated
OrderItem oiG3 = new OrderItem( OrderId=orderDealloc.Id, Product2Id=pStandard.Id, PricebookEntryId=prodToPbe.get(pStandard.Id), Quantity=15, UnitPrice=100.0, Description='G3: FULLY_ALLOCATED status' );

orderItems.addAll(new List<OrderItem>{ oiD1, oiD2, oiD3, oiD4, oiD5, oiD6, oiD7, oiG2, oiG3 });

// === PAGINATION ORDER ITEMS (G7) - 12 items to test multi-page response ===
for (Integer i = 1; i <= 12; i++) {
    orderItems.add(new OrderItem(
        OrderId          = orderPagination.Id,
        Product2Id       = pPagination.Id,
        PricebookEntryId = prodToPbe.get(pPagination.Id),
        Quantity         = 10,
        UnitPrice        = 100.0,
        Description      = 'G7: Pagination item ' + i
    ));
}

insert orderItems;
System.debug('OrderItems created: ' + orderItems.size());
System.debug('Happy Path items:');
System.debug('  oiS1_Standard (S1)           = ' + oiS1_Standard.Id);
System.debug('  oiS2_MultiLoc (S2)            = ' + oiS2_MultiLoc.Id);
System.debug('  oiS3_BatchSingle (S3)         = ' + oiS3_BatchSingle.Id);
System.debug('  oiS4_BatchMulti (S4)          = ' + oiS4_BatchMulti.Id);
System.debug('  oiS5_SerialNB (S5)            = ' + oiS5_SerialNB.Id);
System.debug('  oiS6_SerialBatch (S6)         = ' + oiS6_SerialBatch.Id);
System.debug('  oiS7_SerialBatchId (S7)       = ' + oiS7_SerialBatchId.Id);
System.debug('  oiS8_Mixed (S8)               = ' + oiS8_Mixed.Id);
System.debug('  oiS9_InlineDealloc (S9)       = ' + oiS9_InlineDealloc.Id);
System.debug('Edge Case items:');
System.debug('  oiE1_OverAlloc (E1)           = ' + oiE1_OverAlloc.Id);
System.debug('  oiE2_AlreadyAlloc (E2)        = ' + oiE2_AlreadyAlloc.Id);
System.debug('  oiE3_Consumed (E3)            = ' + oiE3_Consumed.Id);
System.debug('  oiE4_WrongLocBatch (E4)       = ' + oiE4_WrongLocBatch.Id);
System.debug('  oiE5_ZeroQty (E5)             = ' + oiE5_ZeroQty.Id);
System.debug('Deallocation items:');
System.debug('  oiD1 = ' + oiD1.Id + ' | oiD2 = ' + oiD2.Id + ' | oiD3 = ' + oiD3.Id);
System.debug('  oiD4 = ' + oiD4.Id + ' | oiD5 = ' + oiD5.Id + ' | oiD6 = ' + oiD6.Id);
System.debug('  oiD7 = ' + oiD7.Id + ' | oiG2 = ' + oiG2.Id + ' | oiG3 = ' + oiG3.Id);
System.debug('  orderPagination items: 12 created for G7');

// ============================================================
// STEP 8: PRODUCT FULFILLMENT LOCATIONS (for Auto-Allocation S10)
// ============================================================
System.debug(DIV);
System.debug('STEP 8: Creating ProductFulfillmentLocations (Auto-Alloc prereq)...');

try {
    List<SObject> pfls = new List<SObject>();
    SObject pflStdChennai = Schema.getGlobalDescribe().get('ProductFulfillmentLocation').newSObject();
    pflStdChennai.put('ProductId', pStandard.Id);
    pflStdChennai.put('LocationId', locChennai.Id);
    pfls.add(pflStdChennai);

    SObject pflBatchedBLR = Schema.getGlobalDescribe().get('ProductFulfillmentLocation').newSObject();
    pflBatchedBLR.put('ProductId', pBatched.Id);
    pflBatchedBLR.put('LocationId', locBangalore.Id);
    pfls.add(pflBatchedBLR);

    insert pfls;
    System.debug('ProductFulfillmentLocations created: ' + pfls.size());
} catch (Exception ex) {
    System.debug('WARNING: Could not create ProductFulfillmentLocations: ' + ex.getMessage());
}

// ============================================================
// STEP 9: SUMMARY OUTPUT
// ============================================================
System.debug(DIV);
System.debug('DATA SETUP COMPLETE - SCENARIO REFERENCE CARD');
System.debug(DIV);
System.debug('');
System.debug('=== SOURCE IDs FOR API PAYLOADS ===');
System.debug('');
System.debug('ORDERS (sourceId in API)');
System.debug('  S1-S9 Happy Path Order  = ' + orderHappyPath.Id);
System.debug('  E1-E7 Edge Cases Order  = ' + orderEdgeCases.Id);
System.debug('  D1-D7 Dealloc Order     = ' + orderDealloc.Id);
System.debug('  G7    Pagination Order  = ' + orderPagination.Id);
System.debug('  E6    Invalid OrderId   = 0Ax000000000000AAA  (non-existent)');
System.debug('');
System.debug('LOCATIONS (sourceLocationId in API)');
System.debug('  locChennai   = ' + locChennai.Id);
System.debug('  locBangalore = ' + locBangalore.Id);
System.debug('  locHyderabad = ' + locHyderabad.Id);
System.debug('  locSurat     = ' + locSurat.Id);
System.debug('  locEmpty     = ' + locEmpty.Id + '  (no stock - for negative tests)');
System.debug('');
System.debug('PRODUCT BATCH ITEMS (batchItemId in API)');
System.debug('  PBI_Motor_Batch1_BLR   = ' + pbiBatch1Bangalore.Id + ' (Qty=80,  use for S3, S4, D4)');
System.debug('  PBI_Motor_Batch2_BLR   = ' + pbiBatch2Bangalore.Id + ' (Qty=120, use for S4)');
System.debug('  PBI_Motor_Batch3_SRT   = ' + pbiBatch3Surat.Id     + ' (Qty=100, use for D4 multi-loc)');
System.debug('  PBI_Circuit_Batch1_BLR = ' + pbiCircuit1Bangalore.Id + ' (Qty=30, use for S6, D5)');
System.debug('  PBI_Circuit_Batch2_BLR = ' + pbiCircuit2Bangalore.Id + ' (Qty=20, use for S7)');
System.debug('  PBI_Battery_Batch1_BLR = ' + pbiBatteryBatch1.Id   + ' (Qty=40, use for S8, D7)');
System.debug('  PBI_WrongLocation      = ' + pbiWrongLocation.Id   + ' (Empty loc - use for E4)');
System.debug('');
System.debug('SERIALIZED PRODUCTS - Non-Batched iPhone (Hyderabad)');
for (Integer i = 0; i < spNonBatched.size(); i++) {
    SerializedProduct sp = spNonBatched[i];
    String note = (i == 6) ? ' ← E2: use this then re-allocate' : (i == 7) ? ' ← E3: Consumed status' : ' ← S5/D6: Available';
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id + note);
}
System.debug('');
System.debug('SERIALIZED PRODUCTS - Batched Circuit (Bangalore - Batch1)');
for (SerializedProduct sp : spBatch1) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id + ' (S6, D5)');
}
System.debug('');
System.debug('SERIALIZED PRODUCTS - Batched Circuit (Bangalore - Batch2)');
for (SerializedProduct sp : spBatch2) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id + ' (S7)');
}
System.debug('');
System.debug('SERIALIZED PRODUCTS - Mixed Battery (Bangalore)');
for (SerializedProduct sp : spMixed) {
    System.debug('  ' + sp.SerialNumber + ' = ' + sp.Id + ' (S8, D7)');
}
System.debug('');
System.debug('PRODUCT ITEMS (for Process Additional Transaction API P1)');
System.debug('  piStandardChennai  = ' + piStandardChennai.Id);
System.debug('  piBatchedBangalore = ' + piBatchedBangalore.Id);
System.debug('  piSerializedNBHyd  = ' + piSerializedNBHyd.Id);
System.debug('');
System.debug(DIV);
System.debug('SCENARIO QUICK REFERENCE');
System.debug(DIV);
System.debug('S1  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS1, sourceLocationId=locChennai, qty=30');
System.debug('S2  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS2, locations=[Chennai(40)+Surat(30)]');
System.debug('S3  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS3, batch=[PBI_Motor_Batch1_BLR qty=50]');
System.debug('S4  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS4, batches=[PBI1(30)+PBI2(40)]');
System.debug('S5  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS5, unbatchedSerializedProductIds=[SP1,SP2,SP3]');
System.debug('S6  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS6, batchItemId=PBI_Circuit1, batchedSPIds=[SP_B1_001,SP_B1_002]');
System.debug('S7  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS7, batchId=PBI_Circuit2, batchedSPIds=[SP_B2_001,SP_B2_002,SP_B2_003]');
System.debug('S8  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS8, mixed patterns in one request');
System.debug('S9  POST /connect/inventory/allocation  → sourceId=orderHappyPath, sourceItemId=oiS9, allocations+deallocationLocationIds in same request');
System.debug('E1  POST /connect/inventory/allocation  → sourceId=orderEdgeCases, sourceItemId=oiE1, locBangalore qty=20 (only 5 avail) → EXPECT ERROR');
System.debug('E2  POST /connect/inventory/allocation  → use SP_iPhone_007 AFTER first allocating it → EXPECT ERROR (already allocated)');
System.debug('E3  POST /connect/inventory/allocation  → unbatchedSerializedProductIds=[SP_iPhone_008_CONSUMED] → EXPECT ERROR');
System.debug('E4  POST /connect/inventory/allocation  → sourceItemId=oiE4, batchItemId=PBI_WrongLocation → EXPECT ERROR (location mismatch)');
System.debug('E5  POST /connect/inventory/allocation  → allocatedQuantity=0 → EXPECT ERROR');
System.debug('E6  POST /connect/inventory/allocation  → sourceId=0Ax000000000000AAA (invalid) → EXPECT ERROR');
System.debug('E7  POST /connect/inventory/allocation  → sourceItemId=0CoXXXXXXXXXXXXXXX (invalid) → EXPECT ERROR');
System.debug('D1  POST /connect/inventory/deallocation → sourceItemId=oiD1 only (full dealloc)');
System.debug('D2  POST /connect/inventory/deallocation → sourceItemId=oiD2, sourceLocationIds=[locChennai] (v260)');
System.debug('D3  POST /connect/inventory/deallocation → sourceItemId=oiD3, deallocations=[{sourceLocationId=locSurat}] (v262)');
System.debug('D4  POST /connect/inventory/deallocation → sourceItemId=oiD4, batchItemIds=[PBI_Batch1, PBI_Batch2] at locBangalore');
System.debug('D5  POST /connect/inventory/deallocation → sourceItemId=oiD5, batchItemIds=[PBI_Circuit1], serializedProductIds=[SP_B1_001]');
System.debug('D6  POST /connect/inventory/deallocation → sourceItemId=oiD6, serializedProductIds=[SP_iPhone_001,SP_iPhone_002] at locHyderabad');
System.debug('D7  POST /connect/inventory/deallocation → sourceItemId=oiD7, mixed patterns in one request');
System.debug('G1  GET  /connect/inventory/allocation/orderDealloc?pageNumber=1&pageSize=10 (before any allocation)');
System.debug('G2  GET  /connect/inventory/allocation/orderDealloc after partial allocation of oiG2 (allocate 20 of 50)');
System.debug('G3  GET  /connect/inventory/allocation/orderDealloc after full allocation of oiG3 (allocate all 15)');
System.debug('G7  GET  /connect/inventory/allocation/orderPagination?pageNumber=1&pageSize=5 (12 items → 3 pages)');
System.debug('P1  POST /connect/inventory/process-additional-transaction → productItemIds=[piStandardChennai, piBatchedBangalore]');
System.debug('P2  POST /connect/inventory/process-additional-transaction → productItemIds=[piStandardChennai, INVALID_ID]');
System.debug('P3  POST /connect/inventory/process-additional-transaction → productItemIds=[] (empty)');
System.debug('P4  POST /connect/inventory/process-additional-transaction → productItemIds=[INVALID_1, INVALID_2]');
System.debug(DIV);
System.debug('DATA SETUP COMPLETE');
