---
description: Interactive wizard to configure and validate Manufacturing Cloud user management, permission sets, and access
arguments: "[check-type]"
---

# Configure Manufacturing Cloud Users

Interactive wizard to check and configure user provisioning and permission sets.

## Arguments

- `check-type` (optional): Focus area — `full`, `permissions`, `profiles`, `roles`, `partners` (default: full)

## Instructions

### Step 1: Run User Configuration Check

```
check_mfg_user_config()
```

This queries:
- Active user count
- Manufacturing permission set assignments
- Users without Manufacturing access
- Profile distribution
- Role hierarchy

### Step 2: Check Permission Set Coverage

```sql
SELECT PermissionSet.Name, COUNT(Id) assigned
FROM PermissionSetAssignment
WHERE PermissionSet.Name IN (
  'ManufacturingSalesUser',
  'ManufacturingServiceUser',
  'ManufacturingPartnerCommunityUser',
  'ManufacturingAnalyticsUser',
  'WarrantyManagementUser',
  'SalesAgreementsUser',
  'RebateManagementUser'
)
GROUP BY PermissionSet.Name
ORDER BY COUNT(Id) DESC
```

Report:
- Which permission sets are assigned and to how many users
- WARN if critical sets (ManufacturingSalesUser, ManufacturingServiceUser) have 0 assignments

### Step 3: Find Users Needing Access

```sql
SELECT Id, Name, Profile.Name, Email, LastLoginDate
FROM User
WHERE IsActive = true
AND Id NOT IN (
  SELECT AssigneeId FROM PermissionSetAssignment
  WHERE PermissionSet.Name LIKE 'Manufacturing%'
    OR PermissionSet.Name = 'WarrantyManagementUser'
    OR PermissionSet.Name = 'SalesAgreementsUser'
)
ORDER BY LastLoginDate DESC NULLS LAST
LIMIT 20
```

Report:
- Active users with no Manufacturing permission sets
- Their profiles and last login dates
- Offer to assign appropriate permission sets

### Step 4: Check Role Hierarchy

```sql
SELECT Id, Name, DeveloperName, ParentRole.Name
FROM UserRole
ORDER BY Name
LIMIT 20
```

Report:
- Roles defined and their hierarchy
- WARN if no roles configured (affects CRM Analytics visibility)

### Step 5: Check Partner Community Users (if applicable)

```sql
SELECT COUNT(Id) total FROM User WHERE UserType = 'PowerPartner' AND IsActive = true
```

Report:
- Number of active partner community users
- WARN if 0 and partner portal is expected

### Step 6: Present User Report

```
## User Configuration Report

### Overall Status: [READY / NEEDS ATTENTION / NOT CONFIGURED]

### Active Users: [total]

### Manufacturing Permission Set Coverage
| Permission Set | Users |
|---------------|-------|
| ManufacturingSalesUser | [n] |
| ManufacturingServiceUser | [n] |
| ManufacturingAnalyticsUser | [n] |
| WarrantyManagementUser | [n] |
| SalesAgreementsUser | [n] |

### Gap Analysis
- Users with no Manufacturing access: [n]

### Role Hierarchy: [Configured / Not Configured]
- Roles: [count]

### Partner Users: [count]

### Issues Found
1. [issue]

### Recommendations
1. [recommendation]
```

### Step 7: Offer to Fix Issues

**If users are missing permission sets:**
- Ask: "Would you like me to assign ManufacturingSalesUser to the [n] users without Manufacturing access?"
- If yes: use `assign_permission_set` for each user
- Report what was assigned

**If no role hierarchy:**
- Guide to Setup > Roles > Set Up Roles
- Suggest structure: VP of Sales > Regional Managers > Account Managers

**If no partner community users:**
- Ask: "Is Experience Cloud for Manufacturing part of your deployment?"
- If yes: guide through partner user creation

## Admin Console Navigation

| Task | Path |
|------|------|
| Permission Sets | Setup > Permission Sets |
| Users | Setup > Users |
| Roles | Setup > Roles |
| Profiles | Setup > Profiles |
| Experience Cloud Users | Setup > Experience Cloud > Sites > [Site] > Administration > Members |

## IMPORTANT PERMISSION SET NAMES

- `ManufacturingSalesUser` — account managers, sales reps
- `ManufacturingServiceUser` — CSRs, warranty admins, claims adjudicators
- `ManufacturingPartnerCommunityUser` — external distributor/dealer users
- `ManufacturingAnalyticsUser` — CRM Analytics access
- `WarrantyManagementUser` — warranty term and claims administration
- `SalesAgreementsUser` — extended Sales Agreement access
- `RebateManagementUser` — rebate program management
