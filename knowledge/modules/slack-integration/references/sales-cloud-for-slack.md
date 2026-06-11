# Sales Cloud for Slack

---

## Overview

Sales Cloud for Slack helps sales teams collaborate and close deals faster in Slack. It provides:
- View, create, and edit Salesforce records (Accounts, Contacts, Leads, Opportunities, custom objects)
- Pipeline view with filter/group by list view and record type
- Sales channels — Slack channels linked to Salesforce opportunity/account records
- Feed channels — broadcast channels for deal announcements (Deals Won, Deals to Watch)
- Reminders for upcoming close dates and stale opportunities
- Flow Builder automation for channel creation, notifications, and more

**Required Editions:** Enterprise, Performance, Unlimited, Developer (Lightning Experience)  
**Also requires:** Slack (where approved by a workspace admin)

---

## Key Permissions

| Permission | Scope |
|------------|-------|
| `Connect Salesforce with Slack` | System permission required for all Slack users |
| `Slack Sales User` | App permission required for all Sales Cloud for Slack users |
| `Read` on Opportunity | View opportunities in Sales Cloud for Slack |
| `Edit` on Opportunity | Edit opportunities in Sales Cloud for Slack |
| `Read` + `Create` on Swarms | Create sales channels from Slack |
| `Read` + `Create` on Swarms + `Run Flows` | Create sales channels from Salesforce |
| `Customize Application` | Admin setup tasks |
| `Manage Flow` | Set up and activate notification flows |

---

## Features

### Records in Slack

- View, create, and edit accounts, contacts, leads, opportunities, and custom objects
- Share records with people and channels directly from Slack
- Slash commands:
  - `/sales create record` — create a record directly in Slack (shortcut)
  - `/create a sales channel` — link an opportunity/account to a Slack channel (shortcut)
  - `/sales-search [object] [terms]` — search accounts, contacts, leads, opportunities (e.g. `/sales-search opportunity Very Good Coffee`)
  - `/sales-menu` — menu of common actions (Search Salesforce, View Pipeline, Start a Sales Channel, Create a Record)
  - `/sales-pipeline` — open the pipeline view
  - `/sales-muted-notifications` — view muted notifications

> **Note** You can see the first 10 records for a related list. To view the full list, open in Salesforce.

### Custom Objects in Slack

To make custom objects accessible in Slack:
1. When creating the custom object, ensure **Allow Search** is checked.
2. To let reps create records from Slack, select **Launch New Custom Tab Wizard after saving this custom object** under Object Creation Options.

### Pipeline View

Open with `/sales-pipeline`.

- Filter by **list view** and **record type**
- Up to **90 opportunity groups** visible; if more than 90, refine filters or view in Salesforce
- Grouping follows Kanban list view settings — to change, edit the Summarize By and Group By fields in Salesforce Kanban settings
- Requires: `Read` on Opportunity; `Manage Public List Views` + `Edit` on Opportunity for Kanban edit

---

## Sales Channels

Sales channels link Salesforce records (accounts and/or opportunities) to Slack channels. Channel members are notified when the linked record's Amount, Stage, or Close Date fields are updated.

**Pinned records:** Linked records appear pinned to the channel description — members can view or edit directly from the sales channel.

**Visibility:**
- Channels can be **public** or **private**
- You **cannot** change a private channel to public after creation
- Sales Cloud for Slack **does NOT support Slack Connect channels** (channels with external members outside your company)

### Create Sales Channels from Slack

**Permissions:** `Connect Salesforce with Slack` + `Slack Sales User` + `Read` + `Create` on Swarms

1. From Slack sidebar → click the **Sales** app in Apps.
2. Click shortcuts menu (+) → **Sales Cloud for Slack** → **Create a sales channel**.
   Or type `/create a sales channel` in the message field.
3. Select where to collaborate:
   - **Existing channel** — converts an existing Slack channel to a sales channel
   - **New channel** — create a new channel (choose public/private and name)
4. Select the Salesforce records to link (only records you have access to).
5. Choose whether to receive notifications about changes to linked records.
6. Save the sales channel.

> **Note** If you can't find an existing channel you're searching for, check if it's a Slack Connect channel (has external members). Remove all external members first, then retry.

### Create Sales Channels from Salesforce

**Permissions:** `Connect Salesforce with Slack` + `Slack Sales User` + `Read` + `Create` on Swarms + `Run Flows`

1. Open an opportunity or account record.
2. From the record action menu, click **Link a Slack Channel**.
3. Follow prompts to create the sales channel.

> **Note** Invitees who can't be added immediately receive an email with instructions. They can't be auto-added if they're not workspace members or haven't completed Sales Cloud for Slack setup.

### Find Sales Channels

**From Salesforce:**
- Click the **Swarm tab** (add it to your navigation bar) to see all sales channels and swarm channels as a list view
- On an Account or Opportunity record → **Related tab** → **Sales Channels** related list → click a channel to open it in Slack

**From Slack:**
- Any Slack user can view public sales or feed channels
- To take notification actions or view records, you must have the Sales Cloud for Slack app connected to Salesforce
- To view private channels, an existing member must invite you

### Admin Setup for Sales Channels

**Enable Sales Channels and set up users in Slack:**
1. From Setup → Quick Find → `Slack` → select **Sales Cloud for Slack**.
2. From Set Up Sales Channels section, select the level of record access for channel creators.
3. From users' permission sets or profiles, give `Read` and `Create` on Swarms (add `Delete` to let users delete sales channels).

**Set up users to create sales channels from Salesforce:**
1. Assign the `Run Flows` permission to the users' permission set or profile.
2. Ensure the **Link a Slack Channel** action is on opportunity and account record page layouts.

**Set up sales teams to see sales channels in Salesforce:**
1. Give `Read` on Swarms (at minimum) to let users see/search sales channels.
2. Tell users to add the **Swarms tab** to their navigation bar.
3. Add the **Sales Channels** related list to Account and Opportunity page layouts.

> **Service overlap:** Giving users access to the Swarms object also gives them visibility into Service app swarms (Slack channels linked to cases).

---

## Feed Channels

Feed channels broadcast automated announcements to a Slack channel about Salesforce opportunities.

**Two predefined feed channels:**
- **Deals Won** (usually `#deals-won`) — notified when opportunity probability = 100 (Closed Won)
- **Deals to Watch** (usually `#deals-to-watch`) — notified when opportunity is created or updated with probability ≥ 50 and amount > $0

### Admin: Activate a Feed Channel

**Permissions:** `Customize Application`

1. From Setup → Quick Find → `Slack` → select **Sales Cloud for Slack**.
2. Select a channel → click **Activate Channel**.
3. Add users who can access the channel (edit user roles if needed).
4. Select the workspace to add the feed channel to.
5. Choose **public** or **private**.
   > After a channel is set to private, you can't change it to public.
6. Choose to automatically add users to the channel now or let users join manually.
7. Click **Next** → **Activate Channel**.

**Role note:** Roles above the role you select don't automatically inherit channel access. Roles are hierarchical going down, not up.

### Create a Broadcast Topic Type

To create custom feed channel topic types (beyond Deals Won and Deals to Watch):

1. From App Launcher → **Broadcast Topics** → **Setup** → **Edit Object**.
2. In Fields and Relationships → click **Topic Type**.
3. Under Topic Type Picklist Values → click **New**.
4. Add each topic type on its own line → **Save**.

### Create a Custom Feed Channel

1. From App Launcher → **Broadcast Topics** → click **New**.
2. Name the broadcast topic, select a topic type.
3. Enter a description.
4. Select whether to feature this topic in the Slack onboarding message → **Save**.
5. From dropdown (upper right) → **Set Up Feed Channel**.
6. Select user roles → **Next**.
7. Select workspace → name the channel → choose public/private → **Next**.
8. Configure a notification flow to feed into this broadcast topic (if no flow is activated, the channel receives no notifications).
9. Click **Activate Channel**.

### Deactivate a Feed Channel

To deactivate (two options):
1. **Deactivate the flow:** From Setup → Flows → open the relevant flow → click **Deactivate**.
2. **Archive the channel completely:**
   1. Deactivate the flow (step above).
   2. From App Launcher → Broadcast Topics → open the broadcast topic record.
   3. Go to Related tab → delete Broadcast Topic Collaboration Room records → delete Broadcast Topic User Roles records.
   4. Delete the Broadcast Topic record.
   5. In Slack → go to the channel → click down arrow next to channel title → **Settings** → archive the channel.

---

## Notifications and Reminders

### Reminders (Sent to Sales App Messages Tab)

Reminders are sent to the individual opportunity owner — not to a channel. Admins must activate reminder flows first.

| Reminder | Trigger | Time Sent |
|----------|---------|-----------|
| Close date approaching | Opportunity close date is in 7 days | 5:01 AM (user's Salesforce time zone) |
| Next Step unchanged | Opportunity Next Step field unchanged for 30 days | 6:01 AM |
| Stage unchanged | Opportunity Stage unchanged for 30 days | 7:01 AM |

> **Prerequisite for Next Step reminder:** Enable Opportunity Field History for the Next Step field (Object Manager → Opportunity → Fields & Relationships → Set History Tracking).

### Sales Channel Notifications

Sent to all members of sales channels linked to the opportunity when Amount, Stage, or Close Date is updated.

### Feed Channel Notifications

Sent to all members of the feed channel when an opportunity matches the notification criteria.

### Data Access in Notifications

The **Record Detail Security** setting controls what channel members see in notifications:
- **Show Object Type Only** — members see the object type and notification details; record name is hidden from non-Salesforce users
- **Show Record Name and Object Type** — all channel members see the record name, object type, and notification details (including those without Salesforce access)

---

## Notification Flows Reference

Sales Cloud for Slack notifications are driven by Flow Builder. When Sales Cloud for Slack is enabled, Salesforce adds template flows for each notification type.

| Flow Name | Trigger | Destination |
|-----------|---------|-------------|
| Send Slack Notification for Approaching Opportunity Close Date | Close date is in 7 days | Sales app Messages tab (owner only) |
| Send Slack Notification When Opportunity Next Step is Unchanged | Next Step unchanged for 30 days | Sales app Messages tab (owner only) |
| Send Slack Notification When Opportunity Stage is Unchanged | Stage unchanged for 30 days | Sales app Messages tab (owner only) |
| Send Slack Notification for Opportunity Changes | Amount, Close Date, or Stage updated | Sales channels linked to the opportunity |
| Notify in Slack When Child Opportunity is Created | Child opportunity created for linked opportunity | Sales channels with the parent opportunity |
| Send Slack Notifications for Deals Won | Opportunity probability = 100 | Deals Won feed channels |
| Send Slack Notifications for Deals to Watch | Opportunity probability ≥ 50 AND amount > $0 (customizable) | Deals to Watch feed channels |

> **CRITICAL WARNING:** Do NOT edit the notification flow templates directly. Always **Save As** to create a copy, then activate the copy. Editing the template can cause notifications to fail or send incorrect messages.  
> **Exception:** The **Deals to Watch** flow IS customizable — you can adjust the probability percentage and amount triggers.

### Activate Notification Flows

**Permissions:** `Manage Flow`

1. From Setup → Flows.
2. Click the flow to view its template.
3. Click **Save As** → name it descriptively (matching the template name is recommended) → save.
4. From the saved copy → click **Activate**.
5. (For Next Step reminder only) Enable Opportunity Field History for the Next Step field.

### Customize Sales Channel Notifications

1. Create a notification type: Setup → Quick Find → `notifications` → **Custom Notifications** → **New** → select Slack tile → name → object → distribution app → title/text/buttons → **Done**.
2. Open the notification flow template.
3. In Auto-Layout mode, add an Action element next to Send Notifications.
4. Select **Notifications** in the Filter menu → choose your notification type.

> **Important:** Notification types are bound to a specific object (Account or Opportunity). The notification type's object must match the flow's object.

### Customize Deals to Watch Notification

1. From Setup → Flows → open **Send Slack Notification When** template → save a copy.
2. Click **Activate** on the saved copy.
3. Open the activated flow → click **Start**.
4. In Object: Opportunity section → click **Edit** → under Set Entry Conditions, specify the probability and amount.
5. Leave **A record is created or updated** selected (recommended — catches newly created opportunities at later stages).

---

## Admin Setup Checklist

1. Verify Edition requirements (Enterprise, Performance, Unlimited, Developer)
2. Assign `Connect Salesforce with Slack` permission to all users
3. Assign `Slack Sales User` permission to all users
4. Verify object permissions for Accounts, Contacts, Leads, Opportunities
5. Enable Sales Cloud for Slack (follow steps in Enable Salesforce for Slack Integrations)
6. Set up users to create sales channels (Swarms object permissions)
7. Enable `Run Flows` for users who create sales channels from Salesforce
8. Add the Link a Slack Channel action to Opportunity and Account page layouts
9. Set up notification flows (Save As → Activate each desired flow)
10. Set up and activate feed channels (Deals Won, Deals to Watch)
11. Install Sales Cloud for Slack app in the company's Slack workspace (via Slack App Directory)
12. Instruct users to add the app to their Slack sidebar and connect their accounts

---

## Considerations

- **One workspace per org:** Sales Cloud for Slack connects a **single Slack workspace** to a **single Salesforce org**. Plan this carefully before installing.
- **No Slack Connect support:** Sales Cloud for Slack does **not** support Slack Connect channels (channels with external/outside-company members).
- **Do not edit template flows** (except Deals to Watch). Always save a copy first.
- **Check for flow updates:** Periodically check if flows require re-cloning and reactivating.
- **Kanban settings affect pipeline view:** Pipeline grouping/sorting in Slack reflects the Kanban list view settings in Salesforce.
- **90-group pipeline limit:** If a list view + record type combination yields more than 90 groups, Slack only shows 90. View the rest in Salesforce.
