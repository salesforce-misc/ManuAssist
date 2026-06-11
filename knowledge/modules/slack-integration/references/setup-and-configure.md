# Slack Integration — Setup and Configure

---

## Overview

There are two setup paths depending on what you're enabling:

1. **Salesforce Channels** — embed Slack in record pages (Guided Setup or manual)
2. **Salesforce for Slack Integrations** — enable Salesforce for Slack apps (Sales Cloud for Slack, PRM for Slack, Service Cloud for Slack, etc.)

Both paths require a connection between your Salesforce org and a Slack workspace first.

---

## Path 1: Set Up Salesforce Channels

### Option A — Slack Guided Setup (New to Slack)

For admins who don't yet have a Slack workspace.

**Editions:** Essentials, Starter, Pro Suite, Professional, Enterprise, Unlimited, Developer

**Permissions required:** Salesforce admin

**Steps:**

1. From Setup, Quick Find → `Slack Guided Setup`, select it.
2. Click **Start Slack Setup**.

**Step 1: Create Your Workspace**
1. In Create a Slack workspace, click **Get Started**.
2. Enter a name for your Slack workspace, then click **Save**.

**Step 2: Add Slack Conversations to Salesforce Record Pages**
1. Click **Add** in the "Add Slack conversations to record pages" section.
2. In Slack Channels for Records, click **+ Add Objects**.
3. Search and select the objects you want.
4. Click the relevant page under Record Pages, then **Edit** to open Lightning App Builder.
5. Drag the **Slack** component onto the canvas and save.
6. Return to Guided Slack Setup → click **I am done with this step**.

**Step 3: Grant User Access to Slack**
1. Click **Manage** in "Grant users access to Slack automatically".
2. Choose **Auto create and connect Slack accounts** or **Use identity management tools**, then **Save**.
   - Auto create: users receive an email to set up their Slack accounts.
   - Identity management: mapping via Okta or SAML NameID.

---

### Option B — Manual Setup (Already Using Slack)

For admins who already have a Slack workspace.

**Permissions required:** Salesforce admin AND Slack Salesforce Admin system role

#### Step 1: Connect Slack and Salesforce

Your org may already be connected if previous Slack integrations were set up. If not:
1. See [Connect Salesforce and Slack](https://slack.com/intl/en-us/) in the Slack Help Center.
2. Choose user mapping method:
   - **Email** or **SAML NameID** — automatic mapping
   - No auto-mapping — users manually sign in to Slack when prompted

#### Step 2: Choose Supported Objects

1. From Setup, Quick Find → `Slack Channels for Records`.
2. Click **+ Add Objects** and select the objects to support Slack record channels.
3. Click **Add Objects** to finish.

> **Note** If your org previously used Salesforce Channels, your existing supported objects appear in the Slack Channels for Records page.

#### Step 3: Add the Channel Component to Record Pages

1. In Slack Channels for Records, under Record Pages, click the relevant page configuration.
2. Click **Edit** to open Lightning App Builder.
3. Drag the **Slack** component from the Components list to a location on the record page.
4. Click **Activation** to activate the record page.
5. Save your changes.

#### Remove Salesforce Channels from an Object

1. From Setup → `Slack Channels for Records`.
2. Under Record Pages, select an object type → click **Edit** next to the record page.
3. Locate the Slack channel component → click **Delete** icon → save.
4. Repeat for any additional record page configurations for that object.
5. From Slack Channels for Records, click the drop-down icon next to the object type → **Remove Object**.
6. Click **Remove Slack**.

---

## Path 2: Enable Salesforce for Slack Integrations

### Required Permissions

| Permission | Who Needs It |
|------------|-------------|
| `Connect Salesforce with Slack` | Every Slack user (system permission; must be on supported Salesforce license) |
| `Slack Sales User` | Sales Cloud for Slack users |
| `PRM for Slack app Salesforce User` | PAM users for PRM for Slack |
| `PRM for Slack Partner app User` | Partner users for PRM for Slack |
| `Connect Salesforce with Slack` + `Slack Service User` + `Run Flows` | Service Cloud for Slack users |
| `Connect Salesforce with Slack` | CRM Analytics for Slack (plus CRM Analytics-specific permissions) |

> **Important** Some user licenses don't support the `Connect Salesforce with Slack` system permission. If you try to assign the permission set and get an error, the user's license is incompatible.

> **Government Cloud Note:** Salesforce for Slack apps aren't supported in Government Cloud or Government Cloud Plus orgs.

### Enable Steps

1. From Setup, Quick Find → `Slack Apps` → select **Slack Apps Setup**.
2. In section 2, review and accept the terms and conditions.
3. In section 3, enable the applications you want to make available.
   > Some apps have an additional setup page under Specialized Slack Apps — complete those steps before returning here.
4. In section 4, set up required and recommended permissions for users.
   > Each Slack user, including the workspace owner adding apps, must be assigned a permission set with `Connect Salesforce with Slack`.
5. In section 5, set up users with object permissions to view and edit records in Slack. Configure **Record Detail Security** (see below). Optionally configure link unfurling options.
6. In section 6, install Slack apps from the Slack App Directory:
   a. Find the app in the Slack App Directory → click **Add to Slack**.
   b. Click **Connect** → log in to your Salesforce org/sandbox.
   c. Verify the correct workspace is listed → click **Allow**.
   d. Select the checkbox to agree to access conditions → click **Allow**.
7. In section 7, complete additional setup steps for your specific app.
8. (Optional) In section 8, customize which fields users can access in Slack.
9. Instruct users to add the app to their personal Slack sidebar and connect their Salesforce account.

### User: Add Apps in Personal Slack Sidebar

1. In the Slack sidebar, click **Apps** (or **More** → **Apps**).
2. Search for the Salesforce app and click to add it.
3. Follow the prompt to connect your account.
4. Enter Salesforce username and password → click **Log In**.
   - Or, if using a custom domain, click **Use Custom Domain** and enter `mycompany.my.salesforce.com`.
5. Select **I agree to allow Slack to access my Salesforce account** → click **Allow**.

---

## Record Detail Security

Controls how much data is visible in Slack notifications and record previews. Applies to Sales Cloud for Slack app.

From Setup → Quick Find → `Enable Slack for Salesforce`:

| Setting | What Slack Members See |
|---------|------------------------|
| **Show Object Type Only** | Object type + notification details only; record name hidden from non-Salesforce users — **most secure** |
| **Show Record Name and Object Type** | Record name, object type, and notification details visible to all channel members, including those without Salesforce access |

> **Security consideration:** Choose "Show Object Type Only" when you want to prevent data leakage to Slack users who don't have Salesforce access to the record.

---

## Disconnect Slack from Salesforce

### Disconnect a User's Account

Disconnects all Slack apps from the user's Salesforce account.

1. In Salesforce, click the user icon (upper right) → open the user profile menu.
2. Select **Settings**.
3. In the navigation panel, select **Slack User Mappings**.
4. Open the menu for the Slack user → select **Delete**.
5. In the confirmation box → **Delete**.

### Remove a Slack App from a Workspace

Removes all user mappings and Salesforce association with the app. Useful if you want to connect the app to a different org or reset mappings.

1. In Slack, on the About tab of the app, click **Configuration**.
2. In the Slack App Directory, select **Remove App**.
3. In the confirmation box → click **Remove App**.

---

## Salesforce Channels — End User Workflows

### Create or Join a Channel

1. Open a record.
2. In the Slack channel component, click **Join Channel**. If no channel exists yet, click **Create Channel**.

### Add Channel Members

1. From a record, click the **Manage Members** icon in the Slack channel header.
2. Click **Add people**.
3. Search for and select users. Select multiple for bulk add.
4. Click **Add People**.

### Communicate in a Salesforce Channel

- **Send a message:** Click the message field → type → press **Enter**.
- **Mention a teammate:** Enter `@` + member name → press **Enter**.
- **Start/reply to a thread:** Hover over a message → click **Reply in thread**.
- **React with emoji:** Hover over a message → click **Add reaction**.
- **Delete a message:** Hover → click **More actions** → **Delete message**.

> Message editing is not supported in Salesforce Channels at this time.

---

## Considerations for Salesforce Channels

- Only these user license types can use Salesforce Channels for internal collaboration:
  - Salesforce, Salesforce Platform Login, Lightning Platform - One App, Force.com - App Subscription, Company Community User
  - **External user licenses (e.g., Experience Cloud) are unsupported**
- The Slack channel component can only be added to **desktop record page configurations**
- **Avoid** adding both the Slack channel component and the swarming component to the same record type
- Access in **Salesforce** is controlled by record-level permissions
- Access in **Slack** is broader — channel members can see the channel even without Salesforce record access (security consideration)
