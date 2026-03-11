# Contributing to Claude for Manufacturing Cloud

Thank you for your interest in contributing! This guide covers setup, development workflow, and how to add new tools, skills, and commands.

## Setup

```bash
# git clone https://github.com/joe-ferraro/claude-for-mfg.git
cd claude-for-mfg
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

### Running the Plugin Locally

```bash
claude --plugin-dir /path/to/claude-for-mfg
```

## Project Structure

```
src/
├── index.ts                  # Server setup + module registration (~80 lines)
├── tools/                    # Tool modules (one per domain)
│   ├── knowledge.ts          # Knowledge/doc tools
│   ├── salesforce-org.ts     # Org tools (SOQL, CRUD, etc.)
│   ├── admin-console.ts      # Admin Console + trigger handlers
│   ├── actions.ts            # Quick/Custom Actions
│   ├── db-schema.ts          # DB Schema tools
│   ├── config-checks.ts      # check_*_config tools
│   ├── user-management.ts    # User/permission set tools
│   ├── presentations.ts      # Presentation upload/distribute
│   ├── navigation.ts         # Navigation tab tools
│   ├── validation.ts         # Audit/validation tools
│   ├── visits.ts             # Visit sidebar tool
│   ├── diff.ts               # Org diff tool
│   ├── health-check.ts       # Health check + status tools
│   ├── config-export.ts      # Config export/import tools
│   ├── release-notes.ts      # Release notes tool
│   ├── apex.ts               # Anonymous Apex execution
│   ├── bulk-operations.ts    # Bulk create/update
│   ├── metadata.ts           # Deploy/retrieve metadata
│   └── helpers.ts            # Shared helper functions
├── knowledge-loader.ts       # Knowledge base search
├── salesforce/               # SF CLI wrapper
└── validation/               # Rule engine
```

## Adding a New Tool

1. Create a new file in `src/tools/` (or add to an existing module)
2. Export a `register(server: McpServer)` function
3. Import and call the register function in `src/index.ts`
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
2. Include: activation triggers, step-by-step guidance, key objects, common issues
3. Document in `CLAUDE.md` under the Skills table
4. Run `npm test` to verify

## Adding a New Command

1. Create `commands/<command-name>.md`
2. Include frontmatter with `description` field
3. Include steps for Claude to follow when the command is invoked
4. Document in `CLAUDE.md` under the Commands table
5. Run `npm test` to verify

## Adding Knowledge Content

1. Add markdown files to `knowledge/modules/<module-name>/`
2. Update the `_index.md` file to reference the new content
3. Content is automatically loaded by `knowledge-loader.ts`

## Testing

Tests are in `test/` and use vitest. Key test suites:

- **tool-schemas.test.ts** — Snapshot of all tool names and parameter shapes
- **tool-registration.test.ts** — Verifies all tools register without errors
- **claude-md-consistency.test.ts** — CLAUDE.md matches code and file structure
- **knowledge-integrity.test.ts** — Knowledge files exist and are properly linked

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
- No console.log in tool code (use `console.error` for debugging)
