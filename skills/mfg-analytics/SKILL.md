---
name: mfg-analytics
description: Expert guidance on Manufacturing Cloud analytics — Default Analytics Dashboard (Beta), CRM Analytics for Manufacturing, Statistical Order Forecasting predictions, CRM Analytics for Warranty Lifecycle Management, Advanced Account Forecasting Analytics. Use when user asks about CRM Analytics, Manufacturing dashboards, Einstein Discovery stories for sales agreements, statistical forecasting, embedding analytics on Lightning pages, security predicates for Manufacturing analytics, or analytics permission sets.
---

# Manufacturing Cloud Analytics

Two paths: **Default Analytics Dashboard (Beta)** for orgs without CRMA license, **CRM Analytics for Manufacturing** for full premium experience.

## Decision: Default vs. Full

| | Default Dashboard (Beta) | CRM Analytics for Manufacturing |
|---|---|---|
| Cost | Free | Add-on license |
| Coverage | 3 cards (Revenue Realization, Account Performance, Upcoming Renewals) | Sales Agreements, Forecasts, Targets, Rebates, Warranty |
| Predictive | No | Statistical Order Forecasting + Einstein Discovery |
| Customization | None | Full CRMA |
| Beta | Yes — no SLA | No |

## Permission Sets (full)

| PS | Audience |
|---|---|
| Analytics View Only Embedded App | Default dashboard viewers |
| CRM Analytics Plus Admin + Manufacturing Analytics Admin | Full app admins |
| CRM Analytics Plus User + Manufacturing Analytics User | Full app users |

## Default Dashboard Setup (5 steps)

1. Confirm Sales Agreement / Product / Schedule data exists
2. Assign Analytics View Only Embedded App PS
3. Enable CRM Analytics + set Account FLS for Analytics Cloud Integration User
4. Setup → Manufacturing → Sales Agreements → Enable Default Analytics Dashboards
5. Embed CRM Analytics Dashboard component on Manufacturing Home page → Manufacturing Home Page dashboard

## CRM Analytics for Manufacturing Setup

1. Assign permission sets (admins + users)
2. Enable CRM Analytics
3. **FLS for Analytics Cloud Integration User on all required objects** (most common failure point)
4. Setup → Set Up CRM Analytics for Manufacturing → walk through the one-page wizard
5. Analytics Studio → Create App from **Analytics for Manufacturing** template
6. Wizard Q&A: hierarchy / order credit / Einstein Discovery / currency
7. Schedule dataflow (daily)
8. Embed dashboards on Lightning pages
9. Share app with users

## Wizard Q&A Decisions

- **Security predicate hierarchy** — User Role / User Manager / None — match Account Manager Targets hierarchy choice
- **Sales Target hierarchy enforcement** — Yes (recommended)
- **Order credit attribution** — Account Owner (direct sales) / Order Owner (distribution) / Other User (custom)
- **Einstein Discovery stories** — only enable if ≥ 300 rows
- **Currency** — must match org primary currency

## Hard Rules

- Default dashboard renders blank if SalesAgreement records don't exist
- App install skips Einstein Discovery silently if < 300 rows
- App install fails midway if any required field FLS is missing for Integration User
- Beta features have no SLA — Salesforce can discontinue
- Dataflow must be **scheduled** — ad-hoc refresh leaves stale data

## Common SOQL

```sql
-- Coverage of analytics permissions
SELECT PermissionSet.Name, COUNT(Id) cnt
FROM PermissionSetAssignment
WHERE PermissionSet.Name LIKE '%Analytics%'
GROUP BY PermissionSet.Name

-- Data prerequisites
SELECT COUNT(Id) FROM SalesAgreement
SELECT COUNT(Id) FROM AccountForecast
SELECT COUNT(Id) FROM AcctMgrTarget
SELECT COUNT(Id) FROM RebateProgramMember
```

## Troubleshooting Cheatsheet

| Symptom | First Check |
|---------|-------------|
| Default dashboard blank | SalesAgreement / Product / Schedule data exists? |
| App install fails midway | FLS gap on Analytics Cloud Integration User profile |
| Einstein Discovery skipped | < 300 source rows |
| Dashboards stale | Dataflow not scheduled |
| Sales Target panel empty | Hierarchy mismatch with Account Manager Targets |
| Wrong revenue attribution | Wrong order credit choice in wizard |
| User can't open app | Missing CRM Analytics Plus User PS |

## Statistical Order Forecasting

Add-on prediction layer for Advanced Account Forecast Sets:
- Multiplicative time-series model
- 95% confidence interval
- Predicts order quantity + order revenue

## When to Use This Skill

- Choosing Default vs. full CRMA path
- Diagnosing failed app install (FLS gap)
- Designing security predicate
- Setting up Statistical Order Forecasting
- Adding Einstein Discovery stories
- Embedding dashboards on Lightning pages
- Migrating analytics setup between orgs

## Detailed Documentation

Use `get_mfg_module_docs` with slug `analytics`.
