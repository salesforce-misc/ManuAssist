# Advanced Account Forecasting — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Sales license
- Sales Agreements enabled and populated with `ActualQuantity` data
- Data Processing Engine (DPE) feature available in the org

## Configuration Steps

### Step 1: Enable Advanced Account Forecasting
Go to **Setup > Manufacturing Settings > Enable Advanced Account Forecasting** and toggle on.

### Step 2: Install DPE Templates
The prebuilt Manufacturing Cloud DPE definitions must be installed:
1. Go to **Setup > Data Processing Engine**
2. Install the "Advanced Account Forecasting" DPE template package
3. Verify these definitions appear:
   - `AAF_Account_Summary`
   - `AAF_Product_Dimensions`
   - `AAF_Period_Rollup`

### Step 3: Configure Forecast Periods
1. Go to **Setup > Forecast Period Settings** (under Manufacturing Settings)
2. Define time period granularity: Monthly, Quarterly, or Annual
3. Set the forecast horizon (e.g., 12 months forward, 12 months historical)
4. Map fiscal calendar if different from standard Salesforce calendar

### Step 4: Configure Forecast Dimensions
Navigate to **Setup > Manufacturing Settings > Forecast Dimensions** and enable:
- Product Family grouping
- Territory / Region grouping
- Location-based dimensions
- Custom dimensions (requires DPE customization)

### Step 5: Schedule DPE Jobs
1. Go to **Setup > Scheduled Jobs**
2. Schedule the AAF DPE definition to run on a recurring basis:
   - Daily — for active orgs with frequent order activity
   - Weekly — for low-volume environments
3. The first run populates historical data; subsequent runs update actuals

### Step 6: Configure Account Manager Targets
1. Create `AcctMgrTarget` records (one per account manager per period)
2. Set `TotalTarget` (revenue or quantity goal)
3. Set `StartDate` and `EndDate` to define the target period
4. Distribute targets across products/accounts using `AcctMgrTargetDstr`
5. Set `Status = Active` to publish targets to account managers

### Step 7: Assign Permission Sets
| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers viewing forecasts |
| `ManufacturingAnalyticsUser` | Business analysts, sales ops |

## Validation Checklist

Run `check_forecasting_config` to validate:
- [ ] Advanced Account Forecasting enabled
- [ ] DPE definitions installed
- [ ] AccountForecast records exist (DPE has run at least once)
- [ ] AccountForecastPeriodMetric records populated
- [ ] AcctMgrTarget records created for active account managers
- [ ] DPE scheduled job is active

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Forecasts not generating | DPE not installed or not scheduled | Install DPE template, schedule and run |
| Forecasts show 0 actuals | SalesAgreementProductSchedule.ActualQuantity not populated | Check ERP sync / MuleSoft integration |
| Account manager can't see targets | Missing `ManufacturingSalesUser` permission set | Assign permission set |
| Program forecasts missing | ManufacturingProgram records not created | Create programs for production supplier use cases |
| Period metrics stale | DPE not running on schedule | Check Scheduled Jobs; manually re-run DPE |
| Forecast dimensions not showing | Dimensions not enabled in Manufacturing Settings | Enable required dimensions in Setup |
| Target not visible to rep | AcctMgrTarget status is Draft | Set Status = Active |
| Incorrect fiscal period mapping | Fiscal calendar mismatch | Review fiscal year settings in Setup > Fiscal Year |
