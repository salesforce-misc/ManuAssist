# Sandboxes — Create, Clone, Refresh, and Manage

---

## Required Permissions

| Action | Permission Required |
|--------|-------------------|
| View a sandbox | View Setup and Configuration |
| Create, refresh, activate, delete a Developer or Developer Pro sandbox | Manage Dev Sandboxes |
| Create, refresh, activate, delete any sandbox type | Manage Sandboxes |

---

## Create a Sandbox

Setup > Sandboxes > **New Sandbox**

1. Enter a name (≤ 10 characters) and description
   - Keep the name short: Salesforce appends it to usernames (e.g. `user@acme.com.test`)
   - Choose a purpose-reflecting name: `QA`, `Dev1`, `UAT`
2. Select the sandbox type
3. For **Partial Copy**: select a sandbox template (required)
4. For **Full**: choose Object Data Included (All or Template-based), field tracking history, and whether to copy Chatter data
5. (Developer/Developer Pro only) Select storage upgrade if available
6. (Optional) Specify an Apex class implementing `SandboxPostCopy` for post-copy scripts
7. For **Sandbox Access**: select a public user group (required for Developer/Developer Pro; recommended for all types)
8. Click **Create**

**Processing time:** Minutes to days depending on org size and type. You receive an email when complete.

**After creation:** Log in at `https://test.salesforce.com` or the sandbox's My Domain URL:
`https://MyDomainName--SandboxName.sandbox.my.salesforce.com`

Username format: `user@acme.com.test` (sandbox name appended). If not unique, a 7-digit prefix is prepended.

> **⚠️ Warning:** Don't make production org changes while the sandbox copy is in progress — it can cause inconsistencies.

> **Note:** Requests to create a sandbox can't be canceled.

---

## Refresh a Sandbox

Setup > Sandboxes > click **Refresh** next to the sandbox

Refresh intervals are calculated from the last creation or refresh request:

| Type | Interval |
|------|---------|
| Developer | 1 day |
| Developer Pro | 1 day |
| Partial Copy | 5 days |
| Full | 29 days |

**Key considerations:**
- Apex scheduled jobs from the source org are **not copied** — reschedule after refresh
- Active Salesforce-to-Salesforce connections are **not copied** — deactivate and reactivate manually
- The sandbox org ID **changes** on every refresh
- Select **Auto Activate** to skip the activation step; otherwise you receive an activation email

> **⚠️ Warning:** A refreshed sandbox replaces all data and configuration. Any manual changes made since last refresh are lost.

> **Note:** Refreshed sandboxes not activated within 30 days are automatically deleted. At least two email notifications are sent beforehand.

> **Note:** Requests to refresh a sandbox can't be canceled.

---

## Activate a Refreshed Sandbox

Setup > Sandboxes > click **Activate** next to a sandbox with status **Pending Activation**

> **⚠️ Warning:** Activating permanently deletes the previous sandbox version and all its data. This cannot be undone.

To keep the previous version temporarily: click **Discard** instead (discarding is also permanent and can't be recovered).

---

## Clone a Sandbox

Cloning copies data and metadata from an existing sandbox (not from production) into a new sandbox.

Setup > Sandboxes > click **Clone** next to a completed sandbox

**Rules:**
- Cloned sandbox uses the **same license type** as its source org
- Chatter and entity history are only copied for Full sandboxes
- Data Storage and Sandbox Access are **not selectable** for clones — they match the source
- A cloned sandbox **always refreshes from its source org**, not from production (unless the source is deleted)
- External client apps are **not included** on cloned sandbox refresh

**Hyperforce:** Quick Clone technology used by default; may fall back to legacy.

> **Note:** After cloning, you can add a storage upgrade to the clone if you have available upgrade licenses.

---

## Post-Copy Apex Scripts (SandboxPostCopy Interface)

You can specify an Apex class to run after every creation and refresh:

```apex
global class MySandboxPostCopy implements SandboxPostCopy {
    global void runApexClass(SandboxContext context) {
        // context.organizationId()  — sandbox org ID (15-char)
        // context.sandboxName()     — sandbox name
        // context.isSandbox()       — always true
        // Perform post-copy setup: activate features, seed data, fix connections
    }
}
```

Specify the class name during sandbox creation or refresh. The class must exist in the **source org**.

---

## Selective Sandbox Access (Public Groups)

Developer and Developer Pro sandboxes **require** a public group for access control. Partial Copy and Full sandboxes recommend it but allow "All Active Users."

| Sandbox Op. | Access Option | Users With Access | Email Format |
|-------------|--------------|-------------------|--------------|
| Create (Partial/Full) | All Active Users | All users with production access | Creator email unmodified; others appended `.invalid` |
| Create (all types) | Public User Group | Creator + group members | Group members' emails unmodified; others `.invalid` |
| Clone (all types) | Not selectable | Users with access to source sandbox | Creator email unmodified; others `.invalid` |

**Best practice:** Public group size < 150 members for security and faster creation.

**Add access after creation:** Unfreeze frozen user accounts (Setup > Users).

---

## Sandbox Access Gotchas

- Sandbox refresh **reverses all manual access changes** — sandbox-only users will no longer exist; permissions revert to production values
- Users added to production **after** sandbox creation/refresh don't have sandbox access until the next refresh
- Create inactive production users and activate them in the sandbox for sandbox-only developers
- `Manage Modify All Data` permission is often needed for developers — grant carefully in sandboxes containing production data copies
- Log in using the sandbox My Domain URL, not `https://login.salesforce.com`
- After creation/refresh, `https://test.salesforce.com` access may take 24–48 hours to become available

---

## Monitor Sandbox Progress

Setup > Sandboxes > select a sandbox to view the detail page.

Progress bar shows three stages: **In Queue** → **Data Copy** → **Activation**

| Status | Meaning |
|--------|---------|
| Sampling | Determining which records to sample (Partial Copy only) |
| Pending | Waiting in the copy queue |
| Processing | Copy engine building the sandbox |
| Suspended | Copy interrupted; auto-recovers → Processing. If unchanged > 1 hour, contact Salesforce Support |
| Stopped | Multiple failures; contact Salesforce Support |
| Pending Activation | Ready to activate or discard |
| Activating | Final steps before availability |
| Discarding | Admin clicked Discard |
| Completed | Active and ready |
| Deleting | Admin clicked Delete |
| Locking / Locked | License issue — can't log in; contact account manager |

---

## Manage Sandboxes Programmatically

**Salesforce CLI:**
```bash
# Authorize to production
sf org login web --instance-url https://login.salesforce.com

# Create a sandbox
sf org create sandbox --name MySandbox --type Developer --target-org production

# List sandboxes
sf org list sandboxes --target-org production
```

**Tooling API:** Use `SandboxInfo` (create/refresh) and `SandboxProcess` (post-creation) objects for programmatic management.

---

## Inactive User Freezing (Developer and Developer Pro Only)

Users who haven't logged in within **60 days** of their user being created in the sandbox are automatically frozen. This cannot be disabled.

- Applies to all users including admins
- Once a user logs in, they are exempt from future freezing
- To unfreeze: Setup > Users in the sandbox (requires Freeze Users or Manage Users permission)
- If all admin users are frozen: refresh the sandbox, or contact Salesforce Support

> **Note:** Does not affect Partial Copy and Full sandboxes.

---

## Inactive Sandbox Expiration

Sandboxes not accessed for **180 days** are deleted.

- Email notifications sent at ~90, 120, and 150 days to users with `Manage Sandboxes` or `Manage Dev Sandboxes` permission in production
- Final deletion email sent after 180 days
- Deletion does not terminate the subscription — a new sandbox can be created
- To opt out of warning emails: Setup > Dev Hub > **Sandbox Expiration Email Opt Out** (note: sandbox still gets deleted)

---

## Sandbox License Compliance

When you exceed your sandbox license count:

| Days After Non-Compliance Flagged | What Happens |
|----------------------------------|--------------|
| 1–30 | Grace period — sandboxes remain unlocked; delete extras or buy more licenses |
| 31–90 | Non-compliant sandboxes are locked (no login) |
| 91+ | Non-compliant sandboxes are permanently deleted |

If license count goes to **zero**: sandbox is immediately locked, no notifications sent.

When locked, **no sandbox operations** (including refresh) are permitted for any sandbox type until compliance is restored.

---

## Delete a Sandbox

Setup > Sandboxes > **Del** link next to a sandbox

> **⚠️ Warning:** Deleting a sandbox permanently erases all data, including any outbound change sets uploaded from the sandbox. Cannot be recovered.

- Deleting does not terminate your sandbox subscription
- You can create another sandbox after deleting

---

## Best Practices for Faster Creation and Refresh

- **Plan ahead:** Sandboxes are not guaranteed to complete by a specific time — refresh early
- **Stagger requests:** Two requests of the same type queue behind each other
- **Use sandbox templates** (non-Hyperforce): minimize data copied to reduce copy time
- **Update instead of refresh:** Use Metadata API or Bulk API for targeted updates
- **Hyperforce:** Quick Create/Clone is default — check for Hyperforce badge in Setup > Sandboxes
- Customer Support **cannot** expedite sandbox copy speed
