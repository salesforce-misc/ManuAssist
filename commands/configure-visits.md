---
description: Interactive wizard to configure and validate Manufacturing Cloud Partner Visit Management
arguments: "[check-type]"
---

# Configure Partner Visit Management

Interactive wizard to check and configure Partner Visit Management.

## Arguments

- `check-type` (optional): Focus area — `full`, `record-types`, `action-plans`, `mobile` (default: full)

## Instructions

### Step 1: Run Partner Visit Configuration Check

```
check_partner_visit_config()
```

This queries:
- Visit record types
- Visit status distribution
- Action Plan Templates for Visit object
- Action Plan instances
- Permission set coverage

### Step 2: Check Visit Record Types

```sql
SELECT Id, Name, DeveloperName, IsActive
FROM RecordType
WHERE SobjectType = 'Visit' AND IsActive = true
ORDER BY Name
```

Report:
- Visit record types found
- WARN if no active record types

### Step 3: Check Action Plan Templates

```sql
SELECT Id, Name, IsActive, TargetEntityType, Description
FROM ActionPlanTemplate
WHERE TargetEntityType = 'Visit'
ORDER BY Name
```

```sql
SELECT ActionPlanTemplateId, COUNT(Id) taskCount
FROM ActionPlanTemplateItem
GROUP BY ActionPlanTemplateId
```

Report:
- Templates targeting Visit object
- Task count per template
- WARN if no templates (reps have no standard checklists)

### Step 4: Check Existing Visits

```sql
SELECT Status, COUNT(Id) total
FROM Visit
GROUP BY Status
ORDER BY COUNT(Id) DESC
```

```sql
SELECT Id, Name, Status, Account.Name, PlannedVisitStartTime, Owner.Name
FROM Visit
ORDER BY PlannedVisitStartTime DESC NULLS LAST
LIMIT 10
```

Report:
- Visit status breakdown
- Most recent visits

### Step 5: Present Partner Visit Report

```
## Partner Visit Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Visit Record Types
- Record types: [count] ([names])
- Status: [CONFIGURED / NOT CONFIGURED]

### Action Plan Templates
- Templates for Visit: [count]
- Total tasks defined: [count]
- Status: [CONFIGURED / NOT CONFIGURED]

### Visit Activity
- Total visits: [count]
- By status: Planned: [n], In Progress: [n], Complete: [n]

### Permission Coverage
- ManufacturingSalesUser: [count] users

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 6: Offer Next Steps

**If no Visit record types:**
- Guide to Setup > Object Manager > Visit > Record Types
- Suggest: Partner Visit, Distributor Audit, Training Visit, SA Review Visit

**If no Action Plan Templates:**
- Guide to App Launcher > Action Plan Templates > New
- Suggest standard tasks: "Review SA Performance", "Inventory Check", "New Product Presentation", "Capture KPIs"

**If permission sets not assigned:**
- Offer to run `list_users` filtered by profile and `assign_permission_set`

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable Partner Visits | Setup > Manufacturing Settings |
| Visit Record Types | Setup > Object Manager > Visit > Record Types |
| Visit Page Layouts | Setup > Object Manager > Visit > Page Layouts |
| Action Plan Templates | App Launcher > Action Plan Templates |
| Salesforce Mobile | Setup > Salesforce Mobile App |

## IMPORTANT OBJECT REMINDERS

- Use `Visit` NOT `Visit__c` or `PartnerVisit__c`
- Use `ActionPlan` NOT `ActionPlan__c`
- Use `ActionPlanTemplate` NOT `VisitChecklist__c`
- Manufacturing Cloud uses the standard Salesforce Mobile App — no custom iPad app required
