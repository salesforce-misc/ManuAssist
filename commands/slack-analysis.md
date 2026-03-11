---
description: Analyze a Slack channel for question patterns, module trends, and resolution insights
arguments: "<channel> [period] [module]"
---

# Slack Channel Analysis

Analyze a Slack channel for support question patterns and resolution insights.

## Arguments

- **channel** (required): The Slack channel to analyze. Accepts:
  - A Slack URL: `https://salesforce-internal.slack.com/archives/C028WU2N2UQ`
  - A channel ID: `C028WU2N2UQ`
  - A channel name: `#tmp-help-manufacturing-automotive`
- **period** (optional): Time range to analyze. Examples: `today`, `this week`, `last 7 days`, `last 30 days`, `2026-03-01 to 2026-03-10`. Default: last 20 messages.
- **module** (optional): Filter by MFG module. Examples: `sales-agreements`, `warranty`, `inventory`, `forecasting`, `visits`, `all`. Default: all modules.

## Steps

1. Resolve the channel input to a channel ID:
   - If a Slack URL, extract the channel ID from `/archives/<CHANNEL_ID>`
   - If a channel name, resolve via `slack_search_channels(query="channel-name")`
   - If already an ID (starts with `C`), use directly

2. Read the channel using Slack MCP tools, applying any date/module filters:
   - Default: `slack_read_channel(channel_id="CHANNEL_ID", limit=20)`
   - With date filter: `slack_search_public(query="in:<#CHANNEL_ID> *Question Form* after:YYYY-MM-DD")`

3. Identify question form submissions (parent messages from a Question Form bot containing `*Question Form* submission from`).

4. For each question, read the full thread with `slack_read_thread` and extract:
   - The parsed question fields (Question, Category, Customer, Case Number)
   - The resolution (from Channel Expert summary, or synthesized from the thread)

5. Categorize each question by MFG module and resolution type, following the mapping and classification in the `mfg-slack-analysis` skill.

6. Generate the structured report with:
   - **Module Distribution** table (count, %, top issue per module)
   - **Resolution Types** table (configuration guidance, known bug, escalation, etc.)
   - **Key Findings** (top 3 insights)
   - **Detailed Question Log** (date, question, module, customer, case #, resolution summary)
   - **Recommendations** (actionable next steps based on patterns)

7. If a module filter was specified, only include questions matching that module and highlight module-specific trends.

## Examples

```
/mfg:slack-analysis https://salesforce-internal.slack.com/archives/C028WU2N2UQ
/mfg:slack-analysis C028WU2N2UQ this week
/mfg:slack-analysis #tmp-help-manufacturing-automotive last 30 days
/mfg:slack-analysis C028WU2N2UQ last 7 days inventory
/mfg:slack-analysis https://salesforce.enterprise.slack.com/archives/C028WU2N2UQ 2026-03-01 to 2026-03-10 warranty
```
