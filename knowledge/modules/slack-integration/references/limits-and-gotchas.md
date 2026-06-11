# Slack Integration — Limits and Gotchas

---

## Hard Limits

| Limit | Value |
|-------|-------|
| Slack block limit per record modal | 100 blocks (legacy dynamic layout) |
| Objects configurable for Search and Post (PRM for Slack) | 10 objects |
| Opportunity groups visible in pipeline view | 90 groups |
| Related list records visible in Sales Cloud for Slack | First 10 records |
| Notification buttons per custom notification type | Up to 3 |
| Slack workspaces per Salesforce org (Sales Cloud for Slack) | 1 workspace per org |

---

## Unsupported Features and Environments

| Category | Limitation |
|----------|------------|
| **FedRAMP / HIPAA** | Salesforce for Slack is **not certified** with FedRAMP or HIPAA. Cannot be used in Government Cloud or Government Cloud Plus orgs. |
| **Slack Connect (Sales Cloud for Slack)** | Sales Cloud for Slack does **not** support Slack Connect channels (channels with external/outside-company members). |
| **Slack Connect (Service Cloud for Slack)** | Service Cloud for Slack has **limited** support for Slack Connect. |
| **PRM for Slack workspace type** | PRM for Slack requires **Slack Enterprise Grid**. Does NOT work with a standard Slack workspace. |
| **External user licenses (Salesforce Channels)** | External user licenses (e.g., Experience Cloud) are **not supported** for Salesforce Channels. Only: Salesforce, Salesforce Platform Login, Lightning Platform - One App, Force.com - App Subscription, Company Community User. |
| **Record page component placement** | The Slack channel component can only be added to **desktop record page configurations**. Not supported on mobile. |
| **Swarming + Salesforce Channels on same record type** | Avoid adding both the Slack channel component and the swarming component to the same record type. |
| **Notes, Tasks, Events in Slack Record Layouts** | Notes, Tasks, and Events are **not supported** in Slack Record Layouts. The creation of Swarms via Slack Record Layouts is also unsupported. |
| **Channel privacy change** | Once a channel is set to **private**, it **cannot** be changed to public. This applies to both sales channels and feed channels. |
| **Message editing in Salesforce Channels** | Message editing is **not supported** in Salesforce Channels at this time. |
| **Swarm Conversations component: slash commands** | Using and creating Slack slash commands are **not supported** from the Swarm Conversations component. |
| **Swarm Conversations component: workflows** | Using and creating Slack workflows are **not supported** from the Swarm Conversations component. |

---

## Gotchas

### 1. Do NOT Edit Notification Flow Templates

**The most common mistake when setting up Sales Cloud for Slack notifications.**

- Never edit template notification flows directly. Always use **Save As** to create a copy first, then activate the copy.
- Editing the template directly can prevent notifications from firing or cause notification text to mismatch the notification behavior.
- **Exception:** The **Deals to Watch** flow (`Send Slack Notifications for Deals to Watch`) is officially customizable. You can change the probability percentage and amount triggers.

### 2. PRM for Slack Requires Slack Enterprise Grid

Users frequently assume PRM for Slack works with a standard Slack workspace. It does not.
- Requires Slack Enterprise Grid.
- Requires Salesforce PRM customer status.
- Requires Partner Community license for partner users.
- Setup requires coordination between Salesforce admin, Slack Enterprise Grid admin, and partner portal admin.

### 3. `Connect Salesforce with Slack` License Incompatibility

If you see an error when assigning the `Connect Salesforce with Slack` permission set, the user's license type is incompatible. Not all Salesforce licenses support this permission.

Check the user's license type before assigning Slack permission sets. The following internal license types are supported for Salesforce Channels: Salesforce, Salesforce Platform Login, Lightning Platform - One App, Force.com - App Subscription, Company Community User.

### 4. Slack Channel Access Is Broader Than Salesforce Record Access

In **Salesforce**, access to a Salesforce Channel is controlled by access to the corresponding record.

In **Slack**, channel members have broader access — they can see the channel even without access to the corresponding Salesforce record.

This is a **security consideration** that must be communicated to admins when setting up Salesforce Channels. Use "Show Object Type Only" in Record Detail Security to minimize data exposure.

### 5. Sales Cloud for Slack: One Workspace Per Org

Sales Cloud for Slack can connect only a **single Slack workspace** to a **single Salesforce org**. Plan workspace and org mapping carefully before installing.

### 6. Compact Layout Block Limit (100 Blocks)

Salesforce records displayed in Slack using the **legacy dynamic layout** are subject to Slack's 100-block limit per modal. If a record is too large, some fields won't be shown, and users are prompted to view/edit in Salesforce.

- This is dependent on whether the component is used within the sales app, service app, or a third-party view.
- Resolution: Create a custom Slack record layout for large objects.

### 7. Label Localization Issue

Labels provided by the Slack client (not Salesforce) always use the **Slack language setting**, not the Salesforce locale. If Slack and Salesforce use different locales, these labels are not localized:
- **(optional)** label on optional input fields
- **"Press 'enter' to submit"** hint text
- **"Close"** button on modals

To ensure localization, change the Slack language to match the Salesforce language. Some labels are English-only during beta.

### 8. Sales Channel Naming Conventions Matter

Duplicate channels are a real problem with sales channels. Without a consistent naming convention:
- Teams end up with multiple channels for the same opportunity/account
- Channels are hard to find

Recommended naming conventions:
- `#oppty-opportunity-name`
- `#acct-account-name`
- `#sales-acct-name-oppty-name`

Establish the convention **before** rolling out Sales Cloud for Slack.

### 9. Role Hierarchy and Feed Channel Access

When adding Salesforce users to feed channels using roles:
- The selected role **gains** channel access
- Roles **above** the selected role in the hierarchy do **not** automatically inherit channel access
- You must explicitly add roles higher in the hierarchy if they also need access

### 10. PRM for Slack: Flows Must Be Cloned Before Enabling

In PRM for Slack, flows must be cloned and customized before they can be enabled in the PRM for Slack Setup. You cannot enable the original predesigned flow directly.

### 11. Sales Cloud for Slack Doesn't Support Slack Connect

Sales channels cannot include external Slack users (Slack Connect participants).

If you try to use an existing Slack channel that includes external members as a sales channel:
1. You must first remove all external members from the channel.
2. Then the channel appears in search for conversion to a sales channel.
3. After the sales channel is created, you can re-add external members.

### 12. Service Cloud for Slack: Limited Slack Connect Support

Unlike Sales Cloud for Slack which has zero Slack Connect support, Service Cloud for Slack has **limited** support — some Slack Connect scenarios may work, but the app is not fully supported in Slack Connect channels.

### 13. Swarming and Salesforce Channels Cannot Coexist on Same Record Type

Adding both the Slack channel component (for Salesforce Channels) and the swarming component to the same record type is not recommended and may cause issues. Choose one or the other for each record type.

### 14. Next Step Reminder Requires Opportunity Field History

The "Send Slack Notification When Opportunity Next Step is Unchanged" notification requires **Opportunity Field History tracking** for the Next Step field to be enabled.

If Field History is not enabled:
- The notification cannot detect whether the field has been unchanged for 30 days
- The reminder simply won't fire

Enable from Object Manager → Opportunity → Fields & Relationships → **Set History Tracking** → enable Next Step.

### 15. Slack Connect in PRM Depends on Free Workspace Support

When partner organizations want to use a free Slack workspace with PRM for Slack, the vendor's Enterprise Grid must explicitly allow connections to free workspaces:
- Slack Connect → Settings → Security → **Use Slack Connect with free teams** → Enable

If this is not enabled, partners on free workspaces cannot join partner channels.

---

## Service Cloud for Slack — Swarm Conversations Component Limits

| Limitation | Detail |
|-----------|--------|
| Object support | Only objects that support Swarming (e.g., Cases, Customer Service Incident Management) |
| Channel visibility | Only Slack channels linked to the record's swarm |
| Message types | Only public and private channels; no direct messages or group messages |
| Slash commands | Not supported |
| Slack workflows | Not supported |
| Thread replies to channel | Cannot send thread reply to the rest of the channel |
| Max components per page | 2 Swarm Conversations components recommended maximum |
| @here / @Everyone | Not supported |
| Real-time messages | Only from channels with Service Cloud for Slack app installed |
| Firefox auto-redirect | Does not auto-redirect to newest message |

---

## Government Cloud Warning

> Salesforce for Slack apps and integrations are **not supported in Government Cloud**. Do not enable Salesforce for Slack in Government Cloud or Government Cloud Plus orgs. For alternative options, contact your Salesforce account executive.

This covers all Salesforce for Slack apps:
- Sales Cloud for Slack
- PRM for Slack
- Service Cloud for Slack
- CRM Analytics for Slack
- Financial Services Cloud for Slack
- Account Engagement for Slack
- Salesforce for Slack (core)
