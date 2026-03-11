---
description: Interactive onboarding — check setup, discover capabilities, and get your first task done
---

# Getting Started with Claude for Manufacturing Cloud

Walk a new user through setup, introduce the plugin's capabilities, and help them take their first action.

$ARGUMENTS

## Steps

1. **Check setup** — use `check_mfg_setup` to verify Salesforce CLI and org connectivity.
   - If CLI is missing or no orgs are authenticated, walk through the setup steps (same as `/mfg:setup-plugin`).
   - Once an org is connected, confirm it and move on.

2. **Show a quick org snapshot** — use `get_org_status` to display:
   - Org name, type (production/sandbox), and instance
   - Installed packages and versions
   - Active user count

3. **Ask the user their role** — present these options:
   - **Consultant** — implementing Manufacturing Cloud for a customer
   - **Administrator** — managing an existing Manufacturing Cloud org day-to-day
   - **Developer** — building custom functionality or integrations

4. **Recommend next steps based on role:**

   **Consultant:**
   - Run `/mfg:health-check` to assess the org
   - Use the `mfg-implementation` skill by asking about a specific module (e.g., "Help me configure Sales Agreements")
   - Browse documentation with `/mfg:docs`
   - Invoke the `mfg-consultant` agent for complex implementation planning

   **Administrator:**
   - Run `/mfg:status` for an org dashboard
   - Run `/mfg:health-check` to find configuration issues
   - Use `/mfg:configure-*` commands for guided module setup (e.g., `/mfg:configure-sales-agreements`)
   - Use the `mfg-admin` agent for operational tasks

   **Developer:**
   - Use `/mfg:describe <object>` to explore the data model
   - Use `/mfg:soql-query` to query org data
   - Browse the developer guide with `/mfg:help developer guide`
   - Use the `mfg-developer` agent for OmniStudio and custom development guidance

5. **Offer a quick win** — based on the user's role, suggest one concrete action they can take right now:
   - Consultant: "Want me to run a health check on your org?"
   - Administrator: "Want me to show your current org configuration status?"
   - Developer: "Want me to describe a Manufacturing Cloud object for you?"

Present everything in a welcoming, concise format. Use headers and short bullet lists — avoid walls of text.
