# Users and Data Access Skill

## Purpose

> **Category: Platform Skill** — applies org-wide across all Salesforce clouds; not specific to Manufacturing Cloud, but directly relevant for setting up secure access to Manufacturing Cloud objects (quotes, orders, contracts, invoices, price books, sales agreements, accounts) and for internal/external user access in Manufacturing Cloud implementations.

Provides authoritative knowledge of the Salesforce user management and data access security model. Covers the full layered security stack — from user lifecycle and licensing through object/field permissions, OWD, role hierarchies, sharing rules, restriction rules, scoping rules, and guest/external user security — plus practical troubleshooting patterns and SOQL queries.

This skill is intentionally independent of Manufacturing Cloud: the security model applies org-wide and may be asked about in any Salesforce context.

## Trigger Keywords

- User lifecycle: create, deactivate, freeze, unlock, delete, mass transfer
- Licenses: user license, permission set license, feature license
- Profile, permission set, permission set group, muting permission set, session-based permission set
- Field-level security, FLS, object permissions, field permissions, custom permissions
- Org-wide defaults, OWD, record-level security, sharing
- Role hierarchy, sharing rules, manual sharing, Apex managed sharing
- Restriction rules, scoping rules
- Guest user, guest user profile, Experience Cloud users, high-volume users, external users
- Troubleshoot access, insufficient privileges, sharing hierarchy, UserRecordAccess

## Skill Protocol

When this skill is invoked, follow these phases in order:

### Phase 1 — Classify the Request

Determine which area applies:

- **User lifecycle / management** → `users-and-licenses.md`
- **Licenses** (user, PSL, feature) → `users-and-licenses.md`
- **Profiles** (configuration, page layouts, login hours/IP, session settings) → `profiles-and-permission-sets.md`
- **Permission sets / groups / session-based / muting** → `profiles-and-permission-sets.md`
- **Object / field permissions, View All / Modify All** → `profiles-and-permission-sets.md`
- **Migrate profiles to permission sets, User Access Policies** → `profiles-and-permission-sets.md`
- **OWD, role hierarchy, sharing rules, manual sharing, Apex sharing** → `record-access-and-sharing.md`
- **Restriction rules** → `record-access-and-sharing.md`
- **Scoping rules** → `record-access-and-sharing.md`
- **Experience Cloud users (partner, customer, high-volume, contactless)** → `guest-and-external-users.md`
- **Guest user security (profile, sharing rules, record ownership)** → `guest-and-external-users.md`
- **Troubleshooting ("insufficient privileges", "can't access record/field/feature")** → `limits-and-gotchas.md`
- **SOQL queries for permissions / access** → `limits-and-gotchas.md`
- **Architecture overview / how the security model works** → `concepts-and-architecture.md`

### Phase 2 — Frame the Answer

Before answering any "how-to" or "why" question:

1. Identify whether this is **object-level**, **field-level**, or **record-level** access — these are different layers.
2. Identify the **user type** involved: internal user, partner/customer user, high-volume user, or guest user — each has different available mechanisms.
3. State the **principle**: permissions only add access, never subtract. To restrict, you must remove all grants.

### Phase 3 — Answer

- For object/field permissions: always recommend permission sets over profiles for new work.
- For record-level: state the full stack in order — OWD → role hierarchy → sharing rules → manual sharing → Apex sharing. Flag that restriction rules sit orthogonally (they CAN subtract access).
- For guest users: the answer almost always involves the guest user profile + guest user sharing rules (not manual sharing, not public groups).
- For high-volume users: they have no roles; sharing sets and share groups are the correct mechanism.
- For troubleshooting: follow the layered walkthrough from `limits-and-gotchas.md`.

### Phase 4 — Verify Against Gotchas

Cross-check against `limits-and-gotchas.md`:

- Deactivation may be blocked by 7+ system dependencies (workflow user, case owner, hierarchy fields, etc.) — freeze first, then deactivate.
- Permissions are additive: if a permission set grants access the profile doesn't, the user has it.
- View All Data / Modify All Data do NOT override field-level security.
- Guest users: OWD is always Private; no manual sharing; no public groups; only guest user sharing rules (Read Only max).
- Criteria-based sharing rule text/picklist fields are case-sensitive.
- Sharing rule limit: 300 total per object (50 criteria-based or guest user sharing rules).
- Restriction rules CAN reduce access below OWD — unlike all other sharing mechanisms.
- Scoping rules only filter visibility in list views/reports; they do not restrict actual record access.
- Deactivating a user with >10,000 manually shared account records can cause performance issues — delete shares first.

## Quality Standards

- Never recommend relying on profiles for permissions; use permission sets/groups for new implementations.
- Never confuse restriction rules (which restrict) with sharing rules (which can only expand access).
- Always distinguish between object permissions (CRUD + View All / Modify All) and field permissions (Read / Edit).
- Guest user answers must always include the warning that guest user sharing rules expose data to anyone on the internet.
- For external user questions, always confirm whether the user type is partner/customer (has roles) or high-volume (no roles) — different mechanisms apply.
