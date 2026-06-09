# Profiles and Permission Sets

## The Core Distinction

| Feature | Profiles | Permission Sets |
|---|---|---|
| Assignment | One per user | Multiple per user |
| Purpose | Default settings + baseline access | Additive permissions (recommended for all access control) |
| Recommended for | Page layouts, login hours/IP ranges, default apps/record types | All object, field, user, and custom permissions |
| Can restrict access? | No — cannot deny permissions granted elsewhere | No — same rule |

> **Salesforce recommendation:** Use **Minimum Access - Salesforce** profile (or clone) for almost all users. Manage all permissions via permission sets and permission set groups. Profiles are for default settings only.

## Profiles

### What Profiles Control

Configure these in profiles:
- **Assigned apps** (default)
- **Record types and page layouts** (via Object Settings)
- **Login hours** — hours during which users can log in
- **Login IP ranges** — allowed IP addresses for login
- **Session settings** — timeout, High Assurance requirement
- **Password policies** (per-profile overrides)

> Also configurable in profiles but **recommended to move to permission sets:** object permissions, field permissions, user permissions (app/system), custom permissions, Apex class access, Visualforce access.

### Standard Profiles

Pre-built by Salesforce. Standard object permissions on standard profiles **cannot be edited** (as of Winter '21). You can still configure custom object permissions.

Common standard profiles:
- **System Administrator** — full access; Modify All Data, View All Data
- **Standard User** — standard CRM access
- **Read Only** — view-only access to most objects
- **Minimum Access - Salesforce** — minimal permissions; intended as base for permission-set-led model
- **Chatter Free User** / **Chatter External User** — Chatter-only licenses

### Custom Profiles

Clones of standard profiles with modifications. Can configure object permissions, field permissions, user permissions, etc. (But prefer permission sets for permissions.)

### Profile Session Settings

Per-profile overrides of org-wide session settings. Available in enhanced profile UI:
- **Session Times Out After** — idle timeout value; community license max is 24 hours (External Identity/HVCP up to 7 days)
- **Session Security Level Required at Login** — set to "High Assurance" to require MFA at login
- **Separate Experience Cloud site and Salesforce login authentication for employees** — allows different login policies for site vs org
- **Relax login IP restrictions** — ignore IP ranges for this profile
- **Skip employee device activation during Experience Cloud site login**
- **Enable device activation for customers** — community profiles; requires verification from unknown browser/IP
- **Keep users logged in when they close the browser** — only External Identity/HVCP licenses

### Migrating from Profiles to Permission Sets

1. **Plan:** Identify personas, list tasks per persona, map required permissions per task
2. **Create permission sets** for each task/job; use clear naming (e.g., "Create, View, and Edit Cases")
3. **Create permission set groups** per persona, bundling the relevant permission sets
4. **Use User Access Policies** to bulk-assign PSGs to users matching criteria (e.g., all active users with Support Rep profile)
5. **Clean up profiles:** Assign users to Minimum Access profile; remove unnecessary permissions from existing profiles
6. **Enable** Field-Level Security for Permission Sets during Field Creation (User Management Settings)

---

## Permission Sets

A permission set is a reusable collection of settings and permissions that extends access without changing profiles.

### Key Behaviors

- Users can have **multiple** permission sets (unlike profiles: one per user)
- Permissions are **additive**: if a permission isn't in the profile but is in a PS, the user has it
- Cannot deny/revoke a permission — must remove all sources granting it
- Permission sets can be included in permission set groups

### Types of Permission Sets

| Type | Description |
|---|---|
| **Custom** | Created by your org; editable |
| **Standard** | Pre-built by Salesforce for a specific PSL feature; not editable; don't count against org limits |
| **Integration** | Pre-built for Salesforce integration services; varies in editability |
| **Session-based** | Activated only during a specific user session (see below) |
| **Muting** | Used inside PSGs to remove permissions from a PS without modifying the PS itself |

### Session-Based Permission Sets

Grants permissions only while a specific session condition is active.

- Requires `Session Activation Required` checked on the PS
- Activate via REST/SOAP API (`SessionPermSetActivation` object) or via Flow (`Activate Session-Based Permission Set` core action)
- Deactivates when session ends or `Deactivate Session-Based Permission Set` action runs
- Cannot run async operations (e.g., custom metadata deployment) in session-based PS
- Permission to activate: `Manage Session Permission Set Activation`
- Assignment-required PSs appear on user detail page under **"Permission Set Assignments: Activation Required"**

### Permission Set Assignments and Expiration

Enable **Permission Set & Permission Set Group Assignments with Expiration Dates** in User Management Settings to allow assignment expiration dates. Useful for temporary project access.

---

## Permission Set Groups (PSGs)

A PSG bundles multiple permission sets for a persona. Users get all permissions from all included permission sets (minus any muted permissions).

### Muting Permission Sets

A special type of PS inside a PSG that **removes specific permissions** from the group without modifying the underlying permission sets.

Example: PSG includes "View and Edit Accounts" PS, but you don't want IT Help Desk to see Account Revenue field. Create a muting PS in the PSG that mutes the Read Access for Account Revenue. Other PSGs that use the same "View and Edit Accounts" PS are unaffected.

---

## User Access Policies

Automated rules to grant or revoke permission set/PSG access based on user criteria.

- Available in: Enterprise and Unlimited Editions
- Permission needed: `Manage User Access Policies`
- Can target by: Profile, Active status, Role, and other user fields
- Actions: Grant or Revoke a Permission Set or Permission Set Group

Use case: When migrating profiles → PSGs, create a policy to assign the new PSG to all active users with the old profile in one operation.

---

## Object Permissions Reference

| Permission | Respects Sharing? | Notes |
|---|---|---|
| Read | Yes | View records |
| Create | Yes | Create and read |
| Edit | Yes | Read and update |
| Delete | Yes | Read, edit, delete |
| View All Records | **Overrides** | All records of this object |
| Modify All Records | **Overrides** | All records; transfer, approve, unlock in approval processes |
| View All Fields | Respects sharing | All fields regardless of FLS (still subject to record sharing) |

**Parent-child permission dependencies:**
- If child has Modify All or View All Records → parent gets View All Records automatically
- If child has View All or Read → parent gets Read automatically

**View All vs Modify All vs View All Data:**
- View All Records / Modify All Records = object-specific
- View All Data / Modify All Data = all objects (but NOT all fields — FLS still applies)
- Cannot assign View All Data / Modify All Data to external users

---

## Field-Level Security (FLS)

### What FLS Controls

- Whether a field is visible, read-only, or hidden for a user
- Applies everywhere: detail pages, edit pages, list views, related lists, reports, APIs, search results
- **Most restrictive setting wins** between FLS and page layout

### Setting FLS

1. Object Manager → Object → Fields & Relationships → Field → **Set Field-Level Security**
2. Or in permission set / profile: find object → configure Field Permissions

> **Tip:** Enable **Field-Level Security for Permission Sets during Field Creation** (User Management Settings) to route FLS to permission sets when creating fields — avoids adding FLS to profiles.

### FLS Interaction with Other Settings

| Interaction | Behavior |
|---|---|
| FLS hidden + page layout shows field | FLS wins — field is hidden |
| FLS read-only + page layout editable | FLS wins — field is read-only |
| FLS editable + page layout required | FLS wins — field is editable (not required) unless universally required |
| Universally required field | Always shown regardless of FLS |
| View All Data / Modify All Data | Do NOT override FLS — users still need field permissions |

---

## Custom Permissions

Use custom permissions to gate access to custom processes or apps. Configured in:
- Profiles: Enabled Custom Permissions section
- Permission sets: Custom Permissions section

Custom permissions can also be used as criteria in sharing rules, scoping rules, and restriction rules.

---

## Permission Dependencies and Alignment

When you save a profile or permission set, Salesforce evaluates dependent permissions and may auto-enable required ones. Examples:
- Enabling "Customize Application" also enables "View Setup and Configuration"
- Enabling child object "Modify All Records" enables parent object "View All Records"

---

## Guidelines for Creating Permission Sets and PSGs

1. **Use Minimum Access - Salesforce profile** as the base for all users
2. **Create task-based permission sets** — name clearly: "Create, View, and Edit Cases"
3. **Bundle into PSGs** by persona — "IT Help Desk Team Member" = View/Edit Accounts + View/Edit Contacts + Create/View/Edit Cases + Create/Manage Reports
4. **Reuse permission sets** across multiple PSGs for overlapping tasks
5. **Use muting PSs** to remove specific permissions from a PSG without editing the underlying PS
6. **Use expiration dates** for temporary access
7. **Use User Access Policies** for bulk migration and assignment automation

---

## View and Manage Permissions

### User Access Summary
Setup → Users → select user → **View Summary**
- Object Permissions tab, Field Permissions tab, User Permissions tab, Custom Permissions tab, Tabs tab
- Click permission row → **Access Granted By** → see which profile/PS/PSG grants it

### Permission Set Summary
Setup → Permission Sets → select PS → **View Summary**
- See all enabled permissions, which PSGs it's in
- Edit permissions; add/remove from PSGs

### Object Access in Object Manager
Object Manager → Object → **Object Access**
- See all PSs, PSGs, and profiles with permissions on this object
- Edit access for custom PSs and profiles

### Permission Set List Views
Create list views with filters like "Modify All Data equals True" to find overly permissive permission sets. Edit permissions in up to 200 permission sets from list view.

---

## Permission Set Considerations

- Cannot delete a profile that is the profile of an active user
- Cannot delete a PS or profile that is assigned to a site's membership (remove from site first)
- Inactive users retain PS assignments — recommended to clean up after deactivation
- Standard PSs don't count against org PS limits; clones do
- If org has >500 custom objects and you search object settings in a profile, they don't load — use "Object Settings" link instead
