# claude-for-manufacturing

A Claude Code plugin for **Salesforce Manufacturing Cloud** — knowledge, skills, slash commands, agents, and Salesforce org tools for Manufacturing Cloud implementations.



## Quick start

```bash
npm install
npm run build
claude --plugin-dir /path/to/ManuAssist
```

Then in Claude Code:

```
/mfg:getting-started
```

## What's inside

- **Skills** — Auto-invoked guidance for each Manufacturing Cloud module (Sales Agreements, Warranty, Forecasting, Partner Visits, Inventory Allocation, Rebates, etc.)
- **Commands** — `/mfg:configure-*`, `/mfg:audit`, `/mfg:health-check`, `/mfg:diff-orgs`, `/mfg:export-config`, and more
- **Agents** — `mfg-sdet`, `mfg-consultant`, `mfg-admin`, `mfg-developer`
- **MCP server** — Salesforce CLI wrappers, SOQL/Tooling API helpers, audit framework

## Reference

- `AGENTFORCE_FOR_MANUFACTURING.md` — Agentforce integration guide for Manufacturing Cloud
- `MFG_ORG_COMPARISON_SKILL.md` — Org comparison skill documentation
- `CLAUDE.md` — repo-level coding instructions for AI agents
- `docs/` — additional documentation and guides

## Status

`v0.1.0` — scaffold complete with skills + commands + agents authored. MCP server contains full tool implementations for Manufacturing Cloud.

## Open Source Governance

- License: Apache 2.0 (`LICENSE.txt`)
- Contribution guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
