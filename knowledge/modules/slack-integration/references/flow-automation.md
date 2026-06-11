# Slack Integration — Flow Automation

---

## Overview

Salesforce admins can automate Slack actions using **Flow Builder**. All Slack-related flow actions are found in the **Slack** category in Flow Builder.

Some flows require the **Sales Cloud for Slack App ID**: `A028VJ1KG3G`

---

## Slack Flow Core Actions

| Action | What It Does |
|--------|-------------|
| **Archive Slack Channel** | Archives a Slack channel (removes it from active use but preserves history) |
| **Check If Users Are Connected to Slack** | Verifies whether Salesforce users have connected their Slack accounts |
| **Create Slack Channel** | Creates a new Slack channel (public or private) |
| **Edit Slack Message** | Edits an existing Slack message |
| **Get Information about Slack Conversation** | Retrieves metadata about a Slack conversation |
| **Invite Users to Slack Channel** | Invites Salesforce users to a Slack channel |
| **Pin or Unpin Slack Message** (Beta) | Pins or unpins a message in a Slack channel |
| **Send Slack Message** | Sends a message to a Slack channel or user |

---

## Common Automation Patterns

| Business Scenario | Flow Actions Used |
|-------------------|------------------|
| Auto-create a Slack channel when an opportunity reaches a certain stage | Create Slack Channel → Invite Users to Slack Channel |
| Auto-invite the sales team when a high-value deal is created | Check If Users Are Connected to Slack → Invite Users to Slack Channel |
| Archive a channel when a deal closes (Closed Won or Lost) | Archive Slack Channel |
| Send a Slack message when a case is escalated | Send Slack Message |
| Create and populate a partner channel for a new deal registration | Create Slack Channel → Invite Users to Slack Channel → Send Slack Message |
| Notify a channel when key field changes occur on a record | Send Slack Message |

---

## Sales Cloud for Slack Notification Flows

Sales Cloud for Slack notifications are driven entirely by Flow Builder. When Sales Cloud for Slack is enabled, Salesforce automatically adds template flows for each notification type.

> **Critical Warning:** Do **NOT** edit notification flow templates directly. Always **Save As** to create a copy, then activate the copy. Exception: the **Deals to Watch** flow is customizable.

### Notification Flows Reference

| Flow Name | Trigger | Destination |
|-----------|---------|-------------|
| Send Slack Notification for Approaching Opportunity Close Date | Close date is in 7 days | Sales app Messages tab (owner only) |
| Send Slack Notification When Opportunity Next Step is Unchanged | Next Step unchanged for 30 days | Sales app Messages tab (owner only) |
| Send Slack Notification When Opportunity Stage is Unchanged | Stage unchanged for 30 days | Sales app Messages tab (owner only) |
| Send Slack Notification for Opportunity Changes | Amount, Close Date, or Stage updated | Sales channels linked to the opportunity |
| Notify in Slack When Child Opportunity is Created | Child opportunity created for linked opportunity | Sales channels with parent opportunity |
| Send Slack Notifications for Deals Won | Opportunity probability = 100 | Deals Won feed channels |
| Send Slack Notifications for Deals to Watch | Opportunity probability ≥ 50 AND amount > $0 (customizable) | Deals to Watch feed channels |

---

## Activating Notification Flows

**Required Permission:** `Manage Flow`

1. From Setup → Quick Find → `Flows` → select **Flows**.
2. In the Flows list view, click the desired flow to view its template.
3. Click **Save As** → name it descriptively (using the same name as the template is recommended) → save.
4. From the saved copy → click **Activate**.
5. **Special step for "Next Step Unchanged" reminder:** Enable Opportunity Field History for the Next Step field.
   - Object Manager → Opportunity → Fields & Relationships → **Set History Tracking** → enable Next Step.

> **Note:** Check for flow updates regularly, because flows you use sometimes require re-cloning and reactivating to incorporate Salesforce updates.

---

## Customizing Notification Messages

To change the message content of a sales channel notification:

**Prerequisites:** Create a custom notification type first.

**Required Permission:** `Manage Flow`

**Create a Notification Type:**
1. From Setup → Quick Find → `notifications` → **Custom Notifications** → **New**.
2. Select the **Slack tile** → **Next**.
3. Name the notification, select the object (must match the flow's object), and click **Next**.
4. Select the distribution app → **Next**.
5. Enter a title and text for the notification content.
6. Optionally add buttons (up to 3) → click **Done**.

> **Important:** Notification types are bound to a specific object (Account or Opportunity). The notification type and flow must reference the same object.

**Modify the Flow:**
1. From Setup → Flows → select a notification flow template.
2. In Auto-Layout mode, add an **Action element** next to the Send Notifications element.
3. Select **Notifications** in the Filter menu → search for and select your notification type.

---

## Customizing the Deals to Watch Feed Channel

The Deals to Watch flow is the **only notification flow** that is officially customizable.

**Default behavior:** Notifies when opportunity probability ≥ 50 AND amount > $0.

**To customize:**
1. From Setup → Flows → open the **Send Slack Notification When** template → **Save As** with a new name → save.
2. Click **Activate** on the saved copy.
3. Open the activated flow → click **Start**.
4. In the Object: Opportunity section → click **Edit** → under Set Entry Conditions, specify:
   - **Probability** field: change the percentage threshold
   - **Amount** field: change the minimum amount
5. Leave **A record is created or updated** selected (recommended: catches newly created opportunities at later stages).

---

## Managing Notification Time Frames

Sales channels send automated messages on a preconfigured time frame. Three reminder flows have preconfigured schedules:

| Flow | Default Time | What to Modify |
|------|-------------|----------------|
| Approaching Close Date | Close date in 7 days | Change "7 days" in the schedule condition |
| Next Step Unchanged | 30 days | Change "30 days" in the schedule condition |
| Stage Unchanged | 30 days | Change "30 days" in the schedule condition |

To use a different time frame, **save a copy** of the flow and modify the time condition in the flow trigger before activating.

---

## PRM for Slack: Business Process Automation

PRM for Slack includes predesigned flows for partner workflows:

| Predesigned Flow | Purpose |
|-----------------|---------|
| **Register a Deal** | Partners register deal opportunities |
| **Notify Approvers of a Deal** | Notifies PAMs/approvers of a new deal registration |
| **Approve a Deal** | PAMs approve partner deal registrations |

**Enable flows in PRM for Slack:**
> Flows must be cloned and customized before they work in PRM for Slack.

1. Go to Configure Business Processes tab in PRM for Slack Setup.
2. Select the flow → click **Enable** from its action menu.

All enabled flows appear in the PRM for Slack app (Home tab → "Looking for more actions").

---

## End-to-End Flow Example: Auto-Create Sales Channel on Stage Advance

**Scenario:** When an opportunity reaches "Proposal/Price Quote" stage, automatically create a sales channel and invite the opportunity owner and their manager.

**Flow type:** Record-Triggered Flow (Opportunity object)

**Flow logic:**
1. **Trigger:** Record is updated; Stage changes to "Proposal/Price Quote"
2. **Action 1:** Check If Users Are Connected to Slack (opportunity owner)
3. **Decision:** If connected → continue; if not → send email fallback
4. **Action 2:** Create Slack Channel (name: `#oppty-{Opportunity.Name}`, private)
   - Requires Sales Cloud for Slack App ID: `A028VJ1KG3G`
5. **Action 3:** Invite Users to Slack Channel (opportunity owner + manager)
6. **Action 4:** Send Slack Message ("Welcome! This channel is for collaborating on {Opportunity.Name}.")

**Notes:**
- Channel names must be lowercase, no spaces (use `-` or `_`)
- App ID `A028VJ1KG3G` is required by some Slack flow actions (specifically those tied to the Sales Cloud for Slack app)

---

## Flow Actions and App ID

> **When is App ID `A028VJ1KG3G` required?**  
> Certain flow actions that create or manage sales channels through the Sales Cloud for Slack app require providing the App ID in the flow configuration. This is separate from general Slack actions (like Send Slack Message) which don't require it.

---

## Service Cloud for Slack: Swarming Flows

Service Cloud for Slack uses flows to route cases to swarm channels. Admins configure these flows during swarming setup:

1. Complete Swarming setup (Set Up Swarming).
2. Enable Service Cloud for Slack via Enable Salesforce for Slack Integrations.
3. Configure swarming flows in Flow Builder (Configure Swarming Flows).
4. Set Slack as your collaboration tool on the Swarming setup page.
