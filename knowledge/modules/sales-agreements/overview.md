# Sales Agreements — Overview

Sales Agreements are the core of Manufacturing Cloud for Sales. They capture long-term committed business — the products, quantities, and revenue negotiated between a manufacturer and their customers (OEMs, distributors, dealers). They provide a single source of truth for run-rate business.

## Business Value

- Track committed product quantities and revenue over a defined contract period
- Compare planned quantities (agreed) vs. actual quantities (fulfilled from orders/ERP)
- Give account managers real-time compliance visibility
- Feed into Advanced Account Forecasting for demand planning
- Trigger alerts when customers fall behind on commitments

## Key Objects

| Object | Purpose |
|--------|---------|
| `SalesAgreement` | Header — account, status, term dates, owner, currency |
| `SalesAgreementProduct` | Products associated with the agreement |
| `SalesAgreementProductSchedule` | Planned and actual qty/revenue by time period |
| `SalesAgreementProdSchdAdj` | Adjustments to product schedule values |
| `SalesAgreeProductAttribute` | Custom attribute values on agreement products |
| `SalesAgreementStatus` | Status picklist configuration for agreements |
| `SalesContractLine` | Line items on a related sales contract |

## Status Lifecycle

```
Draft → Active → Expired (auto when EndDate passes)
              → Cancelled (manual)
```

- **Draft**: Agreement created but not yet active; actuals not tracked
- **Active**: Agreement is live; actuals sync from ERP into schedules
- **Expired**: EndDate passed; read-only; can be renewed by updating dates
- **Cancelled**: Manually terminated

> Note: The `Status` field on `SalesAgreement` is a **restricted standard picklist**. Custom values cannot be added via Setup. To track custom states (e.g., "Pending Renewal"), use a separate custom field.

## Data Model Relationships

```
Account
  └── SalesAgreement (one per negotiated contract)
        └── SalesAgreementProduct (one per product line)
              └── SalesAgreementProductSchedule (one per period)
                    ├── PlannedQuantity / PlannedRevenue  (agreed)
                    └── ActualQuantity / ActualRevenue    (fulfilled from ERP)
```

## Actuals Sync

Actual quantities flow from ERP into `SalesAgreementProductSchedule.ActualQuantity` and `ActualRevenue` via:
- **MuleSoft Accelerator for Manufacturing** (recommended)
- Direct REST API from Order Management System
- Manual updates for non-integrated environments

## Permission Sets Required

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers, sales reps |
| `SalesAgreementsUser` | Compliance tracking, read-only access |

## SOQL Quick Reference

```sql
-- Active agreements with account
SELECT Id, Name, Status, Account.Name, StartDate, EndDate, CurrencyIsoCode, Owner.Name
FROM SalesAgreement
WHERE Status = 'Active'
ORDER BY EndDate ASC

-- Agreements expiring in next 30 days
SELECT Id, Name, Account.Name, EndDate
FROM SalesAgreement
WHERE Status = 'Active' AND EndDate = NEXT_N_DAYS:30

-- Planned vs actual by product and period
SELECT SalesAgreement.Name, Product2.Name, PlannedQuantity, ActualQuantity,
       PlannedRevenue, ActualRevenue, PeriodStartDate, PeriodEndDate
FROM SalesAgreementProductSchedule
WHERE SalesAgreement.Status = 'Active'
ORDER BY SalesAgreement.Name, PeriodStartDate ASC

-- Agreements with no actuals (possible ERP sync issue)
SELECT SalesAgreement.Name, Product2.Name, PlannedQuantity, PeriodStartDate
FROM SalesAgreementProductSchedule
WHERE ActualQuantity = 0 AND PlannedQuantity > 0
AND SalesAgreement.Status = 'Active'

-- Product attribute values
SELECT SalesAgreementProductId, Name, Value
FROM SalesAgreeProductAttribute
ORDER BY SalesAgreementProductId
```
