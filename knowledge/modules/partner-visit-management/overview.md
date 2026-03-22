# Partner Visit Management — Overview

Partner Visit Management enables manufacturers to plan, execute, and track visits to distributors, dealers, and channel partners. It standardizes the visit process using Action Plan templates and integrates with OmniStudio for guided visit checklists on Experience Cloud.

## Business Value

- Standardize distributor and dealer visit workflows with Action Plan templates
- Track visit completion, outcomes, and follow-up tasks
- Enable field reps to execute structured visit checklists on mobile or Experience Cloud
- Assign visits by territory and account for efficient route planning
- Measure visit frequency and compliance across the partner network

## Key Objects

| Object | Purpose |
|--------|---------|
| `Visit` | A planned or completed visit to a partner location |
| `VisitedParty` | Account or contact being visited |
| `Visitor` | User conducting the visit |
| `ActionPlan` | Checklist of tasks to complete during a visit |
| `ActionPlanItem` | Individual task within an action plan |
| `ActionPlanItemDependency` | Task dependency within an action plan |
| `ActionPlanTemplate` | Reusable template defining a standard visit workflow |
| `ActionPlanTemplateItem` | Task definition within a template |
| `ActionPlanTemplateVersion` | Version control for action plan templates |
| `ActionPlanTmplItmAssessmentInd` | Assessment indicators on template items |

## Visit Lifecycle

```
Planned → In Progress → Completed
        → Cancelled
```

- **Planned**: Visit scheduled; Action Plan created from template
- **In Progress**: Field rep has started the visit
- **Completed**: All action plan items resolved; visit closed
- **Cancelled**: Visit was cancelled before execution

## Action Plan Templates

Templates define standardized visit workflows. Each template version contains:
- **Task items** — what needs to be done (e.g., "Review inventory levels", "Check planogram compliance")
- **Dependencies** — task ordering and prerequisites
- **Assessment indicators** — pass/fail or rating criteria per task
- **Required vs. optional tasks** — controls completion criteria

## OmniStudio Integration

For Experience Cloud (dealer/distributor portals), visit checklists are surfaced via OmniStudio OmniScripts. Field reps complete visit tasks interactively on the portal or mobile, and results are written back to ActionPlanItem records.

## Permission Sets Required

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Field reps conducting visits |
| `ManufacturingPartnerCommunityUser` | External distributors/dealers on Experience Cloud |

## SOQL Quick Reference

```sql
-- Recent visits with account
SELECT Id, Name, PlannedVisitStartTime, PlannedVisitEndTime, Status,
       Account.Name, Owner.Name
FROM Visit
ORDER BY PlannedVisitStartTime DESC LIMIT 20

-- Visits by status and account
SELECT Id, Name, Status, Account.Name, PlannedVisitStartTime
FROM Visit
WHERE Status = 'Planned'
ORDER BY PlannedVisitStartTime ASC

-- Action plans linked to visits
SELECT Id, Name, Status, TargetId, TargetObject
FROM ActionPlan
ORDER BY CreatedDate DESC LIMIT 20

-- Action plan items with completion status
SELECT Id, Name, Status, IsRequired, ActionPlanId, ActionPlan.Name
FROM ActionPlanItem
WHERE ActionPlan.TargetObject = 'Visit'
ORDER BY ActionPlanId

-- Active action plan templates
SELECT Id, Name, TargetObject, LastModifiedDate
FROM ActionPlanTemplate
WHERE IsActive = true
ORDER BY Name

-- Visited parties per visit
SELECT Id, VisitId, ParticipantId, ParticipantType
FROM VisitedParty
ORDER BY VisitId
```
