---
name: mfg-sales-agreements
description: Expert guidance on Manufacturing Cloud Sales Agreements — configuration, activation, actuals sync, troubleshooting, and best practices. Use when user asks about Sales Agreements, run-rate business, planned vs. actual quantities, SalesAgreement object, SalesAgreementProduct, or SalesAgreementProductSchedule.
---

# Manufacturing Cloud Sales Agreements

Sales Agreements are the core of Manufacturing Cloud for Sales. They capture long-term committed business — the products, quantities, and revenue negotiated between a manufacturer and their customers (OEMs, distributors, dealers).

## What Sales Agreements Do

- Track committed product quantities and revenue over a defined period
- Compare planned quantities (from the agreement) vs. actual quantities (from orders/ERP)
- Provide account managers with a real-time view of customer compliance with commitments
- Feed into Advanced Account Forecasting for demand planning

## Key Objects

| Object | Purpose |
|--------|---------|
| `SalesAgreement` | Header — account, status, term dates, owner |
| `SalesAgreementProduct` | Products associated with the agreement |
| `SalesAgreementProductSchedule` | Planned and actual qty/revenue by time period |
| `SalesAgreementProdSchdAdj` | Adjustments to product schedule values |
| `SalesAgreeProductAttribute` | Custom attribute values on agreement products |
| `SalesAgreementStatus` | Status picklist configuration for agreements |
| `SalesContractLine` | Line items on a related sales contract |

## Configuration Steps

### Step 1: Enable Sales Agreements
Go to **Setup > Manufacturing Settings > Enable Sales Agreements**.

### Step 2: Create Record Types
- Setup > Object Manager > Sales Agreement > Record Types
- Recommended types: `Standard`, `Long-Term Contract`, `Program Agreement`

### Step 3: Configure Page Layouts
- Add: Account, Start Date, End Date, Status, Currency, Owner
- Add related lists: Sales Agreement Products, Schedules, Activity History

### Step 4: Create and Activate
1. Create the `SalesAgreement` record with Account and dates
2. Add `SalesAgreementProduct` records (one per product line)
3. Define `SalesAgreementProductSchedule` periods (monthly/quarterly/annual)
4. Set Status to **Active** to begin tracking actuals

### Step 5: Connect to ERP for Actuals
Actuals (fulfilled quantities) are written to `SalesAgreementProductSchedule.ActualQuantity` and `ActualRevenue`. These come from:
- Orders synced from ERP via MuleSoft Accelerator for Manufacturing
- Direct API updates from Order Management System
- Manual updates for non-integrated environments

## Checking Configuration
Use `check_sales_agreement_config` to validate:
- Record type setup
- Active agreement counts
- Product and schedule coverage
- Permission set assignments

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Users can't create agreements | Missing `ManufacturingSalesUser` or `SalesAgreementsUser` PS | Assign permission set |
| Actuals not updating | ERP integration not syncing to `SalesAgreementProductSchedule` | Check MuleSoft flows or API integration |
| Agreement stuck in Draft | No activation automation configured | Add Flow or Process to set Status = Active |
| Products not visible | Price Book not linked or PricebookEntry inactive | Check Pricebook2 and PricebookEntry records |
| Agreement expires | EndDate passed — Status auto-set to Expired | Renew by updating EndDate and re-activating |

## SOQL Quick Reference

```sql
-- Active agreements with compliance summary
SELECT Id, Name, Status, Account.Name, StartDate, EndDate
FROM SalesAgreement
WHERE Status = 'Active'
ORDER BY EndDate ASC

-- Find agreements expiring in next 30 days
SELECT Id, Name, Account.Name, EndDate
FROM SalesAgreement
WHERE Status = 'Active'
AND EndDate = NEXT_N_DAYS:30

-- Planned vs actual by product
SELECT SalesAgreement.Name, Product2.Name, PlannedQuantity, ActualQuantity,
       PlannedRevenue, ActualRevenue
FROM SalesAgreementProductSchedule
WHERE SalesAgreement.Status = 'Active'
ORDER BY SalesAgreement.Name, PeriodStartDate ASC

-- Agreements with no actuals (potential ERP sync issue)
SELECT SalesAgreement.Name, Product2.Name, PlannedQuantity
FROM SalesAgreementProductSchedule
WHERE ActualQuantity = 0 AND PlannedQuantity > 0
AND SalesAgreement.Status = 'Active'
```
