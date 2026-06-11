# General Settings — Configuration & Troubleshooting

## Prerequisites

- Enterprise, Unlimited, or Developer Edition org
- System Administrator profile (or equivalent custom profile)
- Manufacturing Cloud SKU provisioned by Salesforce
- Salesforce CLI authenticated to the target org

## Configuration Steps (in order)

### Step 1: Verify Manufacturing License Activation
Setup → **Manufacturing Settings**. If you cannot see the node, the Manufacturing Cloud SKU is not activated — open a case with Salesforce.

### Step 2: Provision Permission Set Licenses
Setup → **Company Information** → **Permission Set Licenses**. Confirm the following are present and have available capacity:
- Manufacturing Cloud for Sales
- Manufacturing Cloud for Service (if Service track in scope)
- Warranty Lifecycle Management Psl (if Warranty in scope)
- Industries Service Excellence (if Service Console in scope)
- Manufacturing Analytics (if CRM Analytics in scope)

Assign PSLs to users **before** assigning the corresponding permission sets — assignment fails silently with cryptic errors otherwise.

### Step 3: Enable Feature Toggles
Setup → **Manufacturing Settings**. Toggle on, in this order:
1. Sales Agreements
2. Account Forecasting
3. Account Manager Targets
4. Partner Visit Management
5. Warranty Lifecycle Management
6. Inventory Management
7. Manufacturing Programs (if Program-Based Business)

Each toggle activates standard objects and tabs but does not create records — that comes later, per module.

### Step 4: Enable OmniStudio
Setup → **OmniStudio Settings**:
- Enable **Standard OmniStudio Runtime** (required for Service Console components and Pre-Work Estimation)
- Assign **OmniStudio Admin** permission set to admins
- Assign **OmniStudio User** to end users who run scripts

### Step 5: Enable Timeline
Setup → **Timeline**. Toggle on. Configure the preconfigured timelines:
- **Interaction Timeline** — anchored to Contact, used in Service Console
- **Asset Timeline** — anchored to Asset, used in Asset Service Console
- Add custom Timeline configurations for Account, Sales Agreement, etc., as needed.

### Step 6: Enable Record Alerts
Setup → **Record Alerts**. Toggle on. Add the **Record Alerts** Lightning component to the page layouts where alerts should surface (Account, Asset, Sales Agreement, console pages).

### Step 7: Enable Actionable Relationship Center (ARC)
Setup → **Actionable Relationship Center**. Define ARC graph configurations for the entities you want to visualize (Asset → Account Participants → Contact Participants is a common one for Service track).

### Step 8: Configure Flow Settings
Setup → **Flows**:
- Confirm Process Automation settings allow the Manufacturing-supplied flows to run
- Activate the bundled **Verify Customer Identity** flow if Service Console is in scope
- Set the default workflow user (for system-triggered flows)

### Step 9: Set Up Experience Cloud Sites (if external users in scope)
Setup → **Digital Experiences** → **All Sites** → **New**. Use the **Manufacturing** template:
- Distributor portal — for partners viewing Sales Agreements, Visits, Warranty Claims
- Supplier portal — for suppliers reviewing Supplier Recovery claims

After site creation:
- Assign `ManufacturingPartnerCommunityUser` to community users
- Configure CMS, branding, and navigation
- Publish the site

### Step 10: Configure Default Fiscal Year & Currency
- Setup → **Company Information** → confirm fiscal year (Account Manager Targets only supports **standard** fiscal year, not custom)
- Setup → **Currency** → enable multi-currency if planning multi-region rollouts
- Add active currency conversion rates

### Step 11: Configure Field-Level Security for Integration Users
- Analytics Integration User — needs read on all Account, Order, Sales Agreement fields used by CRM Analytics
- Received Document object — Bulk Job ID and Target Object API Name fields need FLS for DPE definitions to work

### Step 12: Assign Permission Sets
```bash
# Example: assign ManufacturingSalesUser
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<ManufacturingSalesUserId>" \
  --target-org <alias>
```

## Validation Checklist

- [ ] All required PSLs have `Status = 'Active'` and capacity remaining
- [ ] Manufacturing Settings page shows the in-scope features as **Enabled**
- [ ] OmniStudio Standard Runtime is on
- [ ] Timeline enabled and at least one Timeline configuration exists
- [ ] Record Alerts component added to Account / Asset page layouts
- [ ] Active Experience Cloud site (if external users in scope)
- [ ] Test user can log in and see the Manufacturing app
- [ ] Test user has expected tabs (Sales Agreements, Visits, etc.)

## Troubleshooting

| Issue | Root Cause | Fix |
|-------|------------|-----|
| "Manufacturing Settings" missing in Setup | Manufacturing Cloud SKU not provisioned | Open Salesforce support case |
| PSL assignment fails | Capacity exhausted or PSL not in org | Check `PermissionSetLicense.UsedLicenses < TotalLicenses`; request more |
| Permission set assignment fails with "INVALID_ID" | Underlying PSL not assigned to user | Assign PSL first, then PS |
| OmniScript components blank in console | Standard OmniStudio Runtime off | Setup → OmniStudio Settings → enable |
| Timeline shows no events | Timeline not enabled or wrong anchor object | Setup → Timeline → enable; confirm component on right page |
| Action Plans not visible to reps | Templates in `Draft` (`IsPublished = false`) | Open template → Publish |
| Experience Cloud users can't log in | `IsActive = false` on User, or community license exhausted | Activate user, confirm license capacity |
| Flow fails with "no access" on Received Document | FLS gap on Bulk Job ID / Target Object API Name | Grant FLS to standard user profile |
| DPE definitions silently produce no rows | Mapping mismatch between template params and program/forecast records | Verify Manufacturing Program Id, Program Component Template Item Name, Program Variant Template Item Name mappings |

## Cross-Module Dependencies

```
General Settings (this module)
  ├── Sales Agreements           — needs PSL, Manufacturing Settings toggle, Price Books
  ├── Forecasting (AAF)          — needs DPE, fiscal year, Account Manager Target hierarchy
  ├── Account Manager Targets    — needs standard fiscal year, hierarchy choice
  ├── Partner Visits             — needs Action Plan Templates, Experience Cloud (for partner reps)
  ├── Warranty                   — needs Claims Management Foundation PSL, Service Console
  ├── Service Console            — needs Industries Service Excellence PSL, Timeline, OmniStudio
  ├── Asset Service              — needs Service Console, Fleet PSL, ARC
  ├── Inventory Management       — needs DPE (for Searchable Field), Inventory Management toggle
  └── CRM Analytics              — needs Manufacturing Analytics PSL, Analytics Integration User FLS
```

Always configure General Settings first. Skipping a step here cascades into hard-to-diagnose failures in the per-module configuration wizards.
