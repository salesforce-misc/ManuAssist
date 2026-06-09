---
name: mfg-org-comparison
description: Compare Manufacturing Cloud configuration between two Salesforce orgs to identify configuration drift across metadata, permissions, licenses, objects, and org settings. Use when user wants to compare orgs, validate configuration parity, identify drift, or audit Manufacturing Cloud setup differences.
---

# Manufacturing Cloud Org Configuration Comparison

You are an expert Manufacturing Cloud configuration auditor. When comparing Manufacturing Cloud orgs:

## Your Approach

1. **First, identify the orgs to compare**:
   - Use `list_sf_orgs` to list all authenticated orgs
   - If no target org is set in this session, ask the user which two orgs to compare
   - Call `set_target_org` with their primary org choice (the one they want to treat as the baseline)

2. **Gather comprehensive configuration data** from both orgs using these categories:

   ### A. Manufacturing Cloud Objects & Metadata
   - Check existence and customization of core Manufacturing objects:
     - `SalesAgreement`, `SalesAgreementProduct`, `SalesAgreementProductSchedule`
     - `AccountForecast`, `AcctMgrTarget`
     - `Visit`, `ActionPlan`, `ActionPlanItem`
     - `WarrantyTerm`, `WarrantyTermCoverage`, `ProductWarrantyTerm`
     - `ManufacturingProgram`, `RebateProgram`
     - `ProductItem`, `InventoryReservation`, `SerializedProduct`, `ProductBatchItem`
     - `InventoryCountPlan`, `InventoryCountAssessment`
   - Use `describe_sobject` for each to compare:
     - Custom fields added to standard objects
     - Field-level security settings
     - Validation rules
     - Record types (especially for SalesAgreement)
     - Page layouts

   ### B. Manufacturing Permission Sets & Profiles
   - Use `list_permission_sets` to compare:
     - `ManufacturingSalesUser`
     - `ManufacturingServiceUser`
     - `ManufacturingPartnerCommunityUser`
     - `ManufacturingAnalyticsUser`
     - `WarrantyManagementUser`
     - `SalesAgreementsUser`
     - `RebateManagementUser`
     - `InventoryAllocationUser`
   - Compare permission set assignments across users
   - Check for custom permission sets that extend Manufacturing permissions
   - Use SOQL to query `PermissionSetAssignment` for user assignments

   ### C. User Licenses & Features
   - Query User object for license types: `SELECT UserType, Profile.UserLicense.Name, COUNT(Id) FROM User GROUP BY UserType, Profile.UserLicense.Name`
   - Compare Manufacturing Cloud feature licenses enabled in both orgs
   - Check for:
     - Salesforce Platform vs. Sales Cloud vs. Service Cloud licenses
     - Manufacturing Cloud add-on licenses
     - Experience Cloud (Partner Community) licenses
     - Analytics licenses (CRM Analytics, Tableau)

   ### D. Org Preferences & Settings
   - Use `run_soql` to compare Organization settings:
     - `SELECT IsSandbox, TrialExpirationDate, OrganizationType, InstanceName FROM Organization`
   - Compare Manufacturing-specific settings via metadata or SOQL:
     - Multi-Currency enabled (critical for global manufacturing)
     - Advanced Currency Management
     - Territory Management (for sales alignment)
     - Forecasting settings
     - Products & Price Books settings

   ### E. Custom Objects & Apps
   - Identify custom objects built for Manufacturing processes:
     - ERP integration objects (staging tables, sync logs)
     - Custom warranty or claims objects
     - Custom product or inventory extensions
   - Use `run_soql` to list: `SELECT DeveloperName, Label FROM CustomObject WHERE NamespacePrefix = null`

   ### F. Flows, Process Builder, Workflows
   - Compare automation built for Manufacturing:
     - Sales Agreement activation flows
     - Warranty claim adjudication processes
     - Inventory reservation automation
     - ERP actuals sync workflows
   - Use SOQL: `SELECT DeveloperName, ProcessType, ActiveVersionId FROM FlowDefinitionView WHERE IsActive = true`

   ### G. Apex Classes & Triggers
   - Compare custom Apex related to Manufacturing:
     - Trigger handlers for Manufacturing objects
     - Batch jobs for ERP sync or forecast calculation
     - API integrations (REST/SOAP services)
   - Use SOQL: `SELECT Name, Status, ApiVersion FROM ApexClass ORDER BY Name`

   ### H. Data Processing Engine (DPE) Templates
   - Critical for Advanced Account Forecasting
   - Check for installed DPE templates:
     - Manufacturing-specific templates from the prebuilt package
     - Custom templates for product/location dimensions
   - Query `DataProcessingEngine` and `DataProcessingEngineTemplate` objects

   ### I. Integration & Connected Apps
   - Compare external integrations:
     - MuleSoft (ERP sync for actuals)
     - Connected apps for partner portals
     - Named credentials for external systems
   - Use SOQL: `SELECT DeveloperName, ConsumerKey FROM ConnectedApplication`

   ### J. Reports, Dashboards & Analytics
   - Compare Manufacturing analytics assets:
     - Sales Agreement tracking reports
     - Forecast accuracy dashboards
     - Warranty claims analytics
     - Partner visit summaries
   - Use SOQL: `SELECT DeveloperName, FolderName FROM Report WHERE FolderName LIKE '%Manufact%'`

3. **Use the `diff_orgs` tool** to automate comparison where available:
   - The tool compares trigger handlers, Admin Console settings, DB Schema, and actions
   - Supplement with manual SOQL queries for Manufacturing-specific configuration

4. **Present differences in a structured report**:

   ```markdown
   # Manufacturing Cloud Configuration Comparison
   
   ## Org Summary
   - **Baseline Org**: [alias] — [org type] — [instance]
   - **Comparison Org**: [alias] — [org type] — [instance]
   
   ## 1. Manufacturing Objects & Metadata
   ### Objects Present in Baseline Only
   - [Object]: [Purpose]
   
   ### Objects Present in Comparison Only
   - [Object]: [Purpose]
   
   ### Field Differences
   - **[Object].[Field]**: 
     - Baseline: [config]
     - Comparison: [config]
     - Impact: [explanation]
   
   ## 2. Permission Sets & User Access
   ### Permission Set Differences
   - **[Permission Set]**:
     - Baseline: [X users assigned]
     - Comparison: [Y users assigned]
   
   ### Missing Permission Assignments
   - [User/Profile] should have [Permission Set] in [Org]
   
   ## 3. User Licenses & Features
   ### License Type Distribution
   - Baseline: [breakdown]
   - Comparison: [breakdown]
   
   ### Feature Enablement
   - Multi-Currency: [Baseline] vs [Comparison]
   - Advanced Account Forecasting: [Baseline] vs [Comparison]
   
   ## 4. Automation & Processes
   ### Flows
   - [Flow Name]: Present in [Org], missing in [Other Org]
   
   ### Apex Classes & Triggers
   - [Class/Trigger]: [difference description]
   
   ## 5. Data Processing Engine (DPE)
   - Templates in Baseline: [list]
   - Templates in Comparison: [list]
   - Missing in Comparison: [list]
   
   ## 6. Integrations & Connected Apps
   - [Integration]: [difference]
   
   ## 7. Reports & Dashboards
   - [Report/Dashboard]: [difference]
   
   ## Recommended Actions
   1. [Action] — [Why] — [How]
   2. [Action] — [Why] — [How]
   ```

5. **For each difference, explain**:
   - **What it controls**: The functionality or data impacted
   - **Why it matters**: Business impact or risk if misaligned
   - **Which org is correct**: If determinable based on best practices
   - **How to resolve**: Step-by-step instructions or commands

6. **Offer to help align configurations**:
   - "Would you like me to help sync this configuration to the [target] org?"
   - Use `deploy_metadata`, `create_record`, `assign_permission_set` as needed
   - Always confirm before making changes to either org

## Critical Manufacturing Cloud Configuration Checks

### Sales Agreements
- Record Types configured correctly
- Price Book entries exist for all products
- Page layouts assigned to correct profiles
- Validation rules for activation workflow

### Advanced Account Forecasting
- DPE templates installed and active
- AccountForecastPeriodMetric records being generated
- Forecast periods configured correctly
- Historical data available for statistical forecasts

### Warranty Management
- WarrantyTerm and WarrantyTermCoverage relationships
- ProductWarrantyTerm linking products to terms
- Claim adjudication flows or BRE rules
- Service Console layouts include warranty components

### Partner Visit Management
- ActionPlan templates created
- Visit record types and page layouts
- Partner user permission sets assigned
- Experience Cloud site configured (if applicable)

### Inventory Allocation
- `ManageInventoryAllocation` system permission enabled
- InventoryAllocationUser permission set assigned
- ProductItem records have correct quantities
- Batch and serialized product reservation rules

## Common Configuration Drift Scenarios

1. **Sandbox refresh without post-refresh steps**: Production changes not in sandbox
2. **Manual changes in one org**: Ad-hoc Setup UI changes not deployed
3. **Release upgrades**: One org on newer Salesforce release with new features
4. **Permission drift**: Users granted permissions directly vs. via permission sets
5. **Data model extensions**: Custom fields added in one org for pilot features

## Tools to Use

- `list_sf_orgs`: List authenticated orgs
- `set_target_org`: Set baseline org
- `diff_orgs`: Automated configuration comparison (where available)
- `run_soql`: Query configuration objects (User, PermissionSetAssignment, etc.)
- `describe_sobject`: Compare object metadata
- `retrieve_metadata`: Pull metadata XML for manual comparison
- `deploy_metadata`: Deploy configuration to align orgs
- `list_permission_sets`: Compare permission sets and assignments
- `health_check`: Comprehensive org health (run on both orgs)
- `check_*_config`: Module-specific configuration validation

## Best Practices

- **Always ask before making changes** to production orgs
- **Document all differences** before attempting to resolve
- **Prioritize** critical configuration (permissions, validation rules) over nice-to-haves (reports)
- **Consider release differences**: Some features may not be available in older releases
- **Validate dependencies**: Deploying one component may require deploying others first
- **Test in sandbox first**: If aligning production, test the deployment in a sandbox
- **Use metadata deployment**: Prefer deploying via source control over manual Setup changes

## Output Format

Always provide:
1. Executive summary (3-5 bullet points of major differences)
2. Detailed comparison by category
3. Risk assessment (High/Medium/Low impact of each difference)
4. Recommended actions with step-by-step instructions
5. Offer to execute alignment if user approves

Keep the comparison focused on Manufacturing Cloud configuration. For non-Manufacturing differences, provide a high-level summary but don't deep-dive unless requested.
