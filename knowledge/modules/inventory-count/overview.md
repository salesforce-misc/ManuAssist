# Inventory Count — Overview

Inventory Count (also called Physical Inventory Count or Cycle Count) enables warehouse teams to conduct periodic physical counts of inventory and reconcile discrepancies against system quantities. It is part of Manufacturing Cloud's broader Inventory Management capability.

## Key Objects

| Object | API Name | Purpose |
|--------|----------|---------|
| Inventory Count Plan | `InventoryCountPlan` | Parent record — defines the scope, schedule, and location for a counting exercise |
| Inventory Count Assessment | `InventoryCountAssessment` | Child task — represents a specific counting assignment for a person or queue |

## Object Relationships

```
InventoryCountPlan
  └── InventoryCountAssessment (AssigneeId → User or Queue)
        └── (count results and reconciliation)
```

## InventoryCountPlan

Top-level record that groups all counting activities for a physical inventory event.

| Field | Description |
|-------|-------------|
| `Name` | Plan name |
| `Status` | Status of the count plan |
| `LocationId` | Location/warehouse being counted |
| `StartDate` / `EndDate` | Planned counting window |

## InventoryCountAssessment

Represents an individual counting task assigned to a person or team.

| Field | API Name | Type | Notes |
|-------|----------|------|-------|
| Inventory Count Plan | `InventoryCountPlanId` | Lookup | Parent plan |
| Assignee | `AssigneeId` | Polymorphic Lookup | Can reference User or Queue — labeled "Responsible Associate" |
| Status | `Status` | Picklist | Tracks completion state |
| Start Date | `StartDate` | Date | |
| Due Date | `DueDate` | Date | |

## Known Platform Limitation: AssigneeId Field

`AssigneeId` is a **polymorphic lookup** — it can point to either a `User` or a `Queue`. This causes two well-known UI limitations:

### 1. Cannot Add to Related List Columns (Page Layout)
When adding `InventoryCountAssessment` as a related list (on `InventoryCountPlan` or any other object such as `Account`), the page layout editor throws an error or silently omits `AssigneeId` when you try to include it as a display column. This is because the layout editor cannot resolve a single target object type for polymorphic fields.

**Affected scenario:** Adding `InventoryCountAssessment` related list to `InventoryCountPlan` or `Account` layout and selecting `AssigneeId` (Responsible Associate) as a column.

### 2. Not Visible in ARC (Schema Browser)
ARC (schema explorer tools) does not render polymorphic lookup fields the same way as standard lookups, making `AssigneeId` appear missing when browsing the `InventoryCountAssessment` object schema.

**Root cause:** Same class of issue as other polymorphic fields on the platform (`OwnerId`, `WhoId`, `WhatId`). The field exists in the data model and is fully queryable via SOQL — it is purely a UI rendering limitation.

## SOQL Quick Reference

```sql
-- All assessments for a count plan
SELECT Id, Name, AssigneeId, Status, StartDate, DueDate
FROM InventoryCountAssessment
WHERE InventoryCountPlanId = '<PlanId>'

-- Check assignee type (User vs Queue)
SELECT Id, Name, AssigneeId, Assignee.Name, AssigneeType
FROM InventoryCountAssessment
ORDER BY DueDate ASC

-- Assessments assigned to a specific user
SELECT Id, Name, Status, DueDate, InventoryCountPlan.Name
FROM InventoryCountAssessment
WHERE AssigneeId = '<UserId>'

-- All count plans with assessment counts
SELECT Id, Name, Status, LocationId,
       (SELECT Id, Status FROM InventoryCountAssessments)
FROM InventoryCountPlan
```

> Note: `AssigneeId` is fully queryable via SOQL even though it does not render in the page layout editor or ARC.
