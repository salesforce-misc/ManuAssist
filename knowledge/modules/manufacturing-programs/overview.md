# Manufacturing Programs — Overview

Manufacturing Programs support program-based business relationships — structured supply agreements between a manufacturer and a production customer (OEM, Tier-1 supplier). A program defines the components required for a production run, enabling component-level demand forecasting and fulfillment tracking across the manufacturing supply chain.

## Business Value

- Model long-term production programs (e.g., automotive model year programs, OEM supply contracts)
- Track component-level demand and fulfillment within a program
- Generate program-based forecasts that feed into Advanced Account Forecasting
- Support variant-level forecasting for product configurations within a program
- Provide account managers with a single view of all active production programs

## Key Objects

| Object | Purpose |
|--------|---------|
| `ManufacturingProgram` | Program header — account, status, production dates, vehicle/product model |
| `MfgProgramTemplate` | Template defining the standard structure of a program type |
| `MfgProgramTemplateItem` | Component or line item definition within a template |
| `MfgProgramForecastFact` | Aggregated forecast fact derived from program data |
| `MfgProgramCpntFrcstFact` | Component-level forecast fact within a program |
| `MfgPgmCpntFrcstFactOpptySchd` | Opportunity schedule tied to a component forecast fact |
| `MfgProgramVariantFrcstFact` | Variant-level forecast for product configuration within a program |

## Program Lifecycle

```
Draft → Active → Closed
      → Cancelled
```

- **Draft**: Program being configured; components and forecasts not yet live
- **Active**: Production is live; component forecasts being tracked
- **Closed**: Program has ended (model year complete, contract fulfilled)

## Program Template Structure

Templates standardize how programs are created:
1. Define component families and required parts in `MfgProgramTemplateItem`
2. Set default quantities, lead times, and forecast horizons
3. When a new program is created from a template, component records are auto-generated

## Integration with Advanced Account Forecasting

Manufacturing Programs feed into AAF:
```
ManufacturingProgram
  └── MfgProgramCpntFrcstFact (component demand by period)
        ↓
  AccountForecastPeriodMetric (aggregated via DPE)
        ↓
  AccountForecast (account manager view)
```

## Use Cases

| Use Case | Objects Used |
|----------|-------------|
| Automotive OEM supply program (model year) | `ManufacturingProgram` + `MfgProgramTemplate` |
| Component-level demand planning | `MfgProgramCpntFrcstFact` |
| Product variant forecasting | `MfgProgramVariantFrcstFact` |
| Program vs. actual tracking | `MfgProgramForecastFact` |

## Permission Sets Required

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers viewing programs |
| `ManufacturingAnalyticsUser` | Demand planners working with program forecasts |

## SOQL Quick Reference

```sql
-- Active manufacturing programs
SELECT Id, Name, Status, AccountId, Account.Name, StartDate, EndDate
FROM ManufacturingProgram
WHERE Status = 'Active'
ORDER BY StartDate DESC

-- All programs by account
SELECT Id, Name, Status, StartDate, EndDate
FROM ManufacturingProgram
WHERE AccountId = '<AccountId>'
ORDER BY StartDate DESC

-- Program forecast facts
SELECT Id, ManufacturingProgramId, ManufacturingProgram.Name,
       PeriodStartDate, PeriodEndDate, ForecastQuantity, ActualQuantity
FROM MfgProgramForecastFact
ORDER BY PeriodStartDate DESC LIMIT 50

-- Component-level forecast facts
SELECT Id, ManufacturingProgramId, ManufacturingProgram.Name,
       ProductId, Product.Name, PeriodStartDate, ForecastQuantity
FROM MfgProgramCpntFrcstFact
ORDER BY ManufacturingProgramId, PeriodStartDate ASC LIMIT 50

-- Program templates
SELECT Id, Name, IsActive, LastModifiedDate
FROM MfgProgramTemplate
WHERE IsActive = true
ORDER BY Name

-- Template items (component definitions)
SELECT Id, MfgProgramTemplateId, MfgProgramTemplate.Name, Name, Sequence
FROM MfgProgramTemplateItem
ORDER BY MfgProgramTemplateId, Sequence ASC
```
