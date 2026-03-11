---
description: Interactive wizard to configure and validate Enterprise Territory Management for Manufacturing Cloud
arguments: "[check-type]"
---

# Configure Territory Management

Interactive wizard to check and configure Enterprise Territory Management (ETM) for Manufacturing Cloud partner and account territories.

## Arguments

- `check-type` (optional): Focus area — `full`, `territories`, `assignments`, `users`, or `accounts` (default: full)

## Instructions

Follow these steps sequentially to validate and configure territory management.

### Step 1: Verify Org Connection

```
Use check_mfg_setup to verify org connection
```

If not connected, guide the user through authentication.

### Step 2: Check Territory Model Status

Verify Enterprise Territory Management is enabled and a model is active:

```sql
SELECT Id, Name, State FROM Territory2Model ORDER BY Name LIMIT 10
```

Report:
- Territory model names and states (Active / Inactive / Planning)
- **WARN if no Active model**: Territory Management cannot function without an Active Territory Model

### Step 3: Check Territory Hierarchy

Verify territories exist and are structured correctly:

```sql
SELECT Id, Name, Territory2Type.Name, ParentTerritory2Id
FROM Territory2
ORDER BY Name
LIMIT 100
```

Report:
- Number of territories
- Territory types (Region, District, Territory, etc.)
- Hierarchy depth (parent-child relationships)
- **WARN if no territories**: Build the hierarchy before assigning accounts or users

### Step 4: Check Account Assignments

Verify accounts (OEMs, distributors, dealers) are assigned to territories:

```sql
SELECT Id, SobjectId, Territory2Id, Territory2.Name, AssociationType,
       (SELECT Id, Name FROM Sobject)
FROM ObjectTerritory2Association
WHERE SobjectType = 'Account'
ORDER BY Territory2.Name
LIMIT 50
```

Report:
- Number of explicit account assignments
- Territories covered
- AssociationTypes (Filter, Manual, Territory)
- **WARN if none**: Guide user to assign accounts to territories

### Step 5: Check User Assignments

Verify account managers and field reps are assigned to territories:

```sql
SELECT Id, UserId, User.Name, User.Title, Territory2Id, Territory2.Name, RoleInTerritory2
FROM UserTerritory2Association
ORDER BY Territory2.Name, User.Name
LIMIT 50
```

Report:
- Number of user-territory assignments
- Users and their roles in territories
- **WARN if none**: Users must be assigned to territories to see territory-filtered data

### Step 6: Check Geo Assignment Rules (optional)

```sql
SELECT Id, Name, Territory2Id, Territory2.Name, UsageType, IsActive
FROM TerritoryGeoAssignmentRule
ORDER BY Territory2.Name
LIMIT 50
```

Report:
- Number of geo-based rules (zip code / state based)
- Active vs inactive rules
- **INFO if none**: Only needed if using automated geo-based territory assignment

### Step 7: Present Configuration Report

```
## Territory Management Configuration Report

### Overall Status: [CONFIGURED / NEEDS ATTENTION / NOT CONFIGURED]

### Territory Model
- Model: [name]
- State: [Active / Inactive / Not Found]

### Territory Hierarchy
- Territories: [count]
- Types: [list]

### Account Assignments
- ObjectTerritory2Association records: [count]
- Territories with accounts: [count]
- Status: [Configured / Not Found]

### User Assignments
- UserTerritory2Association records: [count]
- Users assigned: [count]
- Status: [Configured / Not Found]

### Geo Rules
- TerritoryGeoAssignmentRule records: [count]
- Active: [count]
- Status: [Configured / Not Configured / Not Applicable]

### Issues Found
1. [Issue description]

### Recommendations
1. [Recommendation]
```

### Step 8: Offer Next Steps

**If no Active Territory Model:**
- Guide to Setup > Territory Management > Territory Models
- Walk through activating the model

**If no territories:**
- Explain territory type setup: Setup > Territory Management > Territory Types
- Guide to building the hierarchy

**If no account assignments:**
- Offer to explain manual assignment via account record
- Suggest running territory assignment rules if geo rules are configured

**If no user assignments:**
- Explain Setup > Territory Management > [Territory Name] > Assigned Users
- Note that ManufacturingSalesUser permission set is still required separately

**If all checks pass:**
- Confirm territory management is configured
- Remind to reassign accounts/users when territory changes occur

## Example Usage

User: `/mfg:configure-territory`
> Run full territory management check

User: `/mfg:configure-territory territories`
> Focus on territory model and hierarchy

User: `/mfg:configure-territory assignments`
> Focus on account assignments

User: `/mfg:configure-territory users`
> Focus on user territory assignments

## IMPORTANT OBJECT NAME REMINDERS

- Use `Territory2` NOT `Territory__c`
- Use `Territory2Model` NOT `TerritoryModel__c`
- Use `ObjectTerritory2Association` NOT `AccountTerritory__c`
- Use `UserTerritory2Association` NOT `TerritoryUser__c`
- Use `TerritoryGeoAssignmentRule` NOT `ZipTerritory__c`
