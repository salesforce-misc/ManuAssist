# Inventory Allocation — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Service license with Inventory Allocation add-on
- Inventory Allocation org permission and preference enabled
- `ManageInventoryAllocation` user permission assigned
- `ProductItem` records with `QuantityOnHand > 0` at relevant locations

## Configuration Steps

### Step 1: Enable Inventory Allocation
1. Go to **Setup > Inventory Allocation Settings**
2. Enable the `InventoryAllocationEnabled` org preference
3. Verify the `InventoryAllocation` org permission is active on the license

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

### Step 4: Assign Permission Sets
| Permission Set | Who Needs It |
|---------------|-------------|
| `InventoryAllocationUser` | Allocation managers and planners |

Also ensure users have `ManageInventoryAllocation` user permission.

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
| API returns 403 Forbidden | Missing `ManageInventoryAllocation` perm or org pref disabled | Enable org preference + assign user permission |
| Allocation stuck in "Reservation In Progress" | MQ handler failed or lock contention | Check `ProductItemAdditionalTransaction` for `TransactionStatus = Failure`; may need manual sync |
| `QuantityAllocated` not updating | Async processing delayed | Check `QuantityStateRefreshDate` on ProductItem; review transaction logs |
| Serialized product can't be allocated | `AllocationStatus` already `Allocated` or `Status` not `Available` | Deallocate existing reservation or check SP status |
| Deallocation not reflecting | Cancellation async processing still in progress | Wait for MQ processing; check transaction log for cancellation records |
| Auto-allocate shows no preview | Missing `ProductFulfilmentLocation` records | Create product-to-location mapping records |
| Batch allocation fails | `ProductBatchItem.RemainingQuantity = 0` | Check available batch quantity before allocation |
| API returns 400 on serialized | SP `AllocationStatus` already set | Each serialized product can only be in one active reservation |
| Inventory Location lookup shows all locations, can't filter by LocationType | Expected behavior — CBSF does not auto-filter by LocationType | Add `InventoryLocationType` to the search criteria fieldset in CBSF configuration (see below) |

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
