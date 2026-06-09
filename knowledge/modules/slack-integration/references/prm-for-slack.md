# PRM for Slack

---

## Overview

PRM for Slack enables real-time collaboration between **partner account managers (PAMs)** and **partners**. It creates partner channels (powered by Slack Connect), lets PAMs and partners manage opportunities and deals, search and post CRM records, and automate deal registration and approval flows — all from within Slack.

**Required Editions:** Enterprise, Unlimited with Salesforce for Slack Integrations Enabled  
**Requires:** Slack Enterprise Grid (NOT a standard Slack workspace)  
**Also requires:** Salesforce PRM customer status

---

## Key Requirement: Slack Enterprise Grid

> **Critical:** PRM for Slack requires **Slack Enterprise Grid**. It does NOT work with a standard Slack workspace. This is the most important constraint to communicate when someone asks about PRM for Slack.

PRM for Slack is built on **Slack Connect**, which allows channels with users outside your company's workspace. This is what enables vendor-partner collaboration.

---

## Considerations

### General
- You must be a Salesforce PRM customer
- You must use **Slack Enterprise Grid**
- Partner users need a **Partner Community license** (either Logins and Members or the Partner Relationship Management SKU)
- Partners must have a Slack workspace before working with PRM for Slack — recommend vendors and partners use their existing workspaces
- If vendor's Enterprise Grid allows free workspace connections, partners who aren't Slack customers can create and use a free workspace
- Slack Connect channels on Enterprise Grid ensure new partner workspaces persist past the 90-day free Slack trial

### PRM-Specific
- Setup is required in **both Salesforce and Slack**
- Partner users on login-based license: only one login consumed for the first authentication; no more logins consumed throughout the session's lifetime
- PAMs can create a channel with multiple partners from **different workspaces**
- Record access includes read and write permissions corresponding to Salesforce and portal permissions

---

## Setup in Salesforce

### Step 1: Enable PRM for Slack App in Salesforce

**Permissions:** `Customize Application` AND `View Setup and Configuration`

1. Complete the steps in **Enable Salesforce for Slack Integrations** first.
2. In Initial Slack Setup, enable PRM for Slack.

> **Note:** Use a workspace you've already been using, but you can create a new workspace for PRM for Slack.

### Step 2: Assign PRM for Slack Permissions to Partner Account Managers (PAMs)

**Permissions:** `Customize Application` AND `View Setup and Configuration`

You can assign through Initial Slack Setup, the Profiles menu, or manually:

1. From Setup → Quick Find → `Permission` → **Permission Sets**.
2. Select the **PRM for Slack app Salesforce User** permission set.
3. Click **Manage Assignments** → **Add Assignments**.
4. Select users to assign → click **Assign**.

### Step 3: Assign PRM for Slack Permissions to Partners

**Permissions:** `Customize Application` AND `View Setup and Configuration`

Partner permissions depend on their license type.

1. From Setup → Quick Find → `Permission` → **Permission Sets**.
2. Select the **PRM for Slack Partner app User** permission set matching the partner's license.
   > **Note:** Portal access is controlled with permission sets — this permission set or the partner's profile must be added to the portal.
3. Click **Manage Assignments** → **Add Assignments**.
4. Select partners to assign → click **Assign**.

### Step 4: Set Object Permissions in PRM for Slack

**Permissions:** `Customize Application` AND `View Setup and Configuration`

Controls what PAMs can do with Slack Connect channels.

1. In Slack Apps Setup → select **Verify Data Sharing Options**.
2. Select **Modify PRM for Slack Setting**.
3. Set the object permissions you want for PRM for Slack.

### Step 5: Manage Channel Search and Post Objects

**Permissions:** `Customize Application`

Choose which objects users see in Slack for Search and Post. You can add up to 10 objects (including custom objects).

1. From Setup → Quick Find → `PRM for Slack` → select **PRM for Slack**.
2. Under Manage Channel Search & Post Objects, search for the object name.
3. Click **Search** and select the objects.

### Step 6: Create an Installation Link for Partner Users

**Permissions:** Org Owner and Org Admin

1. In PRM for Slack Setup → go to the **Getting Started** tab.
2. Under "Share the PRM for Slack installation link", select a partner site to generate the link.
3. Click **Copy Link** → send to your partner portal administrator.
4. Click **I'm done distributing PRM for Slack link to Communities**.

> After installation, the app is available to all authorized workspace members. If a partner joins a channel but hasn't authenticated, PRM for Slack will prompt them with the installation link.

### Step 7: Automate Business Processes in PRM for Slack

**Permissions:** `Customize Application`

Two predesigned flows are available:
- **Register a Deal** — for partners to register deal opportunities
- **Approve a Deal** — for PAMs to approve partner deal registrations

**Customize predesigned flows:**
1. Go to the Configure Business Processes tab in PRM for Slack Setup.
2. Choose **Create New Flow**, or select a preinstalled process (Register a Deal, Notify Approvers of a Deal, Approve a Deal) under Preconfigured Business Processes.

**Enable flows in PRM for Slack:**
> **Important:** Flows must be cloned and customized before they work in PRM for Slack.
1. Go to Configure Business Processes tab in PRM for Slack Setup.
2. Select the flow → click **Enable** from its action menu.
3. Go to PRM for Slack Home tab → click **Looking for more actions** to see enabled actions.

> **Tip:** Flows are configured for internal and partner users in Salesforce; access is linked to user-specific profiles. All enabled flows appear in the PRM for Slack app.

**Enable global actions in PRM for Slack:**
1. Create a global action in Salesforce Setup first.
2. Go to Configure Business Processes tab in PRM for Slack Setup.
3. Select the global action → click **Enable** from its action menu.

---

## Setup in Slack

Requires coordination with the **Slack Enterprise Grid admin**.

### Step 1: Enable PRM for Slack in Enterprise Grid

**Permissions:** Org Owner (for Slack Connect channel management)

1. In Slack Enterprise Grid → go to Slack Connect → Settings → "Enable for channels in which workspaces".
2. Click **Edit**.
3. Select the workspace to enable Slack Connect.
4. Save changes.

> **Tip:** If partners will use a free workspace, enable: Slack Connect → Settings → Security → **Use Slack Connect with free teams** → Enable.

### Step 2: Enable Partner Account Managers to Invite Partners

**Permissions:** Org Owner and Org Admin

1. Go to Slack Connect → Settings → Permissions → Channels → **Edit**.
2. Under "With permission to post, invite, and more", select **Everyone, except guests (default)**.
3. Save changes.

**Configure to remove approval requirements (so partners can accept invitations):**
1. Go to Slack Connect → Settings → Requests → **Require approval for channel invitations**.
2. Click **Edit** → select **Never require approval** → save.

### Step 3: Approve App Installation

**Permissions:** Org Owner & Org Admin

1. Select your workspace name → **Settings & Administration**.
2. Select **Manage Apps** to open the Slack App directory.
3. Search for "PRM for Slack".
4. On the app page → click **Approve**.

### Step 4: Set Up the PRM for Slack App for PAMs

1. Click the installation link provided by the Salesforce admin, or find the app in the Slack App Directory.
2. Select your workspace in the workspace dropdown (upper right).
3. Select **Allow** to give PRM for Slack access to the workspace.
4. Select **Allow** to connect Slack with Salesforce.

After installation: PAMs can manage partner channels, add members, search and post Salesforce records, and approve deals.

---

## Partner Collaboration Workflows

### Sign In to Your Slack Workspace

1. In Slack navigation bar → click **(+)**.
2. Select **Sign in to another workspace** → find the PRM workspace.
3. If the workspace doesn't appear → select **Or sign in to a new workspace here**.

### Install PRM for Slack (Partner Side)

1. Click **Add apps** in Slack.
2. Type `PRM for Slack` in the Search bar.
3. Select **PRM for Slack** to install.

### Connect PRM for Slack with Salesforce (Partner or PAM)

1. On the Home tab → select **Connect to Salesforce**.
2. Sign in with Salesforce credentials.
3. (Optional) Go to Home tab → **View Settings** → **Salesforce Setup** to customize the app.

### Create Partner Channels from Slack (PAM)

**Permissions:** Workspace membership

1. On the Home tab of PRM for Slack → select **Manage Partner Channel**.
2. Enter the channel information.
3. Click **Create**.
4. Optionally add partner accounts and partner users now or later.

### Create Partner Channels from Salesforce (PAM)

**Permissions:** Read, Create, Edit on Swarm

Prerequisites:
- Add the **Partner Account Channels** related list to the Account Object page layout
- Enable the Account as a Partner Account

1. Go to the Partner Account record page.
2. Select **New** under Related List → Partner Account Channels.
3. Select the workspace → **Next**.
4. Add channel name → **Next** (optionally add topic and description).
5. Add partner and internal users. Note: all partner users associated with this account are automatically added; the channel creator is automatically added.
6. Review → **Submit**.

### Add Partner Accounts and Users to Existing Channels

**Permissions:** Workspace membership

1. On the Home tab → select **Manage Partner Channel**.
2. Select **Use an existing channel**.
3. Select the channel to add to.
4. Type partner user names in the Partner Users box.
5. Save changes.

### Edit a Partner Channel

**Permissions:** Read, Create, Edit on Swarm

1. Go to the Partner Account record page.
2. Find the channel under Related List → Partner Account Channels.
3. Click **Edit** in its action menu.
4. Update settings → save.

### Archive a Partner Channel

**Permissions:** Read, Create, Edit, Delete on Swarm

1. Go to the Partner Account record page.
2. Find the channel under Related List → Partner Account Channels.
3. Click **Archive** in its action menu.
4. Select **Archive**.

> **Warning:** Archiving removes all external partners, along with any files and attachments they shared.

### Search and Post a CRM Record in a Partner Channel

**Permissions:** Workspace membership

> Can only post records to channels created by the PRM for Slack app. View/edit access matches the user's Salesforce permissions (PAM) or partner portal permissions (partner).

1. On the Home tab → select **Search & Post Record**.
2. Enter the name in the Search field. Filter by contacts, accounts, opportunities, or leads.
3. Click **Search**.
4. **To post the record:**
   a. Click **Post** → preview shown in the Post window.
   b. Select the channel.
   c. Add optional message.
   d. Click **Post Record**.
5. **To view the record:**
   a. Click **View Record**.
   b. To edit → click **Edit**.
   c. To post → click **Post Record** or **View in Salesforce**.

---

## Permissions Summary

| Role | Permission Set |
|------|----------------|
| Partner Account Managers (PAMs) | `PRM for Slack app Salesforce User` |
| Partner users | `PRM for Slack Partner app User` (license-specific) |
| Salesforce admin | `Customize Application` + `View Setup and Configuration` |
| Slack Enterprise Grid admin | Org Owner / Org Admin for Slack Connect management |
