---
name: mfg-product-portfolio
description: Expert guidance on Manufacturing Cloud Product Catalog Management — products (simple vs. bundle), attributes, classifications, catalogs, categories, business brands, product related materials, configurability, and cardinality. Use when user asks about Product2, ProductClassification, AttributeDefinition, ProductRelatedComponent, bundles, attribute inheritance, price-impacting attributes, ProductCatalog, or PricebookEntry setup for Manufacturing.
---

# Manufacturing Cloud Product Portfolio

The catalog is the foundation. Sales Agreements, Forecasting, Pre-Work Estimation, Inventory, and Warranty all read from `Product2` and the surrounding PCM (Product Catalog Management) objects.

## Core Concepts

- **Simple product** — `Product2.Type = 'None'`, no children
- **Bundle product** — `Product2.Type = 'Bundle'`, root with `ProductRelatedComponent` children grouped by `ProductComponentGroup`
- **Configurable** vs. **Static** — `ConfigureDuringSale` controls whether reps can modify a bundle during a sale
- **Local cardinality** — min/max of an individual child product
- **Group cardinality** — min/max children allowed within a group
- **Attribute inheritance** — `ProductClassification` holds attributes; products linked to a classification inherit them. Override defaults via `ProductAttributeDef`.
- **Price-impacting attribute** — flag on `ProductAttributeDef` lets pricing rules differentiate by that attribute

## Key Objects

| Object | Purpose |
|--------|---------|
| `Product2` | The SKU |
| `ProductRelatedComponent` | Bundle child component |
| `ProductComponentGroup` | Cardinality slot inside a bundle |
| `ProductRelatedMaterial` | Supplier-tier material mapping |
| `AttributeDefinition` | An attribute (Model, Weight, Speed) |
| `AttributeCategory` | Group of attributes |
| `AttributePicklist` / `AttributePicklistValue` | Allowed values for picklist attributes |
| `ProductClassification` | Template carrying attribute set |
| `ProductClassificationAttr` | Attribute assigned to classification |
| `ProductAttributeDef` | Per-product default value (and price-impacting flag) |
| `ProductSellingModel` | One-time vs. subscription |
| `ProductCatalog` / `ProductCategory` / `ProductCategoryProduct` | Catalog structure |
| `BusinessBrand` | Brand label |
| `PricebookEntry` | Product price (required for Sales Agreements, Pre-Work Estimation) |

## Setup Order (don't deviate)

1. Business Brands
2. Catalogs and categories
3. Attribute Definitions and Attribute Picklists
4. Attribute Categories
5. Product Classifications (attach categories + attributes)
6. Simple products → link to classification
7. Bundle products → component groups → related components
8. ProductAttributeDef overrides + price-impacting flags
9. Product Selling Models
10. PricebookEntry rows in Standard + custom Price Books
11. Activate products

## Common SOQL

```sql
-- Active product summary by type
SELECT Type, COUNT(Id) cnt FROM Product2 WHERE IsActive = true GROUP BY Type

-- Bundles with their components
SELECT ParentProduct.Name, ChildProduct.Name, MinQuantity, MaxQuantity
FROM ProductRelatedComponent
ORDER BY ParentProduct.Name

-- Products missing PricebookEntry in standard price book
SELECT Id, Name FROM Product2
WHERE IsActive = true
  AND Id NOT IN (SELECT Product2Id FROM PricebookEntry WHERE Pricebook2.IsStandard = true)

-- Classification → attribute count
SELECT Id, Name, (SELECT Id FROM ProductClassificationAttrs) FROM ProductClassification

-- Price-impacting attributes
SELECT Product.Name, AttributeDefinition.Name, DefaultValue
FROM ProductAttributeDef
WHERE IsPriceImpacting = true
```

## Troubleshooting Cheatsheet

| Symptom | First Check |
|---------|-------------|
| Product invisible to Sales Agreement | `IsActive` and `PricebookEntry` for relevant Pricebook |
| Bundle child won't add | Group cardinality max reached; local cardinality on child = 0 |
| Attribute not inheriting | Product missing `ProductClassificationId` |
| Pricing not varying by attribute | Missing `IsPriceImpacting = true` on `ProductAttributeDef` |
| Inventory search empty | `Product Inventory Searchable Field` DPE not run |
| Forecast missing for a SKU | `ProductRelatedMaterial` mapping incomplete |

## Where Portfolio Records Flow

| Downstream | Reads What |
|------------|------------|
| Sales Agreements | `Product2`, `PricebookEntry` |
| Forecasting | `Product2`, `ProductRelatedMaterial` |
| Account Manager Targets | `Product2`, default Pricebook |
| Pre-Work Estimation | `Product2`, attributes, `PricebookEntry` |
| Inventory | `Product2`, `ProductItem` |
| Warranty | `Product2` → `ProductWarrantyTerm` |
| Asset Service | `Product2` → `Asset` |
| Manufacturing Programs | `Product2` for components/variants |
| CRM Analytics | `Product2`, Pricebook |

## When to Use This Skill

- Designing the catalog from scratch
- Migrating SKUs from a legacy ERP / Excel
- Diagnosing why a product is invisible in a downstream module
- Modeling complex bundles with cardinality
- Setting up attribute-based pricing
- Auditing catalog hygiene

## Detailed Documentation

Use `get_mfg_module_docs` with slug `product-portfolio`.
