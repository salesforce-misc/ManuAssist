/**
 * MFG_TestData_Part1_Products_Locations_ProductItems.apex
 *
 * Creates realistic Manufacturing Cloud test data:
 *   - Products (industrial automotive/mfg parts)
 *   - Warehouse Locations (Indian distribution network)
 *   - ProductItems (stock at each location)
 *
 * Run FIRST. Note all IDs printed at the end — paste into Part 2 and Part 3.
 *
 * Execute:
 *   sf apex run --file MFG_TestData_Part1_Products_Locations_ProductItems.apex --target-org mfg@sdb38.org
 */

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: PRODUCTS
// Industrial manufacturing parts — automotive / heavy equipment sector
// ─────────────────────────────────────────────────────────────────────────────

// Standard product (non-batched, non-serialized) — bulk commodity
Product2 pHydPump = new Product2(
    Name        = 'Hydraulic Pump Assembly HP-2000',
    ProductCode = 'HYD-PUMP-HP2000',
    Description = 'High-pressure hydraulic pump for industrial machinery. Non-serialized, non-batched.',
    IsActive    = true
);

// Batched product (non-serialized) — chemical / fluid lot-tracked
Product2 pHydFluid = new Product2(
    Name        = 'Hydraulic Fluid HF-46 (200L Drum)',
    ProductCode = 'HYD-FLUID-HF46-200L',
    Description = 'ISO VG 46 hydraulic oil. Batch-tracked by production lot for quality compliance.',
    IsActive    = true
);

// Serialized non-batched — high-value unit tracked equipment
Product2 pServoMotor = new Product2(
    Name        = 'Servo Motor SM-5KW-3PH',
    ProductCode = 'MOT-SERVO-5KW-3PH',
    Description = '5kW 3-phase servo motor. Individually serialized for warranty tracking. Non-batched.',
    IsActive    = true
);

// Serialized + batched — precision components with both lot and serial tracking
Product2 pPLCUnit = new Product2(
    Name        = 'PLC Control Unit CU-3000',
    ProductCode = 'PLC-CU3000',
    Description = 'Programmable Logic Controller. Batch-manufactured, each unit serialized for field traceability.',
    IsActive    = true
);

// Mixed product — used in complex multi-pattern allocation scenario
Product2 pPressureValve = new Product2(
    Name        = 'Pressure Relief Valve PRV-150',
    ProductCode = 'VLV-PRV150',
    Description = 'Spring-loaded pressure relief valve. Mix of standard and serialized stock depending on grade.',
    IsActive    = true
);

// Pagination product — lightweight standard part for bulk orders
Product2 pBearing = new Product2(
    Name        = 'Deep Groove Ball Bearing 6205-2RS',
    ProductCode = 'BRG-6205-2RS',
    Description = 'Standard sealed ball bearing. High volume, non-serialized, non-batched.',
    IsActive    = true
);

insert new List<Product2>{
    pHydPump, pHydFluid, pServoMotor, pPLCUnit, pPressureValve, pBearing
};

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('STEP 1 COMPLETE: Products');
System.debug('══════════════════════════════════════════════════════');
System.debug('pHydPump      (HP-2000 - Standard)        = ' + pHydPump.Id);
System.debug('pHydFluid     (HF-46 - Batched)           = ' + pHydFluid.Id);
System.debug('pServoMotor   (SM-5KW - Serial NonBatch)  = ' + pServoMotor.Id);
System.debug('pPLCUnit      (CU-3000 - Serial + Batch)  = ' + pPLCUnit.Id);
System.debug('pPressureValve(PRV-150 - Mixed)           = ' + pPressureValve.Id);
System.debug('pBearing      (6205-2RS - Pagination)     = ' + pBearing.Id);


// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: WAREHOUSE LOCATIONS
// Indian manufacturing & distribution network
// ─────────────────────────────────────────────────────────────────────────────

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
locMumbai.Name = 'MFG_Mumbai_ServiceParts_Depot';
locMumbai.LocationType = 'Warehouse';
locMumbai.IsInventoryLocation = true;

// Low-stock location — intentionally set with minimal inventory for E1 over-allocation edge case
Schema.Location locHyderabad = new Schema.Location();
locHyderabad.Name = 'MFG_Hyderabad_Staging_Warehouse';
locHyderabad.LocationType = 'Warehouse';
locHyderabad.IsInventoryLocation = true;

insert new List<Schema.Location>{
    locPune, locChennai, locBangalore, locMumbai, locHyderabad
};

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('STEP 2 COMPLETE: Locations');
System.debug('══════════════════════════════════════════════════════');
System.debug('locPune      (Pune Mfg Plant)          = ' + locPune.Id);
System.debug('locChennai   (Chennai Distribution)    = ' + locChennai.Id);
System.debug('locBangalore (Bangalore Regional Hub)  = ' + locBangalore.Id);
System.debug('locMumbai    (Mumbai Service Depot)    = ' + locMumbai.Id);
System.debug('locHyderabad (Hyderabad Staging - LOW) = ' + locHyderabad.Id);


// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: PRODUCT ITEMS
// Inventory stock levels per product per location
// ─────────────────────────────────────────────────────────────────────────────

// ── Hydraulic Pump (Standard) — multi-location for S1/S2/G2/G3 ──
ProductItem piPumpPune = new ProductItem(
    Product2Id    = pHydPump.Id,
    LocationId    = locPune.Id,
    QuantityOnHand = 150
);
ProductItem piPumpChennai = new ProductItem(
    Product2Id    = pHydPump.Id,
    LocationId    = locChennai.Id,
    QuantityOnHand = 80
);
// Low stock location — for E1 over-allocation edge case (only 8 units, will try to allocate 25)
ProductItem piPumpHyderabad = new ProductItem(
    Product2Id    = pHydPump.Id,
    LocationId    = locHyderabad.Id,
    QuantityOnHand = 8
);

// ── Hydraulic Fluid (Batched) — for S3/S4/D4 ──
ProductItem piFluidPune = new ProductItem(
    Product2Id    = pHydFluid.Id,
    LocationId    = locPune.Id,
    QuantityOnHand = 500
);
ProductItem piFluidChennai = new ProductItem(
    Product2Id    = pHydFluid.Id,
    LocationId    = locChennai.Id,
    QuantityOnHand = 300
);

// ── Servo Motor (Serialized Non-Batched) — for S5/D6/E2/E3 ──
ProductItem piMotorBangalore = new ProductItem(
    Product2Id    = pServoMotor.Id,
    LocationId    = locBangalore.Id,
    QuantityOnHand = 25
);
ProductItem piMotorMumbai = new ProductItem(
    Product2Id    = pServoMotor.Id,
    LocationId    = locMumbai.Id,
    QuantityOnHand = 15
);

// ── PLC Unit (Serialized + Batched) — for S6/S7/D5 ──
ProductItem piPLCPune = new ProductItem(
    Product2Id    = pPLCUnit.Id,
    LocationId    = locPune.Id,
    QuantityOnHand = 40
);

// ── Pressure Valve (Mixed) — for S8/S9/D7 ──
ProductItem piValvePune = new ProductItem(
    Product2Id    = pPressureValve.Id,
    LocationId    = locPune.Id,
    QuantityOnHand = 200
);
ProductItem piValveBangalore = new ProductItem(
    Product2Id    = pPressureValve.Id,
    LocationId    = locBangalore.Id,
    QuantityOnHand = 120
);

// ── Bearing (Pagination) — for G7 (12 order line items) ──
ProductItem piBearingChennai = new ProductItem(
    Product2Id    = pBearing.Id,
    LocationId    = locChennai.Id,
    QuantityOnHand = 5000
);

insert new List<ProductItem>{
    piPumpPune, piPumpChennai, piPumpHyderabad,
    piFluidPune, piFluidChennai,
    piMotorBangalore, piMotorMumbai,
    piPLCPune,
    piValvePune, piValveBangalore,
    piBearingChennai
};

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('STEP 3 COMPLETE: ProductItems');
System.debug('══════════════════════════════════════════════════════');
System.debug('── Hydraulic Pump (Standard) ──');
System.debug('piPumpPune       (QOH=150) = ' + piPumpPune.Id       + ' | LOC=' + locPune.Id);
System.debug('piPumpChennai    (QOH=80)  = ' + piPumpChennai.Id    + ' | LOC=' + locChennai.Id);
System.debug('piPumpHyderabad  (QOH=8)   = ' + piPumpHyderabad.Id  + ' | LOC=' + locHyderabad.Id + ' ← E1: allocate 25, only 8 avail');
System.debug('── Hydraulic Fluid (Batched) ──');
System.debug('piFluidPune      (QOH=500) = ' + piFluidPune.Id      + ' | LOC=' + locPune.Id);
System.debug('piFluidChennai   (QOH=300) = ' + piFluidChennai.Id   + ' | LOC=' + locChennai.Id);
System.debug('── Servo Motor (Serialized Non-Batched) ──');
System.debug('piMotorBangalore (QOH=25)  = ' + piMotorBangalore.Id + ' | LOC=' + locBangalore.Id);
System.debug('piMotorMumbai    (QOH=15)  = ' + piMotorMumbai.Id    + ' | LOC=' + locMumbai.Id);
System.debug('── PLC Unit (Serialized + Batched) ──');
System.debug('piPLCPune        (QOH=40)  = ' + piPLCPune.Id        + ' | LOC=' + locPune.Id);
System.debug('── Pressure Valve (Mixed) ──');
System.debug('piValvePune      (QOH=200) = ' + piValvePune.Id      + ' | LOC=' + locPune.Id);
System.debug('piValveBangalore (QOH=120) = ' + piValveBangalore.Id + ' | LOC=' + locBangalore.Id);
System.debug('── Ball Bearing (Pagination) ──');
System.debug('piBearingChennai (QOH=5000)= ' + piBearingChennai.Id + ' | LOC=' + locChennai.Id);

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('PART 1 COMPLETE — Record IDs for Part 2 & Part 3:');
System.debug('══════════════════════════════════════════════════════');
System.debug('PRODUCTS:');
System.debug('  pHydPump.Id       = ' + pHydPump.Id);
System.debug('  pHydFluid.Id      = ' + pHydFluid.Id);
System.debug('  pServoMotor.Id    = ' + pServoMotor.Id);
System.debug('  pPLCUnit.Id       = ' + pPLCUnit.Id);
System.debug('  pPressureValve.Id = ' + pPressureValve.Id);
System.debug('  pBearing.Id       = ' + pBearing.Id);
System.debug('LOCATIONS:');
System.debug('  locPune.Id        = ' + locPune.Id);
System.debug('  locChennai.Id     = ' + locChennai.Id);
System.debug('  locBangalore.Id   = ' + locBangalore.Id);
System.debug('  locMumbai.Id      = ' + locMumbai.Id);
System.debug('  locHyderabad.Id   = ' + locHyderabad.Id);
System.debug('PRODUCT ITEMS:');
System.debug('  piPumpPune.Id       = ' + piPumpPune.Id);
System.debug('  piPumpChennai.Id    = ' + piPumpChennai.Id);
System.debug('  piPumpHyderabad.Id  = ' + piPumpHyderabad.Id + '  ← E1 low-stock');
System.debug('  piFluidPune.Id      = ' + piFluidPune.Id);
System.debug('  piFluidChennai.Id   = ' + piFluidChennai.Id);
System.debug('  piMotorBangalore.Id = ' + piMotorBangalore.Id);
System.debug('  piMotorMumbai.Id    = ' + piMotorMumbai.Id);
System.debug('  piPLCPune.Id        = ' + piPLCPune.Id);
System.debug('  piValvePune.Id      = ' + piValvePune.Id);
System.debug('  piValveBangalore.Id = ' + piValveBangalore.Id);
System.debug('  piBearingChennai.Id = ' + piBearingChennai.Id);
