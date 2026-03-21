/**
 * MFG_InventoryAllocationTestDataSetup
 *
 * Single Apex class to create all test data required for Inventory Allocation
 * API testing (v260 + v262 enhancements) on Manufacturing Cloud.
 *
 * USAGE — run as Anonymous Apex:
 *   MFG_InventoryAllocationTestDataSetup.run();
 *
 * After execution, all created record IDs are printed to the Debug Log.
 * Use those IDs directly in your API payloads.
 *
 * SCENARIOS COVERED:
 *   S1–S9   Happy path allocation (location, batch, serial, mixed, inline dealloc)
 *   E1–E7   Edge cases / negative tests
 *   D1–D7   Deallocation patterns
 *   G1–G7   Get Allocation API (status variants + pagination)
 *   P1–P4   Process Additional Transaction API
 *
 * CUSTOMER CONTEXT:
 *   Customer : Acme Engineering Pvt. Ltd. (auto parts manufacturer, India)
 *   Products : Industrial hydraulic, motion control, and precision components
 *   Locations: Indian manufacturing & distribution network
 */
public class MFG_InventoryAllocationTestDataSetup {

    // ─────────────────────────────────────────────────────────────────────────
    // Shared state — populated by each create* method, consumed by later ones
    // ─────────────────────────────────────────────────────────────────────────

    // Products
    private static Id pHydPumpId;        // Hydraulic Pump HP-2000    (standard)
    private static Id pHydFluidId;       // Hydraulic Fluid HF-46     (batched)
    private static Id pServoMotorId;     // Servo Motor SM-5KW        (serialized, non-batched)
    private static Id pPLCUnitId;        // PLC Control Unit CU-3000  (serialized + batched)
    private static Id pPressureValveId;  // Pressure Relief Valve PRV-150 (mixed)
    private static Id pBearingId;        // Ball Bearing 6205-2RS     (pagination / bulk)

    // Locations
    private static Id locPuneId;
    private static Id locChennaiId;
    private static Id locBangaloreId;
    private static Id locMumbaiId;
    private static Id locHyderabadId;    // Low-stock — for E1 over-allocation edge case

    // ProductItems
    private static Id piPumpPuneId;        // QOH = 150
    private static Id piPumpChennaiId;     // QOH = 80
    private static Id piPumpHyderabadId;   // QOH = 8  ← intentionally low for E1
    private static Id piFluidPuneId;       // QOH = 500
    private static Id piFluidChennaiId;    // QOH = 300
    private static Id piMotorBangaloreId;  // QOH = 25
    private static Id piMotorMumbaiId;     // QOH = 15
    private static Id piPLCPuneId;         // QOH = 40
    private static Id piValvePuneId;       // QOH = 200
    private static Id piValveBangaloreId;  // QOH = 120
    private static Id piBearingChennaiId;  // QOH = 5000

    // Serialized Products — Servo Motor BLR (non-batched)
    private static Id spMotor001Id;   // Available — pool for S5
    private static Id spMotor002Id;
    private static Id spMotor003Id;
    private static Id spMotor004Id;
    private static Id spMotor005Id;
    private static Id spMotor006Id;
    private static Id spMotorE2Id;    // Available — use for E2 (re-allocate already-allocated)
    private static Id spMotorE3Id;    // Consumed  — use for E3 (invalid status)

    // Serialized Products — Servo Motor MUM (non-batched, Mumbai)
    private static Id spMotorMum001Id;
    private static Id spMotorMum002Id;
    private static Id spMotorMum003Id;

    // Serialized Products — PLC Unit Lot-A (batched, Pune — for S6/D5 via batchItemId)
    private static Id spPLCLotA001Id;
    private static Id spPLCLotA002Id;
    private static Id spPLCLotA003Id;
    private static Id spPLCLotA004Id;

    // Serialized Products — PLC Unit Lot-B (batched, Pune — for S7 via batchId)
    private static Id spPLCLotB001Id;
    private static Id spPLCLotB002Id;
    private static Id spPLCLotB003Id;

    // Serialized Products — Pressure Valve BLR (non-batched — S8/D7 mixed)
    private static Id spValve001Id;
    private static Id spValve002Id;
    private static Id spValve003Id;
    private static Id spValve004Id;

    // ProductionBatch — Hydraulic Fluid (batched non-serialized)
    // LOT-HF-2025-Q1A : Pune, near-expiry batch (FEFO first-pick for S3/S4)
    // LOT-HF-2025-Q1B : Pune, longer shelf-life batch
    // LOT-HF-2025-Q2A : Chennai, Q2 manufacturing batch
    private static Id pbHydFluidLotQ1AId;
    private static Id pbHydFluidLotQ1BId;
    private static Id pbHydFluidLotQ2AId;

    // ProductionBatch — PLC Unit (serialized + batched)
    // LOT-PLC-2025-LTA : Pune, Lot-A (paired with LTA serialized products)
    // LOT-PLC-2025-LTB : Pune, Lot-B (paired with LTB serialized products)
    private static Id pbPLCLotAId;
    private static Id pbPLCLotBId;

    // ProductBatchItem — Hydraulic Fluid (links ProductionBatch → ProductItem)
    private static Id pbiFluidQ1A_PuneId;    // LOT-HF-Q1A at Pune,    RemainingQty=200
    private static Id pbiFluidQ1B_PuneId;    // LOT-HF-Q1B at Pune,    RemainingQty=300
    private static Id pbiFluidQ2A_ChennaiId; // LOT-HF-Q2A at Chennai, RemainingQty=300

    // ProductBatchItem — PLC Unit (links ProductionBatch → ProductItem)
    private static Id pbiPLCLotA_PuneId;    // LOT-PLC-LTA at Pune, RemainingQty=4
    private static Id pbiPLCLotB_PuneId;    // LOT-PLC-LTB at Pune, RemainingQty=3

    // Orders
    private static Id ordHappyPathId;
    private static Id ordEdgeCasesId;
    private static Id ordDeallocationId;
    private static Id ordPaginationId;

    // Order Items — Happy Path
    private static Id oiS1Id; private static Id oiS2Id; private static Id oiS3Id;
    private static Id oiS4Id; private static Id oiS5Id; private static Id oiS6Id;
    private static Id oiS7Id; private static Id oiS8Id; private static Id oiS9Id;

    // Order Items — Edge Cases
    private static Id oiE1Id; private static Id oiE2Id; private static Id oiE3Id;
    private static Id oiE4Id; private static Id oiE5Id;

    // Order Items — Deallocation
    private static Id oiD1Id; private static Id oiD2Id; private static Id oiD3Id;
    private static Id oiD4Id; private static Id oiD5Id; private static Id oiD6Id;
    private static Id oiD7Id; private static Id oiG2Id; private static Id oiG3Id;
    private static Id oiG5Id; private static Id oiG6Id;

    // Pricebook
    private static Id pbId;
    private static Map<Id,Id> prodToPbeMap = new Map<Id,Id>();

    // Account
    private static Id acctId;

    // ─────────────────────────────────────────────────────────────────────────
    // ENTRY POINT
    // ─────────────────────────────────────────────────────────────────────────
    public static void run() {
        System.debug('\n══════════════════════════════════════════════════════════════');
        System.debug('MFG Inventory Allocation Test Data Setup — START');
        System.debug('══════════════════════════════════════════════════════════════');

        lookupPrerequisites();
        createProducts();
        createLocations();
        createProductItems();
        createProductionBatchesAndItems();
        createSerializedProducts();
        createOrders();
        createOrderItems();
        printSummary();

        System.debug('\n══════════════════════════════════════════════════════════════');
        System.debug('MFG Inventory Allocation Test Data Setup — COMPLETE');
        System.debug('══════════════════════════════════════════════════════════════');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 0. PREREQUISITES — Account & Pricebook
    // ─────────────────────────────────────────────────────────────────────────
    private static void lookupPrerequisites() {
        System.debug('\n[Step 0] Looking up prerequisites...');

        List<Account> accts = [SELECT Id FROM Account WHERE Name = 'Acme' LIMIT 1];
        if (accts.isEmpty()) {
            throw new MFGSetupException('Account "Acme" not found. Please verify the org has seed data.');
        }
        acctId = accts[0].Id;

        List<Pricebook2> pbs = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        if (pbs.isEmpty()) {
            throw new MFGSetupException('Standard Pricebook not found.');
        }
        pbId = pbs[0].Id;

        System.debug('  Account (Acme)           = ' + acctId);
        System.debug('  Standard Pricebook       = ' + pbId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PRODUCTS
    // Industrial manufacturing parts — automotive / heavy equipment sector
    // ─────────────────────────────────────────────────────────────────────────
    private static void createProducts() {
        System.debug('\n[Step 1] Creating Products...');

        // Standard product (non-batched, non-serialized)
        Product2 pHydPump = new Product2(
            Name        = 'Hydraulic Pump Assembly HP-2000',
            ProductCode = 'HYD-PUMP-HP2000',
            Description = 'High-pressure hydraulic pump for industrial press machinery. Sold in units.',
            IsActive    = true
        );
        // Batched product (non-serialized, lot-tracked)
        Product2 pHydFluid = new Product2(
            Name        = 'Hydraulic Fluid HF-46 200L Drum',
            ProductCode = 'HYD-FLUID-HF46-200L',
            Description = 'ISO VG 46 mineral hydraulic oil. Batch-tracked by production lot for quality traceability.',
            IsActive    = true
        );
        // Serialized non-batched
        Product2 pServoMotor = new Product2(
            Name        = 'Servo Motor SM-5KW-3Phase',
            ProductCode = 'MOT-SERVO-SM5KW3PH',
            Description = '5kW 3-phase AC servo motor. Individually serialized for warranty and field service tracking.',
            IsActive    = true
        );
        // Serialized + batched
        Product2 pPLCUnit = new Product2(
            Name        = 'PLC Control Unit CU-3000',
            ProductCode = 'PLC-CU3000-V2',
            Description = 'Programmable Logic Controller. Batch-manufactured; each unit serialized for configuration traceability.',
            IsActive    = true
        );
        // Mixed allocation scenarios
        Product2 pPressureValve = new Product2(
            Name        = 'Pressure Relief Valve PRV-150',
            ProductCode = 'VLV-PRV150-SS',
            Description = 'Spring-loaded stainless pressure relief valve, 150 bar rated. Mixed stock: bulk and serialized grades.',
            IsActive    = true
        );
        // High-volume bulk part for pagination test
        Product2 pBearing = new Product2(
            Name        = 'Ball Bearing 6205-2RS Double Sealed',
            ProductCode = 'BRG-6205-2RS-SKF',
            Description = 'Deep groove ball bearing, double sealed, 25x52x15mm. High-volume standard part.',
            IsActive    = true
        );

        insert new List<Product2>{
            pHydPump, pHydFluid, pServoMotor, pPLCUnit, pPressureValve, pBearing
        };

        pHydPumpId       = pHydPump.Id;
        pHydFluidId      = pHydFluid.Id;
        pServoMotorId    = pServoMotor.Id;
        pPLCUnitId       = pPLCUnit.Id;
        pPressureValveId = pPressureValve.Id;
        pBearingId       = pBearing.Id;

        System.debug('  pHydPump       (HP-2000 Standard)       = ' + pHydPumpId);
        System.debug('  pHydFluid      (HF-46 Batched)          = ' + pHydFluidId);
        System.debug('  pServoMotor    (SM-5KW Serial/NonBatch)  = ' + pServoMotorId);
        System.debug('  pPLCUnit       (CU-3000 Serial+Batch)   = ' + pPLCUnitId);
        System.debug('  pPressureValve (PRV-150 Mixed)          = ' + pPressureValveId);
        System.debug('  pBearing       (6205-2RS Pagination)    = ' + pBearingId);

        ensurePricebookEntries();
    }

    // Creates PricebookEntry for each product in the Standard Pricebook
    private static void ensurePricebookEntries() {
        List<Id> allProdIds = new List<Id>{
            pHydPumpId, pHydFluidId, pServoMotorId, pPLCUnitId, pPressureValveId, pBearingId
        };
        for (PricebookEntry pbe : [
            SELECT Id, Product2Id FROM PricebookEntry
            WHERE Pricebook2Id = :pbId AND Product2Id IN :allProdIds AND IsActive = true
        ]) {
            prodToPbeMap.put(pbe.Product2Id, pbe.Id);
        }
        List<PricebookEntry> toInsert = new List<PricebookEntry>();
        for (Id pid : allProdIds) {
            if (!prodToPbeMap.containsKey(pid)) {
                PricebookEntry pbe = new PricebookEntry();
                pbe.Pricebook2Id = pbId;
                pbe.Product2Id   = pid;
                pbe.UnitPrice    = 1.00;
                pbe.IsActive     = true;
                toInsert.add(pbe);
            }
        }
        if (!toInsert.isEmpty()) {
            insert toInsert;
            for (PricebookEntry pbe : toInsert) prodToPbeMap.put(pbe.Product2Id, pbe.Id);
        }
        System.debug('  PricebookEntries ready: ' + prodToPbeMap.size());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. LOCATIONS
    // Indian manufacturing & distribution network — Acme Engineering footprint
    // ─────────────────────────────────────────────────────────────────────────
    private static void createLocations() {
        System.debug('\n[Step 2] Creating Locations...');

        Schema.Location locPune = new Schema.Location();
        locPune.Name = 'MFG_Pune_ManufacturingPlant';
        locPune.LocationType = 'Warehouse';
        locPune.IsInventoryLocation = true;

        Schema.Location locChennai = new Schema.Location();
        locChennai.Name = 'MFG_Chennai_DistributionCenter';
        locChennai.LocationType = 'Warehouse';
        locChennai.IsInventoryLocation = true;

        Schema.Location locBangalore = new Schema.Location();
        locBangalore.Name = 'MFG_Bangalore_RegionalHub';
        locBangalore.LocationType = 'Warehouse';
        locBangalore.IsInventoryLocation = true;

        Schema.Location locMumbai = new Schema.Location();
        locMumbai.Name = 'MFG_Mumbai_ServicePartDepot';
        locMumbai.LocationType = 'Warehouse';
        locMumbai.IsInventoryLocation = true;

        // Hyderabad — intentionally low stock for E1 over-allocation edge case
        Schema.Location locHyderabad = new Schema.Location();
        locHyderabad.Name = 'MFG_Hyderabad_StagingWarehouse';
        locHyderabad.LocationType = 'Warehouse';
        locHyderabad.IsInventoryLocation = true;

        insert new List<Schema.Location>{
            locPune, locChennai, locBangalore, locMumbai, locHyderabad
        };

        locPuneId       = locPune.Id;
        locChennaiId    = locChennai.Id;
        locBangaloreId  = locBangalore.Id;
        locMumbaiId     = locMumbai.Id;
        locHyderabadId  = locHyderabad.Id;

        System.debug('  locPune      (Pune Mfg Plant)            = ' + locPuneId);
        System.debug('  locChennai   (Chennai Distribution)      = ' + locChennaiId);
        System.debug('  locBangalore (Bangalore Regional Hub)    = ' + locBangaloreId);
        System.debug('  locMumbai    (Mumbai Service Depot)      = ' + locMumbaiId);
        System.debug('  locHyderabad (Hyderabad Staging, LOW!)   = ' + locHyderabadId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. PRODUCT ITEMS
    // Inventory stock per product per location
    // ─────────────────────────────────────────────────────────────────────────
    private static void createProductItems() {
        System.debug('\n[Step 3] Creating ProductItems...');

        // Hydraulic Pump — 3 locations (S1 single, S2 multi, E1 low-stock)
        ProductItem piPumpPune = new ProductItem(
            Product2Id = pHydPumpId, LocationId = locPuneId, QuantityOnHand = 150
        );
        ProductItem piPumpChennai = new ProductItem(
            Product2Id = pHydPumpId, LocationId = locChennaiId, QuantityOnHand = 80
        );
        ProductItem piPumpHyderabad = new ProductItem(  // 8 units only — E1 over-alloc
            Product2Id = pHydPumpId, LocationId = locHyderabadId, QuantityOnHand = 8
        );

        // Hydraulic Fluid — 2 locations (S3 single batch, S4 multi batch, D4)
        // QOH=0: platform derives available qty from ProductBatchItem.RemainingQuantity
        // Actual stock is captured per batch via ProductionBatch + ProductBatchItem records
        ProductItem piFluidPune = new ProductItem(
            Product2Id = pHydFluidId, LocationId = locPuneId, QuantityOnHand = 0
        );
        ProductItem piFluidChennai = new ProductItem(
            Product2Id = pHydFluidId, LocationId = locChennaiId, QuantityOnHand = 0
        );

        // Servo Motor — 2 locations (S5 serial non-batch, D6, E2, E3)
        // QOH=0: platform auto-increments QOH as SerializedProduct records are linked to this PI
        ProductItem piMotorBangalore = new ProductItem(
            Product2Id = pServoMotorId, LocationId = locBangaloreId, QuantityOnHand = 0
        );
        ProductItem piMotorMumbai = new ProductItem(
            Product2Id = pServoMotorId, LocationId = locMumbaiId, QuantityOnHand = 0
        );

        // PLC Unit — Pune (S6, S7 serial+batch, D5)
        // QOH=0: driven by SerializedProduct associations (Lot-A + Lot-B)
        ProductItem piPLCPune = new ProductItem(
            Product2Id = pPLCUnitId, LocationId = locPuneId, QuantityOnHand = 0
        );

        // Pressure Valve — 2 locations (S8 mixed, S9 inline dealloc, D7)
        // Pune  : standard non-serialized stock — QOH set explicitly
        // Bangalore : serialized stock — QOH=0, driven by SerializedProduct associations
        ProductItem piValvePune = new ProductItem(
            Product2Id = pPressureValveId, LocationId = locPuneId, QuantityOnHand = 200
        );
        ProductItem piValveBangalore = new ProductItem(
            Product2Id = pPressureValveId, LocationId = locBangaloreId, QuantityOnHand = 0
        );

        // Ball Bearing — Chennai (G7 pagination: 12 order lines)
        ProductItem piBearingChennai = new ProductItem(
            Product2Id = pBearingId, LocationId = locChennaiId, QuantityOnHand = 5000
        );

        insert new List<ProductItem>{
            piPumpPune, piPumpChennai, piPumpHyderabad,
            piFluidPune, piFluidChennai,
            piMotorBangalore, piMotorMumbai,
            piPLCPune,
            piValvePune, piValveBangalore,
            piBearingChennai
        };

        piPumpPuneId       = piPumpPune.Id;
        piPumpChennaiId    = piPumpChennai.Id;
        piPumpHyderabadId  = piPumpHyderabad.Id;
        piFluidPuneId      = piFluidPune.Id;
        piFluidChennaiId   = piFluidChennai.Id;
        piMotorBangaloreId = piMotorBangalore.Id;
        piMotorMumbaiId    = piMotorMumbai.Id;
        piPLCPuneId        = piPLCPune.Id;
        piValvePuneId      = piValvePune.Id;
        piValveBangaloreId = piValveBangalore.Id;
        piBearingChennaiId = piBearingChennai.Id;

        System.debug('  piPumpPune       QOH=150  = ' + piPumpPuneId);
        System.debug('  piPumpChennai    QOH=80   = ' + piPumpChennaiId);
        System.debug('  piPumpHyderabad  QOH=8    = ' + piPumpHyderabadId + '  ← E1: allocate 25, only 8 avail');
        System.debug('  piFluidPune      QOH=0    = ' + piFluidPuneId    + '  (batched — stock via ProductBatchItem: Q1A=200, Q1B=300)');
        System.debug('  piFluidChennai   QOH=0    = ' + piFluidChennaiId + '  (batched — stock via ProductBatchItem: Q2A=300)');
        System.debug('  piMotorBangalore QOH=0    = ' + piMotorBangaloreId + '  (serialized — QOH driven by SP records)');
        System.debug('  piMotorMumbai    QOH=0    = ' + piMotorMumbaiId    + '  (serialized — QOH driven by SP records)');
        System.debug('  piPLCPune        QOH=0    = ' + piPLCPuneId        + '  (serialized — QOH driven by SP records)');
        System.debug('  piValvePune      QOH=200  = ' + piValvePuneId      + '  (standard non-serialized stock)');
        System.debug('  piValveBangalore QOH=0    = ' + piValveBangaloreId + '  (serialized — QOH driven by SP records)');
        System.debug('  piBearingChennai QOH=5000 = ' + piBearingChennaiId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. PRODUCTION BATCHES + PRODUCT BATCH ITEMS
    //
    // Applies to:
    //   Hydraulic Fluid HF-46  — batched non-serialized (S3, S4, D4)
    //   PLC Control Unit CU-3000 — batched + serialized  (S6, S7, D5)
    //
    // Pattern:
    //   ProductionBatch  — defines the lot (UniqueIdentificationNumber, ExpirationDate)
    //   ProductBatchItem — links ProductionBatch → ProductItem (qty at that location)
    //   SerializedProduct.ProductionBatchId — links each unit to its parent batch
    //
    // Constraint: ProductionBatch.ProductId must match ProductItem.Product2Id
    // ─────────────────────────────────────────────────────────────────────────
    private static void createProductionBatchesAndItems() {
        System.debug('\n[Step 4] Creating ProductionBatches and ProductBatchItems...');

        createHydFluidBatches();
        createPLCBatches();
    }

    // ── Hydraulic Fluid — 3 batches across 2 locations ──
    // LOT-HF-2025-Q1A : Pune,    expires Apr-2026 (near-expiry — FEFO first pick)
    // LOT-HF-2025-Q1B : Pune,    expires Oct-2026 (standard shelf life)
    // LOT-HF-2025-Q2A : Chennai, expires Jun-2026
    private static void createHydFluidBatches() {
        ProductionBatch pbQ1A = new ProductionBatch();
        pbQ1A.ProductId                = pHydFluidId;
        pbQ1A.UniqueIdentificationNumber = 'LOT-HF-2025-Q1A';
        pbQ1A.BatchCreatedDate         = Date.newInstance(2025, 1, 10);
        pbQ1A.ManufacturedDate         = Date.newInstance(2025, 1, 10);
        pbQ1A.ExpirationDate           = Date.newInstance(2026, 4, 30); // expires soon — FEFO priority
        pbQ1A.Description              = 'Hydraulic Fluid HF-46, Pune Plant, Batch Q1-A 2025. Near-expiry — prioritise for dispatch.';
        pbQ1A.IsActive                 = true;

        ProductionBatch pbQ1B = new ProductionBatch();
        pbQ1B.ProductId                = pHydFluidId;
        pbQ1B.UniqueIdentificationNumber = 'LOT-HF-2025-Q1B';
        pbQ1B.BatchCreatedDate         = Date.newInstance(2025, 3, 5);
        pbQ1B.ManufacturedDate         = Date.newInstance(2025, 3, 5);
        pbQ1B.ExpirationDate           = Date.newInstance(2026, 10, 31);
        pbQ1B.Description              = 'Hydraulic Fluid HF-46, Pune Plant, Batch Q1-B 2025. Standard shelf-life stock.';
        pbQ1B.IsActive                 = true;

        ProductionBatch pbQ2A = new ProductionBatch();
        pbQ2A.ProductId                = pHydFluidId;
        pbQ2A.UniqueIdentificationNumber = 'LOT-HF-2025-Q2A';
        pbQ2A.BatchCreatedDate         = Date.newInstance(2025, 4, 15);
        pbQ2A.ManufacturedDate         = Date.newInstance(2025, 4, 15);
        pbQ2A.ExpirationDate           = Date.newInstance(2026, 6, 30);
        pbQ2A.Description              = 'Hydraulic Fluid HF-46, Chennai Distribution Centre, Batch Q2-A 2025.';
        pbQ2A.IsActive                 = true;

        insert new List<ProductionBatch>{ pbQ1A, pbQ1B, pbQ2A };
        pbHydFluidLotQ1AId = pbQ1A.Id;
        pbHydFluidLotQ1BId = pbQ1B.Id;
        pbHydFluidLotQ2AId = pbQ2A.Id;

        System.debug('  ProductionBatch — Hydraulic Fluid:');
        System.debug('    LOT-HF-2025-Q1A (Pune,    exp Apr-2026, FEFO) = ' + pbHydFluidLotQ1AId);
        System.debug('    LOT-HF-2025-Q1B (Pune,    exp Oct-2026)       = ' + pbHydFluidLotQ1BId);
        System.debug('    LOT-HF-2025-Q2A (Chennai, exp Jun-2026)       = ' + pbHydFluidLotQ2AId);

        // ProductBatchItems — each links one batch to one ProductItem at its location
        ProductBatchItem pbiQ1A_Pune = new ProductBatchItem();
        pbiQ1A_Pune.ProductionBatchId  = pbHydFluidLotQ1AId;
        pbiQ1A_Pune.ProductItemId      = piFluidPuneId;     // Pune ProductItem for Hydraulic Fluid
        pbiQ1A_Pune.RemainingQuantity  = 200;               // 200 drums of LOT-Q1A at Pune
        pbiQ1A_Pune.IsActive           = true;

        ProductBatchItem pbiQ1B_Pune = new ProductBatchItem();
        pbiQ1B_Pune.ProductionBatchId  = pbHydFluidLotQ1BId;
        pbiQ1B_Pune.ProductItemId      = piFluidPuneId;
        pbiQ1B_Pune.RemainingQuantity  = 300;               // 300 drums of LOT-Q1B at Pune
        pbiQ1B_Pune.IsActive           = true;

        ProductBatchItem pbiQ2A_Chennai = new ProductBatchItem();
        pbiQ2A_Chennai.ProductionBatchId = pbHydFluidLotQ2AId;
        pbiQ2A_Chennai.ProductItemId     = piFluidChennaiId; // Chennai ProductItem for Hydraulic Fluid
        pbiQ2A_Chennai.RemainingQuantity = 300;              // 300 drums of LOT-Q2A at Chennai
        pbiQ2A_Chennai.IsActive          = true;

        insert new List<ProductBatchItem>{ pbiQ1A_Pune, pbiQ1B_Pune, pbiQ2A_Chennai };
        pbiFluidQ1A_PuneId    = pbiQ1A_Pune.Id;
        pbiFluidQ1B_PuneId    = pbiQ1B_Pune.Id;
        pbiFluidQ2A_ChennaiId = pbiQ2A_Chennai.Id;

        System.debug('  ProductBatchItem — Hydraulic Fluid:');
        System.debug('    LOT-Q1A → piFluidPune    RemainingQty=200 = ' + pbiFluidQ1A_PuneId);
        System.debug('    LOT-Q1B → piFluidPune    RemainingQty=300 = ' + pbiFluidQ1B_PuneId);
        System.debug('    LOT-Q2A → piFluidChennai RemainingQty=300 = ' + pbiFluidQ2A_ChennaiId);
    }

    // ── PLC Control Unit — 2 batches at Pune ──
    // LOT-PLC-2025-LTA : Lot-A, paired with LTA-001..004 serialized products
    // LOT-PLC-2025-LTB : Lot-B, paired with LTB-001..003 serialized products
    private static void createPLCBatches() {
        ProductionBatch pbLotA = new ProductionBatch();
        pbLotA.ProductId                = pPLCUnitId;
        pbLotA.UniqueIdentificationNumber = 'LOT-PLC-2025-LTA';
        pbLotA.BatchCreatedDate         = Date.newInstance(2025, 2, 1);
        pbLotA.ManufacturedDate         = Date.newInstance(2025, 2, 1);
        pbLotA.ExpirationDate           = Date.newInstance(2030, 12, 31); // electronics — long life
        pbLotA.Description              = 'PLC CU-3000 Lot-A 2025, Pune Manufacturing Plant. Units LTA-001 to LTA-004.';
        pbLotA.IsActive                 = true;

        ProductionBatch pbLotB = new ProductionBatch();
        pbLotB.ProductId                = pPLCUnitId;
        pbLotB.UniqueIdentificationNumber = 'LOT-PLC-2025-LTB';
        pbLotB.BatchCreatedDate         = Date.newInstance(2025, 5, 15);
        pbLotB.ManufacturedDate         = Date.newInstance(2025, 5, 15);
        pbLotB.ExpirationDate           = Date.newInstance(2030, 12, 31);
        pbLotB.Description              = 'PLC CU-3000 Lot-B 2025, Pune Manufacturing Plant. Units LTB-001 to LTB-003.';
        pbLotB.IsActive                 = true;

        insert new List<ProductionBatch>{ pbLotA, pbLotB };
        pbPLCLotAId = pbLotA.Id;
        pbPLCLotBId = pbLotB.Id;

        System.debug('  ProductionBatch — PLC Unit:');
        System.debug('    LOT-PLC-2025-LTA (Lot-A, 4 units) = ' + pbPLCLotAId);
        System.debug('    LOT-PLC-2025-LTB (Lot-B, 3 units) = ' + pbPLCLotBId);

        // ProductBatchItems — link each batch to piPLCPune
        ProductBatchItem pbiLotA = new ProductBatchItem();
        pbiLotA.ProductionBatchId = pbPLCLotAId;
        pbiLotA.ProductItemId     = piPLCPuneId;  // Pune ProductItem for PLC
        pbiLotA.RemainingQuantity = 4;            // 4 serialized units in Lot-A
        pbiLotA.IsActive          = true;

        ProductBatchItem pbiLotB = new ProductBatchItem();
        pbiLotB.ProductionBatchId = pbPLCLotBId;
        pbiLotB.ProductItemId     = piPLCPuneId;
        pbiLotB.RemainingQuantity = 3;            // 3 serialized units in Lot-B
        pbiLotB.IsActive          = true;

        insert new List<ProductBatchItem>{ pbiLotA, pbiLotB };
        pbiPLCLotA_PuneId = pbiLotA.Id;
        pbiPLCLotB_PuneId = pbiLotB.Id;

        System.debug('  ProductBatchItem — PLC Unit:');
        System.debug('    LOT-LTA → piPLCPune RemainingQty=4 = ' + pbiPLCLotA_PuneId);
        System.debug('    LOT-LTB → piPLCPune RemainingQty=3 = ' + pbiPLCLotB_PuneId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. SERIALIZED PRODUCTS
    // Serial format: <ProductCode>-<Site>-<Year>-<Seq>
    // ─────────────────────────────────────────────────────────────────────────
    private static void createSerializedProducts() {
        System.debug('\n[Step 5] Creating SerializedProducts...');

        createServoMotorsBangalore();
        createServoMotorsMumbai();
        createPLCUnitsLotA();
        createPLCUnitsLotB();
        createPressureValvesBangalore();
    }

    // Servo Motor — Bangalore, Non-Batched
    // SM-BLR-2025-001 to 006 : Available (S5 allocation pool)
    // SM-BLR-2025-007        : Available (E2: allocate first, then attempt re-allocation)
    // SM-BLR-2025-008        : Consumed  (E3: invalid status — allocation must fail)
    private static void createServoMotorsBangalore() {
        List<SerializedProduct> motors = new List<SerializedProduct>();
        for (Integer i = 1; i <= 6; i++) {
            SerializedProduct sp = new SerializedProduct();
            sp.SerialNumber  = 'SM-BLR-2025-' + String.valueOf(i).leftPad(3, '0');
            sp.Product2Id    = pServoMotorId;
            sp.ProductItemId = piMotorBangaloreId;
            sp.Status        = 'Available';
            motors.add(sp);
        }
        SerializedProduct spE2 = new SerializedProduct();
        spE2.SerialNumber  = 'SM-BLR-2025-007';
        spE2.Product2Id    = pServoMotorId;
        spE2.ProductItemId = piMotorBangaloreId;
        spE2.Status        = 'Available';

        SerializedProduct spE3 = new SerializedProduct();
        spE3.SerialNumber  = 'SM-BLR-2025-008';
        spE3.Product2Id    = pServoMotorId;
        spE3.ProductItemId = piMotorBangaloreId;
        spE3.Status        = 'Consumed';

        motors.add(spE2);
        motors.add(spE3);
        insert motors;

        spMotor001Id = motors[0].Id; spMotor002Id = motors[1].Id;
        spMotor003Id = motors[2].Id; spMotor004Id = motors[3].Id;
        spMotor005Id = motors[4].Id; spMotor006Id = motors[5].Id;
        spMotorE2Id  = motors[6].Id;
        spMotorE3Id  = motors[7].Id;

        System.debug('  Servo Motor BLR (non-batched):');
        for (Integer i = 0; i < motors.size(); i++) {
            String note = '';
            if (i == 6) note = '  ← E2: allocate to oiS5 first, then try again with oiE2';
            if (i == 7) note = '  ← E3: Consumed — allocation must fail';
            System.debug('    ' + motors[i].SerialNumber + ' = ' + motors[i].Id + ' [' + motors[i].Status + ']' + note);
        }
    }

    // Servo Motor — Mumbai, Non-Batched  (D6: serial non-batch deallocation)
    private static void createServoMotorsMumbai() {
        List<SerializedProduct> motors = new List<SerializedProduct>();
        String[] serials = new String[]{'SM-MUM-2025-001','SM-MUM-2025-002','SM-MUM-2025-003'};
        for (String sn : serials) {
            SerializedProduct sp = new SerializedProduct();
            sp.SerialNumber  = sn;
            sp.Product2Id    = pServoMotorId;
            sp.ProductItemId = piMotorMumbaiId;
            sp.Status        = 'Available';
            motors.add(sp);
        }
        insert motors;
        spMotorMum001Id = motors[0].Id;
        spMotorMum002Id = motors[1].Id;
        spMotorMum003Id = motors[2].Id;
        System.debug('  Servo Motor MUM (D6 dealloc): '
            + motors[0].SerialNumber + '=' + spMotorMum001Id + ', '
            + motors[1].SerialNumber + '=' + spMotorMum002Id + ', '
            + motors[2].SerialNumber + '=' + spMotorMum003Id);
    }

    // PLC Unit — Pune, Lot-A  (S6: serialized batched via batchItemId)
    // Serial format: PLC-PNE-2025-LTA-NNN
    // PLC Unit — Pune, Lot-A  (S6: serialized batched via batchItemId)
    // ProductionBatchId = pbPLCLotAId (LOT-PLC-2025-LTA, created in Step 4)
    private static void createPLCUnitsLotA() {
        List<SerializedProduct> plcs = new List<SerializedProduct>();
        String[] serials = new String[]{
            'PLC-PNE-2025-LTA-001','PLC-PNE-2025-LTA-002',
            'PLC-PNE-2025-LTA-003','PLC-PNE-2025-LTA-004'
        };
        for (String sn : serials) {
            SerializedProduct sp = new SerializedProduct();
            sp.SerialNumber      = sn;
            sp.Product2Id        = pPLCUnitId;
            sp.ProductItemId     = piPLCPuneId;
            sp.ProductionBatchId = pbPLCLotAId;  // links to LOT-PLC-2025-LTA
            sp.Status            = 'Available';
            plcs.add(sp);
        }
        insert plcs;
        spPLCLotA001Id = plcs[0].Id; spPLCLotA002Id = plcs[1].Id;
        spPLCLotA003Id = plcs[2].Id; spPLCLotA004Id = plcs[3].Id;
        System.debug('  PLC Lot-A Pune (S6 batchItemId / D5) → ProductionBatch=' + pbPLCLotAId + ':');
        for (SerializedProduct sp : plcs) System.debug('    ' + sp.SerialNumber + ' = ' + sp.Id);
    }

    // PLC Unit — Pune, Lot-B  (S7: serialized batched via batchId)
    // ProductionBatchId = pbPLCLotBId (LOT-PLC-2025-LTB, created in Step 4)
    private static void createPLCUnitsLotB() {
        List<SerializedProduct> plcs = new List<SerializedProduct>();
        String[] serials = new String[]{
            'PLC-PNE-2025-LTB-001','PLC-PNE-2025-LTB-002','PLC-PNE-2025-LTB-003'
        };
        for (String sn : serials) {
            SerializedProduct sp = new SerializedProduct();
            sp.SerialNumber      = sn;
            sp.Product2Id        = pPLCUnitId;
            sp.ProductItemId     = piPLCPuneId;
            sp.ProductionBatchId = pbPLCLotBId;  // links to LOT-PLC-2025-LTB
            sp.Status            = 'Available';
            plcs.add(sp);
        }
        insert plcs;
        spPLCLotB001Id = plcs[0].Id; spPLCLotB002Id = plcs[1].Id; spPLCLotB003Id = plcs[2].Id;
        System.debug('  PLC Lot-B Pune (S7 batchId) → ProductionBatch=' + pbPLCLotBId + ':');
        for (SerializedProduct sp : plcs) System.debug('    ' + sp.SerialNumber + ' = ' + sp.Id);
    }

    // Pressure Valve — Bangalore, Non-Batched  (S8 mixed + D7 mixed dealloc)
    private static void createPressureValvesBangalore() {
        List<SerializedProduct> valves = new List<SerializedProduct>();
        String[] serials = new String[]{
            'PRV-BLR-2025-001','PRV-BLR-2025-002','PRV-BLR-2025-003','PRV-BLR-2025-004'
        };
        for (String sn : serials) {
            SerializedProduct sp = new SerializedProduct();
            sp.SerialNumber  = sn;
            sp.Product2Id    = pPressureValveId;
            sp.ProductItemId = piValveBangaloreId;
            sp.Status        = 'Available';
            valves.add(sp);
        }
        insert valves;
        spValve001Id = valves[0].Id; spValve002Id = valves[1].Id;
        spValve003Id = valves[2].Id; spValve004Id = valves[3].Id;
        System.debug('  Pressure Valve BLR (S8/D7):');
        for (SerializedProduct sp : valves) System.debug('    ' + sp.SerialNumber + ' = ' + sp.Id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. ORDERS
    // Customer: Acme Engineering Pvt. Ltd.
    // Order naming: ACME-SO-YYYY-NNNN
    // ─────────────────────────────────────────────────────────────────────────
    private static void createOrders() {
        System.debug('\n[Step 6] Creating Orders...');

        Order ordHappyPath = new Order();
        ordHappyPath.Name          = 'ACME-SO-2025-0047';
        ordHappyPath.AccountId     = acctId;
        ordHappyPath.Status        = 'Draft';
        ordHappyPath.EffectiveDate = Date.today();
        ordHappyPath.Pricebook2Id  = pbId;
        ordHappyPath.Description   = 'Happy Path scenarios S1–S9 — standard, batch, serial, mixed allocations';

        Order ordEdgeCases = new Order();
        ordEdgeCases.Name          = 'ACME-SO-2025-0048';
        ordEdgeCases.AccountId     = acctId;
        ordEdgeCases.Status        = 'Draft';
        ordEdgeCases.EffectiveDate = Date.today();
        ordEdgeCases.Pricebook2Id  = pbId;
        ordEdgeCases.Description   = 'Edge Case scenarios E1–E7 — over-allocation, invalid status, wrong location, zero qty';

        Order ordDeallocation = new Order();
        ordDeallocation.Name          = 'ACME-SO-2025-0049';
        ordDeallocation.AccountId     = acctId;
        ordDeallocation.Status        = 'Draft';
        ordDeallocation.EffectiveDate = Date.today();
        ordDeallocation.Pricebook2Id  = pbId;
        ordDeallocation.Description   = 'Deallocation D1–D7 and Get Allocation G1–G6 status scenarios';

        Order ordPagination = new Order();
        ordPagination.Name          = 'ACME-SO-2025-0050';
        ordPagination.AccountId     = acctId;
        ordPagination.Status        = 'Draft';
        ordPagination.EffectiveDate = Date.today();
        ordPagination.Pricebook2Id  = pbId;
        ordPagination.Description   = 'G7 Pagination — 12 line items to test multi-page GET allocation response';

        insert new List<Order>{ ordHappyPath, ordEdgeCases, ordDeallocation, ordPagination };

        ordHappyPathId    = ordHappyPath.Id;
        ordEdgeCasesId    = ordEdgeCases.Id;
        ordDeallocationId = ordDeallocation.Id;
        ordPaginationId   = ordPagination.Id;

        System.debug('  ordHappyPath    [ACME-SO-2025-0047] = ' + ordHappyPathId);
        System.debug('  ordEdgeCases    [ACME-SO-2025-0048] = ' + ordEdgeCasesId);
        System.debug('  ordDeallocation [ACME-SO-2025-0049] = ' + ordDeallocationId);
        System.debug('  ordPagination   [ACME-SO-2025-0050] = ' + ordPaginationId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. ORDER ITEMS
    // ─────────────────────────────────────────────────────────────────────────
    private static void createOrderItems() {
        System.debug('\n[Step 7] Creating OrderItems...');

        List<OrderItem> allItems = new List<OrderItem>();
        allItems.addAll(buildHappyPathItems());
        allItems.addAll(buildEdgeCaseItems());
        allItems.addAll(buildDeallocationItems());
        allItems.addAll(buildPaginationItems());

        insert allItems;

        // Assign to named variables (order matches the lists returned below)
        oiS1Id = allItems[0].Id;  oiS2Id = allItems[1].Id;  oiS3Id = allItems[2].Id;
        oiS4Id = allItems[3].Id;  oiS5Id = allItems[4].Id;  oiS6Id = allItems[5].Id;
        oiS7Id = allItems[6].Id;  oiS8Id = allItems[7].Id;  oiS9Id = allItems[8].Id;

        oiE1Id = allItems[9].Id;  oiE2Id = allItems[10].Id; oiE3Id = allItems[11].Id;
        oiE4Id = allItems[12].Id; oiE5Id = allItems[13].Id;

        oiD1Id = allItems[14].Id; oiD2Id = allItems[15].Id; oiD3Id = allItems[16].Id;
        oiD4Id = allItems[17].Id; oiD5Id = allItems[18].Id; oiD6Id = allItems[19].Id;
        oiD7Id = allItems[20].Id; oiG2Id = allItems[21].Id; oiG3Id = allItems[22].Id;
        oiG5Id = allItems[23].Id; oiG6Id = allItems[24].Id;
        // allItems[25]–[36] are pagination items

        System.debug('  ' + allItems.size() + ' OrderItems created.');
    }

    // Happy Path order items
    private static List<OrderItem> buildHappyPathItems() {
        List<OrderItem> items = new List<OrderItem>();

        // S1: Single-location — 40 Hydraulic Pumps from Pune
        items.add(buildItem(ordHappyPathId, pHydPumpId, 40, 18500.00,
            'S1: Single-location | allocate 40 Pumps from Pune (piPumpPune)'));

        // S2: Multi-location — 120 Pumps: Pune(80) + Chennai(40)
        items.add(buildItem(ordHappyPathId, pHydPumpId, 120, 18500.00,
            'S2: Multi-location  | 80 from Pune + 40 from Chennai'));

        // S3: Single batch — 60 Fluid drums, LOT-2025-Q1A, Pune
        items.add(buildItem(ordHappyPathId, pHydFluidId, 60, 4200.00,
            'S3: Single batch    | 60 drums LOT-2025-Q1A from Pune'));

        // S4: Multi batch — 150 Fluid drums: LOT-2025-Q1A(80) + LOT-2025-Q1B(70), Pune
        items.add(buildItem(ordHappyPathId, pHydFluidId, 150, 4200.00,
            'S4: Multi batch     | LOT-2025-Q1A(80) + LOT-2025-Q1B(70) from Pune'));

        // S5: Serialized non-batched — 3 Servo Motors: SM-BLR-001/002/003, Bangalore
        items.add(buildItem(ordHappyPathId, pServoMotorId, 3, 95000.00,
            'S5: Serial non-batch| SM-BLR-2025-001/002/003 from Bangalore'));

        // S6: Serialized + batched via batchItemId — 2 PLC Units, Lot-A, Pune
        items.add(buildItem(ordHappyPathId, pPLCUnitId, 2, 145000.00,
            'S6: Serial+batch batchItemId | PLC-PNE-LTA-001/002 from Pune'));

        // S7: Serialized + batched via batchId — 3 PLC Units, Lot-B, Pune
        items.add(buildItem(ordHappyPathId, pPLCUnitId, 3, 145000.00,
            'S7: Serial+batch batchId     | PLC-PNE-LTB-001/002/003 from Pune (system derives batchItemId)'));

        // S8: Mixed — all 4 patterns in single API call
        //   Valve (standard from Pune) + serial Valves (from Bangalore)
        items.add(buildItem(ordHappyPathId, pPressureValveId, 8, 8750.00,
            'S8: Mixed all patterns | std Pune(4) + serial BLR(4): PRV-BLR-001/002/003/004'));

        // S9: Inline deallocation — allocate Chennai, dealloc Pune, in same request
        items.add(buildItem(ordHappyPathId, pHydPumpId, 20, 18500.00,
            'S9: Inline dealloc  | allocations:[Chennai 20] + deallocationLocationIds:[Pune]'));

        return items;
    }

    // Edge case order items
    private static List<OrderItem> buildEdgeCaseItems() {
        List<OrderItem> items = new List<OrderItem>();

        // E1: Over-allocation — request 25 from Hyderabad (QOH=8 only)
        items.add(buildItem(ordEdgeCasesId, pHydPumpId, 25, 18500.00,
            'E1: Over-alloc | Request 25 from piPumpHyderabad (QOH=8) → EXPECT ERROR'));

        // E2: Re-allocate already-allocated serial (allocate SM-BLR-007 to S5 first)
        items.add(buildItem(ordEdgeCasesId, pServoMotorId, 1, 95000.00,
            'E2: Already-alloc serial | Use SM-BLR-2025-007 after it is allocated to oiS5 → EXPECT ERROR'));

        // E3: Serialized product in Consumed status
        items.add(buildItem(ordEdgeCasesId, pServoMotorId, 1, 95000.00,
            'E3: Consumed SP | unbatchedSerializedProductIds=[SM-BLR-2025-008] → EXPECT ERROR'));

        // E4: BatchItem from wrong location (use piFluidChennai batchItemId with locPune)
        items.add(buildItem(ordEdgeCasesId, pHydFluidId, 10, 4200.00,
            'E4: Wrong-loc batchItem | piFluidChennai PBI + sourceLocationId=locPune → EXPECT ERROR'));

        // E5: Zero quantity in payload (OrderItem qty=1 required; send 0 in API)
        items.add(buildItem(ordEdgeCasesId, pHydPumpId, 1, 18500.00,
            'E5: Zero qty | Send allocatedQuantity=0 in allocation payload → EXPECT ERROR'));

        return items;
    }

    // Deallocation + Get Allocation order items
    private static List<OrderItem> buildDeallocationItems() {
        List<OrderItem> items = new List<OrderItem>();

        // D1: Full item-level deallocation
        items.add(buildItem(ordDeallocationId, pHydPumpId, 50, 18500.00,
            'D1: Item-level full dealloc | Allocate Pune+Chennai, then dealloc by sourceItemId only'));

        // D2: Location-level v260 format (sourceLocationIds array)
        items.add(buildItem(ordDeallocationId, pHydPumpId, 40, 18500.00,
            'D2: Location v260 | Allocate Pune+Chennai, dealloc Chennai via sourceLocationIds:[]'));

        // D3: Location-level v262 format (deallocations array)
        items.add(buildItem(ordDeallocationId, pHydPumpId, 35, 18500.00,
            'D3: Location v262 | Allocate Pune+Chennai, dealloc Pune via deallocations:[{sourceLocationId}]'));

        // D4: Batch non-serialized deallocation
        items.add(buildItem(ordDeallocationId, pHydFluidId, 80, 4200.00,
            'D4: Batch non-serial dealloc | Allocate LOT-Q1A at Pune, then dealloc by batchItemIds'));

        // D5: Batch + serialized deallocation
        items.add(buildItem(ordDeallocationId, pPLCUnitId, 2, 145000.00,
            'D5: Batch+serial dealloc | Allocate LTA-001/002, then dealloc by batchItemIds+serializedProductIds'));

        // D6: Serialized non-batched deallocation
        items.add(buildItem(ordDeallocationId, pServoMotorId, 2, 95000.00,
            'D6: Serial non-batch dealloc | Allocate SM-BLR-001/002, then dealloc by serializedProductIds'));

        // D7: Mixed deallocation (all 5 patterns in one request)
        items.add(buildItem(ordDeallocationId, pPressureValveId, 8, 8750.00,
            'D7: Mixed dealloc | item-level + location + batch + serial in single payload'));

        // G2: GET status = PARTIALLY_ALLOCATED (allocate 30 of 100)
        items.add(buildItem(ordDeallocationId, pHydPumpId, 100, 18500.00,
            'G2: GET PARTIALLY_ALLOCATED | Allocate 30 of 100 → status shows PARTIALLY_ALLOCATED'));

        // G3: GET status = FULLY_ALLOCATED
        items.add(buildItem(ordDeallocationId, pBearingId, 200, 145.00,
            'G3: GET FULLY_ALLOCATED | Allocate all 200 → status shows FULLY_ALLOCATED'));

        // G5: GET with batchReservations in response
        items.add(buildItem(ordDeallocationId, pHydFluidId, 50, 4200.00,
            'G5: GET batchReservations | Allocate by batch → verify batchReservations[] in GET response'));

        // G6: GET with instanceReservations in response
        items.add(buildItem(ordDeallocationId, pServoMotorId, 2, 95000.00,
            'G6: GET instanceReservations | Allocate serials → verify instanceReservations[] in GET response'));

        return items;
    }

    // Pagination order items — 12 ball bearing lines for G7
    private static List<OrderItem> buildPaginationItems() {
        List<OrderItem> items = new List<OrderItem>();
        Integer[] qtys = new Integer[]{500,450,400,350,300,250,200,150,100,75,50,25};
        for (Integer i = 0; i < 12; i++) {
            items.add(buildItem(ordPaginationId, pBearingId, qtys[i], 145.00,
                'G7: Pagination LINE-' + String.valueOf(i+1).leftPad(2,'0') + ' | Bearing qty=' + qtys[i]));
        }
        return items;
    }

    // Factory helper
    private static OrderItem buildItem(Id ordId, Id prodId, Integer qty, Decimal price, String description) {
        OrderItem oi = new OrderItem();
        oi.OrderId          = ordId;
        oi.Product2Id       = prodId;
        oi.PricebookEntryId = prodToPbeMap.get(prodId);
        oi.Quantity         = qty;
        oi.UnitPrice        = price;
        oi.Description      = description;
        return oi;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY — full reference card for API payload construction
    // ─────────────────────────────────────────────────────────────────────────
    private static void printSummary() {
        System.debug('\n══════════════════════════════════════════════════════════════');
        System.debug('API PAYLOAD REFERENCE CARD');
        System.debug('══════════════════════════════════════════════════════════════');

        System.debug('\n─── ORDERS (sourceId) ───');
        System.debug('Happy Path    S1–S9  = ' + ordHappyPathId    + '  [ACME-SO-2025-0047]');
        System.debug('Edge Cases    E1–E7  = ' + ordEdgeCasesId    + '  [ACME-SO-2025-0048]');
        System.debug('Deallocation  D1–G6  = ' + ordDeallocationId + '  [ACME-SO-2025-0049]');
        System.debug('Pagination    G7     = ' + ordPaginationId   + '  [ACME-SO-2025-0050]');
        System.debug('Invalid Order E6     = 801000000000000AAA  [non-existent]');

        System.debug('\n─── LOCATIONS (sourceLocationId) ───');
        System.debug('Pune       = ' + locPuneId);
        System.debug('Chennai    = ' + locChennaiId);
        System.debug('Bangalore  = ' + locBangaloreId);
        System.debug('Mumbai     = ' + locMumbaiId);
        System.debug('Hyderabad  = ' + locHyderabadId + '  ← LOW STOCK (QOH=8) for E1');

        System.debug('\n─── PRODUCTION BATCHES (UniqueIdentificationNumber → Id) ───');
        System.debug('Hydraulic Fluid Batches (use as batchId in Allocation API):');
        System.debug('  LOT-HF-2025-Q1A (Pune,    exp Apr-2026, FEFO) = ' + pbHydFluidLotQ1AId);
        System.debug('  LOT-HF-2025-Q1B (Pune,    exp Oct-2026)       = ' + pbHydFluidLotQ1BId);
        System.debug('  LOT-HF-2025-Q2A (Chennai, exp Jun-2026)       = ' + pbHydFluidLotQ2AId);
        System.debug('PLC Unit Batches:');
        System.debug('  LOT-PLC-2025-LTA (4 units, LTA-001..004)      = ' + pbPLCLotAId);
        System.debug('  LOT-PLC-2025-LTB (3 units, LTB-001..003)      = ' + pbPLCLotBId);

        System.debug('\n─── PRODUCT BATCH ITEMS (use as batchItemId in Allocation API) ───');
        System.debug('Hydraulic Fluid:');
        System.debug('  LOT-Q1A → piFluidPune    RemainingQty=200 = ' + pbiFluidQ1A_PuneId    + '  ← S3: single batch');
        System.debug('  LOT-Q1B → piFluidPune    RemainingQty=300 = ' + pbiFluidQ1B_PuneId    + '  ← S4: multi batch (pair with Q1A)');
        System.debug('  LOT-Q2A → piFluidChennai RemainingQty=300 = ' + pbiFluidQ2A_ChennaiId + '  ← D4: batch dealloc test');
        System.debug('PLC Unit:');
        System.debug('  LOT-LTA → piPLCPune RemainingQty=4 = ' + pbiPLCLotA_PuneId + '  ← S6: batchItemId + LTA serials');
        System.debug('  LOT-LTB → piPLCPune RemainingQty=3 = ' + pbiPLCLotB_PuneId + '  ← S7: batchId + LTB serials');

        System.debug('\n─── PRODUCT ITEMS (for Process Additional Txn API: P1/P2) ───');
        System.debug('piPumpPune       = ' + piPumpPuneId);
        System.debug('piFluidPune      = ' + piFluidPuneId);
        System.debug('piMotorBangalore = ' + piMotorBangaloreId);
        System.debug('piPumpHyderabad  = ' + piPumpHyderabadId + '  ← E1 low-stock PI');

        System.debug('\n─── SERIALIZED PRODUCTS ───');
        System.debug('Servo Motor BLR — Available pool (S5/D6):');
        System.debug('  SM-BLR-2025-001 = ' + spMotor001Id);
        System.debug('  SM-BLR-2025-002 = ' + spMotor002Id);
        System.debug('  SM-BLR-2025-003 = ' + spMotor003Id);
        System.debug('  SM-BLR-2025-004 = ' + spMotor004Id);
        System.debug('  SM-BLR-2025-005 = ' + spMotor005Id);
        System.debug('  SM-BLR-2025-006 = ' + spMotor006Id);
        System.debug('  SM-BLR-2025-007 = ' + spMotorE2Id  + '  ← E2: allocate once then re-try');
        System.debug('  SM-BLR-2025-008 = ' + spMotorE3Id  + '  ← E3: Consumed status');
        System.debug('Servo Motor MUM (D6):');
        System.debug('  SM-MUM-2025-001 = ' + spMotorMum001Id);
        System.debug('  SM-MUM-2025-002 = ' + spMotorMum002Id);
        System.debug('  SM-MUM-2025-003 = ' + spMotorMum003Id);
        System.debug('PLC Lot-A Pune (S6 batchItemId / D5):');
        System.debug('  PLC-PNE-2025-LTA-001 = ' + spPLCLotA001Id);
        System.debug('  PLC-PNE-2025-LTA-002 = ' + spPLCLotA002Id);
        System.debug('  PLC-PNE-2025-LTA-003 = ' + spPLCLotA003Id);
        System.debug('  PLC-PNE-2025-LTA-004 = ' + spPLCLotA004Id);
        System.debug('PLC Lot-B Pune (S7 batchId):');
        System.debug('  PLC-PNE-2025-LTB-001 = ' + spPLCLotB001Id);
        System.debug('  PLC-PNE-2025-LTB-002 = ' + spPLCLotB002Id);
        System.debug('  PLC-PNE-2025-LTB-003 = ' + spPLCLotB003Id);
        System.debug('Pressure Valve BLR (S8 mixed / D7):');
        System.debug('  PRV-BLR-2025-001 = ' + spValve001Id);
        System.debug('  PRV-BLR-2025-002 = ' + spValve002Id);
        System.debug('  PRV-BLR-2025-003 = ' + spValve003Id);
        System.debug('  PRV-BLR-2025-004 = ' + spValve004Id);

        System.debug('\n─── ORDER ITEMS (sourceItemId) ───');
        System.debug('S1  ' + oiS1Id + '  40 Pumps, single-location Pune');
        System.debug('S2  ' + oiS2Id + '  120 Pumps, multi-location Pune(80)+Chennai(40)');
        System.debug('S3  ' + oiS3Id + '  60 Fluid, single batch LOT-2025-Q1A Pune');
        System.debug('S4  ' + oiS4Id + '  150 Fluid, multi-batch LOT-Q1A(80)+LOT-Q1B(70)');
        System.debug('S5  ' + oiS5Id + '  3 Motors, serial non-batch SM-BLR-001/002/003');
        System.debug('S6  ' + oiS6Id + '  2 PLCs, serial+batch batchItemId=LotA Pune');
        System.debug('S7  ' + oiS7Id + '  3 PLCs, serial+batch batchId=LotB Pune');
        System.debug('S8  ' + oiS8Id + '  8 Valves, mixed (std Pune + serial BLR)');
        System.debug('S9  ' + oiS9Id + '  20 Pumps, inline dealloc Pune + alloc Chennai');
        System.debug('E1  ' + oiE1Id + '  25 Pumps from Hyderabad (QOH=8) → ERROR');
        System.debug('E2  ' + oiE2Id + '  Motor SM-BLR-007 (already allocated) → ERROR');
        System.debug('E3  ' + oiE3Id + '  Motor SM-BLR-008 (Consumed status) → ERROR');
        System.debug('E4  ' + oiE4Id + '  Fluid — wrong-location batchItem → ERROR');
        System.debug('E5  ' + oiE5Id + '  Pump — send allocatedQuantity=0 → ERROR');
        System.debug('E6  n/a — sourceId=801000000000000AAA (non-existent) → ERROR');
        System.debug('E7  n/a — sourceItemId=802000000000000AAA (non-existent) → ERROR');
        System.debug('D1  ' + oiD1Id + '  50 Pumps — full item-level dealloc');
        System.debug('D2  ' + oiD2Id + '  40 Pumps — location v260 dealloc');
        System.debug('D3  ' + oiD3Id + '  35 Pumps — location v262 dealloc');
        System.debug('D4  ' + oiD4Id + '  80 Fluid — batch non-serial dealloc');
        System.debug('D5  ' + oiD5Id + '  2 PLCs   — batch+serial dealloc');
        System.debug('D6  ' + oiD6Id + '  2 Motors — serial non-batch dealloc');
        System.debug('D7  ' + oiD7Id + '  8 Valves — mixed dealloc all patterns');
        System.debug('G1  n/a — query ordDeallocation BEFORE any allocation → NOT_ALLOCATED');
        System.debug('G2  ' + oiG2Id + '  100 Pumps — allocate 30 → PARTIALLY_ALLOCATED');
        System.debug('G3  ' + oiG3Id + '  200 Bearings — allocate all → FULLY_ALLOCATED');
        System.debug('G4  n/a — check quantityAllocationPending immediately after POST (before MQ)');
        System.debug('G5  ' + oiG5Id + '  50 Fluid  — batch alloc → batchReservations in GET');
        System.debug('G6  ' + oiG6Id + '  2 Motors  — serial alloc → instanceReservations in GET');
        System.debug('G7  GET /connect/inventory/allocation/' + ordPaginationId + '?pageNumber=1&pageSize=5');
        System.debug('    12 Bearing line items → 3 pages (5+5+2)');
        System.debug('E11 n/a — GET with orderId=801000000000000AAA → ERROR');

        System.debug('\n─── PROCESS ADDITIONAL TRANSACTION API ───');
        System.debug('P1  Valid   → productItemIds=[' + piPumpPuneId + ',' + piFluidPuneId + ']');
        System.debug('P2  Partial → productItemIds=[' + piPumpPuneId + ',0Co000000000000AAA]');
        System.debug('P3  Empty   → productItemIds=[]');
        System.debug('P4  Invalid → productItemIds=[0Co000000000000AAA,0Co111111111111AAA]');
    }

    // Custom exception
    public class MFGSetupException extends Exception {}
}
