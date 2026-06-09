# Manufacturing Cloud Org Comparison — Quick Start Guide

## What Is It?

A Manufacturing Cloud-specific configuration comparison tool that validates drift between two Salesforce orgs across metadata, permissions, licenses, objects, and settings.

## How to Use

### Basic Usage

```bash
# In Claude Code CLI or Chat
/mfg:diff-orgs
```

Claude will:
1. List your authenticated orgs
2. Ask which two to compare
3. Generate a comprehensive comparison report
4. Offer to sync configurations if you approve

### What Gets Compared

✓ **Manufacturing Objects** — SalesAgreement, AccountForecast, Visit, WarrantyTerm, ProductItem, etc.
✓ **Custom Fields** — All custom fields on Manufacturing objects
✓ **Permission Sets** — ManufacturingSalesUser, WarrantyManagementUser, InventoryAllocationUser, etc.
✓ **User Licenses** — License types, feature enablement, user distribution
✓ **Automation** — Flows, Process Builder, workflows for Manufacturing processes
✓ **Apex Code** — Triggers, batch jobs, API integrations
✓ **DPE Templates** — Data Processing Engine templates for forecasting
✓ **Integrations** — Connected apps, named credentials, MuleSoft connectors
✓ **Reports & Dashboards** — Manufacturing analytics assets
✓ **Org Settings** — Multi-currency, territory management, forecasting config

## Common Scenarios

### Scenario 1: Pre-Deployment Validation

**Use Case**: You've made changes in a sandbox and want to validate it matches production before deploying.

```
User: /mfg:diff-orgs

Claude: Which two orgs would you like to compare?

User: Compare dev-sandbox to prod-mfg

Claude: [Generates comparison showing dev-sandbox has all production config plus 3 new custom fields ready to deploy]
```

**Result**: Confidence that your deployment won't cause configuration drift.

---

### Scenario 2: Post-Refresh Verification

**Use Case**: You just refreshed your sandbox from production and need to verify the configuration copied correctly.

```
User: /mfg:diff-orgs

Claude: Which two orgs would you like to compare?

User: Compare uat-sandbox to prod-mfg (after refresh)

Claude: [Identifies missing permission set assignments and inactive DPE templates that need to be fixed post-refresh]
```

**Result**: Checklist of post-refresh configuration tasks to restore sandbox to working state.

---

### Scenario 3: Configuration Audit

**Use Case**: You suspect configuration drift between environments and want a comprehensive audit.

```
User: /mfg:diff-orgs

Claude: Which two orgs would you like to compare?

User: Compare prod-mfg to prod-mfg-backup (older prod org)

Claude: [Shows 47 differences including 12 new custom fields, 3 new flows, 5 permission set changes]
```

**Result**: Complete inventory of how your org has evolved over time.

---

### Scenario 4: Org Consolidation

**Use Case**: You have multiple orgs with different configurations and need to standardize on one.

```
User: /mfg:diff-orgs

Claude: Which two orgs would you like to compare?

User: Compare prod-region-emea to prod-region-amer

Claude: [Identifies region-specific customizations vs. global standards]

User: Align EMEA org with AMER org as the baseline

Claude: [Deploys configuration to sync EMEA to AMER standards]
```

**Result**: Standardized configuration across regions.

---

### Scenario 5: Release Upgrade Validation

**Use Case**: Production is on Spring '26, sandbox upgraded to Summer '26. You want to see what changed.

```
User: /mfg:diff-orgs

Claude: Which two orgs would you like to compare?

User: Compare prod-spring26 to uat-summer26

Claude: [Shows new Salesforce platform features available in Summer '26 plus your custom config]
```

**Result**: Understanding of release-specific changes vs. configuration drift.

## Sample Report Structure

```markdown
# Manufacturing Cloud Configuration Comparison

## Org Summary
- Baseline: prod-mfg (Production, NA173)
- Comparison: uat-sandbox (Sandbox, CS92)

## Executive Summary (Top 5 Differences)
1. UAT missing ManufacturingAnalyticsUser permission set (12 users in prod)
2. 5 custom fields on SalesAgreement in prod not in UAT
3. DPE template "Product Demand Forecast" active in prod, missing in UAT
4. Multi-Currency enabled in prod, disabled in UAT
5. InventoryAllocationUser assigned to 3 users in prod, 0 in UAT

## Detailed Comparison

### 1. Manufacturing Objects & Metadata
[Field-by-field differences with impact assessment]

### 2. Permission Sets & User Access
[Missing assignments and access gaps]

### 3. User Licenses & Features
[License distribution and feature enablement]

### 4. Automation & Processes
[Flow, Apex, and workflow differences]

### 5. Data Processing Engine (DPE)
[Template inventory and activation status]

### 6. Integrations & Connected Apps
[External system connections]

### 7. Reports & Dashboards
[Analytics asset differences]

## Recommended Actions (Priority Sorted)
1. CRITICAL: Enable Multi-Currency in UAT (requires Salesforce support)
2. HIGH: Deploy 5 custom fields to UAT
3. HIGH: Install DPE templates in UAT
4. MEDIUM: Assign ManufacturingAnalyticsUser to 12 users
5. LOW: Sync report folders between orgs

## Next Steps
Would you like me to help align UAT with Production configuration?
```

## Risk Assessment Levels

### CRITICAL 🔴
Configuration difference will break functionality or prevent testing.

**Examples**:
- Multi-Currency disabled in sandbox but enabled in production
- Permission set missing for critical user roles
- DPE templates not installed (breaks Advanced Account Forecasting)

**Action**: Must fix before deployment or go-live.

---

### HIGH 🟠
Configuration difference will cause unexpected behavior or limit functionality.

**Examples**:
- Custom fields missing on key objects
- Validation rules not deployed
- Flows inactive in target org

**Action**: Fix before deployment; test workaround if urgent.

---

### MEDIUM 🟡
Configuration difference affects user experience but has workarounds.

**Examples**:
- Page layouts differ between orgs
- Report folders not organized consistently
- Permission sets assigned to different users

**Action**: Fix during next maintenance window.

---

### LOW 🟢
Configuration difference is cosmetic or non-functional.

**Examples**:
- Field labels differ (but API names match)
- Different custom help text
- Report names vary but queries are identical

**Action**: Fix if time permits; not deployment-blocking.

## Tips for Success

### Before You Start
- ✅ Authenticate to both orgs using Salesforce CLI
- ✅ Have admin access to both orgs
- ✅ Know which org is your "baseline" (typically production)
- ✅ Document the business reason for comparison

### During Comparison
- ✅ Review the full report before taking action
- ✅ Prioritize fixes by risk level (CRITICAL → HIGH → MEDIUM → LOW)
- ✅ Validate dependencies (e.g., field referenced by flow must deploy first)
- ✅ Consider release differences (some features not available in older releases)

### After Comparison
- ✅ Save the comparison report for audit trail
- ✅ Test changes in sandbox before production
- ✅ Schedule regular drift checks (monthly recommended)
- ✅ Update runbooks with common alignment procedures

## FAQ

### Q: How long does a comparison take?
**A**: 2-5 minutes depending on org size and complexity. Large enterprise orgs with 1000+ custom objects may take 10 minutes.

---

### Q: Will this make changes to my org automatically?
**A**: No. Claude will ALWAYS ask for permission before deploying any changes. You control what gets aligned.

---

### Q: Can I compare more than 2 orgs at once?
**A**: Currently limited to 2 orgs per comparison. Run multiple comparisons to evaluate 3+ orgs.

---

### Q: What if I don't have permission to access both orgs?
**A**: You must have admin access and authenticated CLI sessions to both orgs. If you lack access, ask your Salesforce admin to run the comparison.

---

### Q: Does this compare data or just configuration?
**A**: Configuration only (metadata, settings, permissions). It does NOT compare records like Accounts, Opportunities, or SalesAgreements.

---

### Q: Can I export the comparison report?
**A**: Yes. The report is generated as markdown and can be saved to a file for sharing or documentation.

---

### Q: What if my orgs are on different Salesforce releases?
**A**: The comparison will note release-specific differences. Some features may not be available in older releases — Claude will flag these.

---

### Q: How do I schedule automated comparisons?
**A**: Currently requires manual invocation. Future enhancement: scheduled drift checks with alerts.

## Related Commands

| Command | Purpose |
|---------|---------|
| `/mfg:health-check` | Comprehensive health check for a single org |
| `/mfg:status` | Quick dashboard of key Manufacturing Cloud metrics |
| `/mfg:audit` | Audit a single org for misconfigurations |
| `/mfg:export-config` | Export org configuration as JSON |
| `/mfg:import-config` | Import configuration from JSON export |

## Support

### If Comparison Fails
1. Check Salesforce CLI authentication: `sf org list`
2. Verify you have admin access to both orgs
3. Check for network connectivity issues
4. Review Claude's error message for specific tool failures

### If Alignment Fails
1. Check for missing dependencies (e.g., field referenced before it's deployed)
2. Verify target org has required licenses/features
3. Review Salesforce metadata deployment limits
4. Consider manual deployment via Change Sets if automated fails

### Getting Help
- `/mfg:help` — Search Manufacturing Cloud knowledge base
- `/mfg:docs` — Browse documentation by category
- `/mfg:getting-started` — Interactive onboarding guide

## Next Steps

Ready to compare your orgs? Run:

```
/mfg:diff-orgs
```

Claude will guide you through the rest!
