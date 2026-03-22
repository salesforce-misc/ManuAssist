---
name: mfg-warranty
description: Expert guidance on Manufacturing Cloud Warranty Lifecycle Management — warranty terms, claims, adjudication, supplier recovery, and product service campaigns. Use when user asks about warranties, claims, WarrantyTerm, WarrantyClaim, adjudication, or recalls.
---

# Manufacturing Cloud Warranty Lifecycle Management

Warranty Lifecycle Management covers the complete warranty journey: from defining warranty entitlements and assigning them to products/assets, through capturing and adjudicating claims from partners and dealers.

## Key Objects

| Object | Purpose |
|--------|---------|
| `WarrantyTerm` | Warranty definition — duration, coverage type, labor/parts/expenses |
| `WarrantyTermCoverage` | Specific coverage details within a warranty term (labor, parts, expenses) |
| `ProductWarrantyTerm` | Link between a Product2 and a WarrantyTerm (auto-assigns warranty on asset creation) |
| `Asset` | Physical product sold to a customer |
| `AssetWarranty` | Link between an Asset and a WarrantyTerm (active warranty on an installed asset) |
| `ProductServiceCampaign` | Product recall or service bulletin targeting a fleet of assets |
| `Supplier` | Supplier account record |
| `SupplierProduct` | Products supplied by a specific supplier |

> **Note:** `WarrantyClaim`, `WarrantyClaimProduct`, and `SupplierRecoveryContract` are **not available** in this org. Claims processing may require custom objects or a different feature enablement.

## Configuration Steps

### Step 1: Enable Warranty Management
Setup > Manufacturing Settings > Enable Warranty Lifecycle Management

### Step 2: Create Warranty Terms
Each WarrantyTerm defines:
- **Type**: Standard, Extended, Supplier
- **Duration**: e.g., 24 months from purchase date
- **Coverage**: Labor (hours covered), Parts (parts reimbursable), Expenses (max expense amounts)
- **Effective Date Range**: when the term is applicable

### Step 3: Assign Warranty Terms to Products / Assets
- Link WarrantyTerm to Product2 records for new sales (auto-creates AssetWarranty on install)
- Or link directly to Asset records for existing installed base

### Step 4: Configure Product Service Campaigns (Recalls)
1. Create `ProductServiceCampaign` records for product recalls or service bulletins
2. Link campaigns to affected assets via the campaign's target criteria
3. Use Flow to notify asset owners and schedule service appointments

## Checking Configuration
Use `check_warranty_config` to validate:
- Active WarrantyTerm count
- WarrantyTermCoverage records
- ProductWarrantyTerm assignments
- Asset coverage (AssetWarranty records)
- Permission set assignments

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Can't create Warranty Terms | Missing `WarrantyManagementUser` permission set | Assign PS to warranty admins |
| Asset not showing warranty | WarrantyTerm not linked to Asset or no AssetWarranty record | Create AssetWarranty junction record |
| Warranty not auto-assigned | ProductWarrantyTerm not created for the product | Create ProductWarrantyTerm linking Product2 to WarrantyTerm |
| Coverage details missing | WarrantyTermCoverage not configured | Add coverage records (labor, parts, expenses) to the WarrantyTerm |

## Detailed Documentation

Use `get_mfg_module_docs` with slug `warranty-management` for full configuration reference, or `search_mfg_knowledge` for targeted searches.

## SOQL Quick Reference

```sql
-- Active warranty terms
SELECT Id, Name, WarrantyType, WarrantyDuration, WarrantyDurationUnit, IsActive
FROM WarrantyTerm WHERE IsActive = true ORDER BY Name

-- Warranty term coverage details
SELECT Id, WarrantyTermId, WarrantyTerm.Name, CoverageType
FROM WarrantyTermCoverage ORDER BY WarrantyTerm.Name

-- Products with warranty terms assigned
SELECT Id, ProductId, Product.Name, WarrantyTermId, WarrantyTerm.Name
FROM ProductWarrantyTerm ORDER BY Product.Name

-- Assets with expiring warranties (next 90 days)
SELECT Asset.Name, Asset.Account.Name, ExpirationDate, WarrantyTerm.Name
FROM AssetWarranty
WHERE ExpirationDate = NEXT_N_DAYS:90
ORDER BY ExpirationDate ASC

-- Assets with active warranties
SELECT Asset.Name, Asset.Account.Name, StartDate, ExpirationDate, WarrantyTerm.Name
FROM AssetWarranty
WHERE StartDate <= TODAY AND ExpirationDate >= TODAY
ORDER BY ExpirationDate ASC
```
