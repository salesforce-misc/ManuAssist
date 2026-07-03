# Inventory Count — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Service license with Inventory Management
- `Location` records set up representing warehouses or counting areas (`IsInventoryLocation = true`)
- `Product2` records (serialized and/or non-serialized), with `ProductItem` on-hand stock per location
- For serialized products: `SerializedProduct` records carrying `SerialNumber`
- Users assigned appropriate permission sets for inventory management
- (For Queue assignment) a Queue configured to support `InventoryCountAssessment`

## Data Model Recap

Only `InventoryCountPlan` is created directly. `InventoryCountPlanItem`, `InventoryCountAssessment`, and `InventoryCountProductItem` are **system-generated** by the `/connect/inventory/inventory-count` REST API. See `overview.md` for full field tables.

## Configuration Steps

### Step 1: Stage Inventory Master Data

```bash
# Location (warehouse)
sf data create record --sobject Location \
  --values "Name=CycleCount-Loc-Blr LocationType=Warehouse IsInventoryLocation=true" \
  --target-org <alias>

# Product (serialized example)
sf data create record --sobject Product2 \
  --values "Name=InvCC-Prod-1 ProductCode=INVCC1 StockKeepingUnit=invcc1 IsActive=true IsSerialized=true" \
  --target-org <alias>

# ProductItem (on-hand stock at the location)
sf data create record --sobject ProductItem \
  --values "Product2Id=<Product2Id> LocationId=<LocationId> QuantityOnHand=10 QuantityUnitOfMeasure=Each" \
  --target-org <alias>
```

### Step 2: Create an Inventory Count Plan
Create the parent plan, specifying location, the count window, and the recurrence cadence:

```bash
sf data create record --sobject InventoryCountPlan \
  --values "Name=InventoryCountPlan-Blr Status=Active LocationId=<LocationId> CountInterval=1 CountIntervalUnitOfMeasure=Month CountWindowDays=2" \
  --target-org <alias>
```

- `CountIntervalUnitOfMeasure` accepts `Day` / `Week` / `Month` / `Quarter` — this is how you implement **ABC / frequency-tiered counting** natively (daily for A-items, quarterly for C-items).
- `StartDateTime` / `EndDateTime` define the overall horizon the recurrence runs over.

### Step 3: Initiate the Count (Connect REST API)

```bash
sf api request rest "/services/data/v60.0/connect/inventory/inventory-count" \
  --method POST \
  --body '{"productItemIds":["<ProductItemId>"],"assignee":"<UserOrQueueId>","inventoryCountPlanId":"<PlanId>","isBlindCount":true}' \
  --target-org <alias>
```

Expect `201` with `{ "isSuccess": true }`. The platform then **asynchronously** generates:
- one `InventoryCountPlanItem` (`IsBlindCount = true`),
- one `InventoryCountAssessment` (`Status = 'Assigned'`, `Type = 'Periodic'`, `PlannedStartDateTime` from the plan),
- one `InventoryCountProductItem` per `ProductItem` in `productItemIds`.

**Poll** for the generated records before validating — they are not present the instant the `201` returns.

### Step 4: Assign to Queues (Optional)
`assignee` / `AssigneeId` supports Queue assignment for team-based counting:
- Create a Queue for counting teams in **Setup > Queues**
- Assign the `InventoryCountAssessment` object to the queue
- Pass the Queue Id as `assignee` in the REST call

## Page Layout Configuration

### Adding InventoryCountAssessment to Related Lists

**Supported approach:**
1. Go to the `InventoryCountPlan` page layout
2. Add `InventoryCountAssessment` as a related list
3. Add standard fields: `Name`, `Status`, `Type`, `PlannedStartDateTime`

**Do NOT add `AssigneeId` as a related list column** — it is a polymorphic lookup and will cause a layout error or silently fail to display.

### Workaround: Surfacing Assignee in Related Lists

Since `AssigneeId` cannot be used directly as a related list column, use one of these approaches:

#### Option A: Flow-Populated Custom Field (Recommended)
1. Create a custom text field on `InventoryCountAssessment`: `Assignee_Name__c` (label: "Responsible Associate Name")
2. Create a Record-Triggered Flow on `InventoryCountAssessment`:
   - Trigger: Created or Updated
   - Get the related User/Queue record using `AssigneeId`
   - Set `Assignee_Name__c` = User's `Name` or Queue's `Name`
3. Add `Assignee_Name__c` to the related list columns — renders without errors

#### Option B: Formula Field (User-only assignments)
If your org only ever assigns to Users (not Queues), a formula field can reference the User name:
- Note: Formula fields referencing polymorphic lookups have platform limitations; test before relying on this

#### Option C: Custom List View
Create a custom List View on `InventoryCountAssessment` filtered by `InventoryCountPlanId` — list views handle polymorphic fields better than related list columns.

## ARC Visibility Issue

`AssigneeId` does not appear in ARC (schema browsers, App Resource Center) because ARC's field enumeration does not surface polymorphic relationship fields the same way as standard lookups.

**Workaround:** Use SOQL to confirm the field exists and inspect values:
```sql
SELECT Id, AssigneeId, AssigneeType
FROM InventoryCountAssessment
LIMIT 1
```

Or use `describe_sobject` to get the full field list including polymorphic fields.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `201` returned but no assessment/plan-item records | Generation is asynchronous | Poll `InventoryCountAssessment` / `InventoryCountPlanItem` until records appear before asserting |
| `isSuccess: false` or non-201 from the REST call | Bad `productItemIds`, `assignee`, or `inventoryCountPlanId`; plan not `Active` | Verify each Id resolves and the plan `Status = 'Active'` |
| Error adding `AssigneeId` to related list column | Polymorphic field — layout editor can't resolve a single object type | Use a custom text field populated by Flow instead |
| `AssigneeId` not visible in ARC | ARC doesn't enumerate polymorphic fields | Use SOQL describe or `describe_sobject` tool to confirm field existence |
| `InventoryCountProductItem.IsSerializedProduct` wrong | Mismatch with `Product2.IsSerialized` | Confirm the `Product2` behind the `ProductItem` has the expected `IsSerialized` value |
| Cannot set `assignee` to Queue | Queue not configured for `InventoryCountAssessment` | Add the object to the Queue's supported objects in Setup > Queues |
| Count never recurs on the expected cadence | `CountInterval` / `CountIntervalUnitOfMeasure` not set, or horizon (`EndDateTime`) too short | Set the interval fields; ensure `EndDateTime` spans enough cycles |
| Assessment overdue / not completed | Counter exceeded `CountWindowDays` | Use `CountWindowDays` + `PlannedStartDateTime` to drive SLA/escalation reporting |

## Re-run / Cleanup Order

When tearing down a count cycle to re-run, delete children **before** the assessment:
1. Delete `InventoryCountProductItem` rows
2. Delete `InventoryCountAssessment` rows
3. Leave (or delete) the parent `InventoryCountPlan` as needed
