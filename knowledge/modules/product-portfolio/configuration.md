# Product Portfolio — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud enabled (see `general-settings`)
- Active Standard Price Book (`Pricebook2.IsStandard = true`, `IsActive = true`)
- Permission to manage Product2 records (Customize Application or `ProductPortfolioManagement` permission set)

## Configuration Steps

### Step 1: Plan Your Catalog Structure
Before creating any record, decide:
- Which **catalogs** you'll use (e.g., "Conveyor Systems", "Order Management Arm Robots")
- The **categories / subcategories** under each catalog
- Which **business brands** apply
- Which **classifications** group products with shared attributes
- Which products are simple vs. bundles

### Step 2: Create Business Brands
App Launcher → **Business Brands** → New.

### Step 3: Create Catalogs
App Launcher → **Product Catalogs** → New. One per logical grouping.

### Step 4: Create Categories and Subcategories
On a catalog record → Related → **Categories** → New. Nest with Parent Category lookup.

### Step 5: Create Attribute Definitions
App Launcher → **Attribute Definitions** → New. Set data type (Text, Number, Boolean, Date, Picklist).

### Step 6: Create Attribute Picklists (for picklist attributes)
App Launcher → **Attribute Picklists** → New, then add Attribute Picklist Values. Associate the picklist with the attribute definition.

### Step 7: Create Attribute Categories
App Launcher → **Attribute Categories** → New. Add attribute definitions to the category.

### Step 8: Create Product Classifications
App Launcher → **Product Classifications** → New. Add attribute categories and individual attributes to the classification. This is the template products will inherit from.

### Step 9: Create Simple Products
App Launcher → **Products** → New:
- `Type = 'None'`
- `ConfigureDuringSale = 'Not Allowed'` (for static products) or `'Allowed'` (for configurable)
- Link to **Product Classification** to inherit attributes
- Set **Business Brand**
- Add to **Product Categories** via the related list

### Step 10: Create Bundle Products
- `Type = 'Bundle'` on the root product
- Add **Product Component Groups** for cardinality slots
- Add **Product Related Components** linking child products to groups
- Set group cardinality (min/max children) and per-component cardinality (min/max quantity of that component)
- Configure `ConfigureDuringSale` based on whether reps can adjust the bundle during sale

### Step 11: Set Default Attribute Values per Product
On a product → Related → **Product Attribute Definitions**:
- Override the default value for any attribute the product needs to differ from the classification template
- Mark **Is Price Impacting** if the attribute drives pricing differentiation

### Step 12: Create Product Related Materials (for tiered suppliers)
On a product → Related → **Product Related Materials** → New. Map tier-1/tier-2 supplier components per product variant.

### Step 13: Set Up Product Selling Models
App Launcher → **Product Selling Models** → New. Common types: One-Time, Subscription. Assign to products via the lookup on Product2.

### Step 14: Create Pricebook Entries
App Launcher → **Price Books** → Standard Price Book → **Add Products**. Repeat for any custom price books (e.g., currency-specific or region-specific).

### Step 15: Activate Products
Set `IsActive = true` on each product. Inactive products do not show in Sales Agreement product selection or Inventory search.

## Bulk Setup via CLI

```bash
# Bulk activate products from a CSV
sf data update record-bulk --sobject Product2 --file products.csv --target-org <alias>

# Insert PricebookEntry rows for the standard price book
sf data create record-bulk --sobject PricebookEntry --file pbe.csv --target-org <alias>
```

## Validation Checklist

- [ ] At least one Business Brand
- [ ] At least one Product Catalog with categories
- [ ] Attribute definitions and picklists in place
- [ ] At least one Product Classification with attributes
- [ ] Simple products created with `IsActive = true`
- [ ] Bundle products with at least one component group + component
- [ ] PricebookEntry exists for every product in every relevant currency
- [ ] Products linked to categories
- [ ] Selling model assigned where subscription pricing matters

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Products don't show in Sales Agreement | `IsActive = false` or no `PricebookEntry` for the agreement's price book | Activate product; add PricebookEntry |
| Attribute value not inherited on a product | Product not linked to the classification, or attribute removed from classification after product was created | Set Product Classification on the product; re-attach attributes |
| Bundle won't accept a child | Group cardinality max already reached, or local cardinality on the child set to 0 | Adjust cardinality on `ProductComponentGroup` or `ProductRelatedComponent` |
| Sales rep can't configure bundle during sale | `ConfigureDuringSale = 'Not Allowed'` | Update to `'Allowed'` if business wants configurability |
| Pricing not differentiating by attribute | Attribute not marked Is Price Impacting | Set the field to true on `ProductAttributeDef` |
| Inventory Search doesn't find a product | Product not in `Product Inventory Searchable Field` (run DPE) or no `ProductItem` at any location | Run Update Product Inventory Searchable Field Values DPE; check ProductItem records |
| Forecast for a product missing | `ProductRelatedMaterial` missing or pricebook entry mismatch | Verify ProductRelatedMaterial covers all product variants |
| Catalog hierarchy looks broken | Category Parent Category lookup not set | Re-link parent on each subcategory |
| Bundle pricing inconsistent | Per-component prices missing in the price book | Add PricebookEntry for every component, not just the root |

## Cross-Module Impact

| Downstream Module | What It Reads from Portfolio |
|-------------------|------------------------------|
| Sales Agreements | `Product2`, `PricebookEntry` |
| Account Forecasting | `Product2`, `ProductRelatedMaterial`, hierarchy |
| Account Manager Targets | `Product2`, default Price Book |
| Pre-Work Estimation | `Product2`, attributes, `PricebookEntry` |
| Inventory Management | `Product2`, `ProductItem`, classification for search |
| Warranty | `Product2` → `ProductWarrantyTerm` |
| Asset Service | `Product2` → `Asset` instances |
| Manufacturing Programs | `Product2` (program component & variant) |
| CRM Analytics | `Product2`, `Pricebook`, `Order` |

Treat Product Portfolio as the single source of truth and propagate changes carefully — a renamed product or deactivated PricebookEntry can ripple into every other module.
