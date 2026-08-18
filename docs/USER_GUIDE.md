# ManuAssist — User Guide

## What Is ManuAssist?

ManuAssist is an AI-powered assistant for **Salesforce Manufacturing Cloud**. It connects to your Salesforce org and gives you an expert consultant, administrator, and developer — all in one tool — that understands Manufacturing Cloud deeply.

Think of it as having a Manufacturing Cloud specialist available 24/7 inside your code editor. You can ask it questions in plain English, run configuration wizards, audit your setup, query data, and get step-by-step implementation guidance — all without leaving your terminal.

## Who Is This For?

- **Salesforce Admins** setting up or maintaining Manufacturing Cloud
- **Consultants** implementing Manufacturing Cloud for clients
- **Developers** building integrations, customizations, or OmniStudio flows
- **Business Analysts** exploring data and running reports on Sales Agreements, Forecasts, etc.

## What Can It Do?

### Ask Questions in Plain English

Just ask about Manufacturing Cloud and get expert answers backed by official documentation:

```
"How do I set up Sales Agreements?"
"What permission sets do I need for Warranty Management?"
"Explain the difference between AccountForecast and AcctMgrTarget"
```

### Configuration Wizards

Interactive step-by-step guides that check your org and walk you through setup:

| Command | What It Configures |
|---------|--------------------|
| `/mfg:configure-sales-agreements` | Sales Agreements — record types, price books, activation |
| `/mfg:configure-forecasting` | Advanced Account Forecasting and DPE templates |
| `/mfg:configure-warranty` | Warranty Terms, coverage, and claims |
| `/mfg:configure-visits` | Partner Visit Management and action plans |
| `/mfg:configure-users` | Users, permission sets, and role hierarchy |
| `/mfg:configure-inventory` | Inventory allocation and reservations |
| `/mfg:configure-agentforce` | Agentforce AI agents for Manufacturing |
| `/mfg:configure-analytics` | Manufacturing Cloud analytics and dashboards |
| `/mfg:configure-asset-service` | Asset Service Lifecycle Management |

### Org Health & Auditing

| Command | What It Does |
|---------|--------------|
| `/mfg:health-check` | Comprehensive check of your Manufacturing Cloud setup |
| `/mfg:audit` | Finds misconfigurations before they cause issues |
| `/mfg:status` | Quick dashboard — record counts, license usage, key metrics |
| `/mfg:diff-orgs` | Compare two orgs side-by-side (e.g., sandbox vs production) |

### Data & Querying

| Command | What It Does |
|---------|--------------|
| `/mfg:soql-query` | Run SOQL queries against your org |
| `/mfg:describe` | View all fields on any Salesforce object |
| `/mfg:export-config` | Export your org's configuration as a JSON file |
| `/mfg:import-config` | Import a configuration from a previous export |

### Documentation & Learning

| Command | What It Does |
|---------|--------------|
| `/mfg:help` | Search the built-in Manufacturing Cloud knowledge base |
| `/mfg:docs` | Browse documentation by category |
| `/mfg:release-notes` | View Manufacturing Cloud release notes by Salesforce release |
| `/mfg:getting-started` | Interactive onboarding — discover what's available |

### Specialized Agents

For complex tasks, ManuAssist includes specialized AI personas:

| Agent | Best For |
|-------|----------|
| **mfg-consultant** | Multi-module implementation planning, sequencing, trade-offs |
| **mfg-admin** | Day-to-day operations, troubleshooting, user management |
| **mfg-developer** | OmniStudio flows, DPE templates, BRE rules, ERP integrations |

### Modules Covered

ManuAssist has deep knowledge of every Manufacturing Cloud module:

- Sales Agreements
- Advanced Account Forecasting
- Account Manager Targets
- Partner Visit Management
- Warranty Lifecycle Management
- Rebate Management
- Inventory Allocation & Reservations
- Manufacturing Programs
- Asset Service Management
- Agentforce for Manufacturing
- Product Portfolio & Catalog
- Service Console for Manufacturing

---

## Installation

### Prerequisites

1. **Node.js 18 or later** — [Download here](https://nodejs.org/)
2. **An MCP-capable client** — one of:
   - [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (terminal)
   - [Cursor](https://cursor.sh/) (IDE)
   - Claude Desktop
3. **Salesforce CLI (`sf`)** — required only if you want to connect to a live org
   - [Install instructions](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/)

### Step 1: Clone and Build

```bash
git clone https://github.com/salesforce-misc/ManuAssist.git
cd ManuAssist
npm install
npm run build
```

### Step 2: Connect to Your MCP Client

#### Option A: Claude Code (recommended)

Run Claude Code with the plugin directory:

```bash
claude --plugin-dir /path/to/ManuAssist
```

#### Option B: Cursor / Claude Desktop

Add this to your `.mcp.json` (in your project root or global config):

```json
{
  "mcpServers": {
    "mfg": {
      "command": "node",
      "args": ["/path/to/ManuAssist/build/index.js"],
      "cwd": "/path/to/ManuAssist"
    }
  }
}
```

Replace `/path/to/ManuAssist` with the actual path where you cloned the repo.

### Step 3: Connect to Your Salesforce Org (Optional)

If you want to query data or run configuration checks against a live org:

```bash
# Production or Developer Edition
sf org login web --alias my-mfg-org

# Sandbox
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com
```

Once authenticated, ManuAssist auto-detects your org. If you have multiple orgs, it will ask which one to use.

### Step 4: Verify

In your MCP client, run:

```
/mfg:getting-started
```

You should see a welcome message with a capability overview and setup verification.

---

## Quick Examples

**Check if your org is healthy:**
```
/mfg:health-check
```

**Find all active Sales Agreements:**
```
/mfg:soql-query SELECT Id, Name, Status FROM SalesAgreement WHERE Status = 'Active' LIMIT 10
```

**Get help on a topic:**
```
/mfg:help warranty claims adjudication
```

**Compare sandbox to production:**
```
/mfg:diff-orgs
```

**Ask a free-form question:**
```
What are the required permission sets for a user who needs to manage inventory allocations?
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No org found" | Run `sf org login web` to authenticate |
| Build fails | Ensure Node.js 18+ is installed (`node --version`) |
| Commands not recognized | Verify the MCP server is configured in `.mcp.json` |
| Permission errors on org queries | Check that your user has the appropriate Manufacturing Cloud permission sets |

---

## Further Reading

- [Manufacturing Cloud Documentation](https://help.salesforce.com/s/articleView?id=ind.mfg_manufacturing_cloud.htm)
- [Manufacturing Cloud Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.mfg_dev_guide.meta/mfg_dev_guide/)
- [Trailhead: Manufacturing Cloud Basics](https://trailhead.salesforce.com/content/learn/modules/manufacturing-cloud-admin-essentials)
- [MCP Specification](https://modelcontextprotocol.io/)
