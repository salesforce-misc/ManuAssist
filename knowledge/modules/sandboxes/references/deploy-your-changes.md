# Sandboxes — Deploying Changes (Change Sets, Metadata API, DevOps Center)

---

## Deployment Tools Overview

| Tool | Best For | Requires |
|------|---------|---------|
| **Change Sets** | Admins; Setup-configurable metadata; small-to-medium releases | Deployment connection between orgs |
| **Metadata API** (SFDX / VS Code / CLI) | Developers; large-scale deployments; CI/CD pipelines | `Modify Metadata Through Metadata API Functions` permission |
| **DevOps Center** | Teams; version-controlled releases; multi-env pipelines | Source control repository |
| **DX Inspector** | Small direct deployments of metadata + configuration data | Access to DX Inspector in Setup |
| **Developer Console** | Quick Apex edits; debugging | `Author Apex` permission |

**Deployment sequence recommendation** (to avoid dependency failures):
1. Objects (custom objects, fields, record types)
2. Apex classes
3. Visualforce components and pages
4. Lightning web components (LWC) and Aura components
5. Apex triggers and other metadata
6. Profiles and permission sets
7. Sharing rules (last — triggers recalculation)

---

## Change Sets

Change sets contain **metadata only** (Setup-configurable components). They do not contain data (records).

**Limit:** 10,000 files, total file size 400 MB. Keep component count below ~5,000.

### Deployment Connections

A **deployment connection** must exist between two orgs before change sets can flow. Connections are created automatically between:
- A production org and each of its sandboxes
- Two sandboxes from the same production org

Each connection must be **authorized** (enabled) in both directions as needed. You can't create connections between arbitrary unrelated orgs.

**Authorize a connection:**
Setup > Deployment Settings > Edit next to the source org > **Allow Inbound Changes** > Save

### Create and Upload an Outbound Change Set

1. Setup > Outbound Change Sets > **New**
2. Enter name and description
3. Click **Add** to select component types and components
4. Click **View/Add Dependencies** to add required dependent components
5. Click **Add Profiles** to include profile settings (not available in Professional Edition)
6. Click **Upload** to send to the target org

> **Note:** After upload, a change set is closed — its components can't be edited. Clone it to redeploy with additions.

> **Note:** Outbound change sets expire **6 months** after upload and are permanently deleted.

### Deploy an Inbound Change Set

1. Setup > Inbound Change Sets
2. Click **Validate** first (recommended) — checks for errors without committing changes
3. Click **Deploy** to commit

> **Warning:** Deployment is a single transaction. If it fails for any reason, the entire transaction rolls back. A successfully deployed change set cannot be rolled back.

> **Note:** Inbound change sets are permanently deleted **6 months** after upload.

### Quick Deployment

Skip re-running Apex tests in production if a recent validation qualifies:
- Validated within the last **10 days**
- All Apex tests passed during validation
- Code coverage ≥ 75% overall; all deployed Apex classes/triggers individually covered ≥ 75%

Setup > Deployment Status > **Quick Deploy** button next to the qualifying validation.

API: call `deployRecentValidation()` with the validation ID.

### Change Set Limits and Important Behaviors

| Behavior | Detail |
|----------|--------|
| Flows deployed as inactive | Active flows in a change set arrive **inactive** in the destination — activate manually after deployment |
| Picklist values not in change set become inactive | If the target has an active picklist value not included in the change set, it becomes inactive |
| Page layout assignments overwrite | Including a profile + record type without the page layout removes existing layout assignment |
| Can't delete or rename via change set | Perform deletions and renames directly in the target org UI |
| Can't deploy action overrides on standard objects | Standard objects can't be included in change sets |
| Auth provider consumer secrets replaced | Change sets replace consumer secrets with a placeholder — insert manually at deploy time |
| Apex jobs pending | By default, can't deploy Apex when Apex jobs are pending. Enable in Deployment Settings or cancel jobs first |
| Apex test coverage required | 75% code coverage required for production deployments; not enforced for sandboxes |
| Master-Detail deployments delete Recycle Bin | Adding or converting a Master-Detail field permanently deletes soft-deleted detail records in the Recycle Bin |
| Custom object + sharingModel + sharing rule | Requires three separate deployments: object first, then sharingModel, then the sharing rule |

### Components NOT available in Change Sets (select examples)

- Data records (use Data Loader, Bulk API, or Seeding)
- Person Account settings
- Opportunity Splits
- Territory model metadata (some types)
- Publishing of Site.com sites

See the full **Components Available in Change Sets** list in Setup documentation for the complete inventory.

---

## Metadata API

Retrieve and deploy metadata programmatically. Required editions: Enterprise, Unlimited, Developer, Performance.

**Required permissions:**
- `Modify Metadata Through Metadata API Functions` — OR —
- `Modify All Data`

> **Note:** `Modify Metadata Through Metadata API Functions` is automatically enabled when `Deploy Change Sets` OR `Author Apex` permission is assigned.

**Key behaviors (same as Change Sets where applicable, plus):**

- Page layout assignment deployments **replace all** existing assignments with what's in the zip file — always include all page layouts for all record types
- Profile with unknown name: creates a new profile based on the Standard Profile
- Groups: public group members are **not migrated** — add members manually after deployment
- Connected App `consumerKey`: remove from zip before deploying to a new org — a new key is generated

---

## DevOps Center

Manages changes through a version-controlled pipeline. Connects sandboxes and scratch orgs to a source control repository.

**Key capabilities:**
- Track changes in work items
- Commit changes (metadata + config data) via DX Inspector
- Create change requests for peer review
- Promote work items through pipeline stages
- Resolve merge conflicts via MCP tools

**Use case vs. DX Inspector:** For large team releases with a full pipeline, use DevOps Center. For small, direct metadata + data deployments without a pipeline, use DX Inspector directly.

---

## DX Inspector (Metadata + Data Deployment, Beta/Developer Preview)

Directly deploy metadata and configuration data from source org to target org in one orchestration.

- Migrates records based on object relationships (parent first, then children with ID remapping)
- Uses external IDs to upsert — prevents duplicates
- Access from: Setup > Change Management tab in DX Inspector
- Metadata deployment is **Beta**; data deployment is **Developer Preview**

---

## Deployment Best Practices

### Never Develop Directly in Production

Even small changes can have cascading effects. Some changes (Apex code) **must** be made in a development environment — you can only change Apex in production via the `compileAndTestAPI()` API call.

### Safe to Do Directly in Production

- Develop email templates
- Create or edit users
- Create or edit permission sets and profiles

### Governance Rules

- Minimize who has `Customize Application` in production (limit to admins)
- Restrict programmatic deployment permissions to a small number of admins
- Stick to administrative tasks when making Setup changes in production

### Deployment Timing

- Avoid peak hours (Apex recompilation can degrade performance)
- Avoid deploying before holidays or major events
- Stick to a consistent release schedule
- Validate change sets before deploying, especially for scheduled or off-hours deployments

### Dependency Ordering

See deployment sequence at the top of this document. Key callouts:
- Profiles act as an overarching dependency layer — deploy all related metadata before profiles
- Sharing rules trigger recalculation on every deployment attempt — deploy last
- Flows deploy as inactive — activate manually after deployment

### Apex Tests in Production

- 75% code coverage is required to deploy to production
- All local Apex tests run by default when Apex is included in the deployment
- Use Quick Deploy (after pre-validation) to skip test re-execution for time-sensitive releases

---

## Monitor Deployments

Setup > Deployment Status

Shows in-progress, queued, and completed deployments (last 30 days).

**Progress indicators:**
- First chart: components deployed vs. total (with error count)
- Second chart: Apex tests run vs. total (after components complete)

**Quick Deploy** button appears next to qualifying validations (validated within 10 days, all tests passed, coverage met).

To cancel a running or queued deployment: click **Cancel** next to it → status becomes `Cancel Requested`.

**Top 5 slow tests** are flagged in Deployment Details for deployments with long-running Apex tests — use this to target test performance improvements.
