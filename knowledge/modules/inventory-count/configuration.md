# Inventory Count — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Service license with Inventory Management
- Location records set up representing warehouses or counting areas
- Users assigned appropriate permission sets for inventory management

## Configuration Steps

### Step 1: Create an Inventory Count Plan
1. Navigate to **Inventory Count Plans** in the app
2. Create a new plan specifying:
   - Name
   - Location (warehouse/area to count)
   - Start Date and End Date

### Step 2: Create Inventory Count Assessments
Create one assessment per counting team or individual:
```bash
sf data create record --sobject InventoryCountAssessment \
  --values "InventoryCountPlanId=<PlanId> AssigneeId=<UserId> Status=Pending StartDate=2025-01-01 DueDate=2025-01-07" \
  --target-org <alias>
```

### Step 3: Assign to Queues (Optional)
`AssigneeId` supports Queue assignment for team-based counting:
- Create a Queue for counting teams in **Setup > Queues**
- Assign `InventoryCountAssessment` object to the queue
- Set `AssigneeId` to the Queue ID on assessments

## Page Layout Configuration

### Adding InventoryCountAssessment to Related Lists

**Supported approach:**
1. Go to the `InventoryCountPlan` page layout
2. Add `InventoryCountAssessment` as a related list
3. Add standard fields: `Name`, `Status`, `StartDate`, `DueDate`

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
| Error adding `AssigneeId` to related list column | Polymorphic field — layout editor can't resolve a single object type | Use a custom text field populated by Flow instead |
| `AssigneeId` not visible in ARC | ARC doesn't enumerate polymorphic fields | Use SOQL describe or `describe_sobject` tool to confirm field existence |
| Assessment not appearing in related list | Object not added to page layout correctly | Add `InventoryCountAssessment` related list to the layout explicitly |
| Cannot set AssigneeId to Queue | Queue not configured for `InventoryCountAssessment` | Add the object to the Queue's supported objects in Setup > Queues |
| AssigneeId shows as blank on record | Assignee was deleted or reassigned | Re-assign using the record edit action |
