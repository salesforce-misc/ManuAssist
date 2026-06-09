# Inventory Management — Run & Monitor

Runtime flows, validation checklists, and SOQL for the inventory data model and Inventory Search
and Transfer experience.

---

## Test Inventory Flows

After setup (`create-and-configure.md`), verify the runtime end-to-end:

- Run the **Inventory Search** component — confirm results
- Initiate a `ProductTransfer` from search results (Product Transfer action)
- Complete a work order with `ProductRequired` → `ProductConsumed` → confirm `ProductItemTransaction`
  is created
- Initiate a `ReturnOrder` from a Claim → confirm Return Order Line Items
- Verify `ProductItem.QuantityOnHand` decrements on consume / increments on receive

---

## Runtime Flow Reference

### Search Flow

1. User loads a page with the **Criteria-Based Search and Filter** component
2. Component reads the linked Search Criteria Configuration
3. Search runs against `ProductInvSearchableField` (populated by the DPE)
4. Results render with Display, Aggregation, and Sort fields
5. User clicks a Search Action (e.g., **Product Transfer**) → bundled LWC opens

### Product Transfer Flow

1. From search results, user picks source `ProductItem`(s) and a destination `Location`
2. `ProductTransfer` record created with `Status = Draft` (or similar)
3. For serialized products, `ProductTransferState` records are created per serial
4. When `Status = Completed`:
   - Source `ProductItem.QuantityOnHand` decrements
   - Destination `ProductItem.QuantityOnHand` increments (creating the destination ProductItem if absent)
   - `ProductItemTransaction` rows are auto-generated for both sides

### Work Order Consumption Flow

1. Work Order created → `ProductRequired` lines define planned consumption
2. Tech consumes parts → `ProductConsumed` records created against the source `ProductItem`
3. `ProductConsumedState` captures post-consumption state
4. `ProductItemTransaction` rows auto-generate; `ProductItem.QuantityOnHand` decrements

### Return Order Flow

1. From a Claim or Work Order, a `ReturnOrder` is created
2. `ReturnOrderLineItem` records reference the original line and quantity
3. `ReturnOrderItemAdjustment` captures price adjustments
4. On receipt, returned inventory increments destination `ProductItem`

---

## Validation Checklist

- [ ] Criteria Based Search And Filter toggle enabled (Manufacturing Settings)
- [ ] Locations defined with type and address
- [ ] ProductItems created for stocked products at each location
- [ ] Page layouts updated
- [ ] Permission sets assigned
- [ ] `SearchableObjDataSyncInfo` ("Searchable Object Configuration") created with criteria + result mappings
- [ ] Update Product Inventory Searchable Field Values DPE active and recently run
- [ ] Search Criteria Configuration created
- [ ] `SearchResultActionConfig` ("Search Action Configuration") for `ProductTransfer` created
- [ ] Criteria-Based Search and Filter component on at least one page
- [ ] Sample search returns results
- [ ] Work order consume / replenish flow tested

---

## SOQL Quick Reference

```sql
-- Inventory snapshot by location
SELECT Location.Name, Product2.Name, QuantityOnHand, QuantityUnitOfMeasure
FROM ProductItem
ORDER BY Location.Name, Product2.Name

-- Recent transactions
SELECT ProductItem.Product2.Name, TransactionType, Quantity, CreatedDate
FROM ProductItemTransaction
WHERE CreatedDate = LAST_N_DAYS:30
ORDER BY CreatedDate DESC

-- Serialized inventory in transit
SELECT Id, SerialNumber, Status, CurrentLocation.Name
FROM SerializedProduct
WHERE Status = 'In Transit'

-- Open product transfers
SELECT Id, SourceLocation.Name, DestinationLocation.Name, Status, ExpectedShipmentDate
FROM ProductTransfer
WHERE Status NOT IN ('Completed', 'Cancelled')

-- Open return orders
SELECT Id, ReturnOrderNumber, Status, AccountId, TotalAmount
FROM ReturnOrder
WHERE Status NOT IN ('Closed', 'Cancelled')

-- Inventory consumed on work orders today
SELECT WorkOrder.WorkOrderNumber, Product2.Name, QuantityConsumed
FROM ProductConsumed
WHERE CreatedDate = TODAY
```

---

## Monitoring the Searchable Field DPE

The `Update Product Inventory Searchable Field Values` DPE is the heartbeat of inventory search.

- Setup → **Data Processing Engine** → check **Last Run Status** and **Next Scheduled Run**
- Failures here mean stale or missing search results — see `limits-and-gotchas.md`
- For high-velocity orgs, increase from daily → hourly cadence
