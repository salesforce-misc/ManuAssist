---
description: Interactive wizard to configure and validate Manufacturing Cloud Advanced Account Forecasting and Account Manager Targets
arguments: "[check-type]"
---

# Configure Advanced Account Forecasting

Interactive wizard to check and configure Advanced Account Forecasting (AAF) and Account Manager Targets.

## Arguments

- `check-type` (optional): Focus area — `full`, `dpe`, `targets`, `programs` (default: full)

## Instructions

### Step 1: Run Forecasting Configuration Check

```
check_forecasting_config()
```

This queries:
- AccountForecast record presence
- AccountForecastPeriodMetric coverage
- AcctMgrTarget status and count
- AcctMgrTargetDstr distributions
- MfgProgram records (Program-Based Business)
- DataProcessingEngineDefinition for Manufacturing/Forecast

### Step 2: Verify DPE Templates Installed

```sql
SELECT Id, DeveloperName, Status
FROM DataProcessingEngineDefinition
WHERE DeveloperName LIKE '%AAF%' OR DeveloperName LIKE '%Forecast%'
   OR DeveloperName LIKE '%Manufacturing%'
ORDER BY DeveloperName
```

Report:
- Which DPE definitions are installed
- WARN if no Manufacturing forecasting DPE definitions found (critical gap)

### Step 3: Check Forecast Period Configuration

```sql
SELECT PeriodStartDate, PeriodEndDate, COUNT(Id) total
FROM AccountForecastPeriodMetric
GROUP BY PeriodStartDate, PeriodEndDate
ORDER BY PeriodStartDate DESC
LIMIT 12
```

Report:
- Periods with forecast data
- Whether current/future periods are populated
- WARN if no current-year data (DPE may not have run)

### Step 4: Check Account Manager Targets

```
check_account_manager_targets()
```

Report:
- Active targets and their owners
- Target distribution coverage
- WARN if targets exist but no distributions (targets not broken down by product/period)

### Step 5: Present Forecasting Report

```
## Advanced Account Forecasting Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### DPE Templates
- Installed: [Yes/No]
- Definitions found: [list]

### Account Forecasts
- Total records: [count]
- Periods covered: [range]

### Account Manager Targets
- Active targets: [count]
- Distributions: [count]

### Program-Based Business
- Programs configured: [count]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 6: Offer Next Steps

**If DPE not installed:**
- Guide to: Setup > Data Processing Engine > Install Manufacturing Templates
- Provide Salesforce help link for AAF DPE setup

**If forecasts not generated:**
- Ask: "Want me to trigger a DPE run now?"
- If yes: use `run_apex` to trigger the DPE definition

**If no Account Manager Targets:**
- Ask: "Would you like to create Account Manager Targets for your account managers?"
- Guide through creating AcctMgrTarget records

**If all checks pass:**
- Confirm forecasting is configured
- Suggest scheduling DPE as a recurring nightly job

## Admin Console Navigation

| Task | Path |
|------|------|
| Enable AAF | Setup > Manufacturing Settings |
| DPE Definitions | Setup > Data Processing Engine |
| Schedule DPE | Setup > Scheduled Jobs |
| Forecasting UI | App Launcher > Account Forecasting |
| Targets UI | App Launcher > Account Manager Targets |

## IMPORTANT OBJECT REMINDERS

- Use `AccountForecast` NOT `Forecast__c` or `AccountForecast__c`
- Use `AcctMgrTarget` NOT `AccountManagerTarget__c` or `ManagerTarget__c`
- Use `MfgProgram` NOT `ManufacturingProgram__c`
- DPE runs generate `AccountForecastPeriodMetric` records — check these if forecasts look wrong
