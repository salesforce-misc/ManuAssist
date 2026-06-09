# Analytics for Manufacturing — Overview

Analytics for Manufacturing surfaces sales agreements, account forecasts, account manager targets, rebates, warranty trends, and inventory performance through pre-built CRM Analytics dashboards. It also includes a beta **Default Analytics Dashboard** delivered with Manufacturing Cloud.

## What's Available

| Capability | Type | Notes |
|------------|------|-------|
| **Default Analytics Dashboard for Manufacturing (Beta)** | Lightning component | Free; embeds in Manufacturing home page |
| **Business Overview Dashboard (Beta)** | Lightning component | Revenue Realization, Account Performance, Upcoming Renewals |
| **CRM Analytics for Manufacturing** | App template | Add-on license; full CRMA experience |
| **Statistical Order Forecasting Predictions** | Einstein Discovery | Multiplicative time-series model; 95% confidence; for Advanced Account Forecast Sets |
| **CRM Analytics for Warranty Lifecycle Management** | App template | Insights on claims and warranty trends |
| **Advanced Account Forecasting Analytics** | App template | Forecast accuracy, run-rate compliance |

> **Beta features** are not part of "Services" under the Main Services Agreement. They are evaluation-only, no SLA, may be discontinued.

## Default Analytics Dashboard (Beta)

The free, lightweight option for orgs that don't have a CRM Analytics add-on license. Shows:

- **Revenue Realization** — current-year revenue realization trend
- **Account Performance** — accounts with < 100% revenue realization
- **Upcoming Renewals** — agreements pending renewal / approval / under revision

### Prerequisites
- Records exist in `SalesAgreement`, `SalesAgreementProduct`, `SalesAgreementProductSchedule` (the dashboard fails silently if any are empty)
- CRM Analytics enabled
- **Analytics View Only Embedded App** permission set assigned to viewers
- Field-level security on Account: `AccountNumber`, `Ownership`, `Rating` → Visible/Read-Only for the Analytics Cloud Integration User

### Setup
1. Setup → Permission Sets → Analytics View Only Embedded App → assign to users
2. Setup → Analytics → Getting Started → Enable CRM Analytics
3. Set Account FLS for Analytics Cloud Integration User
4. Setup → Manufacturing → Sales Agreements → Enable Default Analytics Dashboards
5. Manufacturing home page → Edit Page → drop CRM Analytics Dashboard component → choose **Manufacturing Home Page** dashboard → Save → Activate

## CRM Analytics for Manufacturing (full)

The premium offering. Available as part of Manufacturing Cloud Intelligence (an add-on).

### Required PSLs / Permissions
- **CRM Analytics Plus Admin** + **Manufacturing Analytics Admin** (admins)
- **CRM Analytics Plus User** + **Manufacturing Analytics User** (users)
- Manufacturing Analytics PSL provisioned

### Required Object Access (FLS for Analytics Integration User)
**For Sales Agreements & Forecasting:**
- Sales Agreement, Sales Agreement Product, Sales Agreement Product Schedule
- Account Forecast, Account Forecast Period Metric, Account Product Forecast, Account Product Period Forecast

**For Account Manager Targets:**
- Account Manager Target, Account Manager Target Measure, Account Manager Target Distribution, Account Manager Periodic Target Distribution
- Account, User, Order

**For Rebates:**
- Rebate Program Member, Rebate Member Product Aggregate, Rebate Program Payout Period, Rebate Program
- Order, Order Product, Opportunity, User, Transaction Journal, ProgramRebateTypBenefit, ProgramRebateTypPayoutSrc

**Always:**
- Product, Pricebook, Account, Opportunity Line Item

### Setup Flow (one-page wizard)
Setup → quick find **Set Up CRM Analytics for Manufacturing**:
1. Assign Permission Sets
2. Enable CRM Analytics
3. Add Analytics for Sales Agreements → optional
4. Add Analytics for Account Manager Targets → optional
5. Add Analytics for Account Forecasts → optional
6. Add Einstein Discovery stories (need ≥ 300 rows of data each)
7. Add Rebate Analytics → optional
8. Configure Data Access (security predicate)
9. Select Currency
10. Install (skips silently if prereqs unmet — read the message carefully)

### App Creation (Analytics Studio)
1. Analytics Studio → Create → App
2. Select **Analytics for Manufacturing** template → Continue
3. Compatibility check → Looks good, next
4. Pick objects to include: Sales Agreement, Account Forecast, Sales Target, Rebates
5. **Security predicate questions:**
   - User Role Hierarchy / User Manager Hierarchy / None
   - For Sales Targets: Yes/No on hierarchy enforcement
   - Order credit attribution: Account Owner / Order Owner / Other User
   - Einstein Discovery stories: Maximize Sales Agreement Product Renewals, Get Price Recommendations for Products and Schedules
   - Currency
6. Name app → Create
7. Schedule the dataflow (daily refresh)

### Sharing
- Use Share icon → invite users → Viewer / Editor / Manager
- Editor and Manager require CRM Analytics Plus Admin/User PS

## Statistical Order Forecasting Predictions

Add-on to Advanced Account Forecast Sets. Uses the **Multiplicative model** of time series forecasting.

- Predictions: order quantity values + order revenue values
- Confidence: **95%**
- Input: Out-of-the-box template requiring forecast data — define dimensions and period groups

## Limitations

- Analytics for Manufacturing is a thin layer over CRM Analytics — most CRM Analytics features available, but with templated app constraints
- Einstein Discovery stories need **minimum 300 rows** of data; install silently skipped otherwise
- Default Analytics Dashboard (Beta) doesn't render with empty Sales Agreement data
- Sharing constrained to users with the right permission set licenses

## Permission Sets Required

| Permission Set | Audience |
|----------------|----------|
| `AnalyticsViewOnlyEmbeddedApp` | Default Analytics Dashboard viewers |
| `CRMAnalyticsPlusAdmin` | CRM Analytics admins |
| `ManufacturingAnalyticsAdmin` | Manufacturing app admins |
| `CRMAnalyticsPlusUser` | CRM Analytics users |
| `ManufacturingAnalyticsUser` | Manufacturing dashboard viewers |

## SOQL Quick Reference

```sql
-- Manufacturing analytics permission coverage
SELECT PermissionSet.Name, COUNT(Id) cnt
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN (
  'CRMAnalyticsPlusUser','CRMAnalyticsPlusAdmin',
  'ManufacturingAnalyticsUser','ManufacturingAnalyticsAdmin',
  'AnalyticsViewOnlyEmbeddedApp'
) GROUP BY PermissionSet.Name

-- Data prerequisites — Sales Agreement coverage
SELECT COUNT(Id) total FROM SalesAgreement
SELECT COUNT(Id) products FROM SalesAgreementProduct
SELECT COUNT(Id) schedules FROM SalesAgreementProductSchedule

-- Forecast coverage
SELECT COUNT(Id) total FROM AccountForecast
SELECT COUNT(Id) total FROM AccountProductForecast

-- Rebate data
SELECT COUNT(Id) total FROM RebateProgramMember
SELECT COUNT(Id) total FROM RebateMemberProductAggregate
```

## Common Pitfalls

- Trying to install CRM Analytics for Manufacturing app before assigning Analytics Cloud Integration User FLS on every required field — install fails midway
- Adding Einstein Discovery stories with < 300 rows — install silently skipped
- Default Analytics Dashboard rendered on a home page with no underlying data — appears blank
- Choosing User Manager Hierarchy when the org actually uses User Role Hierarchy — security predicate filters wrong rows
- Forgetting to schedule the dataflow → dashboards show stale data
- Installing the app with currency mismatched to the org → revenue figures look wrong

See `configuration.md` for full setup.
