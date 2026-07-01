# Feature Catalog — Manufacturing / Automotive Cloud

For every feature: primary persona, supporting personas, PSL, key objects, and the **Setup** + **Transactional** scenario seeds the UJ author should expand into table rows. Sources are sections of `manufacturing_admin.pdf` plus the persona catalog in `personas.md`.

---

## Account Manager Targets

- **Primary (Transactional):** Account Manager
- **Setup:** System Administrator + Sales Operations Manager
- **PSL:** `Manufacturing Account Manager Targets Psl`
- **Key objects:** `AccountManagerTarget`, `AccountManagerTargetDistribution`, `AccountManagerPeriodicTargetDistribution`
- **Setup scenarios:**
  - Enable Account Manager Targets in Setup; assign PSL.
  - Configure Fiscal Year (monthly + quarterly cadence) and Period definitions.
  - Sales Operations Manager creates the macro/parent target for FY and distributes to Account Manager(s).
  - Re-parenting / reorg: reassign target ownership and validate roll-up.
- **Transactional scenarios:**
  - Account Manager breaks down assigned target by Account, Product Category, and SKU.
  - Period-level splitting across months/quarters; verify rounding ≤ 0.01.
  - Actuals roll-up from Closed-Won Opportunities / Sales Agreements / Orders.
  - Mid-year revision; verify audit trail / history tracking.

---

## Program Based Business

- **Primary (Transactional):** Program Manager (a.k.a. account manager who owns programs)
- **Setup:** System Administrator + Data Pipelines / DPE Admin
- **PSL:** `Program Based Business Psl for Manufacturing Cloud` (+ `Manufacturing Advanced Account Forecast Psl` + Data Pipelines)
- **Key objects:** `ManufacturingProgram`, `ManufacturingProgramTemplate`, `ManufacturingProgramTemplateItem`, `ManufacturingProgramForecastFact`, `ManufacturingProgramVariantForecastFact`, `ManufacturingProgramComponentForecastFact`
- **Setup scenarios:**
  - Enable Program Based Business in Setup; also enable Advanced Account Forecasting and Data Pipelines.
  - Assign Program Based Business PSL to Program Manager; Data Pipelines Base User PSL to DPE Admin.
  - Create / clone the Manufacturing Program Template; configure template items with forecast sets and transformation type.
  - Configure Advanced Account Forecast Set used as the source for component derivation.
- **Transactional scenarios:**
  - Program Manager creates the Manufacturing Program from the template, links customer accounts and variants.
  - Ingest customer forecast (CSV Data Management for Industries) into Manufacturing Program Forecast Fact.
  - Run the DPE definition; verify Manufacturing Program Component Forecast Fact records are derived per period × component.
  - Adjust a variant/component forecast; verify audit and re-derivation behavior.
  - Partner / Experience Cloud user views the program forecasts on the partner portal (if `Advanced Account Forecast For Community Psl` is assigned).

---

## Sales Agreements

- **Primary (Transactional):** Key Account Manager
- **Setup:** System Administrator + Sales Operations Manager
- **PSL:** `Manufacturing Sales Agreements Psl` (+ `Manufacturing Sales Agreements For Community Psl` for partner portal)
- **Key objects:** `SalesAgreement`, `SalesAgreementProduct`, `SalesAgreementProductSchedule`
- **Setup scenarios:** Enable Sales Agreements; assign PSL; configure schedule frequency and price book; load product catalog.
- **Transactional scenarios:** Create agreement, add products + schedules, activate, track planned vs actual, recalculate actuals via batch, renew/revise mid-term, partner view in Experience Cloud.

---

## Advanced Account Forecasting

- **Primary (Transactional):** Account Manager + Regional Manager
- **Setup:** System Administrator + Data Pipelines / DPE Admin
- **PSL:** `Manufacturing Advanced Account Forecast Psl`
- **Key objects:** `AdvancedAccountForecastSet`, `AdvancedAccountForecastSetUse`, `AdvancedAccountForecastSetPartner`, `AdvancedAccountForecastFact`, `AdvancedAccountForecastFactAdjustment`, `AdvancedAccountForecastPeriod`, `AdvancedAccountForecastPeriodGroup`
- **Setup scenarios:** Enable Advanced Account Forecasting; configure forecast set, period groups, periods; assign set partners; wire DPE definition.
- **Transactional scenarios:** Generate forecast facts; Account Manager adjusts at child-account level; Regional Manager reviews roll-up at parent-account level; partner views forecast on Experience Cloud.

---

## Partner Visit Management

- **Primary (Transactional):** Sales Manager (planner) → Field Rep (executor)
- **Setup:** System Administrator
- **PSL:** `Partner Visit Management` (+ `Partner Visit Management for Experience Cloud Psl` for partner-side)
- **Key objects:** Visit, Visited Party, Action Plan, Action Plan Template, Action Plan Template Item
- **Setup scenarios:** Enable Partner Visit Management; configure visit types; create Action Plan Templates with template items.
- **Transactional scenarios:** Sales Manager schedules visit + assigns template → Field Rep checks in, completes tasks, captures metrics, submits → Sales Manager reviews completed-visit report and triggers follow-ups (sales agreement renewal, warranty expiration).

---

## Service Console for Manufacturing

- **Primary (Transactional):** Customer Service Representative (CSR)
- **Setup:** System Administrator
- **PSL:** `Industry Service Excellence` (+ `Action Plans`, `Actionable Relationship Center`, `Business Milestones and Life Events Access`)
- **Key objects:** Case, Engagement Interaction, Engagement Topic, Engagement Attendee, Record Alerts, Audit Trail, Identity Verification
- **Setup scenarios:** Enable Service Console; configure Service Process Studio; configure Identity Verification + Record Alerts + Action Launcher; build Audit Trail policies.
- **Transactional scenarios:** CSR receives inbound case → runs Identity Verification → launches service process from Action Launcher → creates engagement interaction → reviews record alerts → closes case with milestone update.

---

## Warranty Lifecycle Management

- **Primary (Transactional):** Warranty Admin (definitions) + Service Tech (assignment) + Claim Analyst (adjudication)
- **Setup:** System Administrator
- **PSL:** `Warranty Lifecycle Management Psl`, `Claims Management Foundation`
- **Key objects:** Warranty Term, Warranty Term Coverage, Code Set, Code Set Relationship, Claim, Claim Item, Claim Coverage, Claim Coverage Payment Detail, Claim Participant
- **Setup scenarios:** Enable warranty lifecycle; create warranty terms + coverage; build code sets + relationships; configure claim adjudication decision tables (Business Rules Engine).
- **Transactional scenarios:** Assign warranty to asset; partner submits claim from Experience Cloud → Claim Analyst validates and adjudicates → payout is calculated → audit trail recorded.

---

## Rebate Management

- **Primary (Transactional):** Rebate Analyst (internal) + Distributor (partner)
- **Setup:** System Administrator + Business Rules Designer
- **PSL:** Rebate Management PSL + `Business Rules Engine Designer`
- **Key objects:** Rebate Program, Proof of Sale, Sales Report, Rebate Payout
- **Setup scenarios:** Enable Rebate Management; configure rebate program; build calculation procedure in BRE.
- **Transactional scenarios:** Distributor submits proof of sale on partner portal → Rebate Analyst validates → BRE calculates payout → payout disbursed; mid-program revision and audit.

---

## Asset Service Lifecycle / Work Order Estimation / Product Service Campaign

- **Primary (Transactional):** Service Technician + Service Agent
- **Setup:** System Administrator
- **PSL:** `Asset Service Lifecycle Management`
- **Key objects:** Asset, Asset Milestone, Work Order, Work Order Estimate, Product Service Campaign, Product Service Campaign Item
- **Setup scenarios:** Enable asset service lifecycle; configure campaigns and milestones; map asset relationships.
- **Transactional scenarios:** Service Agent generates work order estimate for customer; Service Technician executes work order; campaign rolls up; milestones closed.

---

## Adding A New Feature

If the user asks for a UJ for a feature not in this list:

1. Ask once for: primary persona, top 3 objects, one Setup and one Transactional scenario.
2. Verify the persona against `personas.md` and the feature's PSL row in the admin PDF.
3. Author the UJ, then append a section here following the same shape.