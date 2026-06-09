---
name: mfg-account-manager-targets
description: Expert guidance on Manufacturing Cloud Account Manager Targets — fiscal year targets, distribution by account/product/period, manager vs. forecast hierarchies, currency vs. non-currency measures, propagation, invalid assignments. Use when user asks about AcctMgrTarget, target distribution, target assignments, custom measures (CSAT, NPS), Account Manager periodic distribution, propagate to assignments, or manager hierarchy choice for targets.
---

# Manufacturing Cloud Account Manager Targets

Account Manager Targets translate top-down growth plans into rep-level, account-level, product-level commitments — distributable by month, quarter, or year.

## Core Concepts

- **Target** (`AcctMgrTarget`) — fiscal year + measure + total value
- **Assignment** — slice of the target given to a direct report
- **Distribution** (`AcctMgrTargetDistribution`) — split of an assignment across accounts and/or products
- **Periodic Distribution** (`AcctMgrPeriodicTargetDistribution`) — split across time periods
- **Measure Type** — Currency (revenue, total order amount) or Non-Currency (CSAT, NPS, units)
- **Hierarchy Type** — Manager (User Role) or Forecasts (Forecast Hierarchy)

## Hard Constraints

- Standard fiscal year only (custom fiscal calendar is unsupported)
- Periodic Distribution capped at **10 million** records per org
- Hierarchy change locks **all existing** targets read-only
- Frequency change applies only to new targets
- Cloning skips assignments — must redistribute manually
- Only **one** assignment per target per team member

## Key Objects

| Object | Purpose |
|--------|---------|
| `AcctMgrTarget` | Header: fiscal year, measure, total value, owner |
| `AcctMgrTargetMeasure` | Picklist values for the Measure field |
| `AcctMgrTargetDistribution` | Per-account / per-product distribution |
| `AcctMgrPeriodicTargetDistribution` | Per-period distribution |

## Setup Order

1. Enable in Setup → Account Manager Targets
2. Pick distribution frequency (Monthly / Quarterly / Yearly)
3. Pick team member hierarchy (Manager / Forecasts)
4. Choose default price book (used for product distribution)
5. Manage measures (Revenue + custom)
6. Confirm standard fiscal year
7. Assign permission sets
8. Create target → assign → distribute → distribute by period → propagate

## Common SOQL

```sql
-- Targets by user for current fiscal year
SELECT Id, Name, FiscalYear, Measure, TargetCurrencyValue, OwnerId
FROM AcctMgrTarget
WHERE FiscalYear = THIS_FISCAL_YEAR

-- Distribution rollup
SELECT Account.Name, Product.Name, TargetCurrencyValue, TargetPercentage
FROM AcctMgrTargetDistribution

-- Periodic breakdown
SELECT Period, TargetCurrencyValue
FROM AcctMgrPeriodicTargetDistribution
WHERE AcctMgrTargetDistributionId = '<id>'

-- Limit utilization
SELECT COUNT() FROM AcctMgrPeriodicTargetDistribution
```

## Distribution Math

For product distribution: `Target Value = Target Currency Value / List Price`
- Target Currency Value $300, list price $30 → Target Value = 10 units
- Editing either Target Currency Value or Target Percentage auto-populates the other

## Troubleshooting Cheat Sheet

| Symptom | First Check |
|---------|-------------|
| Toggle disabled in Setup | Standard fiscal year? Manufacturing license? |
| All targets read-only | Hierarchy type was changed |
| Team member dropdown empty | Manager / Forecast Hierarchy not configured |
| Product list price = $0 | Missing PricebookEntry in selected price book |
| Edit parent target — children stale | Forgot to Propagate to Assignments |
| Cloned target — no assignments | Cloning skips assignments by design |
| Periodic distribution count near 10M | Archive old fiscal years |
| "Invalid Team Assignment" | Team member left or hierarchy changed — use Reassign / Move / Change Owner / Delete |

## Relationship to Sister Modules

- **Sales Agreements** — committed plan
- **Account Forecasts** — bottoms-up projection from programs/orders
- **Account Manager Targets** — top-down growth ambition (sits above the others)
- **CRM Analytics for Manufacturing** — pre-built dashboards roll all three into a unified view

## When to Use This Skill

- Designing the FY target rollout
- Choosing manager vs. forecast hierarchy
- Diagnosing read-only target lock
- Propagation / invalid assignment cleanup
- Auditing periodic distribution storage utilization
- Adding non-currency measures (CSAT/NPS)

## Detailed Documentation

Use `get_mfg_module_docs` with slug `account-manager-targets`.
