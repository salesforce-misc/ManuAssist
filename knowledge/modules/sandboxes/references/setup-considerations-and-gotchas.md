# Sandboxes — Setup Considerations, Data Security, and Gotchas

---

## Sandbox Setup Differences from Production

### Email Deliverability

New and refreshed sandboxes default to **System email only** (prevents most outbound email):

| Setting | Behavior |
|---------|---------|
| No access | Only password reset emails allowed |
| System email only | Auto-generated emails only (new user, password reset). **Default for new/refreshed sandboxes.** |
| All email | All outbound email. Default for new non-sandbox orgs. |

Setup > Deliverability > Access to Send Email

> **Tip:** Keep System email only in sandboxes to prevent test runs from emailing real customers. Manually fix contact email addresses if you need to test outbound email.

> **⚠️ Warning:** Sandboxes change Salesforce user email addresses (appended `.invalid`) but do **not** change other email addresses (Contact records, etc.). Manually invalidate or delete non-user email addresses in your sandbox before testing.

### Org IDs and Instance URLs

- Sandbox org ID is **different** from production and **changes** on every refresh
- Sandboxes can land on **different instances** (e.g. CS40 vs CS50) after each refresh
- Any hard-coded org ID in scripts, text values, or metadata is replaced with the new sandbox org ID on each refresh
- Custom links using **absolute URLs** won't work in sandboxes — use relative URLs only

### Username Modifications

Usernames are appended with the sandbox name: `user@acme.com` → `user@acme.com.test`

If not unique, characters are prepended: `00x7Vquser@acme.com.test`

### Object IDs

- Record IDs are copied from production at sandbox creation time
- IDs do **not** synchronize after creation — production and sandbox act as independent orgs
- New records created in production after the sandbox is created/refreshed don't appear in sandbox

### SAML and SSO

- Sandbox copies are created with federated SAML authentication **disabled**
- Configuration is preserved but Salesforce Login URL is updated to the sandbox URL
- Re-enable SAML after creation: Setup > Single Sign-On Settings > Edit > SAML Enabled

### Multi-Factor Authentication (MFA)

- MFA user permission assignments are copied from production
- MFA verification methods (registered devices) are **not** copied — users must re-register on first login
- Salesforce Authenticator connections are **invalidated** on every refresh — delete old sandbox connections from the app
- Use a dedicated, obviously named MFA permission set for sandboxes to prevent accidentally deploying it to production

### Login History

Login history is **not copied** from the source org. Each sandbox starts fresh.

### Recycle Bin Background Process

Salesforce permanently deletes Recycle Bin records older than 15 days via a background process. The timestamp for this process differs between sandbox and production. Applications or integrations that depend on `getDeleted()` timestamp may behave unexpectedly when switching between environments.

---

## Features Disabled in Sandboxes

The following features are **disabled and cannot be enabled** in sandboxes:

- Contract expiration warnings
- Case escalation
- Subscription summary
- Data exports (Weekly Export Service)
- The ability to create Salesforce sandboxes within a sandbox
- Copy email service addresses from sandbox to production
- Publish Site.com sites

**Disabled by default but can be re-enabled:**
- Sales Engagement
- Salesforce Inbox

---

## Data and Users Copied by Sandbox Type

| Copy Type | Customer Portal / Unified Employee License Users | Contact Object | Employee2 Object |
|-----------|------------------------------------------------|----------------|-----------------|
| Developer / Developer Pro | Licenses included; user records NOT copied | Not copied | Not copied |
| Partial Copy (without Contact selected) | Licenses included; user records NOT copied | Not copied | Not copied |
| Partial Copy (with Contact selected) | ✅ Copied | ✅ Copied | ✅ Copied |
| Full | ✅ Copied | ✅ Copied | ✅ Copied |

**Other data not copied to any sandbox:**
- Big Object records (definition is copied; records are not)
- Archived activities (tasks/events older than 1 year)
- User password history
- Setup audit trail history (sandbox starts a fresh audit trail)
- Chatter data (feeds, messages) — only copied if explicitly selected for Full sandboxes

---

## Data Security: Salesforce Data Mask

Data Mask automatically masks sensitive data (PII, revenue, etc.) in sandbox orgs to protect production data.

**Use case:** After creating a Full or Partial Copy sandbox that includes production records, run Data Mask to replace real values with anonymized or masked equivalents before giving developers or testers access.

**Key capabilities:**
- Mask by field type: name, email, phone, SSN, custom fields
- Multiple masking strategies: randomize, delete, replace with pattern
- Can be run after sandbox creation without needing a refresh

> **Note:** Requires Salesforce Data Mask license (separate from sandbox license).

---

## Data Privacy: Anonymize

Anonymize enables sharing sandbox data with other product teams while protecting sensitive, classified, and personal identifier information.

**Use case:** Share a subset of sandbox data with a partner team for development or testing while complying with privacy regulations (GDPR, CCPA).

---

## Data Seeding (Own by Salesforce)

Seeding populates sandboxes or production orgs with consistent, relationship-aware data sets.

**Key features:**
- Maintains object relationships during seeding
- Ensures data consistency and reliability
- Enhances data security and compliance

**Use case:** Seed a Developer sandbox with a known, reproducible data set for automated testing or training without copying from production.

---

## Customization Gotchas

| Gotcha | Detail |
|--------|--------|
| Apex can only be modified in sandbox/Developer Edition UI | In production, you can only modify Apex via `compileAndTestAPI()` API call |
| Image paths in quote templates, service reports, knowledge articles break | After sandbox creation, image paths become incorrect — reinsert images from the sandbox's correct location |
| Developer Pro sandbox can't open Text/Image quote template fields | If production uses Text/Image fields in quote templates and you create a Developer Pro sandbox, those template fields can't be opened for editing |
| Big Objects have no records | Only the Big Object definition is copied; no records are present in the sandbox |
| AppExchange install/publish | You can install from AppExchange and publish apps from sandbox (if versions match). Don't publish managed packages from a sandbox — refreshing or deleting breaks the package |
| Salesforce auth providers (Summer '14 and earlier) | Sandbox user identity doesn't include org ID — destination org can't differentiate users with same user ID from two sources. Edit Auth. Provider settings to include org ID and users must reapprove third-party links |

---

## Source Tracking in Developer and Developer Pro Sandboxes

Source tracking allows Salesforce DX tooling to automatically track new, changed, and deleted metadata components.

**Enable for all Dev/Dev Pro sandboxes (production org):**
Setup > Dev Hub > **Enable Source Tracking in Developer and Developer Pro Sandboxes**
→ applies to all newly created/refreshed sandboxes; existing sandboxes require a refresh

**Enable for a specific sandbox:**
Log in to the sandbox > Setup > Sandbox Settings > **Enable Source Tracking in This Sandbox**
→ tracks metadata changes from that point forward; prior changes are not retroactively tracked

**Rules:**
- Source tracking is NOT supported on Partial Copy or Full sandboxes
- Source tracking is deleted when a sandbox is refreshed — re-enable after refresh if needed
- Disabling source tracking takes several days to clean up records; can be re-enabled once cleanup finishes
- Source tracking can make metadata deployments take longer to complete

---

## Manufacturing Cloud Relevance

| MFG Scenario | Sandbox Recommendation |
|--------------|------------------------|
| Configuring and testing **Sales Agreements** (record types, price books, schedules, activation, ERP actuals sync) | Partial Copy sandbox seeded with representative `Account` / `Product2` / `SalesAgreement` / `SalesAgreementProduct` / `SalesAgreementProductSchedule` data via template |
| Configuring **Advanced Account Forecasting (AAF)** templates and DPE templates | Developer Pro sandbox for metadata; Partial Copy with `AccountForecast` / `AccountForecastPeriod` / `AccountForecastProductPeriod` data when validating period generation |
| Configuring **Account Manager Targets** (`AcctMgrTarget`) — fiscal year, hierarchy, distribution, periodic measures | Partial Copy sandbox with `AcctMgrTarget` + sales hierarchy users (`AcctMgrPeriodTarget`, `AcctMgrTargetMeasure`) |
| Building **Partner Visit Management** flows + Action Plan Templates + mobile UAT | Partial Copy sandbox with `Visit` / `ActionPlan` / `ActionPlanTemplate` / `Account` data; remember Field Service Mobile relinks on refresh |
| Configuring **Warranty Lifecycle Management** (terms, coverages, claims adjudication via BRE) | Partial Copy or Full sandbox with `WarrantyTerm` / `WarrantyTermCoverage` / `ProductWarrantyTerm` / `Asset` / `AssetWarranty` data |
| Standing up **Inventory Management** + the Criteria-Based Search and Filter LWC backed by `ProductInvSearchableField` | Partial Copy sandbox with `Location` / `ProductItem` / `Product2` data; **must re-activate and reschedule** the managed `UpdateProductInventorySearchableFieldValues` DPE after refresh (template namespace `runtime_industries_fieldservice_inventorysearch`) |
| Configuring **Inventory Allocation** (reservations, batch / serialized allocation) | Partial Copy sandbox with `ProductItem` / `InventoryReservation` / `InventoryItemReservation` / `ProductBatchItem` / `SerializedProduct` data |
| Configuring **Asset Service Lifecycle** (Asset Service Console, Pre-Work Estimation, Fleets, Coverage, Service Parts Return, Product Service Campaigns) | Full sandbox for end-to-end work order flows; Partial Copy works when scoping to a single product family |
| Configuring **Service Console for Manufacturing** (Identity Verification, Engagement Interactions, CTI) | Partial Copy or Full sandbox; remember CTI provider credentials and Auth Provider consumer secrets aren't copied — re-supply post-refresh |
| Configuring **Manufacturing Programs** (component forecasts, hierarchy paths, regenerate forecast DPE) | Partial Copy sandbox with `ManufacturingProgram` data + the `RegenerateComponentForecast` DPE template; reschedule DPE after refresh |
| Configuring **Rebate Management** (rule libraries, accrual / payout DPE templates) | Partial Copy sandbox with `RebateProgram` / `RebateProgramMember` / transaction journal data; reschedule the rebate DPEs after refresh |
| UAT for **CRM Analytics for Manufacturing** dashboards (Sales Agreement, Forecast, Target, Default Manufacturing dashboards) | Full sandbox with production data copy; run Data Mask before handing off to testers; CRMA license counts auto-sync |
| **Field Service mobile** UAT for tech consumption + transfer flows | Full sandbox; remember Salesforce Authenticator MFA connections invalidate on refresh |
| **CI/CD pipeline for Manufacturing Cloud metadata** (Searchable Object Configurations, DPE templates, Search Criteria Configurations, Search Result Action Configs, Lightning pages, flows) | Developer sandboxes with source tracking + Salesforce CLI + DevOps Center; keep DPE definitions in source control to avoid post-refresh re-activation drift |

> **Note:** Sandbox license counts (including `ManufacturingSalesUser`, `ManufacturingServiceUser`, `WarrantyManagementUser`, `SalesAgreementsUser`, `RebateManagementUser`, `InventoryAllocationUser`, `ManufacturingPartnerCommunityUser`, `ManufacturingAnalyticsUser`) are automatically updated to match production without requiring a refresh (license counts sync from production on demand).

> **DPE-specific gotcha (sandbox refresh):** Manufacturing Cloud relies heavily on DPE templates (e.g. `UpdateProductInventorySearchableFieldValues`, AAF generation DPEs, Rebate accrual / payout DPEs, Manufacturing Programs forecast DPE). Apex scheduled jobs are **not copied** on sandbox refresh, so DPE schedules must be re-applied. Build a `SandboxPostCopy` Apex class to re-activate and re-schedule the relevant DPE definitions automatically after every refresh.
