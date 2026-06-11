# Record Access and Sharing

## Organization-Wide Defaults (OWD)

OWD sets the **baseline access level** for every object. This is the most restrictive access any user can have to object records they don't own. You lock data down to OWD, then selectively open it up with hierarchy/sharing rules.

### OWD Access Levels

| Level | Who can access |
|---|---|
| **Private** | Only record owner + users above in role hierarchy |
| **Public Read Only** | All users can read; only owner (and above in hierarchy) can edit |
| **Public Read/Write** | All users can read and edit |
| **Public Read/Write/Transfer** | Leads and cases only; all users can transfer ownership |
| **Controlled by Parent** | Access determined by the parent object's access |
| **Public Full Access** | Campaigns only; all users can view, edit, transfer, delete, and share |

### Internal vs External OWD

Organizations with Experience Cloud can set a **separate, more restrictive OWD for external users** (experience/portal users). The external OWD must be equal to or more restrictive than the internal OWD.

External defaults appear as a second column on the Sharing Settings page.

### Changing OWD

Setup → Sharing Settings. After changes, a **sharing recalculation** runs — can take time for large orgs. To defer calculations during large changes, use **Defer Sharing Calculations** then recalculate later.

### OWD for Activities

Activities (Tasks, Events) are "Controlled by Parent" by default — access flows from the parent record.

---

## Role Hierarchy

Defines data access by organizational position. Users higher in the hierarchy automatically see records owned by — or accessible to — users below them.

### Key Behaviors

- Role hierarchy grants access based on the **full transitive chain** (not just immediate manager)
- Access follows both **ownership** and **any sharing** the subordinate has
- Can be disabled per **custom object** only, via "Grant Access Using Hierarchies" setting on the object
  - Standard objects (Account, Contact, Opportunity, etc.) always use hierarchy
- High-volume Experience Cloud users have **no roles** — hierarchy does not apply to them

### Role vs Profile/Permission Set

> **Common confusion:** Profiles and permission sets control **what a user can do** (object/field permissions). Roles control **which records a user can see** (record-level access). They are orthogonal.

### Role Assignment

- Assign via user record Role field
- User's role determines which users above them inherit access to their records
- Empty role: user effectively has no manager in the hierarchy (peers with no role cannot see each other's records unless OWD or sharing rules allow)
- Role hierarchy also applies to sharing rule targets (roles, roles and subordinates)

### Public Groups and Queues

**Public Groups** are manually created collections of users, roles, roles-and-subordinates, or other public groups. Used as targets for sharing rules, manual sharing, and queue membership.

**Queues** manage and assign records to teams. Queue members (and users above them in role hierarchy) can access queued records. Available for: cases, leads, orders, contact requests, custom objects, service contracts, knowledge articles.

---

## Sharing Rules

Sharing rules make **automatic exceptions to OWD** for specified groups of users. They can **only open access**, never restrict below OWD.

### When to Use Sharing Rules

When a set of users needs consistent access to records they don't own, and role hierarchy alone doesn't grant that access.

### Types of Sharing Rules

#### 1. Owner-Based Sharing Rules

Opens access to records **owned by** certain users.

Setup → Sharing Settings → Sharing Rules related list → New → "Based on record owner"

- Select "Owned by members of": choose category + group/role
- Select "Share with": choose category + group/role
- Select access level: Read Only or Read/Write (Full Access for campaigns only)

**Sharing Rule Categories for "Owned by" / "Share with" fields:**

| Category | Description |
|---|---|
| Roles | A specific role |
| Roles and Subordinates | A role + all roles below it in hierarchy |
| Roles, Internal and Portal Subordinates | Role + internal and portal subordinate roles |
| Portal Roles | External roles only |
| Portal Roles and Subordinates | External role + subordinates |
| Public Groups | A named public group |
| Queues | A named queue |
| Users | A specific individual user |

> Note: Cannot include high-volume Experience Cloud users in sharing rules (they have no roles, can't be in public groups).

#### 2. Criteria-Based Sharing Rules

Opens access to records **matching field values**, regardless of ownership.

Setup → Sharing Settings → Sharing Rules related list → New → "Based on criteria"

**Supported field types for criteria:**
Auto Number, Checkbox, Date, Date/Time, Email, Lookup Relationship (to user/queue ID), Number, Percent, Phone, Picklist, Text, Text Area, URL

> **Critical gotcha:** Text and Text Area fields are **case-sensitive** in criteria. "Manager" ≠ "manager".

- Value criteria limited to 240 characters (longer values are truncated)
- To use an unsupported field type: create a workflow/trigger to copy value to a supported field type, then use that
- Can optionally include records owned by users who can't have roles (e.g., high-volume users, system users)

#### 3. Guest User Sharing Rules

The **only** mechanism to grant record access to unauthenticated guest users.

- Grant **Read Only** access maximum
- A special type of criteria-based sharing rule
- Creates immediate, unlimited access to ALL matching records for ANYONE (not logged in)
- Count toward the 50 criteria-based sharing rule limit per object

> **⚠️ Security Warning:** Guest user sharing rules grant access to anyone on the internet matching the criteria. Implement with extreme caution and minimal data exposure.

#### 4. User Sharing Rules (for User object)

Share User records based on group membership.

### Sharing Rule Limits

- **300 total sharing rules per object**
- **50 criteria-based or guest user sharing rules** per object (within the 300 total)

### After Modifying Sharing Rules

Sharing recalculation runs automatically. For large-scale updates, consider **Defer Sharing Calculations** (Setup → Sharing Settings) to batch the recalculation during off-peak hours.

---

## Manual Sharing

Record owners (and users above them in the hierarchy, and admins) can share specific records one at a time.

- Access the **Sharing** button on any record detail page
- Grant: Read Only or Read/Write to specific users, groups, roles, or territories
- **Removed when the record owner changes** (unless the new owner or admin re-shares)
- Cannot be used for guest users (as of Winter '21 enforcement)

---

## Apex Managed Sharing

Programmatic sharing for custom objects using Apex code.

- Requires **Modify All Data** permission to add/change custom object sharing
- **Persists across record owner changes** (unlike manual sharing)
- Uses `[ObjectName]Share` object with `RowCause` of a custom Apex sharing reason
- Use when: sharing requirements are too complex for rules, or integrating external access systems, or managing very large sharing volumes

---

## Restriction Rules

**Unlike all other sharing tools, restriction rules reduce access.** Users can only see records matching the rule's criteria, even if other sharing mechanisms would normally grant broader access.

### Key Facts

- Available for: custom objects, accounts, cases, contacts, events, leads, opportunities, tasks, and external objects
- Available in: Enterprise, Performance, Unlimited, Developer Editions
- Configured in: Object Manager → [Object] → Restriction Rules
- Limits: 2 active rules/object (Developer), 5 active rules/object (Performance/Unlimited)

### Rule Structure

Every restriction rule has two parts:
- **User Criteria**: which users the rule applies to (by profile, role, custom permission, etc.)
- **Record Criteria**: which records the user is allowed to see (by field values)

When both user criteria and record criteria are met, the user can ONLY see records matching the record criteria.

### Supported Data Types in Criteria

boolean, date, dateTime, double, int, reference, string, time, single picklist

Comma-separated string or ID values supported for multiple values. Use double-quotes to escape commas in values.

### External Objects

- Only OData 2.0, OData 4.0, and Cross-Org adapter external objects support restriction rules
- Editing/deleting a restriction rule on external objects causes extra DB calls (can increase billing)

### Performance

- Use indexed fields only — especially in record criteria
- For large data volumes: test by running the record criteria as a SOQL query; if fast, the rule is likely efficient
- Work with Salesforce Support to get fields indexed if needed

### Example: Allow Only Records Owned by Same Role

| Criteria | Field | Operator | Type | Value |
|---|---|---|---|---|
| User Criteria | [$User].IsActive | Equals | Boolean | True |
| Record Criteria | [Event].Owner:User.UserRoleId | Equals | Current User | $User.UserRoleId |

### Gotchas

- Only ONE active restriction or scoping rule should apply to a given user per object — Salesforce doesn't validate this; if two rules apply, only one is observed
- Deleting custom fields referenced in rules → error
- If IDs in rule are org-specific, update them when deploying between sandboxes/production

---

## Scoping Rules

Scoping rules **filter what users see by default** in list views, reports, and SOQL — but do NOT restrict actual record access. Users can still open and report on all accessible records.

### Key Facts

- Available in: Performance, Unlimited, Developer Editions
- Objects: custom objects, accounts, cases, contacts, events, leads, opportunities, tasks
- Limits: 2 active rules/object (Developer), 5 active rules/object (Performance/Unlimited)
- "Filter by Scope" in list views/reports applies the scoping rule filter

### vs Restriction Rules

| | Restriction Rules | Scoping Rules |
|---|---|---|
| Reduces record access? | **Yes** | No |
| Reduces default view? | Yes | Yes |
| User can override? | No | Yes (via "Filter by Scope" toggle) |
| Editions | Enterprise+ | Performance/Unlimited+ |

### Creating a Scoping Rule

Object Manager → [Object] → Scoping Rule → New Rule. Same criteria structure as restriction rules.

### Using SOQL with Scoping Rules

- `USING SCOPE scopingrule` applies the rule in SOQL
- `USING SCOPE EVERYTHING` bypasses scoping rules
- The SOQL operator in record criteria requires `USING SCOPE EVERYTHING` in nested SELECT

---

## Who Has Access to a Record?

In Lightning Experience: **Action Menu → Sharing Hierarchy** on the record → View next to a user's name to see all sharing reasons.

In Salesforce Classic: **Sharing** button on record → Expand List → Why? next to user.

### Sharing Reason Categories

| Reason | Mechanism |
|---|---|
| Owner | Record owner or queue member/hierarchy above |
| Manual Sharing | Sharing button used |
| Account Sharing Rule | Admin-created account sharing rule |
| Case Sharing Rule | Admin-created case sharing rule |
| *(object)* Guest Sharing Rule | Guest user sharing rule |
| Account Team / Sales Team / Portal Share Group | Team or share group membership |
| Associated Record Owner or Sharing | Implicit access from parent/child record |
| Role Above Owner (Portal Only) | Portal hierarchy |
| Administrator | View All Data / Modify All Data / View All Records / Modify All Records |
| Group Member | Public group membership |

> If multiple sharing reasons apply, only the most permissive access level is shown.

### Account-Specific Access Sources

A user can access an account via:
1. Record ownership
2. Implicit access from child record (case, contact, opportunity) → grants Read on parent account
3. OWD (if Public Read Only or Public Read/Write)
4. Role hierarchy
5. Sharing rules
6. Manual sharing
7. Account team or territory membership

---

## Performance Best Practices for Sharing

- Design role hierarchy to match business data access needs, not the org chart
- Keep number of roles minimal — more roles = more sharing calculation work
- For criteria-based sharing rules: use indexed fields in criteria
- Defer sharing calculations during large OWD or sharing rule changes
- For high-volume user scenarios: prefer sharing sets over sharing rules (more performant)
- If a user has manual shares on >10,000 account records: delete shares via Bulk API before deactivating the user
- For Experience Cloud large membership changes: batch additions by profile/PS; test in sandbox first; plan for processing time (can take hours for 1M+ users)
- Governance limit: 10 million users per transaction for Experience Cloud membership processing
