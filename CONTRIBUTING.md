# Contributing to Manufacturing Cloud MCP Server

This guide covers setup, development workflow, and how to add new tools, skills, and commands.

## Setup

```bash
git clone <this-repo>
cd claudeForManufacturing
npm install
npm run build
```

## Development Workflow

```bash
npm run dev      # Watch mode — rebuilds on change
npm run build    # Full TypeScript build
npm test         # Run all tests (vitest)
npm run lint     # Lint with ESLint
npm run format   # Format with Prettier
```

### Running the MCP Server Locally

Start the server and point your MCP client at it via `.mcp.json`:

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

## Project Structure

```
src/
├── index.ts                   # Server entry point — registers all tools
├── knowledge-loader.ts        # Loads and searches knowledge/
├── citation-map.ts            # Source citation metadata
├── cache.ts                   # Response caching
├── salesforce/
│   ├── cli.ts                 # Salesforce CLI wrapper
│   └── auth.ts                # Org authentication helpers
├── tools/
│   ├── knowledge.ts           # Knowledge/doc tools
│   ├── salesforce-org.ts      # Org tools (SOQL, CRUD, describe)
│   ├── sales-agreements.ts    # Sales Agreement tools
│   ├── partner-visits.ts      # Partner Visit tools
│   ├── warranty.ts            # Warranty tools
│   ├── forecasting.ts         # AAF + Account Manager Targets
│   ├── config-checks.ts       # check_*_config tools
│   ├── user-management.ts     # User/permission set tools
│   ├── health-check.ts        # Health check + org status
│   ├── config-export.ts       # Export/import config as JSON
│   ├── diff.ts                # Org diff tool
│   ├── release-notes.ts       # Release notes tool
│   ├── apex.ts                # Anonymous Apex execution
│   ├── bulk-operations.ts     # Bulk create/update
│   ├── metadata.ts            # Deploy/retrieve metadata
│   └── resources.ts           # MCP resources and prompts
└── validation/
    ├── rules-loader.ts        # YAML validation rule loader
    └── rules-executor.ts      # Rule execution engine

knowledge/
├── modules/                   # Module documentation (auto-loaded)
│   ├── sales-agreements/
│   ├── advanced-account-forecasting/
│   ├── partner-visit-management/
│   ├── warranty-management/
│   ├── rebate-management/
│   ├── inventory-allocation/
│   └── manufacturing-programs/
├── help/                      # Official help documents
├── guides/                    # Implementation guides
├── exercises/                 # Hands-on exercises
├── troubleshooting/           # Troubleshooting docs
└── release-notes/             # Salesforce release notes

skills/                        # Auto-invoked skill files (one per domain)
commands/                      # Slash command definitions (/mfg:*)
agents/                        # Specialized subagent prompts
test/                          # Unit and integration tests
```

## Adding a New Tool

1. Create a new file in `src/tools/` (or add to an existing module)
2. Export a `register(server: McpServer)` function
3. Import and call it in `src/index.ts`
4. Document the tool in `CLAUDE.md` under the appropriate tool table
5. Run `npm run build` and `npm test` — tests auto-detect new tools

Example:

```typescript
// src/tools/my-tool.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "my_tool",
    "Description of what the tool does",
    { param: z.string().describe("Parameter description") },
    async ({ param }) => {
      return { content: [{ type: "text", text: `Result: ${param}` }] };
    }
  );
}
```

## Adding a New Skill

1. Create `skills/<skill-name>/SKILL.md`
2. Include frontmatter with `name` and `description` fields for auto-invocation
3. Include: activation triggers, guidance, key objects, SOQL examples
4. Add a reference to `get_mfg_module_docs` or `search_mfg_knowledge` (required by tests)
5. Document in `CLAUDE.md` under the Skills table
6. Run `npm test` to verify

## Adding a New Command

1. Create `commands/<command-name>.md`
2. Include frontmatter with `description` field
3. Include steps for Claude to follow when the command is invoked
4. Document in `CLAUDE.md` under the Commands table
5. Run `npm test` to verify

## Adding Knowledge Content

1. Add markdown files to `knowledge/modules/<module-name>/`
2. Content is automatically loaded by `knowledge-loader.ts` — no index file needed
3. Use `overview.md` and `configuration.md` as the standard file naming pattern

## Testing

Tests are in `test/` and use vitest. Key test suites:

- **tool-schemas.test.ts** — Snapshot of all tool names and parameter shapes
- **tool-registration.test.ts** — Verifies all tools register without errors
- **claude-md-consistency.test.ts** — CLAUDE.md matches code and file structure
- **knowledge-integrity.test.ts** — Knowledge files exist and are properly linked
- **skill-citations.test.ts** — Skills reference knowledge tools or embed citations

Run specific tests:

```bash
npx vitest run test/unit/tools/tool-schemas.test.ts
npx vitest run test/integration/claude-md-consistency.test.ts
```

Update snapshots after adding/removing tools:

```bash
npx vitest run --update
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier for formatting
- Prefer `const` over `let`
- Use `type` imports for type-only references
- No `console.log` in tool code (use `console.error` for debugging)
