# Manufacturing Cloud Org Comparison Skill

## Overview

A comprehensive Manufacturing Cloud configuration comparison skill that validates metadata, org preferences, permission sets, user licenses, custom objects, and profiles between two Salesforce orgs.

## Created Files

### 1. Skill File
**Location**: `/skills/mfg-org-comparison/SKILL.md`

**Purpose**: Auto-invoked by Claude when users want to compare Manufacturing Cloud configuration between orgs.

**Key Features**:
- Compares 10+ configuration categories
- Manufacturing Cloud-specific object validation
- Permission set and license comparison
- Automation and integration checks
- Structured report generation
- Configuration alignment assistance

### 2. Command File (Updated)
**Location**: `/commands/diff-orgs.md`

**Purpose**: User-invoked command via `/mfg:diff-orgs` slash command.

**Changes Made**:
- Updated description to focus on Manufacturing Cloud
- Added comprehensive list of what gets compared
- Included example usage and output format
- Added related commands section

### 3. CLAUDE.md (Updated)
**Location**: `/CLAUDE.md`

**Changes Made**:
- Added `mfg-org-comparison` to Skills table
- Updated project structure to include new skill directory

## How It Works

### User Invocation
```
User: /mfg:diff-orgs
```

### Claude's Workflow

1. **Skill Activation**: The `mfg-org-comparison` skill is automatically invoked
2. **Org Identification**: 
   - Lists authenticated orgs via `list_sf_orgs`
   - Asks user to select two orgs to compare
   - Sets target org via `set_target_org`
3. **Data Collection**: Gathers configuration from both orgs across 10 categories
4. **Comparison**: Uses `diff_orgs` tool + custom SOQL queries
5. **Report Generation**: Creates structured comparison report
6. **Action Recommendations**: Provides step-by-step resolution guidance
7. **Alignment Assistance**: Offers to sync configurations if approved

## Configuration Categories Compared

### 1. Manufacturing Cloud Objects & Metadata
- Standard objects: `SalesAgreement`, `AccountForecast`, `Visit`, `WarrantyTerm`, etc.
- Custom fields on Manufacturing objects
- Field-level security
- Validation rules
- Record types
- Page layouts

**Tool Used**: `describe_sobject`

### 2. Permission Sets & Profiles
- Manufacturing-specific permission sets:
  - `ManufacturingSalesUser`
  - `ManufacturingServiceUser`
  - `WarrantyManagementUser`
  - `InventoryAllocationUser`
  - etc.
- Permission set assignments per user
- Custom permission sets extending Manufacturing permissions

**Tool Used**: `list_permission_sets` + SOQL on `PermissionSetAssignment`

### 3. User Licenses & Features
- License type distribution
- Manufacturing Cloud add-on licenses
- Experience Cloud licenses
- Analytics licenses
- Feature enablement (Multi-Currency, Advanced Currency Management, etc.)

**SOQL Query**: 
```sql
SELECT UserType, Profile.UserLicense.Name, COUNT(Id) 
FROM User 
GROUP BY UserType, Profile.UserLicense.Name
```

### 4. Org Preferences & Settings
- Organization type (Production, Sandbox, Developer)
- Instance name
- Multi-Currency status
- Territory Management
- Forecasting settings

**SOQL Query**:
```sql
SELECT IsSandbox, TrialExpirationDate, OrganizationType, InstanceName 
FROM Organization
```

### 5. Custom Objects & Apps
- Custom objects built for Manufacturing processes
- ERP integration staging tables
- Custom warranty/claims objects
- Product/inventory extensions

**SOQL Query**:
```sql
SELECT DeveloperName, Label 
FROM CustomObject 
WHERE NamespacePrefix = null
```

### 6. Flows, Process Builder, Workflows
- Sales Agreement activation flows
- Warranty claim adjudication processes
- Inventory reservation automation
- ERP actuals sync workflows

**SOQL Query**:
```sql
SELECT DeveloperName, ProcessType, ActiveVersionId 
FROM FlowDefinitionView 
WHERE IsActive = true
```

### 7. Apex Classes & Triggers
- Trigger handlers for Manufacturing objects
- Batch jobs for ERP sync or forecast calculation
- API integrations (REST/SOAP services)

**SOQL Query**:
```sql
SELECT Name, Status, ApiVersion 
FROM ApexClass 
ORDER BY Name
```

### 8. Data Processing Engine (DPE) Templates
- Manufacturing-specific DPE templates (critical for Advanced Account Forecasting)
- Custom templates for product/location dimensions

**Objects Queried**: `DataProcessingEngine`, `DataProcessingEngineTemplate`

### 9. Integration & Connected Apps
- MuleSoft connectors for ERP sync
- Partner portal connected apps
- Named credentials for external systems

**SOQL Query**:
```sql
SELECT DeveloperName, ConsumerKey 
FROM ConnectedApplication
```

### 10. Reports, Dashboards & Analytics
- Sales Agreement tracking reports
- Forecast accuracy dashboards
- Warranty claims analytics
- Partner visit summaries

**SOQL Query**:
```sql
SELECT DeveloperName, FolderName 
FROM Report 
WHERE FolderName LIKE '%Manufact%'
```

## Sample Output

```markdown
# Manufacturing Cloud Configuration Comparison

## Org Summary
- **Baseline Org**: prod-mfg (Production) — NA173
- **Comparison Org**: uat-sandbox (Sandbox) — CS92

## Executive Summary
✓ **5 Critical Differences Found**
- UAT missing ManufacturingAnalyticsUser permission set
- 5 custom fields on SalesAgreement in Prod not in UAT
- DPE template "Product Demand Forecast" active in Prod, missing in UAT
- Multi-Currency enabled in Prod, disabled in UAT
- 3 users have InventoryAllocationUser in Prod, 0 in UAT

## 1. Manufacturing Objects & Metadata

### Field Differences
**SalesAgreement.Territory__c**
- Baseline (Prod): Text(50), Required, FLS: All profiles
- Comparison (UAT): NOT PRESENT
- **Impact**: Sales territory tracking unavailable in UAT
- **Action**: Deploy custom field to UAT

**SalesAgreementProductSchedule.ActualConfirmedBy__c**
- Baseline (Prod): Lookup(User), Optional
- Comparison (UAT): NOT PRESENT
- **Impact**: Cannot track who confirmed actuals in UAT
- **Action**: Deploy custom field to UAT

## 2. Permission Sets & User Access

### Missing Permission Assignments
- **ManufacturingAnalyticsUser**:
  - Baseline (Prod): 12 users assigned
  - Comparison (UAT): 0 users assigned
  - **Impact**: Business analysts cannot access forecast analytics in UAT
  - **Action**: Assign to 12 users matching production

## 3. User Licenses & Features

### Feature Enablement
- **Multi-Currency**: 
  - Baseline: ✓ Enabled
  - Comparison: ✗ Disabled
  - **Impact**: HIGH RISK — Cannot test multi-currency Sales Agreements in UAT
  - **Action**: Enable in UAT (requires Salesforce support)

## 4. Data Processing Engine (DPE)

### Templates Missing in UAT
- `MFG_Product_Demand_Forecast_v2` (Active in Prod, Missing in UAT)
- `MFG_Location_Based_Forecast` (Active in Prod, Missing in UAT)

**Impact**: Advanced Account Forecasting will fail in UAT
**Action**: Deploy DPE templates from prebuilt Manufacturing package to UAT

## Recommended Actions

1. **Deploy Custom Fields** (Priority: HIGH)
   - Deploy SalesAgreement custom fields via metadata
   - Command: `sf project deploy start --metadata CustomField:SalesAgreement.*`

2. **Assign Permission Sets** (Priority: HIGH)
   - Assign ManufacturingAnalyticsUser to 12 users
   - Use `assign_permission_set` tool

3. **Enable Multi-Currency** (Priority: CRITICAL)
   - Contact Salesforce support to enable in UAT
   - Note: Cannot be enabled via API or metadata

4. **Deploy DPE Templates** (Priority: HIGH)
   - Install Manufacturing DPE package in UAT
   - Activate templates matching production

Would you like me to help align UAT with Production configuration?
```

## When to Use This Skill

### User Scenarios
1. **Pre-deployment validation**: "Compare my sandbox to production before deploying"
2. **Post-refresh verification**: "Validate sandbox config after refreshing from production"
3. **Configuration audit**: "Show me what's different between these two orgs"
4. **Release upgrade comparison**: "Compare my Spring '26 org to Winter '26 org"
5. **Org consolidation**: "I need to align configuration across multiple orgs"

### Trigger Phrases
- "Compare orgs"
- "Diff orgs"
- "Validate configuration parity"
- "Identify drift between orgs"
- "Audit Manufacturing Cloud setup"
- "Show differences between production and sandbox"

## Related Commands

- `/mfg:health-check` — Health check for a single org
- `/mfg:status` — Quick dashboard of key metrics
- `/mfg:audit` — Audit for misconfigurations in a single org
- `/mfg:export-config` — Export configuration as JSON
- `/mfg:import-config` — Import configuration from JSON

## Implementation Notes

### Critical Manufacturing Cloud Checks

#### Sales Agreements
- Record Types configured correctly
- Price Book entries exist for all products
- Page layouts assigned to correct profiles
- Validation rules for activation workflow

#### Advanced Account Forecasting
- DPE templates installed and active
- AccountForecastPeriodMetric records being generated
- Forecast periods configured correctly
- Historical data available for statistical forecasts

#### Warranty Management
- WarrantyTerm and WarrantyTermCoverage relationships
- ProductWarrantyTerm linking products to terms
- Claim adjudication flows or BRE rules
- Service Console layouts include warranty components

#### Partner Visit Management
- ActionPlan templates created
- Visit record types and page layouts
- Partner user permission sets assigned
- Experience Cloud site configured (if applicable)

#### Inventory Allocation
- `ManageInventoryAllocation` system permission enabled
- InventoryAllocationUser permission set assigned
- ProductItem records have correct quantities
- Batch and serialized product reservation rules

### Common Configuration Drift Scenarios

1. **Sandbox refresh without post-refresh steps**
   - Production changes made after last sandbox refresh
   - Solution: Re-deploy recent changes to sandbox

2. **Manual changes in one org**
   - Ad-hoc Setup UI changes not tracked in source control
   - Solution: Capture via metadata retrieval and deploy

3. **Release upgrades**
   - One org on newer Salesforce release with new features
   - Solution: Document feature parity after upgrade

4. **Permission drift**
   - Users granted permissions directly vs. via permission sets
   - Solution: Standardize on permission set assignments

5. **Data model extensions**
   - Custom fields added in one org for pilot features
   - Solution: Deploy after pilot validation

## Best Practices

### Before Making Changes
- Always ask user permission before modifying production
- Document all differences before attempting resolution
- Prioritize critical configuration (permissions, validation rules)
- Consider release differences (some features may not be available)

### Deployment Strategy
- Validate dependencies before deploying
- Test in sandbox first if aligning production
- Use metadata deployment over manual Setup changes
- Deploy in batches (fields → validation rules → flows → permissions)

### Post-Comparison
- Keep comparison report for audit trail
- Schedule regular drift checks (monthly recommended)
- Document standard configuration in version control
- Create runbooks for common alignment scenarios

## Technical Architecture

```
User: /mfg:diff-orgs
   ↓
Command File (diff-orgs.md)
   ↓
Skill Activation (mfg-org-comparison)
   ↓
┌─────────────────────────────────────────┐
│ Data Collection Phase                   │
├─────────────────────────────────────────┤
│ • list_sf_orgs                          │
│ • set_target_org (baseline)             │
│ • run_soql (both orgs)                  │
│ • describe_sobject (both orgs)          │
│ • list_permission_sets (both orgs)      │
│ • diff_orgs (automated comparison)      │
└─────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────┐
│ Analysis Phase                          │
├─────────────────────────────────────────┤
│ • Compare objects & fields              │
│ • Compare permissions & licenses        │
│ • Compare automation & integrations     │
│ • Assess impact & risk                  │
│ • Generate recommendations              │
└─────────────────────────────────────────┘
   ↓
┌─────────────────────────────────────────┐
│ Reporting Phase                         │
├─────────────────────────────────────────┤
│ • Executive summary                     │
│ • Detailed differences by category      │
│ • Risk assessment (High/Med/Low)        │
│ • Step-by-step resolution instructions  │
│ • Offer to execute alignment            │
└─────────────────────────────────────────┘
   ↓
User Approval
   ↓
┌─────────────────────────────────────────┐
│ Alignment Phase (Optional)              │
├─────────────────────────────────────────┤
│ • deploy_metadata (fields, rules, etc.) │
│ • assign_permission_set (permissions)   │
│ • create_record (config records)        │
│ • update_record (settings)              │
└─────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Skill registered in CLAUDE.md
- [ ] Command file updated with Manufacturing Cloud context
- [ ] Skill file includes all 10 comparison categories
- [ ] Sample SOQL queries validated
- [ ] Example output format verified
- [ ] Related commands documented
- [ ] Integration with existing tools confirmed
- [ ] Best practices section complete
- [ ] User scenarios covered

## Future Enhancements

1. **Automated Scheduling**: Run comparisons on a schedule (weekly/monthly)
2. **Drift Alerts**: Notify when critical drift detected
3. **Configuration Baselines**: Store golden configs for instant comparison
4. **Rollback Capability**: Undo alignment changes if issues arise
5. **Bulk Org Comparison**: Compare 3+ orgs simultaneously
6. **Visual Diff Reports**: Generate HTML reports with charts/graphs
7. **Smart Alignment**: Auto-resolve non-critical drift without user approval
8. **Integration with CI/CD**: Run comparison checks in deployment pipelines

## Conclusion

The Manufacturing Cloud Org Comparison Skill provides comprehensive configuration drift detection and alignment capabilities tailored specifically for Salesforce Manufacturing Cloud implementations. It validates 10+ configuration categories, generates detailed reports, and assists with configuration synchronization — all accessible via the `/mfg:diff-orgs` slash command.
