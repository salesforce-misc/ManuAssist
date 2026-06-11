# Skill: sandboxes

## Purpose

> **Category: Platform Skill** — applies org-wide across all Salesforce clouds; not specific to Manufacturing Cloud, but essential for staging, testing, and CI/CD workflows for Manufacturing Cloud feature work.

Answer questions about Salesforce Sandboxes — the staging and testing environments used throughout the Salesforce application lifecycle. Highly relevant to Manufacturing Cloud development and testing workflows: standing up Sales Agreements, configuring Advanced Account Forecasting (AAF) and Account Manager Targets, building Partner Visit / Action Plan flows, configuring Warranty Lifecycle Management, populating `ProductInvSearchableField` via the Inventory Search DPE, running UAT for service campaigns, and setting up CI/CD pipelines for Manufacturing Cloud metadata.

This skill covers sandbox types and licensing, creating/cloning/refreshing sandboxes, selective access via public groups, post-copy Apex scripts, deployment tools (change sets, Metadata API, DevOps Center, DX Inspector), Data Mask, data seeding, source tracking, and all setup considerations and gotchas.

## Trigger Keywords

- Sandbox, sandboxes, staging environment, testing environment
- Developer sandbox, Developer Pro sandbox, Partial Copy sandbox, Full sandbox
- Create sandbox, refresh sandbox, clone sandbox, activate sandbox
- Sandbox template, sandbox license, sandbox storage upgrade
- Change set, outbound change set, inbound change set, deployment connection
- Metadata API, deploy metadata, SFDX, Salesforce CLI, DevOps Center
- SandboxPostCopy, post-copy script
- Data Mask, Anonymize, sandbox data security, seed data
- Source tracking, sandbox source control
- Preview sandbox, non-preview sandbox, Hyperforce sandbox

## Skill Protocol

### Phase 1 — Clarify Scope (if needed)

If the user's request is ambiguous, ask one targeted clarifying question:
- Are they asking about **creating/refreshing** sandboxes (admin task) or **deploying changes** (developer/CI task)?
- Do they have a specific sandbox type in mind (Developer, Developer Pro, Partial Copy, Full)?
- Is this for a **Manufacturing Cloud** feature test (Sales Agreements, AAF, Account Manager Targets, Partner Visits, Warranty, Inventory Search/DPE, Asset Service Lifecycle, Analytics) or a general platform purpose?

Otherwise skip to Phase 2.

### Phase 2 — Domain Framing

Key context for answering sandbox questions:

- **Four types** from smallest to largest: Developer → Developer Pro → Partial Copy → Full. Each has a different refresh interval, storage limit, and data copy scope.
- **Deployment tools hierarchy:** Change sets (admin-friendly, metadata only) → Metadata API/SFDX (developer, large-scale) → DevOps Center (team, version-controlled pipeline).
- **Critical distinctions:**
  - Org IDs change on every refresh — never hard-code sandbox org IDs
  - Email deliverability defaults to System email only in new/refreshed sandboxes
  - Apex scheduled jobs are not copied on refresh — reschedule manually
  - Source tracking only available on Developer and Developer Pro sandboxes
  - Change sets deploy flows as inactive — activate manually post-deployment
- **Manufacturing Cloud context:** All Manufacturing-Cloud permission set licenses (`ManufacturingSalesUser`, `ManufacturingServiceUser`, `WarrantyManagementUser`, `SalesAgreementsUser`, `RebateManagementUser`, `InventoryAllocationUser`, `ManufacturingPartnerCommunityUser`, `ManufacturingAnalyticsUser`) and managed templates (DPE templates like `UpdateProductInventorySearchableFieldValues` in namespace `runtime_industries_fieldservice_inventorysearch`) are automatically available in a sandbox because sandboxes copy all licenses from the production org — no separate provisioning needed. License counts are kept in sync with production on demand (no refresh required).

### Phase 3 — Read References

Before generating output, read the relevant reference files:

```
@knowledge/modules/sandboxes/references/concepts-and-types.md          (type/license/storage questions)
@knowledge/modules/sandboxes/references/create-manage-refresh.md        (create/clone/refresh/access/manage questions)
@knowledge/modules/sandboxes/references/deploy-your-changes.md          (change sets, Metadata API, DevOps Center questions)
@knowledge/modules/sandboxes/references/setup-considerations-and-gotchas.md  (always — setup differences, gotchas, MFG context)
```

### Phase 4 — Produce Output

Rules:
- State required permissions (`Manage Sandboxes` vs `Manage Dev Sandboxes`) before setup steps
- For deployment questions: recommend Change Sets for admin tasks, Metadata API/SFDX for developers, DevOps Center for team pipelines
- For data sensitivity: recommend Data Mask for Full/Partial Copy sandboxes before sharing with testers
- Include step-by-step numbered lists for procedural tasks
- Always flag irreversible actions with **⚠️ Warning**
- For Manufacturing Cloud scenarios: include which sandbox type is most appropriate; remind that all feature licenses and managed DPE templates are automatically available (no separate provisioning needed)

### Phase 5 — Quality Check

Before responding, verify:
- [ ] Sandbox type is appropriate for the stated use case (Developer = metadata-only; Full = for load/perf/staging)
- [ ] Refresh intervals stated correctly (Developer/Dev Pro: 1 day; Partial Copy: 5 days; Full: 29 days)
- [ ] No hard-coded org ID advice given
- [ ] Irreversible actions (activate, delete, discard) flagged with warnings
- [ ] Change set limitations noted (metadata only, flows deploy inactive, picklist values not in set become inactive)
- [ ] Manufacturing Cloud-specific notes included if the question involves Sales Agreements, AAF, Account Manager Targets, Partner Visits, Warranty, Inventory Search/DPE, Asset Service Lifecycle, or Analytics

### Phase 6 — Offer Next Step

End with one concrete suggested next step:
- "Want me to walk through setting up a Partial Copy sandbox template for your Sales Agreement / Account / Product / AccountForecast data?"
- "Should I show the full change set deployment sequence with dependency ordering for your Manufacturing Cloud metadata (Searchable Object Configuration → DPE definition → Search Criteria Configuration → Action Configs → Lightning page)?"
- "Need the SandboxPostCopy Apex class pattern to auto-configure your sandbox on every refresh (e.g., re-activate the `UpdateProductInventorySearchableFieldValues` DPE and reschedule it)?"
- "Want a recommended sandbox strategy (Dev → Partial Copy → Full) for your Manufacturing Cloud development pipeline?"
- "Should I show how to use Salesforce CLI to automate sandbox creation and metadata deployment for CI/CD?"

## Quality Standards

- Use tables for type comparisons, limit summaries, and permission references
- Use numbered lists for all procedural steps
- Use code blocks for Apex (SandboxPostCopy), SFDX CLI commands, and API examples
- State permissions required before every setup procedure
