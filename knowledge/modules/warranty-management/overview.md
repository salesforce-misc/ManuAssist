# Warranty Lifecycle Management — Overview

Warranty Lifecycle Management covers the complete warranty journey: defining warranty entitlements, assigning them to products and installed assets, tracking warranty coverage for the installed base, and managing asset service campaigns (recalls and service bulletins).

## Business Value

- Define granular warranty coverage (labor, parts, expenses) for any product line
- Auto-assign warranties to assets at the point of sale via product-warranty linking
- Track the full installed base and which assets are in/out of warranty
- Identify expiring warranties for proactive service outreach
- Manage product recalls and service bulletins targeting specific asset fleets

## Key Objects

| Object | Purpose |
|--------|---------|
| `WarrantyTerm` | Warranty definition — type, duration, coverage details |
| `WarrantyTermCoverage` | Specific coverage within a term (labor hours, parts %, expense cap) |
| `ProductWarrantyTerm` | Links a Product2 to a WarrantyTerm — auto-assigns warranty on asset creation |
| `Asset` | Physical product sold to and installed at a customer site |
| `AssetWarranty` | Active warranty on a specific installed asset |
| `AssetStatePeriod` | Tracks asset operational state over time |
| `AssetMilestone` | Key lifecycle events on an asset (e.g., installation, first failure) |
| `AssetRelationship` | Parent-child relationships between assets |
| `AssetDowntimePeriod` | Tracks downtime windows for SLA and warranty calculations |

> **Note:** `WarrantyClaim`, `WarrantyClaimProduct`, and `SupplierRecoveryContract` are **not available** in this org. Claims processing requires custom objects or a separate feature enablement.

## Warranty Term Types

| Type | Use Case |
|------|---------|
| Standard | Factory warranty included with product sale |
| Extended | Optional paid extension beyond the standard term |
| Supplier | Coverage passed upstream to a component supplier |

## Coverage Types (WarrantyTermCoverage)

| Coverage Type | What It Defines |
|--------------|----------------|
| Labor | Hours of labor covered, labor rate cap |
| Parts | Parts reimbursement percentage or cap |
| Expenses | Maximum reimbursable expense amount |

## Data Model Relationships

```
Product2
  └── ProductWarrantyTerm (links product to warranty term)
        └── WarrantyTerm
              └── WarrantyTermCoverage (labor / parts / expenses)

Account → Asset (installed product at customer site)
  └── AssetWarranty (active warranty — links asset to WarrantyTerm)
```

## Permission Sets Required

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingServiceUser` | CSRs, warranty admins |
| `WarrantyManagementUser` | Warranty term and coverage administrators |

## SOQL Quick Reference

```sql
-- Active warranty terms
SELECT Id, Name, WarrantyType, WarrantyDuration, WarrantyDurationUnit, IsActive
FROM WarrantyTerm
WHERE IsActive = true ORDER BY Name

-- Warranty term coverage details
SELECT Id, WarrantyTermId, WarrantyTerm.Name, CoverageType
FROM WarrantyTermCoverage
ORDER BY WarrantyTerm.Name

-- Products with warranty terms assigned
SELECT Id, ProductId, Product.Name, WarrantyTermId, WarrantyTerm.Name
FROM ProductWarrantyTerm
ORDER BY Product.Name

-- Assets with warranties expiring in 90 days
SELECT Asset.Name, Asset.Account.Name, ExpirationDate, WarrantyTerm.Name
FROM AssetWarranty
WHERE ExpirationDate = NEXT_N_DAYS:90
ORDER BY ExpirationDate ASC

-- Assets with active warranties
SELECT Asset.Name, Asset.Account.Name, StartDate, ExpirationDate, WarrantyTerm.Name
FROM AssetWarranty
WHERE StartDate <= TODAY AND ExpirationDate >= TODAY
ORDER BY ExpirationDate ASC

-- Assets without any warranty coverage
SELECT Id, Name, Account.Name, InstallDate, Status
FROM Asset
WHERE Id NOT IN (SELECT AssetId FROM AssetWarranty WHERE ExpirationDate >= TODAY)
ORDER BY InstallDate DESC LIMIT 50
```
