---
description: Compare Manufacturing Cloud configuration between two Salesforce orgs
---

# Diff Orgs — Manufacturing Cloud Configuration Comparison

Compare comprehensive Manufacturing Cloud configuration between two Salesforce orgs to identify configuration drift across metadata, permissions, licenses, objects, and org settings.

## What This Command Does

Performs a deep comparison of Manufacturing Cloud setup including:
- Manufacturing Cloud objects & custom fields
- Permission sets & user assignments
- User licenses & features
- Org preferences & settings
- Custom objects & apps
- Flows, Process Builder, workflows
- Apex classes & triggers
- Data Processing Engine templates
- Integrations & connected apps
- Reports, dashboards & analytics

## Steps

1. **Identify orgs to compare**:
   - Use `list_sf_orgs` to find available authenticated orgs
   - Ask the user which two orgs to compare
   - Call `set_target_org` with their baseline org (typically production)

2. **Invoke the `mfg-org-comparison` skill**:
   - The skill will orchestrate the comparison across all Manufacturing Cloud configuration areas
   - It uses `diff_orgs` tool for automated comparison where available
   - Supplements with SOQL queries for Manufacturing-specific configuration

3. **The skill will compare**:
   
   **Manufacturing Objects**: `SalesAgreement`, `AccountForecast`, `Visit`, `WarrantyTerm`, `ProductItem`, `SerializedProduct`, `InventoryReservation`, etc.
   
   **Permission Sets**: `ManufacturingSalesUser`, `ManufacturingServiceUser`, `WarrantyManagementUser`, `InventoryAllocationUser`, etc.
   
   **Licenses**: Salesforce license types, Manufacturing Cloud licenses, Experience Cloud, Analytics
   
   **Automation**: Flows for Sales Agreement activation, warranty adjudication, inventory allocation
   
   **Integrations**: MuleSoft connectors, ERP sync jobs, Connected Apps
   
   **DPE Templates**: Data Processing Engine templates for Advanced Account Forecasting

4. **Receive a structured report**:
   - Executive summary of major differences
   - Detailed comparison by category
   - Risk assessment (High/Medium/Low impact)
   - Recommended actions with step-by-step instructions

5. **Optionally align configurations**:
   - The skill will offer to help sync configuration to the target org
   - Always confirms before making changes
   - Uses metadata deployment or CRUD operations as appropriate

## Example Usage

```
User: /mfg:diff-orgs

Claude: I'll compare Manufacturing Cloud configuration between your orgs.
        You have 3 authenticated orgs:
        1. prod-org (Production)
        2. uat-sandbox (Sandbox)
        3. dev-sandbox (Sandbox)
        
        Which two orgs would you like to compare?

User: Compare prod-org and uat-sandbox

Claude: [Generates comprehensive comparison report]
        
        # Manufacturing Cloud Configuration Comparison
        
        ## Executive Summary
        - UAT missing ManufacturingAnalyticsUser permission set
        - 5 custom fields on SalesAgreement in Prod not in UAT
        - DPE template "Product Demand Forecast" active in Prod, missing in UAT
        - InventoryAllocationUser assigned to 3 users in Prod, 0 in UAT
        - Multi-Currency enabled in Prod, disabled in UAT
        
        [Detailed breakdown follows...]
        
        Would you like me to help align UAT with Production configuration?
```

## When to Use

- **Pre-deployment validation**: Ensure sandbox matches production before deploying changes
- **Post-refresh verification**: Validate sandbox config after production refresh
- **Configuration audit**: Identify drift between environments over time
- **Release upgrade comparison**: Compare orgs on different Salesforce releases
- **Org consolidation**: Align configuration when merging or standardizing orgs

## Related Commands

- `/mfg:health-check` — Comprehensive health check for a single org
- `/mfg:status` — Quick dashboard of key Manufacturing Cloud metrics
- `/mfg:audit` — Audit Manufacturing Cloud configuration for misconfigurations
- `/mfg:export-config` — Export org configuration as JSON
- `/mfg:import-config` — Import configuration from JSON export
