# Sandboxes — Concepts, Types, and Storage

---

## What Is a Sandbox?

A sandbox is a copy of your Salesforce org in a separate, isolated environment used for development, testing, and training without affecting production data or users. Sandboxes are completely isolated from the production org — operations performed in a sandbox never affect production.

**Use cases:**
- Isolate development and configuration from production until ready to deploy
- Test changes against copies of production data and users
- User acceptance testing (UAT)
- Training environments
- Coordinate individual changes before a combined production deployment

---

## Sandbox Types

| Type | Storage (Data) | Storage Upgrade Available | What's Copied | Refresh Interval | Sandbox Templates |
|------|---------------|--------------------------|---------------|-----------------|-------------------|
| **Developer** | 200 MB (400 MB with upgrade) | Yes — doubles to 400 MB | Metadata only | 1 day | Not available |
| **Developer Pro** | 1 GB (2 GB with upgrade) | Yes — doubles to 2 GB | Metadata only | 1 day | Not available |
| **Partial Copy** | 5 GB | No | Metadata + sample data (template-required) | 5 days | Required |
| **Full** | Same as production | No | Metadata + all data | 29 days | Available (recommended) |

**Key rules:**
- Only Full sandboxes support performance testing, load testing, and staging
- Source tracking is only available on Developer and Developer Pro sandboxes
- Entities defined as Metadata Types don't count against storage allocations
- **All Manufacturing Cloud permission set licenses (e.g. `ManufacturingSalesUser`, `ManufacturingServiceUser`, `WarrantyManagementUser`, `SalesAgreementsUser`, `RebateManagementUser`, `InventoryAllocationUser`, `ManufacturingPartnerCommunityUser`, `ManufacturingAnalyticsUser`) and managed packages / DPE templates (e.g. `UpdateProductInventorySearchableFieldValues` in namespace `runtime_industries_fieldservice_inventorysearch`) are automatically available in a sandbox — sandboxes copy all licenses from the production org. No separate license provisioning is needed.**

---

## Sandbox Licenses and Edition Bundles

| License | Allows creation of |
|---------|-------------------|
| Full Sandbox license | Developer, Developer Pro, Partial Copy, Full |
| Partial Copy Sandbox license | Developer, Developer Pro, Partial Copy |
| Developer Pro Sandbox license | Developer, Developer Pro |
| Developer Sandbox license | Developer only |

**Default sandboxes per edition (bundled with platform):**

| Sandbox Type | Professional | Enterprise | Unlimited | Performance |
|--------------|-------------|------------|-----------|-------------|
| Developer | 10 | 25 | 100 | 100 |
| Developer Pro | — | — | 5 | 5 |
| Partial Copy | Not available | 1 | 1 | 1 |
| Full | Not available | — | 1 | 1 |

**Add-on bundle sizes** (purchased separately):

| Add-On | Developer Sandboxes Bundled | Storage Upgrade Licenses |
|--------|-----------------------------|--------------------------|
| Developer Pro add-on | 5 | 5 |
| Partial Copy add-on | 10 | 10 |
| Full add-on | 15 | 15 |

> **Note:** Developer sandboxes aren't available for individual purchase but are bundled with add-ons.

---

## Storage Upgrades (Developer and Developer Pro Only)

- Developer sandbox: 200 MB → 400 MB (one upgrade per sandbox)
- Developer Pro sandbox: 1 GB → 2 GB (one upgrade per sandbox)
- Upgrades are fixed values and can't be further modified
- One storage upgrade license consumed per upgraded sandbox
- A cloned sandbox always inherits the source's storage level; you can add a storage upgrade after cloning
- Storage **cannot be downgraded** in an existing sandbox; free the upgrade by deselecting at next refresh (non-cloned sandboxes only)
- Not available for Partial Copy and Full sandboxes

---

## Sandbox Templates

Sandbox templates control which object records are copied into Partial Copy or Full sandboxes.

**Rules:**
- Required for Partial Copy sandboxes; optional but recommended for Full sandboxes
- The template editor respects object schema relationships — selecting an object auto-adds its required parent objects
- When your object schema changes, Salesforce automatically updates templates (adding/removing required objects)
- To include asset files and content: select **Content Body** in the template

**Template management:**
Setup > Sandboxes > **Sandbox Templates** tab > New Sandbox Template

---

## Preview vs. Non-Preview Sandboxes

| Type | Description |
|------|-------------|
| **Preview** | Upgraded ~6 weeks before production during major releases; use to test configurations before production upgrade |
| **Non-Preview** | Not upgraded early; use when building changes for the current production version |

To view which type a sandbox is: Setup > Sandboxes > **Release Type** column.

---

## Where Are Sandboxes Created?

| Production Org Infrastructure | Sandbox Instance |
|-------------------------------|-----------------|
| Salesforce First-Party | Salesforce First-Party instance, same region |
| Hyperforce | Hyperforce instance, same country |
| Government Cloud / Government Cloud Plus | Government Cloud instance |

Existing sandboxes remain on their current instance until refreshed, deleted, or migrated by Salesforce.

---

## Hyperforce: Quick Create / Quick Clone

On Hyperforce production orgs, Full sandbox creation defaults to **Quick Create** and sandbox cloning defaults to **Quick Clone** — both are faster than the legacy copy method. However, resource limitations may cause fallback to the legacy method. Salesforce Customer Support cannot override this.

To check if your org is on Hyperforce: Setup > Sandboxes > look for the Hyperforce badge.
