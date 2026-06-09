# Decision Tables — Concepts & Architecture

**Last updated from:** Salesforce Decision Tables documentation, 2026.04.27

---

## What Decision Tables Are

Decision Tables are a **rule evaluation engine** that reads business rules stored in Salesforce
objects or custom metadata types (CMTs) and returns outcomes based on those rules.

**Use case:** Instead of coding business logic directly into Apex or Flow, you store the rules
as records in an object. The Decision Table evaluates input values against those records and
returns one or more output values as outcomes.

```
INPUT VALUES (from Flow / Apex / API)
        │
        ▼
DECISION TABLE
  ├── reads rules from → SOURCE OBJECT (SObject / CMT records)
  ├── evaluates input fields against rule records
  └── returns → OUTCOMES (single output value or list of output values)
```

A single Decision Table can read up to **100,000 business rules** and return multiple outcomes
when input values match more than one rule.

---

## Key Terms

### Before You Create a Decision Table

| Term | Description |
|------|-------------|
| **Business Rules** | The records in a standard object, custom object, or custom metadata type that the decision table reads to evaluate outcomes. A decision table can read up to 100,000 rules. |
| **Source Object** | The object or custom metadata type that stores the business rules. Must have `CreatedDate` and `IsDeleted` fields. |

> The following additional terms apply to the Metadata API, Tooling API, and BRE-extended decision tables.

| Term | Description |
|------|-------------|
| **`dataSourceType`** | (metadata/Tooling API) Valid values: `ContextDefinition`, `CsvUpload`, `MultipleSobjects`, `SingleSobject`. `ContextDefinition` evaluates against a hydrated context rather than a SOQL query. Available v59.0+. Default: `SingleSobject`. |
| **`executionType`** | (metadata/Tooling API) The backing storage/execution engine. Valid values: `Dmo`, `Hbase`, `Hbpo`, `Solr`, `Soql`. Salesforce sets this automatically. `Soql` = standard; `Solr` = search-indexed (high-volume). Appears in API responses and affects query behavior. |
| **`type` field values** | Full valid values for the `type` field on the DecisionTable metadata type and Tooling API object: `Advanced`, `HighScaleExecution`, `HighVolume` (reserved for future use), `LowVolume`, `MediumVolume`, `RealTime`. Default: `LowVolume`. |
| **`usageType` field — full values** | Full valid values for the `usageType` field: `Bre`, `ComplianceControl`, `DecompositionEnrichmentMapping`, `DefaultPricing`, `DefaultRating`, `EventOrchestration`, `FinancialServicesCloud`, `FulfillmentCondition`, `GpaCalculation`, `InsuranceClaimProcessing`, `ItServiceManagement`, `PlanCostCalculation`, `PriceProtection`, `PricingDiscovery`, `ProductCategoryQualification`, `ProductQualification`, `RatingDiscovery`, `RecordAlert`, `ShipAndDebit`, `StudentInformationSystem`, `StudentSuccess`, `TestProcess`, `WarrantyClaim`. |
| **`uploadStatus`** | (Tooling API/metadata) CSV upload status. Valid values: `Completed`, `CompletedWithErrors`, `Failed`, `UploadInProgress`. |
| **`hasIncrementalSyncFailed`** | (metadata) Whether the last incremental sync failed. |
| **`isIncrementalSyncEnabled`** | (metadata) Whether incremental sync is enabled for the decision table. |
| **`lastIncrementalSyncDate`** | (metadata) Date of the last incremental sync. |
| **`lastSyncDate`** | (metadata/Tooling API) Date of the last full sync/refresh. |
| **Invocable Actions URI pattern** | Decision Matrix: `/services/data/v55.0/actions/custom/runDecisionMatrix/{UniqueName}`. Decision Table without dataset link: `/services/data/vXX.X/actions/custom/decisionTableAction/{dtApiName}_Default`. Decision Table with dataset link: `/services/data/vXX.X/actions/custom/decisionTableAction/{datasetLinkApiName}`. |
| **`refreshDecisionTable` incremental limit** | If changes to sObject data exceed 2,000 records, an incremental refresh fails and a full refresh is required to restore consistency. |
| **`outcomeType` string values in REST vs Apex** | REST API returns: `Single Match`, `Multiple Matches`, `No Match`. Apex `ConnectApi.DecisionTableOutcome.outcomeType` returns: `SingleMatch`, `MultipleMatch`, `NoMatch` (no spaces). |

### While Creating a Decision Table

| Term | Description |
|------|-------------|
| **Input** | Fields from the source object that the decision table uses to evaluate incoming values. A table can have up to 30 input fields. |
| **Operator** | Defines how an input field value is compared against each rule record. One operator per input field (e.g. Equals, Less Than, Matches). |
| **Output** | Fields from the source object whose values become the outcomes when a rule matches. A table can have up to 5 output fields. A Picklist (Multi-Select) field cannot be an output. |
| **Sort Order** | When multiple outcomes are returned, they are sorted by a selected input or output field. Cannot sort on picklist or multi-select picklist fields. |
| **Input Fields Condition** | Determines how input fields are evaluated together: **All conditions are met (AND)**, **Any condition is met (OR)**, or **Custom Logic** (e.g. `(1 AND 2) OR 3`). |
| **Custom Logic** | A boolean expression using the sequence numbers of the input fields (e.g. `(1 AND 2) OR 3`). Available only when Custom Logic condition type is selected. |
| **Group By** | An input field used to split business rules into groups, allowing only the matching group to be evaluated. Reduces rules processed per invocation. Requires AND condition + Equals operator. Only one Group By field allowed per table. An output field cannot be used as Group By. |
| **`filterResultBy`** | (metadata/API) Full set of values: `AnyValue`, `CollectOperator`, `FirstMatch`, `OutputOrder`, `Priority`, `RuleOrder`, `UniqueValues`. `OutputOrder` sorts by output field values; `UniqueValues` deduplicates output rows. |
| **`isPriorityField`** | (API) On `DecisionTableParameter` — when `true`, this output parameter's value is used as the sort key when `filterResultBy = Priority`. Only one parameter per table can have this set. |
| **`ROWCRITERIA` usage type** | (API) `usageType` on `DecisionTableParameter` accepts `ROWCRITERIA` in addition to `INPUT` and `OUTPUT`. A `ROWCRITERIA` parameter defines an additional row-level filter applied after initial matching — distinct from input conditions. |
| **`RowLevelOverrideType`** | (Tooling API) Accepts `Both`, `Condition`, `None`. `Condition` allows runtime override of condition values only; `Both` allows override of both conditions and outputs. Set via Tooling API; not exposed in metadata type. |
| **`dataSourceType = ContextDefinition`** | (metadata) When set, the table's input conditions are evaluated against a hydrated context rather than a direct SOQL query. Requires a linked Context Definition. |

### After Creating a Decision Table

| Term | Description |
|------|-------------|
| **Dataset Link** | Maps the decision table's input fields to fields on one or more source objects. Tells the decision table which object field values to evaluate when invoked with records. Up to 5 dataset links per table; up to 5 source objects per dataset link. |

### When Invoking in Flows

| Term | Description |
|------|-------------|
| **Decision Table action** | The Flow action that invokes an active decision table. Suffixed with `default` (no dataset link) or the dataset link name (with records). |
| **Outcome Type** | Output field indicating whether the decision table returned a single outcome, multiple outcomes, or zero outcomes. |
| **Single Outcome** | Stores the output when exactly one rule matches, or the first outcome after sort order is applied. |
| **Outcome List** | Stores all outcomes when two or more rules match. Ordered by sort field if configured. |

### After Updating Business Rules

| Term | Description |
|------|-------------|
| **Refresh** | Reloads the decision table with the latest rules from the source object. Required after any add/update/delete of rule records. Can be done manually or via a Flow action. |

---

## How a Decision Table Evaluates Rules

1. **Input values** are passed in (from a Flow variable, Apex, or API call)
2. The decision table reads rule records from the source object
3. For each rule record, it checks each input field against the corresponding rule value using the configured operator
4. If the input fields condition is satisfied (AND / OR / Custom Logic), the rule **matches**
5. The output field values of all matched rules are returned as **outcomes**

### Blank fields in rules
If a rule record has a **blank value for an input field**, the decision table **ignores that field** when evaluating the rule. This means the rule can match based on the remaining non-blank input fields alone — potentially producing additional outcomes.

> **Example:** A rule with Category = (blank) and Price ≤ 2000 will match ANY product priced ≤ 2000, regardless of category.

---

## Supported Data Types and Operators

| Data Type | Supported Operators |
|-----------|---------------------|
| Text | Equals, Not Equals, Matches |
| Number | Equals, Not Equals, Less Than, Less or Equal, Greater Than, Greater or Equal |
| AutoNumber | Equals, Not Equals, Matches |
| Percentage | Equals, Not Equals, Less Than, Less or Equal, Greater Than, Greater or Equal |
| Date | Equals, Not Equals, Less Than, Less or Equal, Greater Than, Greater or Equal |
| Checkbox | Equals, Not Equals |
| Picklist | Equals, Not Equals, Matches |
| Picklist (Multi-Select) | Exists In, Does Not Exist In |
| Lookup | Equals, Not Equals |
| Master Detail | Equals, Not Equals |
| Email | Equals, Not Equals, Matches |
| URL | Equals, Not Equals, Matches |

### Operator definitions

| Operator | Checks whether the input value... |
|----------|----------------------------------|
| Equals | Equals the value of the rule's corresponding field |
| Not Equals | Does not equal the value of the rule's corresponding field |
| Matches | Is a substring of the value of the rule's corresponding field |
| Less Than | Is less than the value of the rule's corresponding field |
| Less or Equal | Is less than or equal to the value of the rule's corresponding field |
| Greater Than | Is greater than the value of the rule's corresponding field |
| Greater or Equal | Is greater than or equal to the value of the rule's corresponding field |
| Exists In | Exists in the multi-select picklist value of the rule's corresponding field |
| Does Not Exist In | Does not exist in the multi-select picklist value of the rule's corresponding field |

---

## Outcome Sorting

When a decision table returns multiple outcomes, you can sort them:

| Sort Order | Behavior |
|------------|----------|
| Ascending with Blank Value First | Ascending order; records with no sort field value appear first |
| Ascending with Blank Value Last | Ascending order; records with no sort field value appear last |
| Descending with Blank Value First | Descending order; records with no sort field value appear first |
| Descending with Blank Value Last | Descending order; records with no sort field value appear last |

> Cannot sort on picklist or multi-select picklist fields.

---

## User Permissions

| Action | Required Permission |
|--------|---------------------|
| Create, edit, activate a decision table | System Administrator profile + Loyalty Management or Rebate Management permission set |
| Invoke a decision table in Flow | `Run Decision Tables` permission (enabled by default on System Admin profile; can be enabled on: Contract Manager, Marketing User, Read Only, Solution Manager, Standard User, Partner Community User/Login, Customer Community Plus User/Login, Customer Community User/Login, Channel Account User) |
| Invoke via API / invocable action | `Run Decision Tables` permission + Read on source object + Read on all input/output fields |

> System Administrators have default access to create and invoke decision tables without additional permission sets.

---

## How Decision Tables Are Used in Manufacturing Cloud Advanced

In RCA, Decision Tables are primarily used for:
- **Pricing discounts** — evaluate product category, quantity, price bands against discount rules
- **Rebate calculations** — determine rebate tiers based on purchase volume or product type
- **Loyalty rewards** — calculate point multipliers or tier thresholds
- **Order discount automation** — weekly scheduled flows that evaluate Order records and populate Discount fields

Decision Tables replace hardcoded Apex logic for business rules that change frequently, giving
admins the ability to update rules by editing object records — no deployment required.
