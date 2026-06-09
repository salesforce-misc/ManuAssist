# Analytics for Manufacturing — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud enabled
- Active Sales Agreements with products and schedules (otherwise dashboards are empty)
- For full CRM Analytics: **Manufacturing Analytics PSL** + **CRM Analytics Plus** entitlements
- Analytics Cloud Integration User profile available
- Customize Application permission for setup steps

## Quick Decision Tree

```
Have CRM Analytics add-on license?
   ├── No → Use Default Analytics Dashboard (Beta) — free, basic
   └── Yes → Use CRM Analytics for Manufacturing (full)
              │
              └── Need predictive forecasting? → Add Statistical Order Forecasting
                  Need warranty insights? → Add CRM Analytics for Warranty Lifecycle
                  Need forecast accuracy? → Add Advanced Account Forecasting Analytics
```

## Path A: Default Analytics Dashboard (Beta)

### Step 1: Confirm Underlying Data
Run:
```sql
SELECT COUNT(Id) FROM SalesAgreement
SELECT COUNT(Id) FROM SalesAgreementProduct
SELECT COUNT(Id) FROM SalesAgreementProductSchedule
```
All three must be > 0. If not, the dashboard renders empty with no error.

### Step 2: Assign Permission Set
Setup → Permission Sets → **Analytics View Only Embedded App** → Manage Assignments → Add Assignments → select target users.

### Step 3: Enable CRM Analytics
Setup → quick find **Analytics** → Getting Started → **Enable CRM Analytics**.

### Step 4: Set Field-Level Security on Account
Setup → Object Manager → Account → Fields & Relationships:
- AccountNumber → Set Field-Level Security → Visible + Read-Only for **Analytics Cloud Integration User** profile
- Repeat for Ownership and Rating

### Step 5: Enable the Dashboard
Setup → Manufacturing → **Sales Agreements** → Enable Default Analytics Dashboards.

### Step 6: Embed in Manufacturing Home Page
1. Manufacturing app → Home page → wheel icon → **Edit Page**
2. Lightning App Builder → drop **CRM Analytics Dashboard** component
3. Dashboard dropdown → select **Manufacturing Home Page**
4. Save → Activate

## Path B: CRM Analytics for Manufacturing (Full)

### Step 1: Assign Permission Sets
Setup → Permission Sets:

**Admins (each user):**
- CRM Analytics Plus Admin
- Manufacturing Analytics Admin

**Users (each user):**
- CRM Analytics Plus User
- Manufacturing Analytics User

```bash
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<PSId>" \
  --target-org <alias>
```

### Step 2: Enable CRM Analytics
Setup → Analytics → Getting Started → **Enable CRM Analytics**.

### Step 3: Configure Field-Level Security on All Required Objects
For the **Analytics Cloud Integration User** profile, grant **Visible** access on every required field across:
- Account, Order, Order Item, Product, Pricebook
- Sales Agreement / Product / Product Schedule
- Account Forecast / Period Metric / Product Forecast / Product Period Forecast
- Account Manager Target / Measure / Distribution / Periodic Target Distribution
- Rebate Program / Member / Member Product Aggregate / Payout Period
- Transaction Journal, ProgramRebateTypBenefit, ProgramRebateTypPayoutSrc

> Skipping any field will fail the install. Use **Set Field-Level Security** in bulk per object.

### Step 4: Use the Setup Wizard
Setup → quick find **Set Up CRM Analytics for Manufacturing**:
1. Click each "Get Started" link in order
2. Add the modules you want (Sales Agreements, Account Manager Targets, Account Forecasts, Rebates)
3. Add Einstein Discovery stories — only if you have ≥ 300 rows of forecasting / agreement data
4. Configure Data Access — pick security predicate (User Role / Manager Hierarchy / None)
5. Select Currency
6. Install

### Step 5: Create the App in Analytics Studio
1. Analytics Studio → **Create** → **App**
2. Select **Analytics for Manufacturing** template → Continue
3. Compatibility check → fix any issues
4. Pick objects (Sales Agreement, Account Forecast, Sales Target, Rebates)
5. **Wizard Q&A:**
   - Security predicate hierarchy: User Role / User Manager / None
   - Sales Targets hierarchy enforcement: Yes/No
   - Order credit: Account Owner / Order Owner / Other User
   - Einstein Discovery stories: choose, or skip
   - Currency: confirm org currency
6. Name app → Create

### Step 6: Schedule the Dataflow
Analytics Studio → Data Manager → Dataflows → schedule **daily** (or more frequent if data velocity demands).

### Step 7: Embed Dashboards
- Lightning App Builder → drop **CRM Analytics Dashboard** component on relevant pages (Account, Sales Agreement, Manufacturing Home)
- Choose dashboard from the app

### Step 8: Share the App
- Open app in Analytics Studio → Share → search for users
- Assign role: **Viewer**, **Editor**, or **Manager**
- Editor / Manager require Plus Admin or Plus User PS

### Step 9: (Optional) Statistical Order Forecasting
- Use OOTB template referencing your Advanced Account Forecast Sets
- Define dimensions and period groups requiring forecast data
- Multiplicative model gives 95% confidence on quantity + revenue predictions

## Validation Checklist

### Default Dashboard
- [ ] SalesAgreement / Product / Schedule records exist
- [ ] Analytics View Only Embedded App PS assigned
- [ ] CRM Analytics enabled
- [ ] Account FLS set for Analytics Cloud Integration User
- [ ] Dashboard enabled in Manufacturing Settings
- [ ] CRM Analytics Dashboard component on Home page → Manufacturing Home Page selected

### CRM Analytics for Manufacturing
- [ ] Manufacturing Analytics PSL provisioned
- [ ] CRM Analytics Plus + Manufacturing Analytics admin/user permission sets assigned
- [ ] All required object fields have FLS for Analytics Cloud Integration User
- [ ] App installed (no skipped sections)
- [ ] Dataflow scheduled and ran successfully
- [ ] Dashboards embedded on relevant Lightning pages
- [ ] App shared with intended users

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Default dashboard appears blank | No SalesAgreement / Product / Schedule data | Create test data; Schedule must be > 0 |
| Default dashboard error: "no access to fields" | Account FLS missing for Integration User | Set FLS on AccountNumber, Ownership, Rating |
| App install skipped Einstein Discovery | < 300 rows of source data for the story | Wait for more data, or skip Discovery and install without |
| App install failed midway | Field-level security gap on one of the required fields | Read the error, grant FLS on the named field, retry |
| Dashboards show stale data | Dataflow not scheduled or paused | Analytics Studio → Data Manager → schedule dataflow |
| User can't open app | Missing CRM Analytics Plus User PS | Assign |
| Security predicate filters everything out | Wrong hierarchy choice (Role vs. Manager) | Recreate app with correct hierarchy choice |
| Sales Target dashboard empty | Account Manager Targets module not in scope, or hierarchy mismatch with target hierarchy | Match Analytics security predicate to Account Manager Targets hierarchy choice |
| Order revenue attributed to wrong user | Wrong order credit choice (Account Owner vs. Order Owner vs. Other User) | Recreate app with correct choice |
| Currency on dashboard doesn't match org | Currency wizard answer mismatched | Recreate app with correct currency |
| Einstein Discovery story shows "Insufficient data" | Below 300-row threshold | Add more data, refresh |
| Statistical Order Forecasting prediction missing | Forecast Set has no fact data, or template not run | Verify forecast set + DPE; re-run template |
| Dashboard renders but no rebate data | Rebate object FLS missing for Analytics Integration User | Add FLS for Rebate Program Member, Member Product Aggregate, etc. |
| Edit dashboard option missing | User has Viewer role only | Promote to Editor / Manager (also requires Plus Admin/User PS) |

## Best Practices

- Provision FLS on **all** required fields **before** clicking Install — saves multiple failed runs
- Schedule the dataflow off-peak (e.g., 3 AM org time) to avoid contention
- Match Analytics security predicate to Account Manager Targets hierarchy — otherwise dashboards disagree with Setup
- Use **Order Owner** credit attribution if your org runs distribution-based comp; **Account Owner** for direct sales
- Don't enable Einstein Discovery stories until you have meaningful data volume
- Audit the Default Dashboard quarterly — beta features can be discontinued
- For multi-currency orgs, install one app per primary currency or use the dual-currency support
