---
name: mfg-user-management
description: Expert guidance on Manufacturing Cloud user provisioning, permission sets, PSLs, profiles, and license management. Use when user asks about user setup, permission sets, ManufacturingSalesUser, ManufacturingServiceUser, partner user access, or license capacity.
---

# Manufacturing Cloud User Management

Manufacturing Cloud uses **standard Salesforce permission sets** (not managed package licenses). User management focuses on assigning the correct permission sets based on each user's role.

## Permission Set Reference

| Permission Set | Who Needs It | Track |
|---------------|-------------|-------|
| `ManufacturingSalesUser` | Account managers, sales reps | Sales |
| `ManufacturingServiceUser` | CSRs, claims adjudicators, service managers | Service |
| `ManufacturingPartnerCommunityUser` | External distributors/dealers via Experience Cloud | Partner |
| `ManufacturingAnalyticsUser` | Business analysts, sales ops who need CRM Analytics | Both |
| `WarrantyManagementUser` | Warranty admins, claims processors | Service |
| `SalesAgreementsUser` | Users focused on agreement compliance tracking | Sales |
| `RebateManagementUser` | Users managing rebate programs | Sales |

## Provisioning Steps

### Step 1: Determine User Roles
Identify which Manufacturing Cloud track(s) each user will work in:
- Sales account managers → `ManufacturingSalesUser`
- Service/warranty reps → `ManufacturingServiceUser`
- Both → Both permission sets
- Partner portal users → `ManufacturingPartnerCommunityUser` + Experience Cloud user license

### Step 2: Assign Permission Sets
```
1. Setup > Users > Select user
2. Permission Set Assignments > Edit Assignments
3. Add the appropriate Manufacturing permission set(s)
```

Or programmatically via `assign_permission_set` tool.

### Step 3: Configure Profiles
Manufacturing Cloud works with standard Salesforce profiles:
- **Standard User** — for internal sales and service reps
- **System Administrator** — for admins and implementation team
- **Customer Community Plus** (or **Partner Community**) — for Experience Cloud partner users

### Step 4: Role Hierarchy
Roles are important for:
- CRM Analytics visibility (field managers see their team's data)
- Record ownership and sharing rules
- Account Manager Target roll-ups

Recommended hierarchy:
```
VP of Sales
├── Regional Sales Manager (Region A)
│   ├── Account Manager (Territory 1)
│   └── Account Manager (Territory 2)
└── Regional Sales Manager (Region B)
    └── Account Manager (Territory 3)
```

### Step 5: Partner User Provisioning (Experience Cloud)
1. Create a Contact record linked to the partner Account
2. Enable the Contact as an Experience Cloud user
3. Assign the `Manufacturing` Experience Cloud permission set and profile
4. Add to the partner portal site

## Checking Configuration
Use `check_mfg_user_config` to:
- Count active users
- Verify Manufacturing permission set assignments
- Identify users with no Manufacturing access
- Review profile distribution and role hierarchy

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| User can't access Sales Agreements | Missing `ManufacturingSalesUser` | Assign permission set |
| User can't see Warranty Claims | Missing `ManufacturingServiceUser` | Assign permission set |
| Analytics dashboard not visible | Missing `ManufacturingAnalyticsUser` | Assign permission set |
| Partner portal login fails | Incorrect profile or missing EC permission set | Check partner user license and profile assignment |
| CRM Analytics shows wrong data | Role hierarchy not configured | Set up role hierarchy with correct parent/child relationships |

## SOQL Quick Reference

```sql
-- Users with Manufacturing permission sets
SELECT Assignee.Name, Assignee.Profile.Name, PermissionSet.Name
FROM PermissionSetAssignment
WHERE PermissionSet.Name LIKE 'Manufacturing%'
ORDER BY Assignee.Name

-- Active users without any Manufacturing permission set
SELECT Id, Name, Profile.Name, Email
FROM User
WHERE IsActive = true
AND Id NOT IN (
  SELECT AssigneeId FROM PermissionSetAssignment
  WHERE PermissionSet.Name LIKE 'Manufacturing%'
    OR PermissionSet.Name = 'WarrantyManagementUser'
    OR PermissionSet.Name = 'SalesAgreementsUser'
)
ORDER BY Name

-- Partner community users
SELECT Id, Name, UserType, Profile.Name, IsActive
FROM User
WHERE UserType = 'PowerPartner'
ORDER BY Name
```

Use `get_mfg_module_docs` with slug `user-management` for full permission set and user configuration reference, or `search_mfg_knowledge` for targeted searches.
