# Users and Licenses

## User Types

| User Type | Description |
|---|---|
| **Internal users** | Employees who log in directly to Salesforce (org UI or API) |
| **External users** | Partners/customers who log in via Experience Cloud sites |
| **High-volume users** | External users designed for millions of concurrent users; no roles |
| **Guest users** | Unauthenticated visitors to public Experience Cloud sites |
| **Automated Process user** | System user for certain async operations; cannot be deactivated |
| **Integration users** | Dedicated users for API integrations; also cannot be deactivated |

## User Lifecycle

### Creating Users

**One at a time:**
1. Setup → Users → New User
2. Required: First/Last Name, Email, unique Username (email format), User License, Profile
3. Optionally: Role (required in most Enterprise+ for record sharing), check "Generate new password and notify user immediately"

**Multiple users (up to 10):**
Setup → Users → Add Multiple Users → select license → fill rows → Save

**Required permission:** `Manage Internal Users`

> **Username rules:**
> - Must be unique across **all** Salesforce orgs including sandboxes and trials
> - Format: email address (e.g., jane@company.com)
> - The email in username does NOT need to be functional or match the account email
> - Salesforce Support **cannot** change usernames or deactivate users — admin must do this
> - Account verification link expires after **7 days**; new users must change password on first login

### Editing Users

- Change profile, role, contact info: Setup → Users → Edit next to user
- Changing license shows only licenses with remaining seats
- Changing a username sends a confirmation to the associated email; change can take **up to 24 hours** to replicate across servers

### Deactivating Users

You cannot delete users — only deactivate them. Deactivation:
- Removes login access
- Preserves all historical records and activity
- User remains in lists as inactive
- User's records remain owned by them until transferred
- Does NOT free up license billing (still billed until license count is changed)

**Deactivation is blocked when the user is:**
- Default owner of leads
- Default or automated case owner
- Default lead creator or owner
- Default workflow user
- Recipient of a workflow email alert
- Selected in a custom hierarchy field
- A customer portal administrator

**Solution:** Freeze the account first (prevents login), then resolve each dependency, then deactivate.

> **Performance warning:** If user has >10,000 manually shared account records, delete those shares via Bulk API BEFORE deactivating to avoid performance issues.

### Freezing Users

- Immediately blocks login without requiring dependency resolution
- Does **not** free up user licenses
- Use when you need immediate access revocation while pending deactivation
- Permission needed: `Freeze Users` OR `Manage Users`

### Unlocking Users

Users are locked out after too many failed login attempts. The Failed Login Attempts field shows the count.
- Setup → Users → select locked user → Click **Unlock**
- Set maximum failed attempts in Password Policies

### Deactivation Considerations

| Area | What happens |
|---|---|
| Public groups & default teams | User remains in groups and default account/sales teams |
| Chatter | Profile remains visible as inactive; Chatter group ownership remains until admin reassigns |
| Salesforce Files | Files owned by deactivated user remain; deactivated user is file owner until admin reassigns |
| Enterprise Territory Management | User removed from territory assignments |
| Account/Opportunity Teams | User removed from other users' default teams; team access reverts to Read Only on reactivation |
| Lightning dashboards | Dashboard doesn't return correct results if user is owner or running user — change owner |
| CRM Analytics | Scheduled dataflows are deleted if user is the scheduler |
| Permission sets | Inactive users retain PS assignments — recommended to remove them; some standard PSs can't be added to PSGs for inactive users |
| Record access | Deactivated user loses manually shared record access; users higher in hierarchy also lose access asynchronously |
| Process Builder | Processes can't update records owned by inactive users — transfer records before deactivating |

### Mass Transfer Records

Setup → Mass Transfer Records → select object type → specify from/to user → find → select records → Transfer.

- Limit: 250 records at a time; use Data Loader for larger volumes
- For accounts: optionally transfer open/closed opps, open/closed cases; keep/remove account/opportunity teams
- When ownership changes: previous manual shares, Apex shares, and sharing rules are removed; new sharing rules apply based on new owner

## User Fields Reference

Key fields on the User record:

| Field | Notes |
|---|---|
| **Username** | Unique across all orgs; email format |
| **Active** | Enables/disables login |
| **User License** | Determines available profiles and features |
| **Profile** | Base-level permissions; one per user |
| **Role** | Record-level access position in hierarchy; not available in Group/Personal/Contact Manager |
| **Federation ID** | For federated SSO |
| **Manager** | Hierarchical relationship field; unlike other hierarchy fields, inactive users can be referenced |
| **Flow User** | Grants ability to run flows; requires Manage Flow permission to enable |
| **Mobile** | Used for SMS device activation |
| **Temporary Verification Code** | Admin-generated for MFA recovery |

## Licenses Overview

### User Licenses

Every user must have exactly one user license. It determines which features and profiles are available.

Common internal user licenses:
- **Salesforce** — full CRM functionality
- **Salesforce Platform** — custom apps only; no Campaigns, Forecasts
- **Lightning Platform** — limited API/custom app access
- **Chatter Free** / **Chatter Only** — Chatter access with limited CRM

Common external licenses:
- **Partner Community** — full B2B portal access (has roles)
- **Customer Community Plus** — read/write access with roles
- **Customer Community** — high-volume, no roles
- **High Volume Customer Portal** — high-volume, no roles
- **Authenticated Website** — high-volume, no roles
- **External Apps** — high-volume, no roles
- **External Identity** — for identity management

### Permission Set Licenses (PSL)

PSLs enable specific features without requiring a new user license. Assigned to users; then standard permission sets associated with that PSL can be assigned.

### Feature Licenses

Enable specific functionality like Marketing User, Knowledge User, Salesforce CRM Content User. Set on the user record as checkboxes.

### Licensing Events

Licensing events (provisioning, changes) can delay org request processing. Use **Licensing Events** (Setup) to set blockout periods for your busiest times, preventing licensing events from occurring during them.

## User Management Settings

Setup → User Management Settings. Key settings:

| Setting | Effect |
|---|---|
| Enhanced User List View | Enables dynamic lists and inline editing for user records |
| Field-Level Security for Permission Sets during Field Creation | Routes FLS setup to permission sets instead of profiles when creating fields |
| Permission Set & Permission Set Group Assignments with Expiration Dates | Enables expiration dates on PS/PSG assignments |

## User Visibility and Sharing

**User Sharing** controls visibility of User records. If OWD for Users is Private:
- `View All Users` permission: grants Read access to all users org-wide (admins get this automatically)
- User sharing rules: owner-based or criteria-based, can be based on group membership
- External users: visibility controlled per-site

## User Access Summary

Setup → Users → select user → **View Summary**. Shows:
- User details (from profile page layout)
- All assigned permissions: User Permissions, Object Permissions, Field Permissions, Custom Permissions, Tabs
- Click any permission's row-level action → **Access Granted By** to see which profile/PS/PSG grants it

Also allows managing permission set, PSG, public group, and queue assignments.

## Delegate Administration

**Delegate Administrators:** Non-admin users who can manage a subset of users.
- Can create/edit users in specified profiles
- Can assign specified permission sets
- Can reset passwords for managed users
- Configure in Setup → Delegated Administration

**External user delegation:** You can delegate site administration to trusted partner/customer users.

## User Email Domain Allowlist

Setup → Allowed Email Domains → New Allowed Email Domain.
- Restricts which email domain(s) users can have in their Email field
- New users must match an allowed domain
- Existing users: compliant on next edit
- Does NOT apply to external (Experience Cloud/portal/Chatter External) users
