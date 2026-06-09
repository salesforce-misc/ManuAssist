# Guest and External Users

## External User Types Overview

| User Type | License Examples | Has Roles? | Sharing Mechanism |
|---|---|---|---|
| **Partner user** | Partner Community | Yes (up to 3 account roles) | OWD, role hierarchy, sharing rules, sharing sets, manual sharing |
| **Customer Community Plus** | Customer Community Plus | Yes (up to 3 account roles) | OWD, role hierarchy, sharing rules, sharing sets, manual sharing |
| **Customer Community (high-volume)** | Customer Community | No | Sharing sets, share groups only |
| **High Volume Customer Portal** | High Volume Customer Portal | No | Sharing sets, share groups only |
| **Authenticated Website** | Authenticated Website | No | Sharing sets, share groups only |
| **External Apps** | External Apps | No | Sharing sets, share groups only |
| **External Identity** | External Identity | No | Sharing sets, share groups only |
| **Guest user** | (none — unauthenticated) | No | Guest user sharing rules only (Read Only max) |

## Creating External Users

External users are created from **Contact records**, not independently.

1. Ensure the Account is enabled as a Partner Account (for partners):
   - Lightning: Action dropdown → **Enable as Partner**
   - Classic: **Manage External Account → Enable as Partner**
2. On the contact record → Action dropdown → **Enable Partner User** or **Enable Customer User**
3. Assign appropriate license (Partner Community / Customer Community / Customer Community Plus)
4. Assign appropriate profile and role

**Required permissions:**
- To create/edit external users: `Manage External Users` OR `Manage External Users (Limited)` (limited = only users you have Read/Write access to)
- To create/edit customer users: `Manage Customer Users` (requires account owner to have a role assigned)
- To log in as an external user: `Manage External Users` AND `Edit on Accounts` (unless you have a higher role)

### Considerations

- All Experience Cloud site users must have a Salesforce record (person account or contact linked to a business account)
- External users cannot directly log in to Salesforce — they must use an Experience Cloud site
- Cannot delete external users — deactivate instead
- A global search in the internal org won't find user records assigned to a site's network ID — create users in the internal org first and then link to a contact/site

### Account Role Optimization (ARO)

For high-volume Experience Cloud implementations with many accounts and few users per account, enable **Account Role Optimization** to minimize roles created. Fewer roles = better performance.

---

## High-Volume (HVU) External Users

High-volume users are designed for orgs with thousands to millions of external users. They have **no roles**, so role hierarchy and most sharing mechanisms do not apply.

**Licenses:** Customer Community, High Volume Customer Portal, Authenticated Website, External Apps, External Identity

### Sharing with High-Volume Users

Only two mechanisms work for HVUs:

#### Sharing Sets

A sharing set grants record access to HVUs based on matching a field on the record to a field on the user's account or contact.

Setup → Digital Experiences → Settings → Sharing Sets → New

- Select which **profiles** the sharing set applies to
- Select **objects** to share
- Configure **access mapping**: e.g., "Account field on the record must match the Account on the user's contact"
- Access level: Read Only or Read/Write

> Access granted via sharing set does **not** extend to users above the HVU in the role hierarchy (HVUs have no hierarchy).

#### Share Groups

A share group shares records **owned by** HVUs associated with a sharing set with a specified group of internal/external users. Members of the share group can access any records owned by HVUs in the associated sharing set — even for objects not in the sharing set itself.

### Super User Access for Partner/Customer Community Plus Users

Enable "super user access" on a portal user to allow them to view and edit all data owned by or accessible to users at their role level or below in the external account hierarchy.
- Grant sparingly — widespread data access
- Setup: contact record → Grant Portal Super User Access

---

## Guest Users

Guest users are unauthenticated visitors to public Experience Cloud sites.

Every Experience Cloud site automatically gets:
- A unique **guest user profile** (one per site)
- A unique **site guest user record** (one per site)

### Guest User Security Model (Post-Winter '21 enforcement — permanent)

The following policies are now permanent and **cannot be disabled**:

1. **Secure guest user record access** setting is ON by default and irrevocable
2. Guest users have org-wide defaults set to **Private** for all objects (cannot be changed)
3. Guest users **cannot** be added to queues or public groups
4. Guest users **cannot** receive records via manual sharing or Apex managed sharing
5. Guest users **can only** get record access via **guest user sharing rules** (Read Only maximum)
6. Guest users **cannot** have View All Records or Modify All Records permissions
7. Guest users **cannot** have Edit or Delete permissions
8. Guest users **cannot** be the owner of newly created records (Spring '25: this setting is permanent and on)
9. Guest users **cannot** be assigned the View All Users permission

### Guest User Sharing Rules

The ONLY mechanism to grant record access to guest users.

- A special type of criteria-based sharing rule
- Maximum access: **Read Only**
- Count toward the 50 criteria-based sharing rules per object limit
- Granting access means **anyone on the internet** can access matching records

> **⚠️ Warning:** Guest user sharing rules expose data to unauthenticated users. Always share the minimum data necessary.

### Configuring the Guest User Profile

Access: Experience Builder → Settings → General → Guest User Profile (or Setup → Digital Experiences → All Sites → Workspaces → Administration → Public Access Settings for Tabs+VF)

Key configuration tasks:
1. **Object permissions:** Set to most restrictive needed; recommend no access for almost all objects; if needed, set Read only
2. **Change Default Record Type** from Master to a specific record type for any accessible object
3. **Field-level security:** Review and remove access to fields with sensitive/PII data
4. **System permissions:** Review and disable all unnecessary permissions
   - Disable **View All Users** (already off for orgs created Winter '20+)
   - Disable **Run Flows** if flows aren't needed
   - Disable **API Enabled** unless required (Salesforce strongly recommends disabling this)
5. **Visualforce pages:** Remove all pages not needed for business processes; keep only login/error/auth flow pages
6. **Apex classes:** Restrict to REST/SOAP API use; Apex VF controllers don't need explicit access
7. **Permission sets/PSLs:** Ensure guest user isn't assigned any PS/PSG that grants View All, Modify All, Edit, or Delete (removed automatically by Salesforce with Winter '23 enforcement)

### Configuring the Site Guest User Record

- Access from guest user profile → Assigned Users → click site guest user record
- Email field: Use a verified org-wide email address to prevent email delivery failures (Salesforce blocks email from unverified addresses)
- Record ownership: Never let the guest user own records — configure default owner

### Record Ownership for Guest Users

When a guest user creates a record, it must be assigned to an active internal user (not the guest user).

1. Setup → Digital Experiences → All Sites → Workspaces → Administration → Preferences → select default user in record ownership lookup
2. In Spring '25: this is permanent and cannot be disabled

Best practices for guest record default owner:
- Create a queue as the owner rather than a single user
- Use assignment rules, triggers, or flows to re-route records after creation
- Never rely solely on the default owner field — set up automation

### Guest User Setup Checklist

Initial setup:
- [ ] Configure guest user access for site/pages
- [ ] Configure the guest user profile
- [ ] Create guest user sharing rules for any needed record access
- [ ] Configure guest user visibility (user sharing setting for the site)
- [ ] Assign records created by guest users to a default user/queue
- [ ] Review field-level security on all accessible objects
- [ ] Disable unneeded system permissions (API Enabled, View All Users, Run Flows)
- [ ] Remove unnecessary Visualforce pages and Apex class access
- [ ] Test with incognito window

Managing existing setup:
- [ ] Review guest user access report
- [ ] Reassign records owned by the guest user
- [ ] Remove guest users from any queues or public groups (legacy data)
- [ ] Remove records shared with guest users via manual/Apex sharing (legacy data)

---

## Experience Cloud Site Membership

Sites grant access to members via profiles and permission sets:

- Adding a **profile** to site membership grants access to all users with that profile
- Adding a **permission set** to site membership grants access to all users with that PS
- Cannot use permission set **groups** for site membership — only individual permission sets

> **Note:** If you add permissions to a PS that is already used for site membership, all site members with that PS get the new permissions. Check before adding permissions to shared PSs.

Setup: Experience Workspaces → Administration → Members → Add profiles/permission sets.

### Membership Processing Performance

For large sites:
- Processing >1M users can take hours; plan maintenance windows
- Governor limit: 10M users per transaction
- Removing profiles/PSs from a site takes longer than adding
- Add profiles/PSs in batches to minimize per-transaction processing time
- Test in sandbox with similar setup before deploying to production

---

## External User Best Practices

### Profiles and Permission Sets

- Use custom profiles for external users (not standard profiles from community licenses)
- Follow principle of least privilege — minimum permissions required
- Use permission sets / PSGs for external user permission management
- Use User Access Policies to automate assignments

### Record Access

- Keep external OWD at Private for all objects whenever possible
- Use sharing sets and share groups for HVUs — more performant and secure than sharing rules
- Use super user access sparingly (gives widespread account access)
- Keep track of which public groups/roles include external users; nested groups can unexpectedly include externals
- Use 1 account role (default) unless business requires more; more roles = worse performance

### User and PII Visibility

- Configure user sharing per site for external user visibility to each other
- Hide user fields containing PII using field-level security

### Auditing

- Review access summaries periodically — pick a representative user of each persona
- Review public group membership for external users
- Use the Guest User Sharing Rule Access report (Setup → Digital Experiences → Workspaces → Administration)

---

## Site User Visibility Settings

### Control Which Users Experience Cloud Site Users Can See

Configure per site: whether external users can see only themselves, only other members of the same account, or all site members.

Setup: Digital Experiences → Workspaces → Administration → Preferences → "Let members see other members of this site" (for authenticated users)

### Guest Users Seeing Other Members

- "Let guest users see other members of this site" setting: disabling means guests can't see user/topic feeds
- View All Users permission is off by default on guest profiles (Winter '20+ orgs)

---

## Contactless Users

External users without an associated Contact record. Useful when you don't need to track contact information for customers/partners — reduces sync overhead between user and contact records.

Enable in Setup → Digital Experiences → Settings → "Enable Contactless Users"
