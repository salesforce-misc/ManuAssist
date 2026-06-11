---
description: Interactive wizard to validate Manufacturing Cloud Product Catalog Management — products, bundles, attributes, classifications, catalogs, categories, price books
arguments: "[check-type]"
---

# Configure Product Portfolio

Interactive wizard to check and configure Manufacturing Cloud Product Catalog Management (PCM).

## Arguments

- `check-type` (optional): `full` (default), `products`, `bundles`, `attributes`, `catalog`, `pricebook`

## Instructions

### Step 1: Verify Org Connection

Use `check_mfg_setup`. If not connected, guide through `sf org login`.

### Step 2: Product Inventory Summary

```sql
SELECT Type, COUNT(Id) cnt FROM Product2 WHERE IsActive = true GROUP BY Type
```

```sql
SELECT COUNT(Id) total FROM Product2
```

```sql
SELECT COUNT(Id) inactive FROM Product2 WHERE IsActive = false
```

Report:
- Active product count by type (None / Bundle)
- Total vs. active vs. inactive
- WARN if zero active products

### Step 3: Catalog Structure Check

```sql
SELECT Id, Name FROM ProductCatalog ORDER BY Name
```

```sql
SELECT Id, Name, Catalog.Name, ParentCategory.Name FROM ProductCategory ORDER BY Catalog.Name, Name
```

```sql
SELECT COUNT(Id) total FROM ProductCategoryProduct
```

Report:
- Catalogs and category tree depth
- Products linked to categories
- WARN if catalogs exist but no categories, or categories have no products

### Step 4: Business Brands

```sql
SELECT Id, Name, IsActive FROM BusinessBrand ORDER BY Name
```

Report active brand count. WARN if zero.

### Step 5: Attribute & Classification Setup

```sql
SELECT COUNT(Id) total FROM AttributeDefinition
SELECT COUNT(Id) total FROM AttributeCategory
SELECT COUNT(Id) total FROM AttributePicklist
SELECT COUNT(Id) total FROM ProductClassification
SELECT COUNT(Id) total FROM ProductAttributeDef WHERE IsPriceImpacting = true
```

Report:
- Counts for each attribute object
- Number of price-impacting attributes
- WARN if classifications exist but few products linked

### Step 6: Bundle Health

```sql
SELECT COUNT(Id) bundles FROM Product2 WHERE Type = 'Bundle' AND IsActive = true
```

```sql
SELECT ParentProduct.Name, COUNT(Id) componentCount
FROM ProductRelatedComponent
GROUP BY ParentProduct.Name
ORDER BY ParentProduct.Name
```

Report:
- Number of bundles
- Bundles with zero components (broken bundles — flag prominently)
- Component counts per bundle

### Step 7: Price Book Coverage

```sql
SELECT Id, Name, IsActive, IsStandard FROM Pricebook2 ORDER BY IsStandard DESC, Name
```

```sql
SELECT COUNT(Id) totalEntries FROM PricebookEntry WHERE IsActive = true
```

```sql
-- Active products without PricebookEntry in any active price book — DANGER
SELECT Id, Name FROM Product2
WHERE IsActive = true
  AND Id NOT IN (SELECT Product2Id FROM PricebookEntry WHERE IsActive = true)
LIMIT 25
```

Report:
- Active price books
- Total active price book entries
- WARN with the list of products missing PricebookEntry — these break Sales Agreements and Pre-Work Estimation

### Step 8: Selling Models

```sql
SELECT Id, Name, SellingModelType FROM ProductSellingModel
```

Report selling models defined.

### Step 9: Configurability Distribution

```sql
SELECT ConfigureDuringSale, COUNT(Id) cnt FROM Product2 WHERE IsActive = true GROUP BY ConfigureDuringSale
```

Report mix of configurable vs. static products.

### Step 10: Present Configuration Report

```
## Product Portfolio Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Products
- Active products: [count] (None: [n], Bundle: [n])
- Inactive products: [count]
- Configurable: [count], Static: [count]

### Catalog Structure
- Business Brands: [count]
- Catalogs: [count]
- Categories: [count]
- Products mapped to categories: [count]

### Attributes
- Attribute Definitions: [count]
- Attribute Categories: [count]
- Attribute Picklists: [count]
- Product Classifications: [count]
- Price-impacting attributes: [count]

### Bundles
- Bundle products: [count]
- Bundles missing components: [count] ⚠
- Avg. components per bundle: [n]

### Pricing
- Active Price Books: [count]
- Active Pricebook Entries: [count]
- Active products WITHOUT PricebookEntry: [count] ⚠

### Selling Models
- Models defined: [count]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 11: Offer Next Steps

**If products lack PricebookEntry:**
- Direct user to App Launcher → Price Books → Standard → Add Products
- Or offer to build a CSV for `bulk_create_records` against PricebookEntry

**If bundles missing components:**
- Show which bundles
- Walk user through Setup → Object Manager → Product → Component Groups + Related Components

**If no classifications:**
- Suggest building 1–2 classifications grouping the most common attributes

**If no products in categories:**
- Suggest creating ProductCategoryProduct records to power the catalog UI

**If all checks pass:**
- Confirm portfolio ready
- Suggest next module: `/mfg:configure-sales-agreements` or `/mfg:configure-inventory`

## Admin Console Navigation

| Task | Path |
|------|------|
| Products | App Launcher → Products |
| Bundles (component groups) | Product record → Related → Product Component Groups |
| Attributes | App Launcher → Attribute Definitions |
| Classifications | App Launcher → Product Classifications |
| Catalogs / Categories | App Launcher → Product Catalogs |
| Price Books | App Launcher → Price Books |
| Selling Models | App Launcher → Product Selling Models |
| Business Brands | App Launcher → Business Brands |

## IMPORTANT

- Use `Product2`, NOT `Product__c`
- Bundles require `Type = 'Bundle'` on the root product
- Every active product needs at least one active `PricebookEntry` to be usable in Sales Agreements
- Attribute inheritance only kicks in when the product is linked to a `ProductClassification`
- `ConfigureDuringSale = 'Allowed'` is required for sales reps to add components during a sale
- Reference: PCM is the supported model in Manufacturing Cloud (Spring '25 onward)
