# Slack Integration — Concepts & Architecture

---

## Overview

Salesforce + Slack integration works through two distinct layers:

| Layer | What It Is |
|-------|-----------|
| **Salesforce Channels** | A Slack component embedded directly in Salesforce record pages. Conversations sync bidirectionally between the record page and the corresponding Slack channel. Access is controlled by record-level permissions. |
| **Salesforce for Slack Apps** | A suite of standalone Slack apps (Sales Cloud for Slack, PRM for Slack, Service Cloud for Slack, etc.) installed in a Slack workspace. Each app has its own permissions, setup, and capabilities. |

---

## Connection Model

All Salesforce + Slack features depend on a **connection** between your Salesforce org and your
Slack workspace. This connection is established once and shared across all Salesforce Slack features.

**User mapping** determines which Salesforce user maps to which Slack user:
- **Auto create and connect Slack accounts** — automatic mapping based on email; users receive
  an onboarding email to set up their Slack accounts
- **Use identity management tools** — mapping via an IdP such as Okta or SAML NameID

If automatic mapping fails or is not configured, users manually sign in to Slack when prompted.

---

## Salesforce Channels Architecture

Each **Salesforce Channel** is a 1-to-1 link between a specific Salesforce record and a Slack
channel. The Slack component is placed on the record page in Lightning App Builder.

**Key behaviors:**
- Conversations made in the Salesforce record page **sync instantly** to the corresponding
  Slack channel and vice versa
- Only users with **record-level access in Salesforce** can access the channel via the record page
- In **Slack**, channel members have broader access — members can see the channel even without
  Salesforce record access. This is a security consideration to communicate to admins.
- Only **internal user license types** are supported (see `limits-and-gotchas.md`)
- The Slack component can only be added to **desktop record page configurations**

---

## Salesforce for Slack App Ecosystem

### App Selection Guide

| App | Primary Use Case | Key Features | Editions Required |
|-----|-----------------|--------------|-------------------|
| **Salesforce for Slack** | Core authentication and multi-org management | Identify Slack/Salesforce users, link unfurling, create records | All (with Slack enabled) |
| **Sales Cloud for Slack** | Sales team collaboration and deal management | Pipeline view, sales channels, feed channels, reminders, record CRUD | Enterprise, Performance, Unlimited, Developer |
| **PRM for Slack** | Partner co-selling with external partners | Partner channels (Slack Connect), deal registration, deal approval flows | Enterprise, Unlimited + **Slack Enterprise Grid** |
| **Service Cloud for Slack** | Customer support and case swarming | Swarming channels, case management, Search and Post records | Enterprise, Performance, Unlimited, Developer |
| **CRM Analytics for Slack** | Analytics in Slack | Browse/share/subscribe to dashboards and reports, Einstein Discovery predictions | Enterprise, Performance, Unlimited, Developer |
| **Financial Services Cloud for Slack** | FSC-specific features in Slack | FSC record access, collaboration | FSC license required |
| **Account Engagement for Slack (Pardot)** | Marketing automation notifications | Automate marketing tasks via connector | Account Engagement license |
| **Trailhead for Slack** | Learning content in Slack | Search and share Trailhead/myTrailhead content | — |

### Feature Comparison Matrix

| Feature | Salesforce for Slack | Sales Cloud for Slack | PRM for Slack | Service Cloud for Slack | CRM Analytics for Slack |
|---------|---------------------|-----------------------|---------------|--------------------------|-------------------------|
| View Salesforce Records | No | Yes (Opp, Lead, Contact, Account, Custom) | Yes (Search and post) | Yes (Cases, Incidents, etc.) | No |
| Create Records | Yes | Yes | No | Yes | No |
| Edit Records | No | Yes | Yes | Yes | No |
| Swarming | No | No | No | Yes | No |
| Sales Channels | No | No | Yes | No | No |
| Pipeline View | No | Yes | Yes | No | No |
| Feed Channels | No | Yes | Yes | No | No |
| Record Reminders | No | Yes | No | No | No |
| CRM Analytics | No | No | No | No (installs CRM Analytics for Slack) | Yes |
| Analytics Subscriptions | No | No | No | No | Yes |
| Einstein Discovery | No | No | Yes (via PRM portal) | No | Yes |
| Multi-Org Management | Yes | No | No | Yes | No |
| Link Unfurling | Yes | No | Yes | Yes | Yes |
| Identify Slack + Salesforce User | Yes | No | No | Yes | No |

---

## Flow Automation for Slack

Salesforce admins can automate Slack actions from **Flow Builder** using these core actions
(found under the **Slack** category):

| Action | What It Does |
|--------|-------------|
| Archive Slack Channel | Archives a Slack channel |
| Check If Users Are Connected to Slack | Verifies if Salesforce users have connected their Slack accounts |
| Create Slack Channel | Creates a new Slack channel (public or private) |
| Edit Slack Message | Edits an existing Slack message |
| Get Information about Slack Conversation | Retrieves metadata about a Slack conversation |
| Invite Users to Slack Channel | Invites Salesforce users to a Slack channel |
| Pin or Unpin Slack Message (Beta) | Pins or unpins a message in a Slack channel |
| Send Slack Message | Sends a message to a Slack channel or user |

**App ID required:** Some flows require the Sales Cloud for Slack App ID: `A028VJ1KG3G`

**Example automation patterns:**
- Auto-create a Slack channel when an opportunity reaches a certain stage
- Auto-invite the sales team when a high-value deal is created
- Archive a channel when a deal closes
- Send a Slack message when a case is escalated

---

## Key Permissions Summary

| Permission | Grants |
|------------|--------|
| `Connect Salesforce with Slack` | Core system permission required for most Slack apps; must be assigned to every Slack user |
| `Slack Sales User` | Required for Sales Cloud for Slack access |
| `PRM for Slack app Salesforce User` | Required for PAM access to PRM for Slack |
| `PRM for Slack Partner app User` | Required for partner users in PRM for Slack |
| `Slack Service User` | Required for Service Cloud for Slack |
| `Run Flows` | Required to create sales channels from Salesforce |
| `Customize Application` | Required for most admin setup tasks |
| Swarms object: Read + Create | Required to create sales channels from Slack |

> **Important:** Some user licenses do not support the `Connect Salesforce with Slack` permission.
> If you see an error when assigning the permission set, the user's license is incompatible.

---

## Record Detail Security Setting

Controls how much data is visible in Slack notifications and record previews.

| Setting | What Slack Members See |
|---------|------------------------|
| **Show Object Type Only** | Object type and notification details only; record name hidden from non-Salesforce users — most secure |
| **Show Record Name and Object Type** | Record name, object type, and notification details visible to all channel members including those without Salesforce access |

Configured from Setup → Quick Find → `Enable Slack for Salesforce`.
