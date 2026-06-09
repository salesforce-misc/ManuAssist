# Product Portfolio (Product Catalog Management) — Overview

Product Portfolio organizes the products you sell — standalone, bundled, configurable, or static — and gives you the attribute / catalog / category structure that downstream modules (Sales Agreements, Forecasting, Pre-Work Estimation, Inventory) all key off of.

In Manufacturing Cloud, Product Catalog Management (PCM) is the recommended way to model this. PCM uses a richer object graph than the classic `Product2` + `PricebookEntry` pattern, supporting attribute inheritance, classifications, bundles with cardinality, and product related materials.

## Why Product Portfolio Matters First

- Sales Agreements line-items reference Product2 records via `SalesAgreementProduct.Product2Id`
- Account Forecasting and Account Manager Targets distribute by Product
- Pre-Work Estimation and Inventory Search only show products that are correctly attributed
- Bundles drive how reps configure orders during a sale (configurable vs. static)

Get the catalog wrong and every downstream module inherits the mess.

## Key Objects

| Object | Purpose |
|--------|---------|
| `Product2` | The SKU. `Type` = `None` (simple) or `Bundle` (root of a bundled product) |
| `ProductComponentGroup` | Group of components within a bundled product (cardinality + group of similar parts) |
| `ProductRelatedComponent` | Child component of a bundle |
| `ProductRelatedMaterial` | Tier-1/tier-2 supplier material mapping for a product |
| `AttributeDefinition` | An attribute that describes a product (Model, Weight, Belt Speed) |
| `AttributeCategory` | Logical grouping of attribute definitions |
| `AttributePicklist` | Set of allowed values for an attribute (e.g., Industry: Consumer Goods, Manufacturing, ...) |
| `AttributePicklistValue` | A single value in a picklist |
| `ProductClassification` | Template that holds a collection of attributes — products inherit from it |
| `ProductClassificationAttr` | An attribute assigned to a classification |
| `ProductAttributeDef` | The default value of an attribute on a specific product |
| `ProductSellingModel` | One-time vs. subscription |
| `ProductCatalog` | Top-level grouping (e.g., "Order Management Arm Robots") |
| `ProductCategory` | Branch within a catalog (with subcategories) |
| `ProductCategoryProduct` | Membership of a product in a category |
| `BusinessBrand` | Brand the product is sold under |
| `Asset` | An instance of a product owned/installed at a customer |

## Product Types

| Product `Type` | Meaning | Example |
|----------------|---------|---------|
| `None` (simple) | Standalone product, no children | Environmental Gas Sensor A1 |
| `Bundle` | Root of a bundle made of components | Order Picking System (Arm + Battery + Belt) |

## Configurability

The `Configure During Sale` field on `Product2` controls whether reps can configure or add components during a sale:

- **Allowed** → configurable; sales can add optional components (e.g., spare belt covers)
- **Not Allowed** → static; sales cannot modify the bundle

## Cardinality

Cardinality limits the quantities of children inside a bundle:

- **Local cardinality** — min/max for an individual child product within the bundle
- **Group cardinality** — min/max child components allowed in a group

## Attribute Inheritance Model

```
AttributeDefinition (e.g., "Belt Speed")
       │
       ├── lives in → AttributeCategory ("Conveyor Belt Category")
       │
       └── value source → AttributePicklist + AttributePicklistValue (e.g., "Industry: Manufacturing")

ProductClassification ("Conveyor Belts Classification")
       │
       └── holds → AttributeCategory(s) + individual AttributeDefinitions
                       │
                       └── inherited by → Product2 (when its ProductClassificationId is set)
                                              │
                                              └── default value → ProductAttributeDef
```

A product that is based on a `ProductClassification` automatically inherits all its attributes. `ProductAttributeDef` overrides the default value for a specific product.

## Price-Impacting Attributes

Setting an attribute as **price-impacting** lets pricing rules use it in attribute-based price adjustment schedules. Example: Industry attribute on Environmental Gas Sensor A1 — Manufacturing customers pay $300, Energy customers pay $340.

## SOQL Quick Reference

```sql
-- All active products with type and configurability
SELECT Id, Name, ProductCode, Type, ConfigureDuringSale, IsActive
FROM Product2
WHERE IsActive = true
ORDER BY Name

-- Bundle products and their components
SELECT Id, ParentProduct.Name, ChildProduct.Name, MinQuantity, MaxQuantity
FROM ProductRelatedComponent
ORDER BY ParentProduct.Name

-- Attribute definitions
SELECT Id, Name, DataType, Description
FROM AttributeDefinition
ORDER BY Name

-- Product classifications and their attribute count
SELECT Id, Name, (SELECT Id FROM ProductClassificationAttrs)
FROM ProductClassification

-- Products with attribute overrides
SELECT Product.Name, AttributeDefinition.Name, DefaultValue
FROM ProductAttributeDef
ORDER BY Product.Name

-- Catalog → Category → Product membership
SELECT Catalog.Name, ProductCategory.Name, Product.Name
FROM ProductCategoryProduct
ORDER BY Catalog.Name, ProductCategory.Name

-- Active price book entries (downstream dependency for Sales Agreements)
SELECT Pricebook2.Name, Product2.Name, UnitPrice, IsActive
FROM PricebookEntry
WHERE IsActive = true
```

## Common Pitfalls

- Adding products to Sales Agreements before `PricebookEntry` exists for the agreement's currency
- Treating `ProductRelatedComponent` and `ProductComponentGroup` interchangeably — groups represent a *slot* with cardinality; components fill the slot
- Setting attributes directly on products instead of via classification — loses the inheritance benefit
- Forgetting to mark price-impacting attributes for products sold at differential pricing
- Mixing simple (`Type = 'None'`) and bundle products without setting `ConfigureDuringSale` consistently

See `configuration.md` for step-by-step setup and troubleshooting.
