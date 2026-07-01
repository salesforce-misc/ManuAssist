# Penny Perfect Pricing (PPP) Module — Design

**Date:** 2026-07-01
**Status:** Approved design → ready for implementation plan
**Repo:** claudeForMFG (Claude for Manufacturing Cloud plugin)

## 1. Summary

Penny Perfect Pricing (PPP) is the Consumer Goods Cloud **Complex Pricing Engine**
being brought into Manufacturing Cloud **core**. It is a configuration-driven pricing
engine: you model **keys** and **search strategies** to *find* the right pricing
conditions, then a **calculation schema** *executes* ordered calculation steps
(base price, surcharges, discounts) to price an order. Extensibility comes from
**Pricing Context Definitions** (add custom attributes to condition search) and
**User Exits** (inject JavaScript at search/calculation steps).

This module packages PPP knowledge for the plugin, mirroring the existing
`inventory-allocation` module exactly: **5 knowledge docs + 1 auto-invoked skill +
1 configure command + CLAUDE.md registry wiring.**

## 2. Key design decision — two-layer representation

PPP appears at **two layers** in the source material, and they do not use the same
objects. Both are documented with **equal weight**, with a mapping table between them.

| Concept | Conceptual model (BPO / off-core) | Core runtime (verified 2026-06-30) |
|---------|-----------------------------------|-------------------------------------|
| Key Type / Search Strategy / Specification / Calc Schema | 15 BPO objects (`KeyType`, `SearchStrategy`, `PricingConditionTemplate`, `CalculationSchema`, …) | `ExpressionSet` records — `usageType=DefaultPricing`, 4 `usageSubtype`s: `PricingKeyType` → `PricingSearchStrategy` → `PricingSpecification` → `PricingCalculationSchema` |
| Pricing conditions (price matrix / merge-key rows) | `PricingCondition` object | HBase table `PPP.EXT_PRICING_KEY_VALUE_CONSOL_RECORD`, surfaced as virtual sObject **`ExtlPrcKeyValCnsldView`** |
| Pricing invocation | offline/online JS engine | `POST /connect/contexts` (hydrate) → `POST /connect/core-pricing/price-contexts/{id}` (price); context `AdvOrderSalesTxnContext__stdctx` |
| Enablement | CG Cloud setup | Org pilots `AdvncdRetailExecutionPilot` + `ContextServicePilot` |
| Computation | user-exit JS | `PennyPerfectPricingComputation` calc-schema step (2 inputs / 10 outputs) |

The **concepts are identical** across both layers (Key Type → Search Strategy →
Specification → Calc Schema, merge/unique keys, grouping conditions, user exits).
The core *implementation* is ExpressionSet + HBase, not the 15 BPO objects — this is
the "bringing off-core into core" story.

## 3. The 15 conceptual (BPO) objects

All standard API names, no `cgcloud_dev__` namespace, per the CLAUDE.md rule:

`KeyAttribute`, `KeyType`, `SearchStrategy`, `SearchStrategyStep`,
`PricingConditionTemplate`, `PricingConditionStage`, `PricingConditionScaleStage`,
`PricingCondition`, `PricingContextDefinition`, `UserExit`, `UserExitContent`,
`CalculationSchema`, `CalculationSchemaStep`, `CalculationSchemaDetermination`.

## 4. Knowledge docs (`knowledge/modules/penny-perfect-pricing/`)

| File | Contents |
|------|----------|
| **overview.md** | What PPP is; business value; design principles; two-layer model at a glance; 6-step config flow; core concepts (merge/unique key, grouping, user exits, pricing context); access/pilots; SOQL quick-reference |
| **data-model.md** | **§A Conceptual (BPO):** 15 objects + fields (from the field workbook), merge-key vs unique-key generation logic (both flowcharts transcribed as ASCII). **§B Core runtime:** ExpressionSet subtypes + bottom-up build order, `ExtlPrcKeyValCnsldView` schema + `UniqueKeyHashValue` formula, `ConsolidatedPricing` JSON shape. **§C Mapping table** BPO ↔ ExpressionSet/HBase |
| **api-reference.md** | **Pricing invocation:** hydrate (`POST /connect/contexts`), price (`POST /connect/core-pricing/price-contexts/{id}`), ExpressionSet authoring API, `PennyPerfectPricingComputation` element mapping (2 inputs / 10 outputs, OMIT PriceWaterFall). **User Exits:** the 4 types with params/return values + online & offline implementation + `CustomPlugins.ComplexPricingEngine.*` debug entry points |
| **configuration.md** | 6-step config flow (Key Attribute → Key Type → Search Strategy (+Steps) → Pricing Condition Template → Calculation Schema → Calculation Schema Determination); PricingContextDefinition setup; grouping-condition config; pilot enablement; troubleshooting |
| **functional-flows.md** | End-to-end pricing calculation flow; condition search (merge/unique key); grouping conditions (exclusive / non-exclusive, scale-based, item-template rules); user-exit invocation points; the **E2E setup-and-test playbook** (crawl → build ExpressionSets bottom-up → load HBase → hydrate → price) with verified gotchas (IOU consistency, unique ExternalId, multi-currency readback limitation); the 4 extensibility use cases; customer user journey + persona FAQ |

### Doc-split rationale
- **User Exits live in `api-reference.md`** — they are the developer-facing contract
  surface (function params, return values, online/offline impl).
- **E2E playbook lives in `functional-flows.md`** — it is the operational
  "how the pieces move end to end" narrative.

## 5. Skill, command, CLAUDE.md wiring

- **`skills/mfg-penny-perfect-pricing/SKILL.md`** — auto-invoked. Description triggers on:
  penny perfect pricing, complex pricing engine, pricing conditions, key types/attributes,
  search strategies, calculation schema, condition search, merge key / unique key,
  user exits, grouping conditions, pricing context definition, ExpressionSet
  `DefaultPricing`, `ExtlPrcKeyValCnsldView`, hydrate/price-contexts.
- **`commands/configure-penny-perfect-pricing.md`** — `/mfg:configure-penny-perfect-pricing`
  interactive wizard walking the 6-step config flow.
- **CLAUDE.md updates:** add the skill row (Skills table), the command row (Commands →
  Inventory & Analytics or a new Pricing group), PPP objects into the "Key Objects"
  table (canonical core names + ExpressionSet/HBase runtime), and a note that the
  PPP permission set / license name is **TBD** (feature-gated by pilots today).

## 6. Decisions captured

- **Scope:** Full module (match inventory-allocation).
- **Object names:** Treat the conceptual BPO names as canonical core names (no namespace).
- **Permission set:** Leave out for now — document access as pilot-gated / TBD.
- **Screenshots:** Text-only (transcribe flowcharts as ASCII/mermaid; no image embeds),
  matching existing modules.
- **Data model:** Two parallel layers (conceptual BPO + core runtime) with equal weight
  and a mapping table.
- **E2E playbook:** Include as a setup/testing section in `functional-flows.md`.

## 7. Source material

- Pricing configuration flow + schema-builder config (slide deck, Schema Builder JPEG)
- Merge Key / Unique Key generation flowcharts (JPEG)
- Data-model field workbook — "CG Cloud - Retail Execution - PPP" (16 sheets)
- Demo / extensibility use cases doc (4 cases)
- User Exit types & examples doc (4 exit types, online + offline)
- Grouping Conditions doc
- **PPP E2E Test-Data Setup Playbook** (git.soma `shubham-kishore/claude-playground`) —
  the verified core-runtime reality (ExpressionSet + HBase + Connect APIs + pilots)

## 8. Non-goals (YAGNI)

- No MCP server tools for PPP in this pass (docs/skill/command only), matching how the
  module knowledge is delivered before tool wiring.
- No image embeds; flowcharts are transcribed.
- No invented permission-set names.
- No unrelated refactoring of existing modules.
