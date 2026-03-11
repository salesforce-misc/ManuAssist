# Manufacturing Cloud — Common Issues and Resolutions

---

## 1. Sales Agreements

### 1.1 Sales Agreement Cannot Be Activated

**Problem:** Users receive an error when trying to activate a Sales Agreement. Common messages include "This record can't be saved" or "Validation rule failed."

**Root Cause:** Sales Agreements require specific data to be complete before activation:
- At least one `SalesAgreementProduct` must exist
- The `StartDate` must be before `EndDate`
- An associated `Pricebook` must be active
- The record owner must have the `SalesAgreementsUser` permission set

**Resolution:**
1. Verify the Sales Agreement has at least one product line
2. Confirm price book is active and assigned
3. Check that the activating user has the `SalesAgreementsUser` permission set
4. Review validation rules in Setup → Object Manager → SalesAgreement → Validation Rules
5. Check Apex triggers or flows that fire on `SalesAgreement` status change

---

### 1.2 Actuals Not Syncing to Sales Agreement Schedules

**Problem:** `SalesAgreementProductSchedule` actual quantity/revenue fields remain 0 despite orders or invoices existing in the system.

**Root Cause:** Actuals sync requires an ERP integration or a configured DPE (Data Processing Engine) job to populate the fields. Out of the box, Manufacturing Cloud does not auto-populate actuals from standard Salesforce Order records unless explicitly configured.

**Resolution:**
1. Confirm the MuleSoft Accelerator for Manufacturing is configured if using external ERP
2. If using Salesforce Orders as actuals source, ensure the DPE template for actuals sync is deployed and scheduled
3. Verify the `ActualsCalculationMethod` field on the Sales Agreement is set correctly
4. Check DPE job run history in Setup → Data Processing Engine → Jobs

---

## 2. Advanced Account Forecasting (AAF)

### 2.1 Forecast Periods Not Generating

**Problem:** `AccountForecast` records are not created after running the DPE batch job.

**Root Cause:** The forecast period generation DPE template requires:
- `AcctMgrTarget` records to exist for the period
- The DPE template to be deployed and activated
- The batch job to be scheduled and run successfully

**Resolution:**
1. Verify `AcctMgrTarget` records exist for the relevant users and periods
2. Navigate to Setup → Data Processing Engine → check template status is "Active"
3. Run the batch job manually and check for errors in the job log
4. Confirm the user running the job has the `ManufacturingAnalyticsUser` permission set

---

### 2.2 Account Manager Targets Showing Zero Values

**Problem:** `AcctMgrTarget` records exist but show 0 for all target fields.

**Root Cause:** Target values must be set explicitly via the UI or API. The system does not auto-populate targets from historical data.

**Resolution:**
1. Use the `check_account_manager_targets` tool to verify target records exist
2. If records exist with zero values, update them via the UI or bulk API
3. Check if a DPE template is overwriting targets during batch execution
4. Verify field-level security allows the target fields to be edited by account managers

---

## 3. Partner Visit Management

### 3.1 Visit Records Not Appearing for Distributor/Dealer Users

**Problem:** External users on Experience Cloud cannot see Visit records assigned to them.

**Root Cause:** Visit sharing requires the `ManufacturingPartnerCommunityUser` permission set and proper sharing rules configured for the Experience Cloud site.

**Resolution:**
1. Assign the `ManufacturingPartnerCommunityUser` permission set to affected users
2. Verify the Experience Cloud site has the Visit object enabled in its profile/permission settings
3. Check OWD (Organization-Wide Defaults) for the Visit object — external users require at least "Read" access via sharing rules
4. Confirm the Experience Cloud site is published and active

---

### 3.2 Action Plans Not Completing After Checklist Items Marked Done

**Problem:** `ActionPlan` status does not update to "Completed" even after all checklist tasks are marked done.

**Root Cause:** Action Plan completion may depend on a Flow or Process Builder automation that needs to be activated.

**Resolution:**
1. Check Setup → Flows for a flow named related to ActionPlan completion — verify it is active
2. Confirm the `ActionPlanItem` records have their `IsComplete` field set to `true`
3. Run `SELECT Id, Status FROM ActionPlan WHERE Id = '<id>'` to check current status
4. Check for Apex triggers on `ActionPlanItem` that should fire completion logic

---

## 4. Warranty Lifecycle Management

### 4.1 Warranty Claim Cannot Be Submitted

**Problem:** Users receive errors when submitting a Warranty Claim for adjudication.

**Root Cause:** Common causes include:
- Missing required fields (`Asset`, `WarrantyTerm`, `ClaimDate`)
- The Asset's warranty term is expired
- BRE (Business Rules Engine) rules are blocking submission

**Resolution:**
1. Verify all required fields on the `WarrantyClaim` record are populated
2. Check that the associated `Asset` has a valid, active `WarrantyTerm`
3. Review BRE decision tables in Setup → Business Rules Engine
4. Confirm the submitting user has the `WarrantyManagementUser` permission set

---

### 4.2 BRE (Business Rules Engine) Rules Not Firing on Claims

**Problem:** Warranty Claim adjudication rules are configured in BRE but are not being evaluated during claim processing.

**Root Cause:** BRE rules must be published and the invocation point must be configured correctly in the claim workflow.

**Resolution:**
1. Navigate to Setup → Business Rules Engine — verify the rule set is in "Published" status
2. Check that the invocation point is linked to the `WarrantyClaim` object lifecycle
3. Review the decision table input parameters match the claim record fields
4. Check debug logs for BRE evaluation failures during claim save/submit

---

## 5. Permission Set Issues

### 5.1 Users Cannot Access Manufacturing Cloud Features

**Problem:** Users with Manufacturing Cloud licenses cannot see Sales Agreements, Forecasting, or other MFG features in the app.

**Root Cause:** Manufacturing Cloud features require specific permission sets beyond the base license.

**Resolution:**
Assign the appropriate permission set based on user role:

| User Role | Required Permission Set |
|-----------|------------------------|
| Account Manager / Sales Rep | `ManufacturingSalesUser` |
| CSR / Warranty Admin | `ManufacturingServiceUser` |
| External Distributor | `ManufacturingPartnerCommunityUser` |
| Business Analyst | `ManufacturingAnalyticsUser` |
| Warranty Specialist | `WarrantyManagementUser` |
| SA Compliance Tracker | `SalesAgreementsUser` |
| Rebate Manager | `RebateManagementUser` |

Use the `check_mfg_user_config` tool to verify permission set assignments automatically.

---

## 6. ERP Integration Issues

### 6.1 MuleSoft Actuals Sync Failing

**Problem:** The MuleSoft Accelerator for Manufacturing is deployed but actuals are not syncing from the ERP to `SalesAgreementProductSchedule`.

**Root Cause:** Common causes include authentication failures, field mapping mismatches, or the ERP integration user lacking required permissions.

**Resolution:**
1. Verify the integration user has the `ManufacturingSalesUser` permission set and API access
2. Check MuleSoft Runtime Manager for failed flows and review error payloads
3. Confirm the `SalesAgreementProductSchedule` `ActualQuantity` and `ActualRevenue` fields are editable via API for the integration profile
4. Test the integration endpoint manually using Postman or the MuleSoft API Console
5. Review field-level security — the integration user must have edit access to actual fields

---

## 7. Configuration and Setup

### 7.1 Manufacturing Cloud Not Visible in App Launcher

**Problem:** After enabling Manufacturing Cloud in Setup, users cannot find the Manufacturing app in the App Launcher.

**Root Cause:** The Manufacturing Cloud app must be added to the user's profile or permission set, and the user must have the appropriate Manufacturing Cloud license.

**Resolution:**
1. Navigate to Setup → App Manager — verify the "Manufacturing" Lightning App exists
2. Assign the app to the user's profile via Setup → Profiles → App Assignments
3. Confirm the user has a Manufacturing Cloud license in Setup → Users → user record
4. Run the `health_check` tool to get a full configuration status report

---

### 7.2 Sales Agreement List View Shows No Records

**Problem:** Users with `ManufacturingSalesUser` permission set cannot see any Sales Agreement records in list views.

**Root Cause:** Sales Agreement OWD (org-wide defaults) may be set to "Private," requiring sharing rules or owner-based access.

**Resolution:**
1. Check Setup → Sharing Settings → Sales Agreement OWD
2. Create sharing rules based on territory or role hierarchy if OWD is "Private"
3. Verify the user is the owner of at least one Sales Agreement or is in the sharing hierarchy
4. Run `SELECT Id, Name, OwnerId FROM SalesAgreement LIMIT 10` to check record ownership
