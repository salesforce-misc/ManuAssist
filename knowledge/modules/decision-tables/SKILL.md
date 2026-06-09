---
name: decision-tables
description: >
  Decision Tables domain knowledge for Manufacturing Cloud Advanced. Use this skill when
  the user asks about: Decision Tables, business rules, rule evaluation, discount
  rules, decision table inputs/outputs, operators, dataset links, Group By,
  outcome sorting, invoking decision tables in Flows, refreshing decision tables,
  decision table limits, distributing decision tables, or how RCA uses decision
  tables for pricing and discount logic.
---

# Decision Tables Skill

> **Category: Common Service Skill** — available across Salesforce Industries clouds; used in Manufacturing Cloud Advanced (RCA) for pricing and discount rule evaluation.

You are an expert on Salesforce Decision Tables as used in Manufacturing Cloud Advanced (RCA).
This skill covers the full lifecycle: design → create → configure → activate → invoke → refresh → distribute.

**Reference files to read at the start of every session:**
- `skills/decision-tables/references/concepts-and-architecture.md`
- `skills/decision-tables/references/create-and-configure.md`
- `skills/decision-tables/references/dataset-links.md`
- `skills/decision-tables/references/invoke-and-refresh.md`
- `skills/decision-tables/references/limits-and-gotchas.md`

---

## Phase 1 — Understand the Role in the Feature

Before answering, establish what the user is building:
- Are they configuring rules for pricing discounts, rebates, or loyalty?
- Are they setting up a new decision table from scratch, or debugging an existing one?
- Are they working with dataset links to evaluate records from multiple objects?
- Are they invoking via Flow, Apex, or Connect API?
- Are they hitting limits (100k rules, invocation caps, Group By constraints)?

Clarify if the context is ambiguous.

---

## Phase 2 — Configuration Guidance

When guiding through setup:
1. Start from business rules: the rules object/CMT must exist and be populated first
2. Walk through Decision Table creation: source object → inputs + operators → outputs → sort order → condition type → Group By
3. Guide on when to use Group By (high-volume, frequently filtered field, always AND + Equals)
4. Guide on dataset link setup: which objects to map, type-compatibility constraints
5. Activation prerequisites: ≤100,000 rules in source object, at least one input + one output selected

Always flag constraint violations early:
- Source objects that can't be used (Account, Contact, Lead, Opportunity, Case — and objects missing CreatedDate/IsDeleted)
- Multi-select picklist can't be output; can't sort on picklist fields
- Group By requires AND condition and Equals operator; only one Group By field allowed
- Picklist (Multi-Select) inputs only support one value at invocation time (no semicolons)

---

## Phase 3 — Test Scenario Design

When helping design tests for decision table features:

**Core test scenarios to cover:**
- Single match: input matches exactly one rule → single outcome
- Multiple matches: input matches multiple rules → outcome list
- No match: input matches no rules → zero outcomes
- Blank input field: rule with blank field is skipped for that field; other fields still evaluated
- Sort order: verify outcomes are ordered correctly (ascending/descending, blank first/last)
- AND vs OR vs Custom Logic: verify each condition type produces correct outcomes
- Group By: verify grouped invocation returns correct results and respects group field value

**Pre-test checklist:**
- [ ] Source object exists and has rules populated
- [ ] Decision table is Active (activation can take several minutes)
- [ ] If rules were updated after last activation: decision table has been Refreshed
- [ ] Dataset link is configured if testing record-based invocations
- [ ] User invoking the flow has "Run Decision Tables" permission
- [ ] Read permission on source object and all input/output fields

**Key verification points:**
- `Outcome Type` field: Single, Multiple, or Zero
- `Single Outcome` field: only set when exactly one match (or first match after sort)
- `Outcome List` field: set when 2+ matches
- If Group By is used: the group field value must be passed in the invocation

---

## Phase 4 — Flow Integration

When building or testing flows that invoke decision tables:
- Always check whether the decision table has dataset links — this determines which action suffix to select (default vs dataset link name)
- For dataset link invocations: pass the record variable, not individual field values
- For non-dataset link invocations: pass each input field's value explicitly
- Group By field must always be included in the invocation input
- Output variables: use `singleOutcome.<FieldApiName>` or iterate `outcomeList` for multiple results
- Refresh action (`Refresh Decision Table`): async — use in a scheduled flow or when rules change frequently

---

## Phase 5 — Limits and Distribution

Key limits to keep in mind:
- Read `limits-and-gotchas.md` for the full table
- Highlight Group By as the primary performance lever for high-volume invocations
- For distribution: change sets, managed packages, or unmanaged packages are all supported
- Business Rules Engine (BRE) is the extended version — flag if the user's org has BRE enabled

**Do not confuse with:**
- Decision Matrix (separate concept in BRE) — if user mentions BRE + Decision Matrix, note this skill covers standalone Decision Tables only
- Legacy CPQ discount schedules — Decision Tables are the native RCA/BRE approach
