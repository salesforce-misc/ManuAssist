# UJ Output Template — Reference: `UJ/InventoryAllocation UserJourney.xlsx`

The UJ MUST be written as a real `.xlsx` workbook under the repo `UJ/` folder. Filename pattern:

```
UJ/<FeatureNameCamelCase> UserJourney.xlsx
```

e.g. `UJ/ProgramBasedBusiness UserJourney.xlsx`, `UJ/SalesAgreements UserJourney.xlsx`, `UJ/PartnerVisitManagement UserJourney.xlsx`.

Markdown table preview in chat is fine, but the **deliverable is always the `.xlsx`**.

## Workbook Structure (matches `InventoryAllocation UserJourney.xlsx`)

Two worksheets:

1. `<Feature> SetUp` — Setup journey rows.
2. `<Feature Short> Transactional` — Transactional journey rows.

Each sheet has **10 columns, in this exact order**:

| # | Column header | Notes |
|---|---|---|
| A | Setup Journey | Scenario ID + short title — e.g. `PBB-SU-01 Enable Program Based Business`. On Transactional sheet, prefix is `PBB_TC001`, `PBB_UI_TC001`, etc. |
| B | Owner | Leave blank for author to fill in. |
| C | Reviewer | Leave blank for author to fill in. |
| D | Business Process | Short noun phrase — `Master Data`, `Forecast Ingestion`, `Component Derivation`, `Partner Portal`. |
| E | Features | Pipe-delimited list of feature facets touched + (Transactional only) `Feature File`, `TaleggioId`, `Seed` references where known. |
| F | Complexity | Tier label + bullet list using `P0/P1/P2` markers, one per line, mirroring the Inventory Allocation style (`P0: Foundation\n<Object>\nP0\n…`). Use `\n` newlines inside the cell. |
| G | Complexity Map | Detailed sub-bullets with field/object names + `P0/P1/P2` priority per line. Cell is multi-line. |
| H | Pre-requisites | Numbered list of org / data / permission conditions only. Never reference a JSON or `.feature` file path. |
| I | Scenarios | Numbered list of explicit UI / API steps. First step always names the persona and the app. Include button labels, field names, REST endpoints, expected validations inline. |
| J | Priority | `P0` / `P1` / `P2`. |

## Header Block (chat preview only — NOT a row in the xlsx)

When previewing in chat before writing the xlsx, include:

```
**Feature:** <feature name>
**Cloud:** Manufacturing Cloud | Automotive Cloud
**Primary Persona (Transactional):** <persona>
**Setup Persona(s):** <persona(s)>
**Permission Set License(s):** <PSL name(s)>
**Key Objects:** <object1>, <object2>, ...
**Source:** PDF §<section> | Feature file: <name>.feature | TaleggioId: <id>
**Output:** UJ/<Feature> UserJourney.xlsx
```

## Scenario ID Conventions

- Setup rows: `<FEATURE>-SU-NN` (e.g. `PBB-SU-01`, `SAG-SU-02`, `AAF-SU-03`).
- Transactional rows: `<FEATURE>_TC0NN` for API/headless scenarios, `<FEATURE>_UI_TC0NN` for UI/LWC scenarios (matches Inventory Allocation reference).
- Zero-padded, sequential per sheet.

## Minimum Row Counts

- Setup sheet: **6–10 rows**, mirroring Inventory Allocation breadth (master data, feature-enable, PSL assignment, template/forecast wiring, user-and-permission row).
- Transactional sheet: **3–5 rows**, with at minimum:
  - core happy-path API/headless scenario
  - split/distribution / period-level / multi-location variant
  - partial / negative / replay scenario
  - audit-trail or revision verification
  - (when applicable) a `_UI_TC` row that exercises the LWC / page-layout flow

## Writing the .xlsx

Use Python `openpyxl` (or equivalent) — never an XML/JSON shim. Preserve cell newlines (`\n`) and wrap text on columns F, G, H, I. Match the Inventory Allocation header styling: bold row 1, freeze first row, set reasonable column widths (A ~ 40, D 22, E 35, F/G 50, H 35, I 70, J 10).
