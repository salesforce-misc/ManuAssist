---
name: mfg-slack-analysis
description: Analyzes a Slack channel to identify patterns, categorize issues by MFG module, summarize resolutions, and generate insights reports. Use when user asks about support trends, common issues, Slack channel analysis, question patterns, recurring problems, or support metrics for Manufacturing Cloud.
---

# Manufacturing Cloud Slack Channel Analysis

Analyze a Slack channel to surface question patterns, categorize issues by Manufacturing Cloud module, track resolution types, and generate actionable insights.

## Channel Input

The user provides a channel as one of:
- **Slack URL**: `https://salesforce-internal.slack.com/archives/C028WU2N2UQ` or `https://salesforce.enterprise.slack.com/archives/C028WU2N2UQ` — extract the channel ID from the URL path (`/archives/<CHANNEL_ID>`)
- **Channel ID**: `C028WU2N2UQ` — use directly
- **Channel name**: `#tmp-help-manufacturing-automotive` — resolve to ID using `slack_search_channels(query="tmp-help-manufacturing-automotive")`

If no channel is provided, ask the user which channel to analyze. **Do not assume a default channel.**

Once the channel ID is resolved, use it as `CHANNEL_ID` in all tool calls below.

## Channel Structure

### Question Form Bot Messages

Parent messages are posted by the **Question Form Manager** bot (`B06S2GLGRQ8`). Each submission follows this structure:

```
*Question Form* submission from <@USER_ID|Name>

*Question*
[Short title of the issue]

*Additional Details*
[Detailed description of the problem]

*Category*
[Category:subcategory:]

*Customer Name*
[Customer org name]

*Global Case Number*
[Case number]

*Partner Name*
[Partner name or empty]

*Select the group that best represents you*
[Support / Engineering / Product / etc.]
```

**Parsing**: Extract fields by splitting on bold markers (`*Question*`, `*Additional Details*`, `*Category*`, `*Customer Name*`, `*Global Case Number*`, `*Partner Name*`, `*Select the group*`).

### Thread Resolution Structure

Each question thread typically contains:

1. **Auto-reply** from the bot tagging a triage subteam and linking the Channel Overview canvas
2. **Investigation** — back-and-forth between the submitter and channel experts (screenshots, logs, Splunk links, code references)
3. **Closing Summary bot** (`B09F4FHKTSS`) posts: `_We are closing the thread. Thank you!_` and tags Channel Expert
4. **Channel Expert** (`U08UL6ZCFEV`) posts a structured summary with **Query** and **Resolution** sections

**Resolution extraction priority**:
1. Look for Channel Expert (`U08UL6ZCFEV`) message — this is the authoritative summary
2. Fall back to reading the full thread and synthesizing the resolution
3. If no closing bot message exists, the thread is **unresolved/open**

Check for the `resolved` reaction on the parent message as an additional signal.

## Analysis Procedure

### Step 1: Read Recent Messages

```
slack_read_channel(channel_id="CHANNEL_ID", limit=20)
```

For larger windows, paginate using the returned `cursor`. For date-filtered queries, use:

```
slack_search_public(query="in:<#CHANNEL_ID> *Question Form* after:YYYY-MM-DD")
```

### Step 2: Filter Question Submissions

From the channel messages, identify parent messages where:
- Author is `B06S2GLGRQ8` (Question Form Manager bot)
- Text contains `*Question Form* submission from`

Skip bot auto-replies, closing summaries, and non-question messages.

### Step 3: Parse Each Question

Extract these fields from each question submission:

| Field | Marker | Example |
|-------|--------|---------|
| Submitter | `submission from <@ID\|Name>` | Sravani Gajula |
| Question | `*Question*` | Unable to edit OrderItem layout |
| Details | `*Additional Details*` | Full problem description |
| Category | `*Category*` | Manufacturing (Others):manufacturing: |
| Customer | `*Customer Name*` | W. L. Gore & Associates |
| Case Number | `*Global Case Number*` | 472796265 |
| Partner | `*Partner Name*` | May be empty |
| Group | `*Select the group*` | Support |

### Step 4: Read Each Thread

For each question, read the full thread:

```
slack_read_thread(channel_id="CHANNEL_ID", message_ts="<parent_message_ts>")
```

### Step 5: Extract Resolution

From the thread, find the resolution:

1. **Channel Expert summary** — Look for message from `U08UL6ZCFEV` containing "Query:" and "Resolution:"
2. **Workaround or fix** — Look for messages mentioning "workaround", "fix", "resolved", GUS work item links, or known issue links
3. **Escalation** — Look for messages redirecting to another team or channel
4. **Unresolved** — No closing bot message and no resolution found

### Step 6: Categorize by MFG Module

Map each question to a Manufacturing Cloud module using the Category field and question content:

| Category Pattern | MFG Module |
|-----------------|------------|
| `Sales Agreements`, `SalesAgreement` | Sales Agreements |
| `Forecasting`, `AAF`, `DPE`, `AccountForecast` | Advanced Account Forecasting |
| `Warranty`, `Claims`, `WarrantyTerm` | Warranty Lifecycle Management |
| `Inventory`, `Product Item`, `ProductBatchItem`, `Inventory Search` | Inventory Management |
| `Partner Visit`, `Visit`, `ActionPlan` | Partner Visit Management |
| `Asset`, `Service` | Asset Service Management |
| `Rebate`, `RebateProgram` | Rebate Management |
| `Program`, `ManufacturingProgram` | Program-Based Business |
| `Automotive` | Automotive Cloud |
| `Order`, `OrderItem`, `OrderProduct` | Order Management |
| `Manufacturing (Others)` or unclear | General / Cross-Module |

When the Category field is vague (e.g., "Manufacturing (Others)"), use keyword analysis on the Question and Additional Details text to determine the module.

### Step 7: Classify Resolution Type

Assign each question one of these resolution types:

| Type | Indicators |
|------|-----------|
| **Configuration guidance** | Answer was a setup/config instruction, Setup UI path provided |
| **Known issue / bug** | Links to known issues (`help.salesforce.com/s/issue`), GUS work items, "will be fixed in [release]" |
| **Code/Entity investigation** | Required codesearch, entity XML review, or R&D analysis |
| **Documentation pointer** | Directed to existing help articles or Trailhead |
| **Escalation** | Redirected to another team (Rev-Orders, CBSF, etc.) |
| **Enhancement request** | Feature doesn't exist, customer should file VOC |
| **Unresolved** | Thread still open, no resolution posted |

### Step 8: Compute Metrics

Calculate and present:
- Total questions in the analyzed period
- Breakdown by MFG module (count and percentage)
- Breakdown by resolution type (count and percentage)
- Average thread reply count
- Resolution rate (resolved vs. unresolved)
- Top submitters (support reps posting most questions)
- Top customers appearing in questions
- Cross-team escalation frequency

## Report Output Format

Generate the report in this structure:

```markdown
# Manufacturing Cloud Support Channel Analysis

**Period**: [start date] to [end date]
**Channel**: [resolved channel name] (CHANNEL_ID)
**Total Questions Analyzed**: N

## Module Distribution

| Module | Count | % | Top Issue |
|--------|-------|---|-----------|
| Inventory Management | X | Y% | [most common theme] |
| Sales Agreements | X | Y% | [most common theme] |
| ... | ... | ... | ... |

## Resolution Types

| Type | Count | % |
|------|-------|---|
| Configuration guidance | X | Y% |
| Known issue / bug | X | Y% |
| Code/Entity investigation | X | Y% |
| Escalation | X | Y% |
| Unresolved | X | Y% |

## Key Findings

1. [Insight about most common module or recurring issue]
2. [Insight about resolution patterns or escalation trends]
3. [Insight about unresolved items or knowledge gaps]

## Detailed Question Log

| # | Date | Question | Module | Customer | Case # | Resolution | Summary |
|---|------|----------|--------|----------|--------|------------|---------|
| 1 | YYYY-MM-DD | [title] | [module] | [customer] | [case#] | [type] | [brief summary] |
| ... | ... | ... | ... | ... | ... | ... | ... |

## Recommendations

- [Actionable recommendation based on patterns found]
- [Knowledge gap or documentation improvement needed]
- [Product enhancement themes to consider]
```

## Date Range Handling

| User Request | Approach |
|-------------|----------|
| No date specified | `slack_read_channel(channel_id="CHANNEL_ID", limit=20)` — last 20 messages |
| "Today" | `slack_search_public(query="in:<#CHANNEL_ID> *Question Form* after:YYYY-MM-DD")` with today's date |
| "This week" | Same with Monday's date |
| "Last N days" | Same with calculated date |
| Specific range | Use `oldest` and `latest` Unix timestamps on `slack_read_channel`, or `after:` / `before:` on `slack_search_public` |
| "Last month" | `slack_search_public(query="in:<#CHANNEL_ID> *Question Form* during:month_name")` |

## Single Question Deep Dive

When the user asks about a specific question (by case number, customer name, or topic):

1. Search: `slack_search_public(query="in:<#CHANNEL_ID> [search_term]")`
2. Read the matching thread fully with `slack_read_thread`
3. Provide detailed analysis:
   - Full timeline of the investigation
   - Who was involved and their roles
   - Root cause identified
   - Resolution or workaround provided
   - Related GUS work items or known issues
   - Applicability to other customers (is this a widespread issue?)

## Slack MCP Tool Quick Reference

```
# Read recent channel messages (newest first)
slack_read_channel(channel_id="CHANNEL_ID", limit=20)

# Paginate for older messages
slack_read_channel(channel_id="CHANNEL_ID", limit=20, cursor="<next_cursor>")

# Read a specific question thread
slack_read_thread(channel_id="CHANNEL_ID", message_ts="<parent_ts>")

# Search for questions in a date range
slack_search_public(query="in:<#CHANNEL_ID> *Question Form* after:2026-03-01")

# Search for a specific module's questions
slack_search_public(query="in:<#CHANNEL_ID> Sales Agreements")

# Search by case number
slack_search_public(query="in:<#CHANNEL_ID> 472796265")

# Search by customer name
slack_search_public(query="in:<#CHANNEL_ID> Gore")
```

## Performance Tips

- For large analysis windows (30+ days), read threads only for unresolved or notable questions; rely on Channel Expert summaries for resolved ones
- Use `slack_search_public` with date filters instead of paginating through `slack_read_channel` for targeted analysis
- When analyzing trends over time, batch the analysis by week to keep thread reads manageable
- Use `response_format="concise"` on channel reads when you only need message timestamps for thread reads
