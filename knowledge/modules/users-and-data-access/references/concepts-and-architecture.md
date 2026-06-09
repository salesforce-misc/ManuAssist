# Concepts and Architecture: Salesforce Data Access Model

## The Layered Security Model

Salesforce data security is a layered system. **Each layer can only open access beyond the previous layer — except restriction rules, which can close access.**

```
┌─────────────────────────────────────────────────────────┐
│  Object & Field Permissions (Profiles + Permission Sets) │  ← Who can see/edit which objects and fields?
├─────────────────────────────────────────────────────────┤
│  OWD (Org-Wide Defaults)                                 │  ← Baseline: most restrictive access level
├─────────────────────────────────────────────────────────┤
│  Role Hierarchy                                          │  ← Opens access vertically (managers see subordinates' records)
├─────────────────────────────────────────────────────────┤
│  Sharing Rules                                           │  ← Opens access laterally (between groups/roles)
├─────────────────────────────────────────────────────────┤
│  Manual Sharing / Apex Sharing / Teams / Queues          │  ← Opens access on specific records flexibly
├─────────────────────────────────────────────────────────┤
│  Restriction Rules (ORTHOGONAL)                          │  ← Can REDUCE access regardless of above layers
└─────────────────────────────────────────────────────────┘
```

> **Critical rule:** Permissions are **additive**. If a permission is not enabled in a user's profile but is enabled in an assigned permission set, the user has the permission. You cannot "deny" a permission — to revoke it, you must remove **all** sources granting it.

## Three Dimensions of Access Control

### 1. Object-Level Security (Object Permissions)

Controls whether a user can see, create, edit, or delete any instance of a specific object type.

Configured in **profiles** and **permission sets**.

| Permission | What it allows | Respects sharing? |
|---|---|---|
| Read | View records | Yes |
| Create | Create and read records | Yes |
| Edit | Read and update records | Yes |
| Delete | Read, edit, and delete records | Yes |
| View All Records | View ALL records of this object regardless of sharing | **Overrides** sharing |
| Modify All Records | Read, edit, delete, transfer, approve ALL records | **Overrides** sharing |
| View All Fields | View all fields regardless of FLS | Respects sharing |

> **Note:** View All Data / Modify All Data (user-level permissions) override sharing for ALL objects — but do NOT override field-level security. Users still need field permissions.

### 2. Field-Level Security (Field Permissions)

Controls whether a user can see or edit a specific field on an object.

Configured in **profiles** and **permission sets**. **Most restrictive setting always wins** — page layouts can't expose a field that FLS hides.

| Access Level | Enhanced Profile/PS UI | Original Profile UI |
|---|---|---|
| Read and Edit | Read + Edit | Visible |
| Read-only | Read | Visible + Read-Only |
| Hidden | (none) | (none) |

Field permissions apply everywhere: list views, reports, related lists, search results, Connect Offline, APIs, email templates.

> **Gotcha:** Formula fields and roll-up summaries are read-only on edit pages regardless of FLS. Universally required fields appear regardless of page layout FLS.

### 3. Record-Level Security (Sharing)

After object/field permissions grant access to an object, record-level security controls which specific records the user can see.

#### Organization-Wide Defaults (OWD)
The baseline — most restrictive access level org-wide. You "lock the data down" to OWD, then selectively open it up.

Available access levels:
- **Private** — only record owner and users above in hierarchy
- **Public Read Only** — all users can read, only owner (and hierarchy) can edit
- **Public Read/Write** — all users can read and edit
- **Public Read/Write/Transfer** — available for leads and cases; all users can transfer
- **Controlled by Parent** — access determined by parent record's access
- **Public Full Access** — available for campaigns

> **External OWD** — organizations with Experience Cloud can set a separate (more restrictive or equal) OWD for external users.

#### Role Hierarchy

- Defines data access levels by organizational position, not just reporting structure
- Users **higher** in the hierarchy always have the same access as users below them
- Applies to records **owned by** or **accessible to** subordinates
- Can be disabled per custom object using **"Grant Access Using Hierarchies"** setting
- Does NOT apply to high-volume Experience Cloud users

#### Sharing Rules

Automatic exceptions to OWD for groups of users. Can **only open access**, never restrict below OWD.

Types:
1. **Owner-based** — shares records owned by members of a group/role with another group/role
2. **Criteria-based** — shares records matching field-value criteria with a group/role
3. **Guest user sharing rules** — only mechanism to grant record access to unauthenticated users; Read Only access maximum

Limits: **300 total per object**, including up to **50 criteria-based or guest user sharing rules** per object.

#### Manual Sharing

Record owners (or users above them in hierarchy, or admins) can manually share individual records with specific users or groups. Not automated. Removed when record ownership changes.

#### Apex Managed Sharing

Programmatic sharing for custom objects. Persists across ownership changes. Requires **Modify All Data** permission to add/change. Use for complex access logic not achievable by other means.

#### Restriction Rules

**Unlike all other sharing tools, restriction rules CAN reduce access.** When applied, users can only see records matching the rule's criteria — even if other sharing mechanisms would otherwise grant broader access.

- Available for: custom objects, accounts, cases, contacts, events, leads, opportunities, tasks, and some standard objects
- Available in: Enterprise, Performance, Unlimited, Developer Editions
- Configure in Object Manager → Restriction Rules
- Limits: Enterprise = 2 active rules/object; Performance/Unlimited = 5 active rules/object

#### Scoping Rules

**Do NOT restrict access** — they filter what users SEE in list views, reports, and SOQL queries by default. Users can still access all records they're entitled to; scoping just narrows the default view.

- Available in: Performance, Unlimited, Developer Editions
- Up to 2 active rules/object (Developer) or 5 active rules/object (Performance/Unlimited)
- Users can override scope with "Filter by Scope" in list views/reports

## Comparing Security Models

| | Sharing-Based (Read/Edit/Delete) | Override-Based (View All / Modify All) |
|---|---|---|
| Target audience | End-users | Delegated data administrators |
| Record access | Varies by sharing config | All records unconditionally |
| Ability to transfer records | Respects sharing settings | Yes (Modify All) |
| Reporting on all records | Only with sharing rule on "Entire Organization" | Yes (View All) |
| FLS respected? | Yes | Yes — FLS always applies |
| External users? | Yes | No — View All/Modify All can't be assigned to external users |

## Additional Access Features

| Feature | Description |
|---|---|
| Account Teams | Add team members to accounts; specify per-member access level |
| Opportunity Teams | Same pattern for opportunities; supports opportunity splits |
| Case Teams | Groups working together on a case |
| Queues | Manage and assign records to teams; members (and hierarchy above) can take ownership |
| Enterprise Territory Management | Record access and ownership by geographic territories |
| Folder Sharing | For reports, dashboards, documents, email templates |
| Apex Sharing | Custom programmatic sharing for complex scenarios |
| Sharing Sets | For high-volume Experience Cloud users — grants access to records related to user's account/contact |
| Share Groups | For sharing records owned by high-volume users with other users |

## User Sharing

Controls whether a user record is visible to other users. Set via OWD for the User object:
- **Private** — users see only themselves and users they manage
- **Public Read Only** — all users can see all user records (default in most orgs)

User sharing rules can be created based on group membership.

External user visibility: controlled per site via "Let guest users see other members of this site" and "Control Which Users Experience Cloud Site Users Can See."
