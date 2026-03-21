/**
 * MFG_TestData_Part2_SerializedProducts.apex
 *
 * Creates realistic serialized products for:
 *   - Servo Motor SM-5KW-3PH (non-batched, Bangalore & Mumbai)
 *   - PLC Control Unit CU-3000 (batched, Pune — uses existing ProductBatchItems)
 *
 * !! PREREQUISITE: Run Part 1 first, then REPLACE the IDs below !!
 *
 * Execute:
 *   sf apex run --file MFG_TestData_Part2_SerializedProducts.apex --target-org mfg@sdb38.org
 */

// ─────────────────────────────────────────────────────────────────────────────
// !! PASTE IDs from Part 1 output below !!
// ─────────────────────────────────────────────────────────────────────────────
Id pServoMotorId    = 'REPLACE_WITH_pServoMotor.Id';
Id pPLCUnitId       = 'REPLACE_WITH_pPLCUnit.Id';
Id pPressureValveId = 'REPLACE_WITH_pPressureValve.Id';

Id piMotorBangaloreId = 'REPLACE_WITH_piMotorBangalore.Id';
Id piMotorMumbaiId    = 'REPLACE_WITH_piMotorMumbai.Id';
Id piPLCPuneId        = 'REPLACE_WITH_piPLCPune.Id';
Id piValveBangaloreId = 'REPLACE_WITH_piValveBangalore.Id';

// ─────────────────────────────────────────────────────────────────────────────
// SERVO MOTOR — Serialized, Non-Batched (Bangalore)
// Serial format: SM-BLR-YYYY-NNNNN (Site + Year + Sequence)
// These are used for: S5, D6, E2 (re-allocate), E3 (Consumed status)
// ─────────────────────────────────────────────────────────────────────────────
List<SerializedProduct> servoMotorsBLR = new List<SerializedProduct>();

// SM-BLR-001 to SM-BLR-006: Available — primary pool for S5 allocation
String[] motorSerialsBLR = new String[]{
    'SM-BLR-2025-00101',
    'SM-BLR-2025-00102',
    'SM-BLR-2025-00103',
    'SM-BLR-2025-00104',
    'SM-BLR-2025-00105',
    'SM-BLR-2025-00106'
};
for (String sn : motorSerialsBLR) {
    SerializedProduct sp = new SerializedProduct();
    sp.SerialNumber  = sn;
    sp.Product2Id    = pServoMotorId;
    sp.ProductItemId = piMotorBangaloreId;
    sp.Status        = 'Available';
    servoMotorsBLR.add(sp);
}

// SM-BLR-007: Available — allocate this first, then re-use to test E2 (Already Allocated)
SerializedProduct spMotorE2 = new SerializedProduct();
spMotorE2.SerialNumber  = 'SM-BLR-2025-00107';
spMotorE2.Product2Id    = pServoMotorId;
spMotorE2.ProductItemId = piMotorBangaloreId;
spMotorE2.Status        = 'Available';
servoMotorsBLR.add(spMotorE2);

// SM-BLR-008: Consumed — for E3 edge case (cannot allocate consumed unit)
SerializedProduct spMotorE3 = new SerializedProduct();
spMotorE3.SerialNumber  = 'SM-BLR-2025-00108';
spMotorE3.Product2Id    = pServoMotorId;
spMotorE3.ProductItemId = piMotorBangaloreId;
spMotorE3.Status        = 'Consumed';
servoMotorsBLR.add(spMotorE3);

insert servoMotorsBLR;

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('Servo Motor — Non-Batched Serialized (Bangalore)');
System.debug('══════════════════════════════════════════════════════');
for (SerializedProduct sp : servoMotorsBLR) {
    String tag = '';
    if (sp.SerialNumber == 'SM-BLR-2025-00107') tag = ' ← E2: allocate first, then re-allocate to trigger error';
    if (sp.SerialNumber == 'SM-BLR-2025-00108') tag = ' ← E3: Consumed status — allocation should fail';
    System.debug('  ' + sp.SerialNumber + ' | Id=' + sp.Id + ' | Status=' + sp.Status + tag);
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVO MOTOR — Serialized, Non-Batched (Mumbai)
// Additional pool for D6 deallocation test (different location)
// ─────────────────────────────────────────────────────────────────────────────
List<SerializedProduct> servoMotorsMUM = new List<SerializedProduct>();
String[] motorSerialsMUM = new String[]{
    'SM-MUM-2025-00201',
    'SM-MUM-2025-00202',
    'SM-MUM-2025-00203'
};
for (String sn : motorSerialsMUM) {
    SerializedProduct sp = new SerializedProduct();
    sp.SerialNumber  = sn;
    sp.Product2Id    = pServoMotorId;
    sp.ProductItemId = piMotorMumbaiId;
    sp.Status        = 'Available';
    servoMotorsMUM.add(sp);
}
insert servoMotorsMUM;

System.debug('');
System.debug('Servo Motor — Non-Batched Serialized (Mumbai, for D6)');
for (SerializedProduct sp : servoMotorsMUM) {
    System.debug('  ' + sp.SerialNumber + ' | Id=' + sp.Id);
}

// ─────────────────────────────────────────────────────────────────────────────
// PLC CONTROL UNIT — Serialized + Batched (Pune)
//
// NOTE: ProductBatchItem cannot be created via Apex without Batch Management pref.
// These serialized products are linked to piPLCPune (ProductItem).
// For batch allocation (S6/S7/D5), use existing ProductBatchItems from the org
// that share the same ProductItem or create via UI/Data Loader.
//
// Serial format: PLC-PNE-YYYY-LTNNN-SNNN (Site + Year + LotNum + Seq)
// Two logical batch groups:
//   LOT-A: PLC-PNE-2025-LTA-001 to 004 (for S6 with batchItemId)
//   LOT-B: PLC-PNE-2025-LTB-001 to 003 (for S7 with batchId)
// ─────────────────────────────────────────────────────────────────────────────
List<SerializedProduct> plcUnitsLotA = new List<SerializedProduct>();
String[] plcSerialsA = new String[]{
    'PLC-PNE-2025-LTA-001',
    'PLC-PNE-2025-LTA-002',
    'PLC-PNE-2025-LTA-003',
    'PLC-PNE-2025-LTA-004'
};
for (String sn : plcSerialsA) {
    SerializedProduct sp = new SerializedProduct();
    sp.SerialNumber  = sn;
    sp.Product2Id    = pPLCUnitId;
    sp.ProductItemId = piPLCPuneId;
    sp.Status        = 'Available';
    plcUnitsLotA.add(sp);
}
insert plcUnitsLotA;

List<SerializedProduct> plcUnitsLotB = new List<SerializedProduct>();
String[] plcSerialsB = new String[]{
    'PLC-PNE-2025-LTB-001',
    'PLC-PNE-2025-LTB-002',
    'PLC-PNE-2025-LTB-003'
};
for (String sn : plcSerialsB) {
    SerializedProduct sp = new SerializedProduct();
    sp.SerialNumber  = sn;
    sp.Product2Id    = pPLCUnitId;
    sp.ProductItemId = piPLCPuneId;
    sp.Status        = 'Available';
    plcUnitsLotB.add(sp);
}
insert plcUnitsLotB;

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('PLC Unit — Batched+Serialized (Pune)');
System.debug('══════════════════════════════════════════════════════');
System.debug('LOT-A (use with batchItemId for S6/D5):');
for (SerializedProduct sp : plcUnitsLotA) {
    System.debug('  ' + sp.SerialNumber + ' | Id=' + sp.Id);
}
System.debug('LOT-B (use with batchId for S7):');
for (SerializedProduct sp : plcUnitsLotB) {
    System.debug('  ' + sp.SerialNumber + ' | Id=' + sp.Id);
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESSURE VALVE — Serialized, Non-Batched (Bangalore)
// Used for S8 mixed scenario and D7 mixed deallocation
// Serial format: PRV-BLR-YYYY-NNNNN
// ─────────────────────────────────────────────────────────────────────────────
List<SerializedProduct> pressureValvesBLR = new List<SerializedProduct>();
String[] valveSerials = new String[]{
    'PRV-BLR-2025-00301',
    'PRV-BLR-2025-00302',
    'PRV-BLR-2025-00303',
    'PRV-BLR-2025-00304'
};
for (String sn : valveSerials) {
    SerializedProduct sp = new SerializedProduct();
    sp.SerialNumber  = sn;
    sp.Product2Id    = pPressureValveId;
    sp.ProductItemId = piValveBangaloreId;
    sp.Status        = 'Available';
    pressureValvesBLR.add(sp);
}
insert pressureValvesBLR;

System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('Pressure Valve — Serialized (Bangalore, for S8/D7)');
System.debug('══════════════════════════════════════════════════════');
for (SerializedProduct sp : pressureValvesBLR) {
    System.debug('  ' + sp.SerialNumber + ' | Id=' + sp.Id);
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
System.debug('');
System.debug('══════════════════════════════════════════════════════');
System.debug('PART 2 COMPLETE — Serialized Product ID Reference');
System.debug('══════════════════════════════════════════════════════');
System.debug('Servo Motor BLR (S5, D6, E2, E3):');
List<Id> smBLRIds = new List<Id>();
for (SerializedProduct sp : servoMotorsBLR) smBLRIds.add(sp.Id);
System.debug('  IDs: ' + String.join(smBLRIds, ', '));
System.debug('  E2 (re-alloc test) = SM-BLR-2025-00107 | Id=' + servoMotorsBLR[6].Id);
System.debug('  E3 (Consumed)      = SM-BLR-2025-00108 | Id=' + servoMotorsBLR[7].Id);

System.debug('Servo Motor MUM (D6 multi-location):');
List<Id> smMUMIds = new List<Id>();
for (SerializedProduct sp : servoMotorsMUM) smMUMIds.add(sp.Id);
System.debug('  IDs: ' + String.join(smMUMIds, ', '));

System.debug('PLC Unit LOT-A (S6 with batchItemId / D5):');
List<Id> plcAIds = new List<Id>();
for (SerializedProduct sp : plcUnitsLotA) plcAIds.add(sp.Id);
System.debug('  IDs: ' + String.join(plcAIds, ', '));

System.debug('PLC Unit LOT-B (S7 with batchId):');
List<Id> plcBIds = new List<Id>();
for (SerializedProduct sp : plcUnitsLotB) plcBIds.add(sp.Id);
System.debug('  IDs: ' + String.join(plcBIds, ', '));

System.debug('Pressure Valve BLR (S8 mixed / D7):');
List<Id> pvBLRIds = new List<Id>();
for (SerializedProduct sp : pressureValvesBLR) pvBLRIds.add(sp.Id);
System.debug('  IDs: ' + String.join(pvBLRIds, ', '));
