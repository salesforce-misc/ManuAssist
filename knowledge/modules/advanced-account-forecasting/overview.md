# Advanced Account Forecasting (AAF) — Overview

Advanced Account Forecasting gives manufacturers a unified view of planned and actual business across customers, products, and locations. It uses the Data Processing Engine (DPE) to aggregate order and agreement data into structured forecast records, giving account managers and demand planners a real-time picture of business performance.

## Business Value

- Aggregate planned vs. actual data across all accounts and products in one view
- Enable demand planners to adjust forecasts based on market signals
- Track account manager targets against forecast performance
- Support program-based business (manufacturing programs with component-level forecasting)
- Feed CRM Analytics dashboards with structured forecast data

## Key Objects

| Object | Purpose |
|--------|---------|
| `AccountForecast` | Forecast header for an account and time period |
| `AccountForecastAdjustment` | Manual adjustment applied to a forecast period |
| `AccountForecastPeriodMetric` | Planned/actual metric by period and dimension |
| `AccountProductForecast` | Product-level breakdown within an account forecast |
| `AccountProductPeriodForecast` | Product forecast value for a specific period |
| `AcctMgrTarget` | Account manager revenue/quantity goal for a period |
| `AcctMgrTargetMeasure` | Measure definition within a target |
| `AcctMgrTargetDstr` | Distribution of a target across products, accounts, or periods |
| `AcctMgrPeriodicTargetDstr` | Period-level distribution of a target |

## Architecture

```
Sales Orders / ERP actuals
        ↓
SalesAgreementProductSchedule (ActualQuantity, ActualRevenue)
        ↓
Data Processing Engine (AAF DPE Job — runs on schedule)
        ↓
AccountForecast + AccountForecastPeriodMetric
        ↓
Forecasting UI (Account Forecast tab) + CRM Analytics dashboards
```

## Forecast Dimensions

Dimensions control how data is grouped in the forecast grid. Supported groupings:
- By **Product Family**
- By **Territory / Region**
- By **Location** (inventory or fulfillment site)
- By **Sales Agreement**
- Custom dimensions via DPE configuration

## Account Manager Targets

`AcctMgrTarget` records represent revenue or quantity goals assigned to an account manager for a period. Targets are distributed across products, accounts, or periods using `AcctMgrTargetDstr`.

Status lifecycle:
```
Draft → Active → Expired
```

## Permission Sets Required

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers viewing forecasts |
| `ManufacturingAnalyticsUser` | Business analysts, sales ops |

## SOQL Quick Reference

```sql
-- Forecast records by account and period
SELECT Id, AccountId, Account.Name, PeriodStartDate, PeriodEndDate
FROM AccountForecast
ORDER BY PeriodStartDate DESC LIMIT 20

-- Period metrics — planned vs actual
SELECT AccountForecastId, Metric, PlannedValue, ActualValue, PeriodStartDate
FROM AccountForecastPeriodMetric
WHERE PeriodStartDate = THIS_YEAR
ORDER BY PeriodStartDate ASC LIMIT 50

-- Active account manager targets
SELECT Id, Name, Status, StartDate, EndDate, Owner.Name, TotalTarget, TotalAllocatedTarget
FROM AcctMgrTarget
WHERE Status = 'Active'
ORDER BY StartDate DESC

-- Target distributions by product
SELECT AcctMgrTarget.Name, Product2.Name, TargetValue, PeriodStartDate
FROM AcctMgrTargetDstr
ORDER BY PeriodStartDate ASC LIMIT 50

-- Forecast adjustments
SELECT Id, AccountForecastId, AdjustmentValue, AdjustmentNote, CreatedBy.Name
FROM AccountForecastAdjustment
ORDER BY CreatedDate DESC LIMIT 20
```
