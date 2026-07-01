---
name: mfg-user-journey-author
description: Use when the user asks for an end-to-end User Journey (UJ) for a Salesforce Manufacturing Cloud or Automotive Cloud feature — e.g. "create a UJ for Program Based Business", "give me the Account Manager Targets user journey", "draft a UJ for Sales Agreements / Advanced Account Forecasting / Partner Visit Management / Service Console / Rebates / Warranty Lifecycle". Produces a two-section (Setup + Transactional) journey written from the correct persona, with granular pre-reqs, exact UI/API steps, and expected technical outcomes, in the column layout used by `.claude/SampleUJ/RE Package UserJourney.xlsx`.
---

# Manufacturing / Automotive Cloud User Journey Author

## Overview

A UJ deliverable is **two journeys side by side**:

1. **Setup User Journey** — Admin / Sales Operations Manager builds the foundation (PSLs, fiscal year, templates, hierarchies, seed data).
2. **Transactional User Journey** — the feature's primary persona executes day-to-day work and downstream automations fire.

The skill's job is to take **one input — a feature name** — and emit both journeys keyed off the correct persona, objects, and scenarios. The persona is **not** "user" or "Sales Manager" by default — it depends on the feature (see `references/features.md`).

## When To Use

- User says "create / draft / generate a UJ for `<feature>`".
- User references `.claude/UJ` or `.claude/SampleUJ/RE Package UserJourney.xlsx`.
- User asks to swap one feature in an existing UJ for another (e.g. "same as Account Manager Targets but for Program Based Business").

Do **not** use this skill for:
- Cucumber `.feature` authoring → use the test authoring skills.
- Test-scenario CSVs / Taleggio uploads → use `test-plan-author` or the 20-column test plan format.
- Executable apiSteps JSON → use `mfg-apisteps-author`.

## Required Inputs

| Input | Required? | Example |
|---|---|---|
| Feature name | yes | "Program Based Business", "Account Manager Targets", "Sales Agreements", "Partner Visit Management" |
| Cloud | optional, defaults to Manufacturing | "Automotive Cloud" |
| Org / TaleggioId | optional, for grounding pre-reqs | `mfgNA81`, `T-17400182` |
| Source Cucumber file | optional, for scenario seeding | `MFGProgramBasedBusiness.feature` |

If the feature is not listed in `references/features.md`, ask the user once for: primary persona, top 3 objects, and one Setup + one Transactional scenario, then proceed and add the feature to `references/features.md` at the end.

## Authoring Workflow

1. **Resolve the feature** in `references/features.md` → primary persona, supporting personas, key objects, PSL, top scenarios.
2. **Resolve the persona profile** in `references/personas.md` → permission set licenses, day-to-day responsibilities, persona-correct verbs ("Account Manager *distributes*", "Service Agent *creates an engagement interaction*").
3. **Render Setup UJ** — 2–4 scenarios covering enable-feature, PSL/permission assignment, master-data / fiscal-year / template seeding, and any required Data Processing Engine / forecast-set wiring.
4. **Render Transactional UJ** — 3–5 scenarios covering the feature's core flow, period/account/product splitting, actuals roll-up, mid-cycle revision, and audit/history validation.
5. **Output as a markdown table** with the columns in `references/template.md` (Business Process | Complexity | Pre-requisites | Scenario | User Actions | Expected Technical Outcome | Priority).
6. **Persona consistency check** — every Transactional row's User Action must be performable by the resolved persona's PSL. If a row needs Admin rights, move it to Setup.

## Output Contract

Every UJ MUST contain:

- A header block: `Feature`, `Primary Persona`, `Supporting Personas`, `Permission Set License(s)`, `Key Objects`, `Source: <PDF section / Cucumber file / TaleggioId>`.
- Two H2 sections: `## 1. Setup User Journey` and `## 2. Transactional User Journey`.
- Inside each section, a markdown table with the columns from `references/template.md`.
- Every `Expected Technical Outcome` cell names the object/field that changes, the trigger that fires, and the validation (e.g. "`AccountManagerPeriodicTargetDistribution.Value__c` rolls up to parent `AccountManagerTarget.TotalTargetValue` after `Distribute` button; currency rounding deviation ≤ 0.01 per period").

## Examples of Persona Routing

| Feature | Primary persona (Transactional) | Setup persona |
|---|---|---|
| Account Manager Targets | Account Manager | Sales Operations Manager / Admin |
| Program Based Business | Program Manager / Account Manager | Admin + Data Pipelines Admin |
| Sales Agreements | Key Account Manager | Sales Operations Manager / Admin |
| Advanced Account Forecasting | Account Manager / Regional Manager | Admin + Data Pipelines Admin |
| Partner Visit Management | Sales Manager (planner) + Field Rep (executor) | Admin |
| Service Console for Manufacturing | Customer Service Representative (CSR) | Admin |
| Warranty Lifecycle Management | Warranty Admin + Claims Adjudicator | Admin |
| Rebate Management | Rebate Analyst + Distributor/Partner | Admin |

Full catalog: `references/features.md`. Persona PSLs and verbs: `references/personas.md`.

## Common Mistakes

- **Defaulting to "Account Manager" for every feature.** Program Based Business is owned by a **Program Manager** (PSL: `Program Based Business Psl for Manufacturing Cloud`); Rebates by a **Rebate Analyst**; Service Console by a **CSR**. Always re-resolve persona per feature.
- **Skipping the PSL row in Setup.** Without the right Permission Set License assignment, the Transactional UJ won't execute in the org. Every Setup section must include a PSL assignment scenario.
- **Quoting Cucumber step text verbatim.** UJ rows are persona-readable prose ("Account Manager clicks **Distribute** and selects monthly cadence"), not `Given/When/Then` step labels.
- **Mixing Setup and Transactional rows.** If the action requires `System Administrator` profile, it belongs in Setup. The Transactional persona never enters Setup → Quick Find.
- **Citing file paths in `Pre-requisites`.** Pre-reqs are org/data/permission conditions; never reference the apiSteps JSON path or `.feature` path (carries over from `feedback_prerequisite_no_test_data_path` and `feedback_gus_test_scenario_no_file_refs`).

## References

- `references/personas.md` — persona catalog distilled from `manufacturing_admin.pdf` (PSLs + day-to-day verbs).
- `references/features.md` — feature → persona / objects / PSL / Setup-vs-Transactional scenario seeds.
- `references/template.md` — column layout matching `.claude/SampleUJ/RE Package UserJourney.xlsx`.
- Salesforce admin PDF: https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/manufacturing_admin.pdf