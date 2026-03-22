# Manufacturing Programs — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Sales license
- Advanced Account Forecasting enabled (programs feed into AAF)
- Account records representing OEM or production customers
- Product2 records for all components in the program

## Configuration Steps

### Step 1: Enable Manufacturing Programs
Go to **Setup > Manufacturing Settings > Enable Manufacturing Programs** and toggle on.

This also requires Advanced Account Forecasting to be enabled.

### Step 2: Create Program Templates
Templates define the standard structure for a program type (e.g., automotive model year, annual supply agreement):

1. Go to **App Launcher > Manufacturing Program Templates > New**
2. Set template name and description (e.g., "Automotive Model Year Template")
3. Add `MfgProgramTemplateItem` records for each component:
   - Component name
   - Linked `Product2` record
   - Default quantity or percentage
   - Sequence number

### Step 3: Create Manufacturing Programs
1. Go to **App Launcher > Manufacturing Programs > New**
2. Set required fields:
   - **Name**: Program identifier (e.g., "Ford F-150 MY2026 Supply Program")
   - **Account**: The OEM / production customer account
   - **Start Date / End Date**: Program production period
   - **Status**: Draft initially
3. Optionally link to an `MfgProgramTemplate` to auto-populate components

### Step 4: Link Components and Products
Within each program, define the component demand:
- Associate `Product2` records representing components
- Set planned quantities per period
- These populate `MfgProgramCpntFrcstFact` records after DPE runs

### Step 5: Activate the Program
Set `Status = Active` to begin tracking forecast vs. actual at the component level.

### Step 6: Configure DPE for Program Forecasts
Programs feed into Advanced Account Forecasting via DPE:
1. Verify the `AAF_Program_Summary` DPE definition is installed
2. Schedule DPE to run to generate `MfgProgramForecastFact` records
3. Confirm `AccountForecastPeriodMetric` records are created from program data

### Step 7: Assign Permission Sets
| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers managing programs |
| `ManufacturingAnalyticsUser` | Demand planners using program forecast data |

## Validation Checklist

- [ ] Manufacturing Programs enabled in Setup
- [ ] At least one `MfgProgramTemplate` with template items
- [ ] Active `ManufacturingProgram` records linked to OEM accounts
- [ ] `MfgProgramCpntFrcstFact` records generated after DPE run
- [ ] `MfgProgramForecastFact` records visible in Account Forecast view
- [ ] `ManufacturingSalesUser` permission set assigned to account managers

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Component forecasts not generating | DPE not running or AAF DPE template missing program definition | Check DPE installation; re-run DPE job |
| Program not visible in Account Forecast | Program not Active or DPE hasn't processed it yet | Set Status = Active; trigger DPE run |
| Template items not auto-populating | Program not linked to a template | Link `MfgProgramTemplate` when creating the program |
| Variant forecasts missing | `MfgProgramVariantFrcstFact` not generated | Check product variant configuration in the program |
| Account manager can't see programs | Missing `ManufacturingSalesUser` permission set | Assign permission set |
| Program forecast showing 0 actuals | No order data linked to the program | Ensure orders are associated with the program account and ERP sync is running |
