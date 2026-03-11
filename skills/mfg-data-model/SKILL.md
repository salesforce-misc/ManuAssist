---
name: mfg-data-model
description: Expert knowledge of the Manufacturing Cloud data model — key objects, relationships, and correct API names. Use when user asks about Manufacturing Cloud objects, field names, object relationships, or needs to construct SOQL queries.
---

# Manufacturing Cloud Data Model

Manufacturing Cloud uses **standard Salesforce platform objects** — no managed package namespace. All objects are available in standard SOQL.

## Core Objects by Domain

### Sales Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Sales Agreement | `SalesAgreement` | Header for a long-term committed business agreement |
| SA Product | `SalesAgreementProduct` | Products on an agreement |
| SA Product Schedule | `SalesAgreementProductSchedule` | Planned/actual qty and revenue by period |

### Forecasting Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Account Forecast | `AccountForecast` | Forecast header per account and period |
| Forecast Period Metric | `AccountForecastPeriodMetric` | Metric values by dimension and period |
| Account Manager Target | `AcctMgrTarget` | Revenue/quantity target for an account manager |
| Target Distribution | `AcctMgrTargetDstr` | Target broken down by product, account, period |

### Program-Based Business
| Object | API Name | Description |
|--------|----------|-------------|
| Manufacturing Program | `ManufacturingProgram` | OEM customer program (production commitment) |
| Program Template | `MfgProgramTemplate` | Template defining program structure |
| Program Template Item | `MfgProgramTemplateItem` | Items within a program template |
| Program Forecast Fact | `MfgProgramForecastFact` | Supplier forecast derived from program |
| Program Component Forecast | `MfgProgramCpntFrcstFact` | Component-level forecast within a program |
| Program Variant Forecast | `MfgProgramVariantFrcstFact` | Variant-level forecast within a program |

### Partner Engagement
| Object | API Name | Description |
|--------|----------|-------------|
| Visit | `Visit` | Scheduled visit to a partner/distributor |
| Action Plan | `ActionPlan` | Instance of a task checklist on a Visit |
| Action Plan Template | `ActionPlanTemplate` | Reusable checklist definition |
| Action Plan Template Item | `ActionPlanTemplateItem` | Individual task in a template |

### Warranty & Service Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Warranty Term | `WarrantyTerm` | Warranty coverage definition |
| Warranty Term Coverage | `WarrantyTermCoverage` | Specific coverage details within a warranty term |
| Product Warranty Term | `ProductWarrantyTerm` | Link between Product2 and WarrantyTerm |
| Asset | `Asset` | Physical product sold to a customer |
| Asset Warranty | `AssetWarranty` | Link between Asset and WarrantyTerm |
| Product Service Campaign | `ProductServiceCampaign` | Product recall or service notice |
| Supplier | `Supplier` | Supplier account record |
| Supplier Product | `SupplierProduct` | Products supplied by a specific supplier |

### Inventory Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Product Item | `ProductItem` | Inventory stock record at a location |
| Product Item Transaction | `ProductItemTransaction` | Transaction history for inventory items |
| Location | `Location` | Warehouse or distribution site |
| Inventory Reservation | `InventoryReservation` | Reserved stock for a work order or transfer |
| Inventory Item Reservation | `InventoryItemReservation` | Item-level reservation detail |
| Product Transfer | `ProductTransfer` | Transfer of parts between locations |
| Inventory Count Plan | `InventoryCountPlan` | Plan for physical inventory counting |
| Inventory Count Plan Item | `InventoryCountPlanItem` | Items within an inventory count plan |
| Inventory Replenishment Policy | `InventoryReplenishmentPolicy` | Auto-replenishment rules for inventory |

### Asset Service Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Asset Milestone | `AssetMilestone` | Key moment in an asset's lifecycle |
| Asset Account Participant | `AssetAccountParticipant` | Accounts associated with an asset |
| Asset Contact Participant | `AssetContactParticipant` | Contacts associated with an asset |
| Asset Relationship | `AssetRelationship` | Parent/child or related asset linkages |
| Asset State Period | `AssetStatePeriod` | Tracks asset state changes over time |
| Asset Attribute | `AssetAttribute` | Custom attribute values for an asset |
| Fleet Asset | `FleetAsset` | Asset tracked as part of a fleet |
| Work Order | `WorkOrder` | Field service work order |

### Rebate Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Rebate Program | `RebateProgram` | Rebate program definition |
| Rebate Program Member | `RebateProgramMember` | Account enrolled in a rebate program |
| Rebate Claim | `RebateClaim` | Claim for rebate payout |
| Rebate Payment | `RebatePayment` | Payment issued for a rebate claim |
| Program Rebate Type | `ProgramRebateType` | Rebate type within a program |

### Partner & Channel Domain
| Object | API Name | Description |
|--------|----------|-------------|
| Channel Program | `ChannelProgram` | Channel partner program definition |
| Partner Fund Allocation | `PartnerFundAllocation` | MDF/co-op fund allocation to partners |
| Partner Fund Claim | `PartnerFundClaim` | Partner's claim against allocated funds |
| Partner Fund Request | `PartnerFundRequest` | Partner's request for fund allocation |
| Partner Staged Data | `PartnerStagedData` | POS/sell-through data staged from partners |
| Partner Unsold Inventory | `PartnerUnsoldInventory` | Distributor inventory not yet sold through |
| Sales Contract Line | `SalesContractLine` | Line items on a sales contract |

## Critical Naming Rules

**ALWAYS use these — NEVER use the __c variants:**
- `SalesAgreement` NOT `SalesAgreement__c` or `SalesContract__c`
- `WarrantyTerm` NOT `WarrantyTerm__c`
- `AcctMgrTarget` NOT `AccountManagerTarget__c` or `ManagerTarget__c`
- `ManufacturingProgram` NOT `MfgProgram` or `ManufacturingProgram__c`
- `Visit` NOT `Visit__c` or `PartnerVisit__c`
- `ActionPlan` NOT `ActionPlan__c`
- `RebateProgram` NOT `RebateProgram__c`

**NOTE:** `WarrantyClaim` and `WarrantyClaimProduct` do NOT exist in this org. Warranty management is handled via `WarrantyTerm`, `WarrantyTermCoverage`, `ProductWarrantyTerm`, and `AssetWarranty`.

## Key Relationships

```
Account ──────────────────────┐
   │                          │
   ├─── SalesAgreement        │
   │       └─ SalesAgreementProduct
   │            ├─ SalesAgreementProductSchedule
   │            └─ SalesAgreeProductAttribute
   │
   ├─── Visit ─── ActionPlan ─── ActionPlanItem
   │       ├─── VisitedParty
   │       └─── GenericVisitTask
   │
   ├─── Asset ─── AssetWarranty ─── WarrantyTerm ─── WarrantyTermCoverage
   │       ├─── AssetMilestone
   │       ├─── AssetRelationship
   │       └─── FleetAsset
   │
   ├─── RebateProgramMember ─── RebateProgram ─── ProgramRebateType
   │
   └─── ManufacturingProgram ─── MfgProgramTemplate ─── MfgProgramTemplateItem

Product2 ──── SalesAgreementProduct
        ──── ProductItem (at Location)
        ──── ProductWarrantyTerm ─── WarrantyTerm
        ──── AcctMgrTargetDstr (target by product)
        ──── SupplierProduct ─── Supplier
```
