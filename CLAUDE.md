# Claude for Manufacturing Cloud

A Claude Code plugin providing Manufacturing Cloud-specific knowledge, templates, tools, and agents for Salesforce Manufacturing Cloud implementations.

## Org Selection — IMPORTANT

When connecting to a Salesforce org, follow these rules strictly:

1. **If only one org is authenticated**, use it automatically — do not ask the user.
2. **If multiple orgs are authenticated and no target is set**, ask the user **exactly once** which org to use, then call `set_target_org` with their choice.
3. **Once an org is selected (via `set_target_org` or auto-detection), NEVER ask again.** The choice persists for the entire session.
4. **Do not call `check_mfg_setup` or `list_sf_orgs` before every operation.** Only call them if the user explicitly asks about setup or if a tool returns an authentication error.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  claude-for-mfg (Plugin)                              │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  Skills (Auto-invoked)    Commands (User-invoked)     │  │
│  │  ─────────────────────    ─────────────────────────   │  │
│  │  • mfg-implementation     • /mfg:setup-plugin         │  │
│  │  • mfg-sales-agreements   • /mfg:configure-sales-...  │  │
│  │  • mfg-warranty           • /mfg:configure-warranty   │  │
│  │  • mfg-forecasting        • /mfg:configure-forecast.. │  │
│  │  • mfg-partner-visits     • /mfg:configure-visits     │  │
│  │  • mfg-user-management    • /mfg:configure-users      │  │
│  │  • mfg-data-model         • /mfg:health-check         │  │
│  │  • mfg-inventory-alloc    • /mfg:status               │  │
│  │  • salesforce-query       • /mfg:soql-query            │  │
│  │                           • /mfg:soql-query            │  │
│  │                           • /mfg:describe              │  │
│  │                                                       │  │
│  │  Agents (Subagents)       MCP Server (Tools)          │  │
│  │  ─────────────────────    ─────────────────────────   │  │
│  │  • mfg-consultant         • Sales Agreement tools     │  │
│  │  • mfg-admin              • Partner Visit tools       │  │
│  │  • mfg-developer          • Warranty tools            │  │
│  │                           • Inventory Allocation tools│  │
│  │                           • Forecasting tools         │  │
│  │                           • Config check tools        │  │
│  │                           • Salesforce org tools      │  │
│  │                           • SOQL, CRUD, metadata      │  │
│  └───────────────────────────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│              Salesforce CLI (sf)                            │
│                       │                                     │
│                       ▼                                     │
│         Your Manufacturing Cloud Org                        │
└─────────────────────────────────────────────────────────────┘
```

## Manufacturing Cloud Context

Manufacturing Cloud is a **core platform product** (not a managed package). It extends Sales Cloud and Service Cloud with industry-specific capabilities. Key implications:

- **No managed package namespace** — all objects use standard API names (e.g., `SalesAgreement`, not `SalesAgreement__c`)
- **No custom Admin Console** — configuration is done via standard Setup UI
- **OmniStudio IS available** — on web and Experience Cloud
- **No custom mobile app** — uses standard Salesforce Mobile App (no iPad-specific cache)
- **Two tracks**: Manufacturing for Sales + Manufacturing for Service (can implement one or both)

## MCP Server Tools

### Knowledge & Documentation Tools
| Tool | Description |
|------|-------------|
| `list_mfg_modules` | List Manufacturing Cloud modules |
| `get_mfg_module_docs` | Full documentation for a module by slug |
| `search_mfg_knowledge` | Search documentation |
| `explain_mfg_concept` | Explain a Manufacturing Cloud concept |
| `get_mfg_admin_setup` | Admin configuration guidance |
| `list_mfg_help_docs` | List official help documents |
| `get_mfg_help_doc` | Get a specific help document |
| `get_mfg_guide` | Get an implementation guide |
| `get_mfg_troubleshooting` | Get troubleshooting content |
| `get_mfg_exercise` | Get a hands-on exercise |

### Salesforce Org Tools (generic — work for any org)
| Tool | Description |
|------|-------------|
| `check_mfg_setup` | Check if SF CLI installed and orgs authenticated |
| `install_sf_cli` | Install or verify Salesforce CLI |
| `list_sf_orgs` | List authenticated orgs |
| `set_target_org` | Set which org to use |
| `open_org` | Open org in browser |
| `run_soql` | Execute SOQL queries |
| `describe_sobject` | Get object metadata |
| `get_record` | Retrieve a record by ID |
| `create_record` | Create a new record |
| `update_record` | Update a record |
| `delete_record` | Delete a record |
| `run_apex` | Execute anonymous Apex |
| `bulk_create_records` | Create records from JSON array |
| `bulk_update_records` | Update records from JSON array |
| `deploy_metadata` | Deploy metadata from local source |
| `retrieve_metadata` | Retrieve metadata from org |
| `diff_orgs` | Compare configuration between two orgs |
| `export_config` | Export org configuration as JSON |
| `import_config` | Import configuration from JSON |

### Sales Agreement Tools
| Tool | Description |
|------|-------------|
| `check_sales_agreement_config` | Validate Sales Agreement setup |
| `get_sales_agreement_details` | Get full SA details with products and schedules |
| `activate_sales_agreement` | Set a Sales Agreement to Active status |

### Partner Visit Tools
| Tool | Description |
|------|-------------|
| `check_partner_visit_config` | Validate Partner Visit Management setup |
| `list_partner_visits` | List visits with filters by status/account |

### Warranty Tools
| Tool | Description |
|------|-------------|
| `check_warranty_config` | Validate Warranty & Claims configuration |
| `list_warranty_claims` | List claims with filters by status/account |

### Forecasting Tools
| Tool | Description |
|------|-------------|
| `check_forecasting_config` | Validate AAF, DPE, and Account Manager Targets |
| `check_account_manager_targets` | Get targets for a specific manager or period |

### Configuration Check Tools
| Tool | Description |
|------|-------------|
| `check_mfg_user_config` | Validate user permission set assignments |
| `check_product_portfolio_config` | Validate product and catalog setup |
| `check_mfg_account_config` | Validate account structure |

### Health & Status Tools
| Tool | Description |
|------|-------------|
| `health_check` | Comprehensive org health check |
| `get_org_status` | Quick dashboard of key record counts |

### User Management Tools
| Tool | Description |
|------|-------------|
| `list_users` | List active users with filters |
| `list_permission_sets` | List permission sets with assignments |
| `assign_permission_set` | Assign permission set to users |
| `unassign_permission_set` | Remove permission set from users |

### Release Notes
| Tool | Description |
|------|-------------|
| `get_release_notes` | Manufacturing Cloud release notes by Salesforce release |

## Key Manufacturing Cloud Objects

**ALWAYS use these standard API names. NEVER use custom object names:**

| Domain | Correct Object | NEVER Use |
|--------|---------------|-----------|
| Sales | `SalesAgreement` | `SalesAgreement__c`, `SalesContract__c` |
| Sales | `SalesAgreementProduct` | `SalesAgreementProduct__c` |
| Sales | `SalesAgreementProductSchedule` | `SalesAgreementSchedule__c` |
| Forecasting | `AccountForecast` | `Forecast__c`, `AccountForecast__c` |
| Forecasting | `AcctMgrTarget` | `AccountManagerTarget__c`, `ManagerTarget__c` |
| Programs | `ManufacturingProgram` | `MfgProgram`, `ManufacturingProgram__c` |
| Visits | `Visit` | `Visit__c`, `PartnerVisit__c` |
| Visits | `ActionPlan` | `ActionPlan__c`, `VisitChecklist__c` |
| Warranty | `WarrantyTerm` | `WarrantyTerm__c`, `WarrantyContract__c` |
| Warranty | `WarrantyTermCoverage` | `WarrantyCoverage__c` |
| Warranty | `ProductWarrantyTerm` | `ProductWarranty__c` |
| Warranty | `Asset` | `Asset__c` |
| Rebates | `RebateProgram` | `RebateProgram__c` |
| Inventory | `ProductItem` | `InventoryItem__c`, `StockItem__c` |
| Inventory | `InventoryReservation` | `InventoryReservation__c` |
| Inventory | `InventoryItemReservation` | `InventoryItemReservation__c` |
| Inventory | `InventoryBatchItemReservation` | `InventoryBatchItemReservation__c` |
| Inventory | `InventorySerializedProductReservation` | `InventorySerializedProductReservation__c` |
| Inventory | `ProductItemAdditionalTransaction` | `ProductItemAdditionalTransaction__c` |
| Inventory | `ProductBatchItem` | `ProductBatchItem__c` |
| Inventory | `SerializedProduct` | `SerializedProduct__c` |

**CORRECT object names:** `SalesAgreement`, `AccountForecast`, `Visit`, `WarrantyTerm`, `ProductItem`, `SerializedProduct`, `RebateProgram`, `ManufacturingProgram`, `AcctMgrTarget`, `InventoryReservation`

**WRONG names (DO NOT USE):** `SalesAgreement__c`, `Forecast__c`, `Visit__c`, `WarrantyTerm__c`, `InventoryItem__c`, `SerializedProduct__c`, `RebateProgram__c`, `ManufacturingProgram__c`

> **Note:** `WarrantyClaim`, `WarrantyClaimProduct`, and `SupplierRecoveryContract` are NOT available in this org.

## Manufacturing Permission Sets

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers, sales reps |
| `ManufacturingServiceUser` | CSRs, warranty admins, claims adjudicators |
| `ManufacturingPartnerCommunityUser` | External distributors/dealers (Experience Cloud) |
| `ManufacturingAnalyticsUser` | Business analysts, sales ops |
| `WarrantyManagementUser` | Warranty term and claims admins |
| `SalesAgreementsUser` | Sales agreement compliance tracking |
| `RebateManagementUser` | Rebate program managers |
| `InventoryAllocationUser` | Inventory allocation managers (requires `ManageInventoryAllocation` perm) |

## Skills (Auto-invoked by Claude)

| Skill | When It's Used |
|-------|---------------|
| `mfg-implementation` | Implementing or configuring any MFG module |
| `mfg-sales-agreements` | Questions about Sales Agreements, run-rate business, planned vs. actual |
| `mfg-warranty` | Questions about warranty terms, claims, adjudication |
| `mfg-forecasting` | Questions about AAF, DPE, Account Manager Targets |
| `mfg-partner-visits` | Questions about partner/distributor visits, action plans |
| `mfg-user-management` | Questions about user access, permission sets |
| `mfg-data-model` | Questions about Manufacturing Cloud objects or SOQL |
| `salesforce-query` | Constructing SOQL queries |
| `mfg-inventory-allocation` | Questions about inventory allocation, deallocation, reservation APIs, inventory states, ProductItem quantities, batch/serialized allocation |
| `mfg-slack-analysis` | Analyzing support channel trends, common issues, question patterns |

## Commands (User-invoked with `/mfg:command`)

| Command | Description |
|---------|-------------|
| `/mfg:soql-query` | Run a SOQL query |
| `/mfg:describe` | Describe a Salesforce object's fields |
| `/mfg:health-check` | Comprehensive org health check |
| `/mfg:status` | Quick org dashboard |
| `/mfg:configure-sales-agreements` | Wizard to configure Sales Agreements |
| `/mfg:configure-forecasting` | Wizard to configure Advanced Account Forecasting |
| `/mfg:configure-visits` | Wizard to configure Partner Visit Management |
| `/mfg:configure-warranty` | Wizard to configure Warranty Lifecycle Management |
| `/mfg:configure-users` | Wizard to configure user management |
| `/mfg:diff-orgs` | Compare configuration between two orgs |
| `/mfg:export-config` | Export org configuration as JSON |
| `/mfg:help` | Search Manufacturing Cloud knowledge base |
| `/mfg:open-org` | Open the Salesforce org in browser |
| `/mfg:release-notes` | View MFG release notes by Salesforce release |
| `/mfg:slack-analysis` | Analyze MFG support Slack channel for question patterns and trends |
| `/mfg:audit` | Audit Manufacturing Cloud configuration for misconfigurations |
| `/mfg:docs` | Browse Manufacturing Cloud documentation by category |
| `/mfg:getting-started` | Interactive onboarding — check setup and discover capabilities |
| `/mfg:import-config` | Import Manufacturing Cloud configuration from JSON export |

## Agents

| Agent | Description |
|-------|-------------|
| `mfg-consultant` | Senior implementation consultant for complex multi-module projects |
| `mfg-admin` | Administrator for day-to-day operations and troubleshooting |
| `mfg-developer` | Developer for OmniStudio, DPE, BRE, and ERP integrations |

## Implementation Sequencing

### Sales Track (8–12 weeks)
1. User Management → Account Management → Product Portfolio
2. Sales Agreements (record types, price books, activation)
3. Advanced Account Forecasting (DPE templates, period setup)
4. Account Manager Targets + Partner Visit Management
5. ERP Integration (MuleSoft Accelerator for actuals sync)

### Service Track (10–14 weeks)
1. Asset data model + Warranty Terms
2. Service Console for Manufacturing
3. Warranty Claims + adjudication automation (BRE)
4. Inventory Management + Supplier Recovery
5. Product Service Campaigns (recalls/notices)

## Project Structure

```
claude-for-mfg/
├── .claude-plugin/plugin.json     # Plugin metadata
├── .mcp.json                      # MCP server config
├── CLAUDE.md                      # This file
├── package.json                   # Node.js dependencies
├── tsconfig.json                  # TypeScript config
├── src/
│   ├── index.ts                   # MCP server entry point
│   ├── knowledge-loader.ts        # Knowledge base loader
│   ├── salesforce/                # Salesforce CLI wrapper
│   │   ├── cli.ts
│   │   └── auth.ts
│   └── tools/
│       ├── sales-agreements.ts    # Sales Agreement tools
│       ├── partner-visits.ts      # Partner Visit tools
│       ├── warranty.ts            # Warranty & Claims tools
│       ├── forecasting.ts         # AAF + Account Manager Targets
│       ├── config-checks.ts       # MFG config validation
│       ├── health-check.ts        # Org health + status dashboard
│       ├── salesforce-org.ts      # Generic SOQL/CRUD
│       ├── user-management.ts     # Users + permission sets
│       ├── knowledge.ts           # Knowledge base search
│       ├── apex.ts                # Anonymous Apex execution
│       ├── bulk-operations.ts     # Bulk create/update
│       ├── metadata.ts            # Deploy/retrieve metadata
│       ├── diff.ts                # Org comparison
│       ├── config-export.ts       # Config export/import
│       └── release-notes.ts       # Release notes
├── skills/                        # Auto-invoked skill files
│   ├── mfg-implementation/SKILL.md
│   ├── mfg-sales-agreements/SKILL.md
│   ├── mfg-warranty/SKILL.md
│   ├── mfg-forecasting/SKILL.md
│   ├── mfg-partner-visits/SKILL.md
│   ├── mfg-user-management/SKILL.md
│   ├── mfg-data-model/SKILL.md
│   ├── mfg-inventory-allocation/SKILL.md
│   └── salesforce-query/SKILL.md
├── commands/                      # Slash commands
│   ├── configure-sales-agreements.md
│   ├── configure-forecasting.md
│   ├── configure-visits.md
│   ├── configure-warranty.md
│   ├── configure-users.md
│   ├── health-check.md
│   ├── status.md
│   ├── soql-query.md
│   └── ...
├── agents/                        # Specialized subagents
│   ├── mfg-consultant.md
│   ├── mfg-admin.md
│   └── mfg-developer.md
├── knowledge/                     # Manufacturing Cloud documentation
│   ├── modules/
│   │   ├── sales-agreements/
│   │   ├── advanced-account-forecasting/
│   │   ├── partner-visit-management/
│   │   ├── warranty-management/
│   │   ├── asset-service/
│   │   ├── inventory-management/
│   │   ├── product-portfolio/
│   │   └── ...
│   └── release-notes/             # Salesforce release notes
└── documentation/                 # Source PDFs and docs
```

## Resources

- [Manufacturing Cloud Documentation](https://help.salesforce.com/s/articleView?id=ind.mfg_manufacturing_cloud.htm)
- [Manufacturing Cloud Admin Guide PDF](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/manufacturing_admin.pdf)
- [Manufacturing Cloud Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.mfg_dev_guide.meta/mfg_dev_guide/)
- [Trailhead: Manufacturing Cloud Basics](https://trailhead.salesforce.com/content/learn/modules/manufacturing-cloud-admin-essentials)
- [MuleSoft Accelerator for Manufacturing](https://www.mulesoft.com/exchange/#!/accelerators-catalog-manufacturing)
- [Manufacturing Cloud Trailblazer Community](https://trailhead.salesforce.com/trailblazer-community/groups/0F94S000000kHi6SAE)
