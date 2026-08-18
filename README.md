# ManuAssist

An AI-powered assistant for **Salesforce Manufacturing Cloud** — bringing expert implementation knowledge, org management tools, and interactive configuration wizards directly into your MCP-capable editor (Claude Code, Cursor, Claude Desktop).

Connect to your Manufacturing Cloud org and get instant access to guided setup wizards, health checks, auditing, SOQL queries, and deep knowledge across all modules — Sales Agreements, Forecasting, Warranty, Partner Visits, Inventory, Rebates, and more.

**For full installation instructions, capabilities, and usage examples, see the [User Guide](docs/USER_GUIDE.md).**

## Quick start

```bash
git clone https://github.com/salesforce-misc/ManuAssist.git
cd ManuAssist
npm install
npm run build
claude --plugin-dir /path/to/ManuAssist
```

Then in Claude Code:

```
/mfg:getting-started
```

## What's inside

- **20+ Skills** — Auto-invoked guidance for every Manufacturing Cloud module (Sales Agreements, Warranty, Forecasting, Partner Visits, Inventory Allocation, Rebates, Agentforce, Analytics, and more)
- **30 Commands** — `/mfg:configure-*`, `/mfg:audit`, `/mfg:health-check`, `/mfg:diff-orgs`, `/mfg:export-config`, `/mfg:soql-query`, and more
- **3 Specialized Agents** — `mfg-consultant`, `mfg-admin`, `mfg-developer`
- **MCP server** — Salesforce CLI wrappers, SOQL/CRUD, metadata deploy/retrieve, bulk operations, org comparison

## Reference

- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) — Full user guide: installation, capabilities, and examples
- `AGENTFORCE_FOR_MANUFACTURING.md` — Agentforce integration guide for Manufacturing Cloud
- `MFG_ORG_COMPARISON_SKILL.md` — Org comparison skill documentation
- `CLAUDE.md` — Repo-level coding instructions for AI agents

## Status

`v0.1.0` — Skills, commands, agents, and MCP server fully implemented for Manufacturing Cloud.

## Open Source Governance

- License: Apache 2.0 (`LICENSE.txt`)
- Contribution guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
