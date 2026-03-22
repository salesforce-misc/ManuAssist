# Partner Visit Management — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Sales license (Visit management is included)
- Accounts representing distributor/dealer locations
- Users with territory assignments for field rep visit scheduling

## Configuration Steps

### Step 1: Enable Partner Visit Management
Go to **Setup > Manufacturing Settings > Enable Partner Visit Management** and toggle on.

### Step 2: Configure the Visit Object Layout
Navigate to **Setup > Object Manager > Visit > Page Layouts**:

Recommended fields to include:
- Account, Planned Start Time, Planned End Time, Status, Owner
- Visit Type, Description, Location

Recommended related lists:
- Action Plans
- Tasks
- Activity History

### Step 3: Create Action Plan Templates
Templates define standardized visit checklists:
1. Go to **Setup > Action Plan Templates** (or via App Launcher)
2. Create a new template with `TargetObject = Visit`
3. Add `ActionPlanTemplateItem` records for each task:
   - Task name (e.g., "Review inventory levels", "Check display compliance")
   - Required vs. optional
   - Sequence number for ordering
4. Add dependencies between tasks if sequential execution is required
5. Activate the template

### Step 4: Configure Visit Types
Create a custom picklist or record type for visit classification:
- Routine Check-in
- Quarterly Business Review (QBR)
- New Product Launch
- Compliance Audit

### Step 5: Assign Permission Sets
| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Field reps conducting visits |
| `ManufacturingPartnerCommunityUser` | External distributors/dealers on Experience Cloud |

### Step 6: OmniStudio Setup (for Experience Cloud)
For partner self-service visit checklists on Experience Cloud:
1. Install OmniStudio if not already deployed
2. Create an OmniScript mapped to `ActionPlanItem` for checklist completion
3. Configure the Experience Cloud site with visit management components
4. Assign `ManufacturingPartnerCommunityUser` permission set to external users

### Step 7: Create Visits
Visits can be created:
- Manually by field reps from the Account record
- In bulk via API (`bulk_create_records` tool)
- Via Flow automation based on a schedule or trigger

When creating a visit:
1. Set `AccountId`, `PlannedVisitStartTime`, `PlannedVisitEndTime`
2. Set `OwnerId` to the responsible field rep
3. Action Plans can be auto-created via a Flow that fires on visit creation

## Validation Checklist

Run `check_partner_visit_config` to validate:
- [ ] Visit Management enabled in Manufacturing Settings
- [ ] At least one ActionPlanTemplate with TargetObject = Visit
- [ ] Visit records exist with linked accounts
- [ ] ActionPlan records linked to visits
- [ ] ManufacturingSalesUser permission set assigned to field reps

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Field reps can't create visits | Missing `ManufacturingSalesUser` permission set | Assign permission set |
| Action Plan not auto-created | No Flow configured for visit creation | Create a Flow triggered on Visit creation to instantiate Action Plans |
| Action Plan template items not appearing | Template not activated | Activate the ActionPlanTemplate |
| Visit checklist not visible on Experience Cloud | OmniScript not configured or PS not assigned | Configure OmniStudio integration; assign `ManufacturingPartnerCommunityUser` |
| Visit shows wrong owner | Visit OwnerId not set to field rep | Update OwnerId on Visit record |
| Task dependencies not enforcing order | Dependencies not configured on template | Add ActionPlanItemDependency records to the template |
