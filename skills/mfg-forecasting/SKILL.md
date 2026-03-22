---
name: mfg-forecasting
description: Expert guidance on Manufacturing Cloud Advanced Account Forecasting and Account Manager Targets — DPE setup, forecast dimensions, period configuration, target distribution. Use when user asks about forecasting, AAF, AccountForecast, AcctMgrTarget, DPE, or demand planning.
---

# Manufacturing Cloud Advanced Account Forecasting

Advanced Account Forecasting (AAF) gives manufacturers a unified view of planned and actual business across customers, products, and locations. It uses Data Processing Engine (DPE) to aggregate sales data into forecast records.

## Key Objects

| Object | Purpose |
|--------|---------|
| `AccountForecast` | Forecast header for an account and period |
| `AccountForecastPeriodMetric` | Planned/actual metric by period and dimension |
| `AcctMgrTarget` | Account manager target (revenue/quantity goal) |
| `AcctMgrTargetDstr` | Distribution of a target across products, accounts, or periods |
| `ManufacturingProgram` | Manufacturing program (for Program-Based Business) |
| `MfgProgramTemplate` | Template defining program structure |
| `MfgProgramTemplateItem` | Items within a program template |
| `MfgProgramForecastFact` | Forecast derived from customer program data |
| `MfgProgramCpntFrcstFact` | Component-level forecast within a program |
| `AdvAccountForecastSet` | Forecast set grouping multiple forecast facts |
| `AdvAccountForecastFact` | Individual forecast fact record within a set |

## Architecture

```
Sales Orders / ERP actuals
        ↓
SalesAgreementProductSchedule (ActualQuantity, ActualRevenue)
        ↓
Data Processing Engine (AAF DPE Job)
        ↓
AccountForecast + AccountForecastPeriodMetric
        ↓
Forecasting UI (Account Forecast tab) + CRM Analytics dashboards
```

## Configuration Steps

### Step 1: Enable Advanced Account Forecasting
Setup > Manufacturing Settings > Enable Advanced Account Forecasting

### Step 2: Install DPE Templates
The prebuilt Manufacturing Cloud DPE definitions must be installed:
- Go to Setup > Data Processing Engine
- Install the "Advanced Account Forecasting" DPE template package
- Verify definitions appear: `AAF_Account_Summary`, `AAF_Product_Dimensions`, etc.

### Step 3: Configure Forecast Periods
- Define time periods (monthly, quarterly, annual)
- Set the forecast horizon (e.g., 12 months forward)
- Map your fiscal calendar if different from Salesforce default

### Step 4: Configure Forecast Dimensions
Dimensions control how data is grouped in the forecast grid:
- By Product Family
- By Territory / Region
- By Location (inventory site)
- By Sales Agreement

### Step 5: Schedule DPE Jobs
- Go to Setup > Scheduled Jobs
- Schedule the AAF DPE definition to run daily (or weekly for low-volume)
- First run populates historical data; subsequent runs update actuals

### Step 6: Account Manager Targets
1. Create `AcctMgrTarget` records (one per account manager per period)
2. Set `TotalTarget` (revenue or quantity goal)
3. Use `AcctMgrTargetDstr` to distribute targets across products, accounts, or time periods
4. Activate the target — it becomes visible to account managers in the Targets UI

## Checking Configuration
Use `check_forecasting_config` to validate:
- AccountForecast record presence
- DPE definition installation
- Account Manager Target coverage
- Program-Based Business records (if applicable)

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Forecasts not generating | DPE not installed or not scheduled | Install DPE template, schedule and run |
| Forecasts show 0 actuals | SalesAgreementProductSchedule.ActualQuantity not populated | Check ERP sync |
| Account manager can't see targets | Missing `ManufacturingSalesUser` permission set | Assign PS |
| Program forecasts missing | ManufacturingProgram records not created | Create programs for production supplier use cases |
| Period metrics stale | DPE not running on schedule | Check Scheduled Jobs, re-run DPE |

## Detailed Documentation

Use `get_mfg_module_docs` with slug `advanced-account-forecasting` for full configuration reference, or `search_mfg_knowledge` for targeted searches.

## SOQL Quick Reference

```sql
-- Check forecast generation
SELECT Id, AccountId, Account.Name, PeriodStartDate, PeriodEndDate
FROM AccountForecast
ORDER BY PeriodStartDate DESC LIMIT 20

-- Period metrics — planned vs actual
SELECT AccountForecastId, Metric, PlannedValue, ActualValue, PeriodStartDate
FROM AccountForecastPeriodMetric
WHERE PeriodStartDate = THIS_YEAR
ORDER BY PeriodStartDate ASC LIMIT 50

-- Account manager targets
SELECT Id, Name, Status, StartDate, EndDate, Owner.Name, TotalTarget, TotalAllocatedTarget
FROM AcctMgrTarget WHERE Status = 'Active' ORDER BY StartDate DESC

-- Target distributions by product
SELECT AcctMgrTarget.Name, Product2.Name, TargetValue, PeriodStartDate
FROM AcctMgrTargetDstr
ORDER BY PeriodStartDate ASC LIMIT 50
```
