# Limits, Gotchas, and Troubleshooting

## Critical Gotchas

### 1. Permissions Are Additive — You Cannot "Deny"

If a permission is not in the profile but IS in any assigned permission set, the user has the permission. To revoke a permission, you must remove it from **every** source (profile, all permission sets, all permission set groups).

Use the **Access Granted By** feature (User Access Summary → click permission row → Access Granted By) to find all sources.

### 2. Deactivation Has 7+ Blockers — Freeze First

Cannot deactivate a user who is:
- Default owner of leads
- Default or automated case owner
- Default lead creator or owner
- Default workflow user
- Recipient of a workflow email alert (sole recipient)
- Selected in a custom hierarchy field
- A Customer Portal administrator

**Solution:** Freeze the account immediately (prevents login), then resolve each dependency one by one, then deactivate.

**Cannot deactivate:** Automated Process user, integration users.

### 3. Custom Hierarchy Field Blocks Deactivation Even After Field Deletion

You can't deactivate a user selected in a custom hierarchy field even if you delete the field. Must **permanently erase** (delete + erase from Recycle Bin) the field first.

### 4. Deactivation With >10,000 Manual Shares = Performance Risk

If a user has >10,000 manually shared account records, deactivating causes a massive sharing recalculation. Use Bulk API to delete those `AccountShare` records (RowCause = 'Manual') BEFORE deactivating.

### 5. View All Data / Modify All Data Do NOT Override FLS

These user permissions bypass sharing — but they never bypass field-level security. Users with View All Data can see all records but still can't see fields they don't have FLS for.

### 6. Sharing Rules Can Only Open Access — Except Restriction Rules

Standard sharing mechanisms (OWD, role hierarchy, sharing rules, manual sharing) can only **open** access beyond the baseline OWD. **Restriction rules** are the only sharing mechanism that can **reduce** access — even below OWD.

### 7. Criteria-Based Sharing Rules: Text Fields Are Case-Sensitive

A criteria-based sharing rule on a Text or Text Area field matching "Manager" will NOT match records with "manager" in that field. To handle multiple cases, enter comma-separated values.

### 8. Guest Users: OWD Is Always Private (No Exceptions)

As of Winter '21 (permanent enforcement):
- Guest user external OWD = Private for ALL objects; cannot be changed
- No manual sharing, no public groups, no queues for guest users
- Only guest user sharing rules can open access (Read Only max)
- Guest users cannot have Edit, Delete, View All Records, Modify All Records
- Guest users cannot own records

### 9. High-Volume Users Have No Roles

HVU licenses (Customer Community, High Volume Customer Portal, Authenticated Website, External Apps, External Identity) have no role hierarchy. You cannot use role-based sharing, sharing rules by role, or queues for access control. Only sharing sets and share groups work.

### 10. Restriction Rules: Only ONE Should Apply Per User Per Object

Salesforce does NOT validate that only one active restriction or scoping rule applies to a given user for a given object. If two rules both have user criteria that match the same user, only one is applied — unpredictably. Design rules so each user is only ever covered by one active rule per object.

### 11. Session-Based Permission Sets Cannot Run Async

Session-based PSs don't support asynchronous processes (deploying custom metadata, scheduled jobs). They're valid only for the current active session. Cannot both activate and deactivate in the same flow.

### 12. Record Owner Change Removes Manual Shares

When a record's owner changes, all manual shares for that record are automatically removed. Apex-managed shares (custom RowCause) persist through ownership changes.

### 13. Account Ownership Change Removes Sharing Rules on Related Records

When transferring accounts in Enterprise/Unlimited/etc., all previous manual shares, Apex shares, and sharing rules are removed from the transferred accounts and opportunities. New sharing rules apply based on the new owner.

### 14. Criteria-Based Sharing "Include records owned by users who can't have a role"

This setting (introduced Spring '22) must be selected at **rule creation time** — cannot be edited afterwards. To add it to existing rules, delete and recreate the rule.

### 15. Permission Sets Can't Be Deleted If Assigned to Site Membership

If a permission set (or profile) is assigned to an Experience Cloud site's membership, it cannot be deleted from Salesforce until you remove it from the site first.

---

## Sharing Rule Limits

| Limit | Value |
|---|---|
| Total sharing rules per object | 300 |
| Criteria-based or guest user sharing rules per object | 50 (included in the 300) |
| Sharing rule label | Up to 1,000 character description |
| Criteria value length | 240 characters (longer values truncated) |

---

## Troubleshooting Access Issues

### Step 1: Identify the Dimension

First determine: is this **object-level**, **field-level**, or **record-level** access?

- User can't see the object/tab at all → object-level (profile/PS object permissions)
- User can see records but can't see/edit a specific field → field-level (FLS)
- User can see the object but can't access specific records → record-level (OWD/sharing)
- User can't complete a task (but has object access) → feature-level (user/system permission)

### Step 2: Use the User Access Summary

Setup → Users → select user → **View Summary**

- Object Permissions tab → see all object access
- Field Permissions tab → see all field access  
- User Permissions tab → see all system/app permissions
- Click any row → **Access Granted By** → see which profile/PS/PSG grants it

### Troubleshoot: User Can't Access a Record (Full walkthrough)

1. **Check object permissions** (User Access Summary → Object Permissions tab)
   - Missing → assign via permission set
2. **Check OWD** (Setup → Sharing Settings)
   - Public Read/Write → no restriction; go to step 12 for restriction rules
   - Controlled by Parent → repeat for parent object
   - Private → continue
3. **View Sharing Hierarchy** on the record (Action Menu → Sharing Hierarchy in LEX)
   - Click View → see all sharing reasons; investigate any you expected to grant access
4. **Check role hierarchy** — is user in the correct role? Is owner in expected role?
5. **Check public group membership** — is user in expected groups that are targets of sharing rules?
6. **Review sharing rules** — is there a rule intended to give access? Check criteria/owner match; check target group includes this user
7. **Check queues** — is user in correct queue(s)?
8. **Check teams** (account/opportunity/case) — is user on relevant teams with correct access level?
9. **Check territories** — is user in territory that covers this record?
10. **Review manual shares** — was a previous manual share removed due to ownership change?
11. **Check Apex sharing** — if custom object, is Apex code running correctly?
12. **Check restriction rules** — Object Manager → object → Restriction Rules → is there an active rule applying to this user that blocks this record?

### Troubleshoot: User Has Unexpected Record Access

1. **Check object permissions** → View All Records / Modify All Records override sharing entirely
2. **View Sharing Hierarchy** on the record → identify the sharing reason
3. Check if user is in a public group that's a target of a sharing rule
4. Check if user's role is above the record owner in the hierarchy
5. Check manual shares, team memberships
6. Check Apex sharing code

### Troubleshoot: User Can't See/Edit a Field

1. **Check FLS** (User Access Summary → Field Permissions tab)
   - Missing Read → assign FLS via permission set
   - Has Read but not Edit → update FLS if edit needed
2. **Check page layout** — field may not be on the page layout the user's profile/record type uses
3. **Check validation rules** — rules can prevent editing in certain conditions
4. **Check custom Apex** — may restrict field access

### Troubleshoot: User Has Unexpected Field Access

1. Check for special permissions: `Edit Read Only Fields`, `View Concealed Field Data`, `View All Lookup Record Names`
2. Check universally required fields — these always appear
3. **Check FLS** via User Access Summary → click **Access Granted By** to find source
4. **Check custom Apex** — may expose fields programmatically

### Troubleshoot: External User (Customer/Partner) Access Issues

Same flow as internal users but with additional checks:
1. Check objects available for the specific Experience Cloud license
2. Check **external OWD** (separate from internal OWD on Sharing Settings page)
3. Check **external account role hierarchy** (up to 3 account roles)
4. Check **sharing sets** and **share groups** (for HVU licenses — see `guest-and-external-users.md`)
5. For Customer Community Plus: check "Grant site users access to related cases" setting
6. For partner super users: check if super user access is intended

### Troubleshoot: Guest User Access Issues

> If guest users have unexpected access, consider deactivating the site until resolved.

1. **Review guest user profile** (Experience Builder → Settings → General → Guest User Profile)
   - Check object permissions, field permissions, system permissions
2. **Review guest user sharing rules** — only mechanism that grants record access
3. **Review "Let guest users see other members of this site"** user sharing setting
4. Query for records still owned by or shared with the guest user (legacy pre-Winter '21):

```sql
-- Find records owned by a guest user
SELECT Id, OwnerId FROM Account WHERE OwnerId = '[GuestUserRecordId]'

-- Find records shared via manual/Apex sharing with a guest user
SELECT Id, [ParentId], RowCause, UserOrGroupId
FROM [shareObject]
WHERE UserOrGroupId IN [userOrGroupIdList]
AND RowCause != 'Owner'
AND RowCause != 'Rule'
AND RowCause != 'GuestRule'
```

---

## SOQL Queries for Troubleshooting Access

### Object Permissions for a User

```sql
-- All object permissions from all sources (profile + PSs) for a user
SELECT Parent.Name, Parent.IsOwnedByProfile, SobjectType,
       PermissionsRead, PermissionsCreate, PermissionsEdit, PermissionsDelete,
       PermissionsViewAllRecords, PermissionsModifyAllRecords
FROM ObjectPermissions
WHERE ParentId IN (
    SELECT PermissionSetId
    FROM PermissionSetAssignment
    WHERE AssigneeId = '<UserId>'
)
ORDER BY SobjectType, Parent.Name
```

Filter `Parent.IsOwnedByProfile = true` for profile-only; `= false` for PS-only.

### Field Permissions for a User on a Specific Object

```sql
SELECT Parent.Name, Parent.IsOwnedByProfile, Field, PermissionsRead, PermissionsEdit
FROM FieldPermissions
WHERE ParentId IN (
    SELECT PermissionSetId
    FROM PermissionSetAssignment
    WHERE AssigneeId = '<UserId>'
)
AND SobjectType = '<ObjectApiName>'
ORDER BY Parent.Name, Field
```

### User (System) Permissions for a User

```sql
SELECT Id, Name, PermissionsApiEnabled, PermissionsViewSetup, PermissionsManageUsers,
       PermissionsModifyAllData, PermissionsViewAllData
FROM PermissionSet
WHERE Id IN (
    SELECT PermissionSetId
    FROM PermissionSetAssignment
    WHERE AssigneeId = '<UserId>'
)
```

### Does User Have Access to a Specific Record?

```sql
SELECT RecordId, HasReadAccess, HasEditAccess, HasDeleteAccess, HasTransferAccess,
       HasAllAccess, MaxAccessLevel
FROM UserRecordAccess
WHERE RecordId = '<RecordId>'
AND UserId = '<UserId>'
```

### All Users Who Have Access to an Account Record

```sql
SELECT AccountAccessLevel, AccountId, CaseAccessLevel, ContactAccessLevel,
       Id, OpportunityAccessLevel, RowCause, UserOrGroupId
FROM AccountShare
WHERE AccountId = '<AccountId>'
```

### Permissions Associated with a Profile (via associated PermissionSet)

```sql
-- Step 1: Get the profile's associated permission set
SELECT Id FROM PermissionSet WHERE ProfileId = '<ProfileId>'

-- Step 2: Query field permissions using that permission set ID
SELECT Field, Id, ParentId, PermissionsEdit, PermissionsRead, SobjectType
FROM FieldPermissions
WHERE ParentId = '<PermissionSetId>'
```

### Permissions Associated with a PSG (via aggregated PermissionSet)

```sql
-- Step 1: Get the PSG's aggregate permission set
SELECT Id FROM PermissionSet WHERE PermissionSetGroupId = '<PSGId>'

-- Step 2: Query permissions
SELECT Field, Id, ParentId, PermissionsEdit, PermissionsRead, SobjectType
FROM FieldPermissions
WHERE ParentId = '<PermissionSetId>'
```

### Access Settings (Apex Class, VF Page, Custom Permission) for a User

```sql
-- Permission sets assigned to user that have access to a specific Apex class/VF page
SELECT AssigneeId, PermissionSetId, PermissionSet.Name
FROM PermissionSetAssignment
WHERE PermissionSetId IN (
    SELECT ParentId
    FROM SetupEntityAccess
    WHERE SetupEntityId = '<ApexClassOrVFPageId>'
)
AND AssigneeId = '<UserId>'
```

---

## Deactivation Decision Tree

```
User needs to leave → Try deactivating
    |
    ├── Blocked? (see blockers list above)
    |       |
    |       └── YES → Freeze immediately (prevents login)
    |                   → Resolve each blocker:
    |                       - Transfer lead/case default ownership
    |                       - Update default workflow user
    |                       - Update workflow email alert recipients
    |                       - Update custom hierarchy field references
    |                       - Update portal admin assignment
    |                   → Now deactivate
    |
    └── NOT blocked → Deactivate
            |
            └── Has >10,000 manually shared account records?
                    → YES → Delete AccountShare records (RowCause=Manual) via Bulk API first
                    → THEN deactivate
```

---

## Common "Insufficient Privileges" Root Causes

| Error Context | Most Likely Cause |
|---|---|
| Can't view object/tab | Missing object Read permission in profile/PS |
| Can see list but can't open records | Missing record access (OWD Private + no sharing) |
| Can open record but fields blank/hidden | FLS missing Read permission |
| Can view but can't edit fields | FLS missing Edit permission |
| Can't save record | FLS (field hidden but required), or validation rule, or record type mismatch |
| Can access account but not related opportunities | Opportunity OWD may be private; check opportunity sharing separately |
| External user "insufficient privileges" | Check external OWD (separate from internal); check license object availability |
| Guest user gets error accessing record | Check guest user sharing rules — only mechanism available |
| "You do not have access to the Apex class" | Apex class not in profile or permission set of guest/external user |
