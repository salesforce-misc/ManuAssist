# Slack Integration Skill

## Purpose

> **Category: Platform Skill** — applies org-wide across all Salesforce clouds; not specific to Manufacturing Cloud, but relevant for deal-room collaboration, pipeline updates, and approval notifications in Manufacturing Cloud workflows.

Answer questions about Salesforce + Slack integrations. Covers the full spectrum: connecting
Salesforce to Slack, Salesforce Channels (embedded Slack on record pages), and the suite of
Salesforce for Slack apps — Sales Cloud for Slack, PRM for Slack, Service Cloud for Slack,
CRM Analytics for Slack, and more. Includes admin setup, user workflows, Flow automation,
permissions, limitations, and the right-app-for-the-job decision guide.

---

## When to Invoke This Skill

Invoke `/revenue-cloud-q3:slack-integration` when the user asks about any of the following:

- Connecting Salesforce and Slack (initial connection, workspace setup, user mapping)
- Slack Guided Setup in Salesforce
- Salesforce Channels — Slack component on record pages, record-linked Slack channels
- Set Up Salesforce Channels in Your Org — objects, components, Lightning App Builder
- Salesforce for Slack Integrations — enabling, permissions, installing apps from Slack App Directory
- Which Salesforce Slack app is right for a use case (app selection guide)
- Sales Cloud for Slack — pipeline view, sales channels, feed channels, reminders, slash commands
- PRM for Slack — partner co-selling, partner channels, Slack Connect, PAM + partner setup
- Service Cloud for Slack — swarming, case management
- CRM Analytics for Slack — Analytics dashboards and reports in Slack, subscriptions
- Financial Services Cloud for Slack, Account Engagement for Slack, Trailhead for Slack
- Automating Slack actions from Flow Builder (Create Slack Channel, Send Slack Message, etc.)
- Slack flow core actions — Archive Slack Channel, Create Slack Channel, Send Slack Message,
  Invite Users to Slack Channel, Edit Slack Message, Get Information about Slack Conversation,
  Pin or Unpin Slack Message
- Sales Cloud for Slack notifications — notification flows, deals won, deals to watch, reminders
- Feed channels — Deals Won, Deals to Watch, custom broadcast topics, activating feed channels
- Customizing Sales Cloud for Slack notification flows in Flow Builder
- Sales channel naming conventions, channel strategy, creating sales channels from Slack or Salesforce
- Sales Cloud for Slack permissions — Connect Salesforce with Slack, Slack Sales User
- PRM for Slack permissions — PAM permissions, partner permissions, Slack Connect setup
- Record Detail Security (Show Object Type Only vs Show Record Name and Object Type)
- Slack App limitations — compact layout block limit, label localization, FedRAMP/HIPAA unsupported
- Disconnect Slack from Salesforce; remove a Slack app from a workspace
- Link unfurling in Slack for Salesforce records
- Salesforce for Slack in Manufacturing Cloud 

---

## Skill Protocol

### Phase 1 — Identify the Scenario

Determine whether the question is about:
- **Admin setup** — connecting orgs, enabling apps, permissions, component placement
- **End-user workflow** — using Salesforce channels, pipeline view, creating sales channels
- **App selection** — which Salesforce Slack app fits the use case
- **Automation** — Flow actions for Slack, notification flows, feed channels
- **PRM** — partner co-selling, Slack Connect, PAM + partner workflows
- **Limitations** — block limits, unsupported features, FedRAMP/HIPAA restrictions

### Phase 2 — Apply Domain Knowledge

Reference the documents in `references/`:
- `concepts-and-architecture.md` — connection model, Salesforce Channels architecture,
  Salesforce for Slack app ecosystem, which app does what
- `setup-and-configure.md` — step-by-step admin setup: connect Salesforce + Slack, enable
  Salesforce Channels (objects + page component), enable Salesforce for Slack, permissions,
  record detail security, install apps from App Directory
- `sales-cloud-for-slack.md` — Sales Cloud for Slack features, sales channels, feed channels,
  notifications/reminders, notification flows, pipeline view, slash commands, admin setup steps
- `prm-for-slack.md` — PRM for Slack setup (Salesforce + Slack side), PAM permissions, partner
  permissions, Slack Connect setup, partner channel workflows, automating business processes
- `flow-automation.md` — Flow core actions for Slack, automating channel creation/messages/invites,
  Sales Cloud for Slack App ID, notification flow customization
- `limits-and-gotchas.md` — compact layout block limit (100), label localization, unsupported
  features (FedRAMP/HIPAA, Slack Connect in Sales Cloud for Slack, Notes/Tasks in record layouts),
  known gotchas

### Phase 3 — Cross-Reference Related Skills

When the answer involves these areas, cross-reference the related skill:
- **Flow Builder automation** (used heavily for Slack notifications and channel automation) —
  note that Salesforce Flow is also used by Batch Management and DPE; Slack actions are in the
  `Slack` category in Flow Builder
- **CRM Analytics for Slack** — overlaps with the `data-processing-engine` skill for CRMA concepts

### Phase 4 — Provide the Answer

Structure the response to directly answer the question:
1. Architecture / concept explanation (what and why)
2. Step-by-step setup or user workflow (if relevant)
3. Required permissions (always specify — they differ between apps)
4. Limitations and gotchas (always flag the most relevant ones)

---

## Quality Standards

- Always specify **which Salesforce Slack app** the user needs — the apps are separate products
  with separate permissions, installation steps, and capabilities.
- For **Sales Cloud for Slack**, clarify whether the question is from an admin (setup) or
  end-user (pipeline, sales channels, notifications) perspective.
- For **PRM for Slack**, always note it requires **Slack Enterprise Grid** — it does not work
  with standard Slack workspaces.
- For **Salesforce Channels**, clarify that access in Salesforce is controlled by record access,
  while access in Slack is separate and broader — this is a security consideration.
- For **notification flows**, always warn: do NOT edit the template flows; save a copy first
  (except Deals to Watch, which is customizable).
- Always remind users that **Salesforce for Slack is not certified with FedRAMP or HIPAA**
  — it cannot be used in Government Cloud.
