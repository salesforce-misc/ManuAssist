# Claude for Manufacturing Cloud

A [Claude Code](https://claude.ai/code) plugin that brings expert Manufacturing Cloud knowledge, Salesforce org tools, and implementation guidance directly into your terminal.

## What It Does

This plugin gives Claude deep expertise in Salesforce Manufacturing Cloud, enabling it to:

- **Guide implementations** across Manufacturing Cloud modules with best practices, correct object names, and source citations
- **Run interactive configuration wizards** for Sales Agreements, Warranty Management, Advanced Account Forecasting, Partner Visit Management, and user setup
- **Inspect and manage** your Salesforce Manufacturing Cloud org directly — SOQL, CRUD, metadata deploy/retrieve, anonymous Apex
- **Configure org settings** programmatically — permission sets, record types, Sales Agreement setup, Warranty configuration
- **Audit configurations** with validation rules to catch misconfigurations before they cause issues
- **Troubleshoot issues** using Manufacturing Cloud-specific knowledge and automated diagnostics
- **Explain Manufacturing Cloud concepts** like Sales Agreements, DPE, Account Manager Targets, Warranty adjudication, and more — with source citations
- **Compare orgs** side-by-side to identify configuration drift between environments
- **Export/import configurations** as JSON for org-to-org migration
- **Manage users** — permission sets, profiles, role hierarchy, and license capacity

## Quick Start

### Prerequisites

- [Claude Code](https://claude.ai/code) 1.0.33+
- Node.js 18+
- A Salesforce org with Manufacturing Cloud (optional, for org tools)

### Installation

**Option 1: Plugin Marketplace (Recommended)**

In Claude Code, run:
```
/plugin marketplace add sgrandhi/claude-for-mfg
/plugin install mfg
```

**Option 2: Local Development**

```bash
# git clone https://github.com/sgrandhi/claude-for-mfg.git
cd claude-for-mfg
npm install
npm run build
claude --plugin-dir ./claude-for-mfg
```

### First-Time Setup

Run `/mfg:setup-plugin` to check your environment and connect to a Salesforce org:

```
/mfg:setup-plugin
```

The plugin will guide you through:
1. Installing Salesforce CLI (if needed)
2. Authenticating to your Manufacturing Cloud org
3. Selecting a target org for queries

## Commands

| Command | Description |
|---------|-------------|
| `/mfg:setup-plugin` | Check plugin status and connect to Salesforce |
| `/mfg:soql-query <soql>` | Run a SOQL query against your org |
| `/mfg:describe <object>` | Describe a Salesforce object's fields |
| `/mfg:help <topic>` | Search the Manufacturing Cloud knowledge base by topic |
| `/mfg:docs` | Browse and navigate Manufacturing Cloud documentation by category |
| `/mfg:audit [group]` | Audit configuration against validation rules |
| `/mfg:configure-sales-agreements` | Configure and validate Sales Agreements |
| `/mfg:configure-forecasting` | Configure and validate Advanced Account Forecasting |
| `/mfg:configure-visits` | Configure and validate Partner Visit Management |
| `/mfg:configure-warranty` | Configure and validate Warranty Lifecycle Management |
| `/mfg:configure-accounts` | Configure and validate account management |
| `/mfg:configure-territory` | Configure and validate territory alignment |
| `/mfg:configure-users` | Configure and validate user management |
| `/mfg:open-org` | Open the Salesforce org in the browser |
| `/mfg:diff-orgs` | Compare configuration between two Salesforce orgs |
| `/mfg:health-check` | Run a comprehensive org health check |
| `/mfg:release-notes` | View Manufacturing Cloud release notes by Salesforce release |
| `/mfg:export-config` | Export org configuration as JSON |
| `/mfg:import-config` | Import configuration from JSON export |
| `/mfg:status` | Dashboard view of the connected org |
| `/mfg:getting-started` | Interactive onboarding and capability discovery |
| `/mfg:slack-analysis <channel>` | Analyze a Slack channel for question patterns and trends |

## Skills (Auto-Invoked)

Claude automatically activates the right skill based on what you're asking about:

| Skill | Description |
|-------|-------------|
| `mfg-implementation` | Guides module implementations with best practices |
| `mfg-sales-agreements` | Sales Agreements, run-rate business, planned vs. actual |
| `mfg-warranty` | Warranty terms, claims, adjudication, supplier recovery |
| `mfg-forecasting` | Advanced Account Forecasting, DPE, Account Manager Targets |
| `mfg-partner-visits` | Partner/distributor visit management, action plans |
| `mfg-user-management` | User provisioning, permission sets, profiles, role hierarchy |
| `mfg-data-model` | Expert knowledge of the Manufacturing Cloud data model |
| `salesforce-query` | Helps construct and execute SOQL queries |
| `mfg-slack-analysis` | Analyzes Slack channels for support question patterns and trends |

## Example Usage

### First-time setup

```
/mfg:setup-plugin
```

```
Checking Salesforce CLI... ✓ sf v2.42.6
Checking authenticated orgs... 2 orgs found

Which org would you like to use?
1. my-mfg-sandbox (sandbox) — last used 2 days ago
2. mfg-uat (sandbox)

> 1

Target org set to: my-mfg-sandbox
You're ready to use all Manufacturing Cloud tools.
```

---

### Sales Agreement configuration

```
/mfg:configure-sales-agreements
```

```
## Sales Agreement Configuration Report

### Overall Status: NEEDS ATTENTION

### Record Types
- SalesAgreement record types: 2 (Standard, Volume-based)
- Status: ✓ Configured

### Products
- SalesAgreementProduct records: 847
- Status: ✓ Configured

### ERP Actuals Sync
- SalesAgreementProductSchedule.ActualQuantity populated: 0 records
- Status: ⚠️ NOT CONFIGURED — ERP sync not yet set up

### Permission Sets
- ManufacturingSalesUser: 12 users
- Status: ✓ Configured

Issues Found:
1. No ERP actuals synced — ActualQuantity is 0 for all schedules
2. No Account Manager Targets configured

Recommendations:
1. Set up MuleSoft Accelerator or custom REST API for ERP actuals sync
2. Run /mfg:configure-forecasting to set up Account Manager Targets
```

---

### Run a SOQL query

```
/mfg:soql-query SELECT Id, Name, Status, AccountId FROM SalesAgreement
WHERE Status = 'Active' LIMIT 20
```

```
Returned 20 records.

ID                  | NAME                    | STATUS  | ACCOUNT
--------------------|-------------------------|---------|------------------
0AHg000001xyzAB    | Distributor SA 2026     | Active  | Acme Corp
0AHg000001xyzAC    | Volume Agreement Q1     | Active  | Global Parts Inc
...
```

---

### Warranty claim troubleshooting

```
Why are warranty claims stuck in "In Review" status?
```

```
Claims stuck in "In Review" typically indicate a Business Rules Engine (BRE) issue.

Common causes:

1. BRE decision table not activated
   Check: Setup > Business Rules Engine > Decision Tables
   Fix: Activate the WarrantyAdjudication decision table

2. Flow not triggered on status change
   Check: Setup > Flows > Warranty Claim Auto-Adjudication
   Fix: Ensure the flow triggers on WarrantyClaim status change to 'In Review'

3. Missing WarrantyClaimProduct records
   BRE rules require claim line items to evaluate conditions.
   Run: SELECT Id, Count() FROM WarrantyClaimProduct WHERE WarrantyClaim.Status = 'In Review'

Running check now...
```

---

### Org health check

```
/mfg:health-check
```

```
## Manufacturing Cloud Health Check

### Overall Status: NEEDS ATTENTION

✓  ManufacturingSalesUser — 12 users assigned
✓  ManufacturingServiceUser — 8 users assigned
⚠️  SalesAgreement record types — 0 found (WARN: create at least one record type)
✓  WarrantyTerm records — 45 active
⚠️  AccountForecast records — 0 found (DPE may not have run yet)
✓  Visit record types — 3 configured

Issues (2 warnings):
1. No SalesAgreement record types — create via Setup > Object Manager > SalesAgreement
2. No AccountForecast records — schedule and run DPE definition
```

### Slack channel analysis

```
/mfg:slack-analysis https://salesforce-internal.slack.com/archives/C028WU2N2UQ last 7 days
```

```
# Manufacturing Cloud Support Channel Analysis

**Period**: 2026-03-04 to 2026-03-11
**Channel**: #tmp-help-manufacturing-automotive (C028WU2N2UQ)
**Total Questions Analyzed**: 14

## Module Distribution

| Module             | Count | %   | Top Issue                              |
|--------------------|-------|-----|----------------------------------------|
| Inventory Mgmt     | 5     | 36% | OrderItem layout edit with perm sets   |
| Sales Agreements   | 4     | 29% | ERP actuals sync not populating        |
| Warranty           | 3     | 21% | Claims stuck in review                 |
| General            | 2     | 14% | Permission set assignment errors       |

## Key Findings

1. Inventory Management questions dominate — mostly related to
   permission set conflicts with page layouts
2. 71% of questions resolved via configuration guidance
3. 2 questions linked to known bugs with fixes planned for 262
```

---

## MCP Server Tools

The plugin exposes 60+ tools via its MCP server, organized into these categories:

### Knowledge & Documentation
Search and retrieve Manufacturing Cloud documentation, module guides, help docs, and troubleshooting. All responses include source citations.

### Salesforce Org Tools
Connect to orgs, run SOQL, describe objects, CRUD operations, deploy/retrieve metadata, execute anonymous Apex.

### Sales Agreement Tools
Check Sales Agreement configuration, get SA details with products and schedules, activate draft agreements.

### Warranty Tools
Validate warranty configuration, list warranty claims with filters.

### Forecasting Tools
Validate AAF and DPE setup, check Account Manager Targets.

### Partner Visit Tools
Validate Partner Visit Management setup, list visits with filters.

### Configuration Check Tools
Check user permission set assignments, product catalogs, account structure.

### User Management Tools
List users, list permission sets with capacity, assign and unassign permission sets.

### Health & Status Tools
Comprehensive org health check, org status dashboard, export/import configuration as JSON.

### Developer & Integrator Tools
Execute anonymous Apex, bulk create/update records, deploy/retrieve metadata.

## Covered Modules

| Module | Key Topics |
|--------|------------|
| Sales Agreements | Run-rate business, planned vs. actual, ERP actuals sync |
| Advanced Account Forecasting | DPE templates, forecast periods, account-level forecasts |
| Account Manager Targets | Set and track targets per account manager |
| Partner Visit Management | Visit scheduling, action plan templates, mobile access |
| Warranty Lifecycle Management | Warranty terms, asset coverage, claims adjudication |
| Asset Service Management | Asset tracking, service cases, product campaigns |
| Inventory Management | Product inventory at field locations |
| User Management | Permission sets, profiles, role hierarchy, Experience Cloud |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          claude-for-mfg (Plugin)                         │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  8 Skills (auto-invoked)   │  21 Commands (/mfg:*)      │ │
│  │  • mfg-implementation     │  • /mfg:setup-plugin       │ │
│  │  • mfg-sales-agreements   │  • /mfg:soql-query         │ │
│  │  • mfg-warranty           │  • /mfg:health-check       │ │
│  │  • mfg-forecasting        │  • /mfg:configure-*        │ │
│  │  • mfg-partner-visits     │                             │ │
│  │  • mfg-user-management    │  MCP Server (60+ Tools)    │ │
│  │  • mfg-data-model         │  • Knowledge + citations   │ │
│  │  • salesforce-query       │  • SOQL / CRUD / Apex      │ │
│  │                            │  • SA / Warranty / AAF     │ │
│  │  3 Agents (Subagents)      │  • Config check tools      │ │
│  │  • mfg-consultant         │  • User management         │ │
│  │  • mfg-admin              │  • Org diff + export       │ │
│  │  • mfg-developer          │                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│                    Salesforce CLI (sf)                       │
│                           │                                  │
│                           ▼                                  │
│              Your Manufacturing Cloud Org                    │
└─────────────────────────────────────────────────────────────┘
```

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm test             # Run tests
npm run lint         # Lint source
```

## Resources

- [Manufacturing Cloud Documentation](https://help.salesforce.com/s/articleView?id=ind.mfg_manufacturing_cloud.htm)
- [Manufacturing Cloud Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.mfg_dev_guide.meta/mfg_dev_guide/)
- [MuleSoft Accelerator for Manufacturing](https://www.mulesoft.com/exchange/#!/accelerators-catalog-manufacturing)
- [Claude Code Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [MCP Specification](https://modelcontextprotocol.io/)

## License

MIT
