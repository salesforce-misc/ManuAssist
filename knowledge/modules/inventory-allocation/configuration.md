# Inventory Allocation — Configuration & Troubleshooting

> **Source:** Verified against Salesforce Core release **264** UDD settings, Setup Discovery configuration, and PSL definitions.

## Prerequisites

- Manufacturing Cloud for Service license with Inventory Allocation add-on
- Inventory Allocation org permission (`InventoryAllocation`) and org preference (`InventoryAllocationEnabled`) enabled
- `ManageInventoryAllocation` user permission assigned (or `ManageInventoryAllocationInExprcCloud` for Experience Cloud users)
- `ProductItem` records with `QuantityOnHand > 0` at relevant locations
- For batch allocation: `orgHasBatchManagementEnabled` AND `orgHasDistributorManagementPilot` (additional gating on `InventoryBatchItemReservation`)

## Setup Discovery Wizard

Salesforce Core ships a Setup Discovery configuration at `core/industries-unified-inventory/java/resources/discovery/configurations/industries-mfg-inventory-allocation.configuration.json` with two required steps:

| Step | Type | Action |
|------|------|--------|
| `inventoryAllocationUserAccess` | UserAssignment | Assign `force__InvAllocationUserPsl` (internal) or `force__InventoryAllocationExprcCloudPsl` (Experience Cloud) |
| `AddInventoryAllocationComponent` | URL | Open `/lightning/o/Order/home` and add the Inventory Allocation LWC component to the Order page (help URL: `xcloud.aslm_inventory_allocation_add_component.htm`) |

> **Naming note:** The public docs label the assignable permission set as `InventoryAllocationUser`. In core that perm set is **delivered as part of the Permission Set License `force__InvAllocationUserPsl`** — when you assign the PSL, the underlying perm set comes with it.

## Configuration Steps

### Step 1: Enable Inventory Allocation
1. Go to **Setup > Inventory Allocation Settings**
2. Enable the `InventoryAllocationEnabled` org preference
3. Verify the `InventoryAllocation` org permission is active on the license

   Via Metadata API:
   ```xml
   <InventoryAllocationSettings xmlns="http://soap.sforce.com/2006/04/metadata">
     <enableInventoryAllocation>true</enableInventoryAllocation>
   </InventoryAllocationSettings>
   ```

### Step 2: Set Up Locations
Inventory is tracked per location (`Location` object):
```sql
SELECT Id, Name, LocationType FROM Location ORDER BY Name
```
Create Location records representing warehouses, distribution centers, or stocking points.

### Step 3: Create ProductItem Records
For each product-location combination that holds stock:
```bash
sf data create record --sobject ProductItem \
  --values "Product2Id=<ProductId> LocationId=<LocationId> QuantityOnHand=500" \
  --target-org <alias>
```

### Step 4: Assign Permission Set Licenses
| PSL (assign this) | Underlying Perm Set | Who Needs It |
|---|---|---|
| `force__InvAllocationUserPsl` | `InventoryAllocationUser` | Internal allocation managers and planners |
| `force__InventoryAllocationExprcCloudPsl` | (Experience Cloud variant) | Partner/distributor users on Experience Cloud sites |

Also ensure users have the corresponding user permission:
- Internal: `ManageInventoryAllocation` (Tooling/Metadata API: `PermissionsManageInventoryAllocation`)
- Experience Cloud: `ManageInventoryAllocationInExprcCloud` (`PermissionsManageInventoryAllocationInExprcCloud`)

### Step 5: Set Up Product Fulfillment Locations (for Auto-Allocation)
Create `ProductFulfilmentLocation` records to enable auto-allocation:
- Maps each product to its preferred fulfillment location
- Drives the auto-allocate preview in the UI

### Step 6: Configure Serialized Products (if applicable)
For serialized inventory:
1. Create `SerializedProduct` records with `Status = Available` and `AllocationStatus = None`
2. Link each to its `ProductItem` and optionally to a `ProductBatchItem` (if batch-tracked)

### Step 7: Test the Allocation API
Basic test call (location-level allocation):
```json
POST /services/data/vXX.0/connect/inventory/allocation
{
  "allocationData": [{
    "sourceId": "<OrderId>",
    "items": [{
      "sourceItemId": "<OrderItemId>",
      "allocations": [{
        "sourceLocationId": "<LocationId>",
        "allocatedQuantity": 10
      }]
    }]
  }]
}
```

Expected result:
- `InventoryReservation` created with status `Reservation In Progress` → `Reserved`
- `ProductItem.QuantityAllocated` incremented by 10

## Validation Checklist

- [ ] `InventoryAllocationEnabled` org preference enabled
- [ ] `InventoryAllocation` org permission active
- [ ] `InventoryAllocationUser` permission set assigned to users
- [ ] `ProductItem` records with `QuantityOnHand > 0`
- [ ] At least one successful allocation API call
- [ ] `ProductItemAdditionalTransaction` records showing `TransactionStatus = Success`

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| API returns 403 Forbidden | Missing `ManageInventoryAllocation` perm or org pref disabled | Enable org preference + assign user permission (or PSL) |
| API returns `ALLOCATION_ALREADY_IN_PROGRESS` | Another reservation for the same `sourceId` is in `ReservationInProgress` or `CancellationInProgress` | Wait for MQ to finish (`InventoryReservation.IsAsyncOperationInProgress = false`) before retrying |
| API returns `USER_REQUEST_ERROR` | Stage-3 validation failure (zero qty, duplicate location, missing serialized IDs, etc.) | Inspect `errorDetails[]` in response; fix payload |
| Allocation stuck in `ReservationInProgress` | MQ handler failed or `ProductItem` lock contention | Check `ProductItemAddlTrxn.Status = 'Pending'`; if stale, call `POST /connect/inventory/process-additional-transaction` with `forceUnlock=true` |
| `QuantityAllocated` not updating | `ProductItemAddlTxnProcessor` couldn't acquire lock | Items get re-enqueued with 15s delay; inspect `ProductItemAddlTrxn` Pending rows; manual reconcile via Process Additional Transaction API |
| Serialized product can't be allocated | `AllocationStatus` already `Allocated` or `Status` not `Available` | Deallocate existing reservation or check SerializedProduct status |
| Deallocation not reflecting | Cancellation async processing still in progress | Wait for MQ processing; check `InvItemInstanceReservation.Status` and `ProductItemAddlTrxn` |
| Auto-allocate shows no preview | Missing `ProductFulfilmentLocation` records | Create product-to-location mapping records |
| Batch allocation fails | `ProductBatchItem.RemainingQuantity = 0`, or `orgHasBatchManagementEnabled`/`orgHasDistributorManagementPilot` not enabled | Check batch quantity AND verify both org perms are active |
| API returns 400 on serialized | SP `AllocationStatus` already set | Each serialized product can only be in one active reservation |
| MQ message keeps retrying | Handler error during commit; max retries 2 | Check logs around `InventoryAllocationHandler.handleMessage`; failure notification should appear in-app after final attempt |
| Inventory Location lookup shows all locations, can't filter by LocationType | Expected behavior — CBSF does not auto-filter by LocationType | Add `InventoryLocationType` to the search criteria fieldset in CBSF configuration (see below) |

## Async Pipeline Reference

The allocation API returns `{ isSuccess: true }` as soon as the MQ message is enqueued — **the actual reservation is created asynchronously**. To verify completion:

1. Poll `InventoryReservation.IsAsyncOperationInProgress` — `false` means the handler finished.
2. Check `InventoryReservation.IsSuccess` and `ErrorMessage`/`ErrorCode`.
3. Check `InventoryItemReservation.Status` — should be `Reserved` (or `Cancelled` for deallocation).
4. Check `ProductItemAddlTrxn` rows linked to the reservation — `Status = Completed` means `ProductItem` quantities have been updated.

Constants:
- MQ type: `MessageQueueTypeEnum.INVENTORY_ALLOCATION` (Tier 2)
- Max retries: `2`
- Clone message delay on retry: `60s`
- Re-enqueue delay on lock contention: `15s`

## Inventory Search and Transfer Component — CBSF Configuration

### Inventory Location Lookup Behavior

The **Inventory Location lookup** in the Inventory Search and Transfer component displays **all Location records the user has access to**. This is expected behavior — the component does not apply any automatic filters based on `LocationType` or other field values.

### Filtering Locations by Type (e.g., LocationType = 'Ship-To')

There is no way to restrict the Location lookup dropdown to specific `LocationType` values directly. However, users can filter results at search time by adding `InventoryLocationType` to the **CBSF (Criteria-Based Search and Filter) search criteria fieldset**.

**How to configure:**
1. Go to **Setup > Object Manager > Inventory Search and Transfer** (or the relevant CBSF configuration)
2. Locate the **search criteria fieldset** for the Inventory Search and Transfer component
3. Add `InventoryLocationType` to the fieldset
4. Once added, users can filter the location results by type directly within the component's search criteria

### Key Rule
> The Inventory Location lookup showing all accessible records is **by design**. Do not treat this as a bug. The supported way to narrow results by location type is to expose `InventoryLocationType` in the CBSF search criteria fieldset configuration.

## CBSF 10-Record Selection Limit per Field

### Symptom
The Criteria-Based Search and Filter component limits selection to **10 records per lookup field**. This is problematic for bulk scenarios such as transferring 500 Serial Numbers across 15 products.

### Confirmed Behavior
The 10-record limit is an **enforced platform constraint** defined in the CBSF component code:
- `criteriaBasedSearchFilterValueInput.js` — enforces the 10-value cap on the input field
- `lookup.js` — controls the underlying lookup behavior

### Is It Configurable?
The limit **can be increased** by modifying `lookup.js` and `criteriaBasedSearchFilterValueInput.js`. However, increasing it is bounded by the following hard platform limits that cannot be changed:

| Platform Constraint | Limit |
|--------------------|-------|
| SOSL query max length | 20,000 characters |
| Effective Serial Number IDs per query | ~50–100 (depending on other field values in the query) |
| SOSL maximum records returned | 2,000 records |

### Key Rule
> The 10-record limit is a code-level default, not an absolute ceiling — but the practical upper bound is ~50–100 values due to the 20k SOSL query character limit. For bulk operations beyond this range (e.g., 500+ Serial Numbers), the CBSF UI is not the right tool. Use the **Inventory Transfer REST API** or **Data Loader** for bulk serial number transfers.

### Workarounds for Bulk Serial Number Transfers
| Approach | Details |
|----------|---------|
| Inventory Transfer REST API | No equivalent input limit — best for programmatic bulk transfers |
| Data Loader | Direct record creation for planned/scheduled batch transfers |
| Custom Lightning Component | Accepts paste/CSV input of serial numbers, calls transfer API |
| CBSF in batches | Run multiple transfers in groups of 10 — operational workaround only |
