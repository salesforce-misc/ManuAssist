# Account Manager Targets — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Sales license
- Org on **standard** fiscal year (custom fiscal calendars are not supported)
- User Role Hierarchy or Forecast Hierarchy defined for team member derivation
- At least one active Price Book (for product distributions)
- `Customize Application` permission to configure settings
- Salesforce CLI authenticated

## Configuration Steps

### Step 1: Enable Account Manager Targets
Setup → quick find **Account Manager Targets** → toggle **Account Manager Targets** to Enabled.

### Step 2: Choose Distribution Frequency
On the same page → Distribution Frequency section → select:
- **Monthly** (default — best for revenue tracking)
- **Quarterly** (common for partner/distributor mgmt)
- **Yearly**

> Changing frequency later only applies to *new* targets. Plan once, change rarely.

### Step 3: Choose Team Member Hierarchy
Same page → Team Member Hierarchy section → choose:
- **Manager Hierarchy** — uses User → Manager field (Setup → Roles)
- **Forecasts Hierarchy** — uses Setup → Forecast Hierarchy

> Changing this later locks all existing targets read-only. Decide based on which hierarchy your sales org actually operates by.

### Step 4: Specify Default Price Book
Same page → Price Book section → search and select the default Price Book that auto-populates when distributing by product.

### Step 5: Manage Measures
Object Manager → Account Manager Target → Fields & Relationships → **Measure** picklist → New:
- Add custom measures (e.g., `CSAT`, `Total Sales Agreement Amount`, `Units Shipped`)
- For each, select **Measure Type**: `Currency` or `Non-Currency`
- The default `Revenue` measure is provided out of the box

### Step 6: Verify Standard Fiscal Year
Setup → Company Information. Confirm `FiscalYearStartMonth` is set and the org is on standard fiscal calendar. If on custom, this feature will not work.

### Step 7: Assign Permission Sets
```bash
# Example: assign Manufacturing Sales User
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<PSId>" \
  --target-org <alias>
```

### Step 8: Create the First Target
App Launcher → **Account Manager Targets** → New:
- Name (e.g., "FY26 Revenue Target")
- Fiscal Year (current / next / year after)
- Measure (Revenue or custom)
- Target Value (numeric)
- Save

### Step 9: Assign to Team Members
On the target record → Assignments tab → **Assign Targets** → enter target percentage or absolute value per team member → Save.

> Sum of assignment values does not need to equal the parent target. Over- or under-allocation is allowed.

### Step 10: Distribute by Account / Product
On the assignment row → **Distribute By** → choose **Account and Product**:
- **Account tab** — Add Row → search account → set percentage or currency value
- **Product tab** — Add Row → search product → optional override price book → enter list price (auto-populates from price book) → set percentage or currency value
- Save

### Step 11: Distribute by Period
On any account or product distribution row → **Distribute by Period** → set per-period values (auto-divides equally by default; override as needed). Save.

### Step 12: Propagate Changes
After editing the parent target value, click **Propagate to Assignments** on the Assignments tab. Without this step, child assignments stay at the old value and team members see stale data.

## Validation Checklist

- [ ] Account Manager Targets enabled in Setup
- [ ] Distribution frequency configured
- [ ] Team member hierarchy chosen
- [ ] Default price book selected
- [ ] At least one measure configured (Revenue minimum)
- [ ] Org on standard fiscal year
- [ ] At least one target created and assigned
- [ ] Distribution data populated
- [ ] Periodic distribution count well below 10M cap

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Account Manager Targets toggle disabled or absent | Manufacturing license not active, or org on custom fiscal year | Confirm license; switch to standard fiscal year |
| Target won't save with currency value | Measure type mismatch (e.g., currency value entered for non-currency measure) | Match Measure type to value type |
| Team member dropdown empty when assigning | Hierarchy not configured (no Manager set on User, or Forecast Hierarchy empty) | Set Manager fields or build Forecast Hierarchy |
| Existing targets suddenly read-only | Hierarchy type was changed | Either keep new hierarchy and recreate targets, or revert hierarchy type |
| Product distribution shows zero list price | Price book missing PricebookEntry for that product | Add PricebookEntry to selected price book |
| Target Value differs from expected after product distribution | Formula: `Target Value = Target Currency Value / List Price` — list price drives the unit count | Verify list price |
| Cloning target — assignments missing | Cloning never copies assignments | Manually re-assign and redistribute |
| "Invalid Team Assignment" appears | Team member left org or hierarchy changed | Use Reassign / Move / Change Owner / Delete on the invalid row |
| Periodic distribution count near 10M | Years of accumulated targets | Archive old fiscal years; consider purging unused distributions |
| Updating parent target — child values unchanged | Forgot to Propagate to Assignments | Click Propagate to Assignments on the Assignments tab |
| Custom measure not appearing in target form | Custom measure created but not active | Edit the measure picklist value → Activate |
| Target value reverts on save | Formula collision: editing both percentage and currency value at the same time | Edit only one; the other auto-calculates |

## Best Practices

- Lock the distribution frequency early; do not change after onboarding
- Use **Forecasts Hierarchy** when sales hierarchy differs from manager hierarchy (common in matrixed orgs)
- Build CSAT / NPS measures alongside Revenue to give managers a balanced scorecard
- Use Trailhead's **CRM Analytics Dashboards for Account Manager Targets** for executive views
- Audit `AcctMgrPeriodicTargetDistribution` quarterly to stay below the 10M cap
- Always **Propagate to Assignments** after editing parent targets
