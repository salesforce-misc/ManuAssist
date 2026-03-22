# Manufacturing Cloud MCP Server

An MCP (Model Context Protocol) server that brings expert Salesforce Manufacturing Cloud knowledge, org tools, and implementation guidance directly into any MCP-capable client (Claude Code, Claude Desktop, Cursor, etc.).

## What It Does

Connects your AI assistant to deep Manufacturing Cloud expertise, enabling it to:

- **Guide implementations** across all Manufacturing Cloud modules with best practices, correct object names, and source citations
- **Run interactive configuration wizards** for Sales Agreements, Warranty Management, Advanced Account Forecasting, Partner Visit Management, and user setup
- **Inspect and manage** your Salesforce org directly — SOQL, CRUD, metadata deploy/retrieve, anonymous Apex
- **Audit configurations** with validation rules to catch misconfigurations before they cause issues
- **Troubleshoot issues** using Manufacturing Cloud-specific knowledge and automated diagnostics
- **Compare orgs** side-by-side to identify configuration drift between environments
- **Export/import configurations** as JSON for org-to-org migration
- **Manage users** — permission sets, profiles, role hierarchy, and license capacity

## Quick Start

### Prerequisites

- Node.js 18+
- An MCP-capable client (Claude Code, Claude Desktop, Cursor, etc.)
- Salesforce CLI (`sf`) — optional, required only for org tools

### Setup

```bash
git clone <this-repo>
cd claudeForManufacturing
npm install
npm run build
```

Then point your MCP client at `dist/index.js`. For Claude Code, add to `.mcp.json`:

```json
{
  "mcpServers": {
    "mfg": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### Connecting to a Salesforce Org

```bash
# Authenticate to your Manufacturing Cloud org
sf org login web --alias my-mfg-org

# For sandbox
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com
```

Once authenticated, the server auto-detects your org. If multiple orgs are authenticated, use `set_target_org` to choose one.

## Commands

| Command | Description |
|---------|-------------|
| `/mfg:soql-query <soql>` | Run a SOQL query against your org |
| `/mfg:describe <object>` | Describe a Salesforce object's fields |
| `/mfg:help <topic>` | Search the Manufacturing Cloud knowledge base |
| `/mfg:docs` | Browse Manufacturing Cloud documentation by category |
| `/mfg:audit [group]` | Audit configuration against validation rules |
| `/mfg:configure-sales-agreements` | Configure and validate Sales Agreements |
| `/mfg:configure-forecasting` | Configure and validate Advanced Account Forecasting |
| `/mfg:configure-visits` | Configure and validate Partner Visit Management |
| `/mfg:configure-warranty` | Configure and validate Warranty Lifecycle Management |
| `/mfg:configure-users` | Configure and validate user management |
| `/mfg:open-org` | Open the Salesforce org in the browser |
| `/mfg:diff-orgs` | Compare configuration between two Salesforce orgs |
| `/mfg:health-check` | Run a comprehensive org health check |
| `/mfg:release-notes` | View Manufacturing Cloud release notes by Salesforce release |
| `/mfg:export-config` | Export org configuration as JSON |
| `/mfg:import-config` | Import configuration from JSON export |
| `/mfg:status` | Dashboard view of the connected org |
| `/mfg:getting-started` | Interactive onboarding and capability discovery |
| `/mfg:slack-analysis` | Analyze Manufacturing Cloud support channel trends |

## Skills (Auto-Invoked)

The server activates the right skill automatically based on context:

| Skill | Triggered By |
|-------|-------------|
| `mfg-implementation` | Implementation or configuration questions |
| `mfg-sales-agreements` | Sales Agreements, run-rate business, planned vs. actual |
| `mfg-warranty` | Warranty terms, asset coverage, adjudication |
| `mfg-forecasting` | Advanced Account Forecasting, DPE, Account Manager Targets |
| `mfg-partner-visits` | Partner/distributor visit management, action plans |
| `mfg-user-management` | User provisioning, permission sets, profiles |
| `mfg-data-model` | Manufacturing Cloud objects, SOQL, data relationships |
| `mfg-inventory-allocation` | Inventory allocation, deallocation, reservation APIs |
| `mfg-slack-analysis` | Support channel trend analysis |
| `salesforce-query` | SOQL query construction and execution |

## Example Usage

### Sales Agreement configuration check

```
/mfg:configure-sales-agreements
```

```
## Sales Agreement Configuration Report

### Record Types
- SalesAgreement record types: 2 (Standard, Volume-based) ✓

### ERP Actuals Sync
- SalesAgreementProductSchedule.ActualQuantity populated: 0 records
- Status: ⚠️ NOT CONFIGURED — ERP sync not yet set up

Recommendations:
1. Set up MuleSoft Accelerator or custom REST API for ERP actuals sync
2. Run /mfg:configure-forecasting to set up Account Manager Targets
```

### SOQL query

```
/mfg:soql-query SELECT Id, Name, Status FROM SalesAgreement WHERE Status = 'Active' LIMIT 10
```

### Org health check

```
/mfg:health-check
```

```
## Manufacturing Cloud Health Check

✓  ManufacturingSalesUser — 12 users assigned
✓  WarrantyTerm records — 2,792 active
✓  RebateProgram records — 1,731 active
⚠️  AccountForecast records — 0 (DPE may not have run yet)
```

## Architecture

```
MCP Client (Claude Code, Claude Desktop, Cursor, etc.)
        │
        ▼
  mfg-cloud-mcp-server — Node MCP server (stdio)
        │
        ├── Knowledge Base (knowledge/modules/)
        ├── Skills (skills/mfg-*/SKILL.md)
        ├── Tools (src/tools/*.ts)
        │
        ▼
  Salesforce CLI (sf)
        │
        ▼
  Your Manufacturing Cloud Org
```

## Covered Modules

| Module | Key Capabilities |
|--------|----------------|
| Sales Agreements | Run-rate business, planned vs. actual, ERP actuals sync |
| Advanced Account Forecasting | DPE templates, forecast periods, account-level forecasts |
| Account Manager Targets | Set and track targets per account manager |
| Partner Visit Management | Visit scheduling, action plan templates |
| Warranty Lifecycle Management | Warranty terms, asset coverage |
| Rebate Management | Rebate programs, member payouts, claims |
| Inventory Allocation | Allocation APIs, batch/serialized products |
| Manufacturing Programs | Program-based business, component forecasting |
| User Management | Permission sets, profiles, role hierarchy |

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm run dev          # Watch mode
npm test             # Run tests
npm run lint         # Lint source
```

## Resources

- [Manufacturing Cloud Documentation](https://help.salesforce.com/s/articleView?id=ind.mfg_manufacturing_cloud.htm)
- [Manufacturing Cloud Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.mfg_dev_guide.meta/mfg_dev_guide/)
- [MuleSoft Accelerator for Manufacturing](https://www.mulesoft.com/exchange/#!/accelerators-catalog-manufacturing)
- [MCP Specification](https://modelcontextprotocol.io/)

## License

MIT
