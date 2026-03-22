---
name: mfg-partner-visits
description: Expert guidance on Manufacturing Cloud Partner Visit Management — visit scheduling, action plan templates, mobile access, and visit task tracking. Use when user asks about partner visits, distributor visits, dealer visits, action plans, Visit object, or field rep scheduling.
---

# Manufacturing Cloud Partner Visit Management

Partner Visit Management enables account managers and field reps to schedule, execute, and track visits to distributors, dealers, and supplier locations. Action plan templates define standard checklists for common visit types.

## Detailed Documentation

Use `get_mfg_module_docs` with slug `partner-visit-management` for full configuration reference, or `search_mfg_knowledge` for targeted searches.

## Key Objects

| Object | Purpose |
|--------|---------|
| `Visit` | A scheduled visit to a partner/distributor location |
| `VisitedParty` | The party (account/contact) being visited |
| `Visitor` | The user or contact conducting the visit |
| `GenericVisitTask` | Task assigned during a visit |
| `GenericVisitTaskContext` | Context linking a visit task to related records |
| `ActionPlanTemplate` | Reusable visit checklist (standard tasks and assessment indicators) |
| `ActionPlanTemplateVersion` | Version of an action plan template |
| `ActionPlan` | Instance of a template attached to a specific Visit |
| `ActionPlanItem` | Individual task instance within an action plan |
| `ActionPlanTemplateItem` | Individual task definition within a template |

**Note:** Manufacturing Cloud uses the **standard `Visit` object** with Manufacturing-specific record types.

## Configuration Steps

### Step 1: Enable Partner Visit Management
Setup > Manufacturing Settings > Enable Partner Visit Management

### Step 2: Create Visit Record Types
- Setup > Object Manager > Visit > Record Types
- Recommended types: `Partner Visit`, `Distributor Audit`, `Training Visit`, `Sales Agreement Review`

### Step 3: Configure Page Layouts
- Add: Account, Start/End Time, Status, Owner, Location
- Add related lists: Action Plans, Activity History, Files

### Step 4: Create Action Plan Templates
1. Go to Action Plans > Action Plan Templates > New
2. Set Target Entity Type = **Visit**
3. Add tasks with sequence and required/optional flags:
   - "Review Sales Agreement Performance"
   - "Conduct Inventory Check"
   - "Present New Product Line"
   - "Capture Assessment Indicators (KPIs)"
4. Activate the template

### Step 5: Mobile Access (Experience Cloud / Salesforce Mobile App)
- Partner Visit Management works on Salesforce Mobile App and Experience Cloud
- There is **no custom iPad app** — use standard Salesforce Mobile App
- Ensure Visit object is enabled for the Salesforce Mobile App via Setup > Salesforce Mobile App

## Checking Configuration
Use `check_partner_visit_config` to validate:
- Visit record types
- Visit status distribution
- Action Plan Templates for Visit object
- Permission set coverage

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Can't create Visit | No active Visit record types | Create and activate Visit record types |
| Action Plans not showing | Template not set to `Visit` as Target Entity Type | Edit template, set correct entity type |
| Field rep can't see visits | Missing `ManufacturingSalesUser` PS | Assign permission set |
| Action items not completing | Flow automation not configured | Add Flow on ActionPlan item completion |
| Mobile access issues | Mobile app setup not configured | Enable Visit in Salesforce Mobile App navigation |

## SOQL Quick Reference

```sql
-- Visits by status
SELECT Status, COUNT(Id) total FROM Visit GROUP BY Status

-- Upcoming visits (next 30 days)
SELECT Id, Name, Status, Account.Name, PlannedVisitStartTime, Owner.Name
FROM Visit
WHERE PlannedVisitStartTime = NEXT_N_DAYS:30
ORDER BY PlannedVisitStartTime ASC

-- Visits with incomplete action plans
SELECT Visit.Name, Visit.Account.Name, Status
FROM ActionPlan
WHERE Status != 'Complete'
AND TargetId != null
ORDER BY CreatedDate ASC

-- Action plan templates for visits
SELECT Id, Name, IsActive, TargetEntityType
FROM ActionPlanTemplate
WHERE TargetEntityType = 'Visit'
ORDER BY Name
```
