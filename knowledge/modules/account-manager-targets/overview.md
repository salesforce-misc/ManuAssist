# Account Manager Targets — Overview

Account Manager Targets convert organizational growth strategies into measurable, distributable goals for account managers. Targets are created for revenue (currency) or non-currency measure types (CSAT, NPS, units), assigned to team members, and distributed across accounts, products, and time periods.

## Business Value

- Translate top-down revenue plans into rep-level, account-level, product-level commitments
- Distribute targets by month / quarter / year for periodic review
- Track target attainment against actual revenue or quantity delivered
- Visualize manager → rep hierarchy and reassign targets when the org changes
- Roll up to CRM Analytics dashboards for real-time progress

## Key Objects

| Object | Purpose |
|--------|---------|
| `AcctMgrTarget` | The target — fiscal year, measure, total value, owner |
| `AcctMgrTargetMeasure` | Picklist values for the Measure field on the target (Revenue, CSAT, etc.) |
| `AcctMgrTargetDistribution` | Per-account or per-product distribution of a target |
| `AcctMgrPeriodicTargetDistribution` | Per-period (month/quarter/year) breakdown of a distribution |

> **Limit:** The `AcctMgrPeriodicTargetDistribution` object is capped at **10 million records** per org. Monitor utilization in Setup → Account Manager Targets → Account Manager Periodic Target Distribution Limits.

## Measure Types

- **Currency** — total order amount, total sales agreement amount, revenue (org currency or multi-currency)
- **Non-Currency** — units shipped, customer satisfaction (CSAT), net promoter score (NPS), or any other count

## Distribution Frequency

Configured once per org in Setup → Account Manager Targets → Distribution Frequency:

- **Monthly** (default)
- **Quarterly**
- **Yearly**

> **Important:** Changing the frequency only affects targets created **after** the change. Existing targets keep their original frequency.

## Team Member Hierarchy

Configured in Setup → Account Manager Targets → Team Member Hierarchy:

| Option | How Team Members Are Derived |
|--------|------------------------------|
| **Manager Hierarchy** | User Role hierarchy — uses the Manager field on User |
| **Forecasts Hierarchy** | The hierarchy defined in Setup → Forecast Hierarchy |

> **Warning:** Changing the hierarchy type makes **all existing targets read-only**. Plan this carefully.

## Distribution Patterns

A single target can be distributed in any combination:
- **By Account** — split target value across customer accounts
- **By Product** — split target value across products (uses default Price Book unless overridden)
- **By Account and Product** — both
- **By Period** — split a target or any account/product distribution by time period

The product distribution row uses `List Price` (auto-populated from the price book) and computes `Target Value = Target Currency Value / List Price`.

## Status Lifecycle (target assignments)

```
Created → Assigned → Distributed → (re-distributed by period as needed)
                          │
                          └─ becomes "Invalid" when:
                              • assignee leaves the org
                              • manager hierarchy changes
                              • new team member added with overlapping target
```

Invalid assignments must be resolved via **Reassign**, **Move to Team Assignment**, **Change Owner**, or **Delete**.

## Fiscal Year Support

- **Standard fiscal year** — supported
- **Custom fiscal year** — **NOT supported**. If your org uses a custom fiscal calendar, Account Manager Targets is unavailable until you switch to standard.

Targets can be created for the current fiscal year, the next fiscal year, or the year after that.

## Permission Sets Required

| Permission Set | Used For |
|----------------|----------|
| `AccountManagerTargetUser` (or equivalent) | Read/Edit on `AcctMgrTarget` |
| Custom permission with **View Setup and Configuration** | Required to modify targets |
| Custom permission with **Customize Application** | Required to change frequency, hierarchy, default price book, or measures |
| Sub-target ownership | Requires **Read, Edit, and Modify All** on `AcctMgrTarget` |

## SOQL Quick Reference

```sql
-- All targets for the current fiscal year
SELECT Id, Name, FiscalYear, Measure, TargetValue, TargetCurrencyValue, OwnerId, Owner.Name
FROM AcctMgrTarget
WHERE FiscalYear = THIS_FISCAL_YEAR
ORDER BY OwnerId

-- Distributions for a target
SELECT Account.Name, Product.Name, ListPrice, TargetPercentage,
       TargetCurrencyValue, TargetValue
FROM AcctMgrTargetDistribution
WHERE AcctMgrTargetId = '<TargetId>'

-- Periodic breakdown
SELECT Period, TargetCurrencyValue, TargetValue
FROM AcctMgrPeriodicTargetDistribution
WHERE AcctMgrTargetDistributionId = '<DistributionId>'
ORDER BY Period

-- Targets assigned to a specific user
SELECT Id, Name, FiscalYear, TargetCurrencyValue, AssignedToUserId
FROM AcctMgrTarget
WHERE AssignedToUserId = '<UserId>'

-- Periodic distribution utilization (for limit monitoring)
SELECT COUNT() FROM AcctMgrPeriodicTargetDistribution
```

## Relationship to Forecasting & Sales Agreements

- **Sales Agreements** provide planned revenue for committed business
- **Account Forecasts** project demand based on programs and historical orders
- **Account Manager Targets** sit on top — top-down growth plans the rep must hit, regardless of agreement coverage

A common pattern: target = sales agreement plan + uncommitted upside.

## Common Pitfalls

- Org on custom fiscal year — feature unavailable
- Changing hierarchy type after targets exist — locks them read-only
- Forgetting to **Propagate to Assignments** after editing the parent target value
- Cloning a target — assignments are **not** cloned; you must redistribute
- Hitting the 10M `AcctMgrPeriodicTargetDistribution` cap on large orgs — archive old fiscal years
- Trying to assign multiple targets for the same fiscal year + measure to the same team member — only one assignment per target per member is allowed

See `configuration.md` for setup steps and troubleshooting.
