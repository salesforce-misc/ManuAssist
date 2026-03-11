---
description: Export Manufacturing Cloud org configuration as JSON
---

# Export Configuration

Export the current org's Manufacturing Cloud configuration as a JSON snapshot.

## Steps

1. Use the `export_config` tool to export configuration.
   - By default, exports all categories: trigger handlers, admin settings, DB Schema, and actions.
   - Optionally specify categories to export a subset.

2. Present the export summary showing what was captured.

3. The JSON output can be:
   - Saved to a file for backup
   - Used with `import_config` to apply to another org
   - Compared manually between orgs (see also `/mfg:diff-orgs`)
