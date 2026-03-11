---
name: salesforce-query
description: Helps construct and execute SOQL queries against Manufacturing Cloud orgs. Use when user needs to query data, check configurations, or explore the Manufacturing Cloud data model in their Salesforce org.
---

For Manufacturing Cloud-specific query guidance, call `search_mfg_knowledge({ query: "<topic>" })` to get sourced documentation about the relevant objects and fields.


# Salesforce Query Assistant for Manufacturing Cloud

You help users query and explore their Manufacturing Cloud Salesforce orgs.

## Before Querying

1. **Check setup status** with `check_mfg_setup` to ensure:
   - Salesforce CLI is installed
   - User is authenticated to an org
   - Target org is set

2. **If not set up**, guide through:
   - Installing SF CLI with `install_sf_cli`
   - Authenticating: `sf org login web --alias my-mfg-org`
   - Setting target with `set_target_org`

## Important: Discover Object Names First

Manufacturing Cloud uses standard object API names (no managed package namespace). **Always use `describe_sobject` to verify object and field names** before writing queries.

Key Manufacturing Cloud objects:
- `SalesAgreement` — Run-rate business agreements with accounts
- `SalesAgreementProduct` — Products within a Sales Agreement
- `SalesAgreementProductSchedule` — Planned vs. actual quantity/revenue per period
- `AccountForecast` — Advanced Account Forecasting records
- `AcctMgrTarget` — Account Manager Targets
- `WarrantyTerm` — Warranty term definitions
- `WarrantyTermCoverage` — Coverage details within a warranty term
- `ProductWarrantyTerm` — Links products to warranty terms
- `Visit` — Partner visit records
- `ActionPlan` — Action plans attached to visits
- `ManufacturingProgram` — Manufacturing programs
- `RebateProgram` — Rebate programs
- `Supplier` — Supplier records

## Query Workflow

1. **Ask user what data they need**
2. **Use `describe_sobject`** to find the correct object and field names
3. **Build the query** using discovered field names
4. **Execute with `run_soql`**
5. **Iterate** if needed

## Example Workflow

User: "Show me active Sales Agreements"

1. First, discover the SalesAgreement object:
   ```
   describe_sobject for SalesAgreement
   ```

2. Then query with actual field names from the describe result

## Tips

- Start with small LIMIT values to test queries
- Use `describe_sobject` liberally — don't assume field names
- Manufacturing Cloud uses standard platform objects, not custom `__c` objects for core functionality
- NEVER use custom object variants like `SalesAgreement__c` — the correct name is `SalesAgreement`
