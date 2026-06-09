# Decision Tables — Create & Configure

---

## Step 0: Prepare the Business Rules Object

Before creating a decision table, the source object must exist and be populated.

**Rules for the source object:**
- Can be a standard object, custom object, or custom metadata type
- Must have `CreatedDate` and `IsDeleted` fields (most standard and custom objects do by default)
- **Cannot use these standard objects as source:** Account, Contact, Lead, Opportunity, Case
- Fields you intend to use as inputs and outputs must already exist on the object
- Rules are added as individual records — each record = one business rule
- The decision table reads rules in order of `CreatedDate` if there are more than 100,000 records (only the first 100,000 are read)

---

## Step 1: Create the Decision Table

**Permission required:** System Administrator profile

1. Setup → Quick Find → `Decision Tables` → **Decision Tables**
2. Click **New**
3. Enter:
   - **Name** — human-readable name; API name is auto-populated
   - **Source Object** — the object or CMT that contains the business rules
4. Click **Next**

---

## Step 2: Select Inputs, Outputs, Sort Order

### Inputs
- Select fields from the source object to use as inputs (up to **30 input fields**)
- For each input field, select an **operator** (how incoming values are compared against rule records)
- To group business rules: select the frequently-used input field and assign **Equals** as its operator (see Group By below)

**Input field constraints:**
- Picklist (Multi-Select) input: the decision table reads up to **512 characters** (including semicolons as separators); only the first values that total 512 characters are considered
- Number fields: the decision table reads only the first **15 digits**

### Outputs
- Select fields whose values become the outcomes (up to **5 output fields**)
- **Picklist (Multi-Select) fields cannot be selected as output fields**

### Sort Order
- Optionally select an input or output field to sort outcomes when multiple rules match
- Select the sort direction: Ascending/Descending with Blank Value First/Last
- Select **Don't Use** for fields you don't want the decision table to consider at all
- **Cannot sort on picklist or multi-select picklist fields**

Click **Next**

---

## Step 3: Set Input Fields Condition and Group By

### Input Fields Condition
Choose how the input fields are evaluated together:

| Condition | Behavior |
|-----------|----------|
| **All conditions are met (AND)** | All input fields must match a rule for the rule to produce an outcome |
| **Any condition is met (OR)** | If any one input field matches a rule, the rule produces an outcome |
| **Custom Logic** | Boolean expression using field sequence numbers (e.g. `(1 AND 2) OR 3`) |

For **Custom Logic**: the Number column in the wizard shows each field's sequence number. Write the expression using those numbers with AND / OR / parentheses.

### Group By
- Select an input field as the Group By field to split rules into groups
- Only the group matching the provided value is evaluated — dramatically reduces rows processed
- **Constraints:**
  - Only one Group By field per decision table
  - Must use **AND** condition (not OR or Custom Logic)
  - The Group By field must use the **Equals** operator
  - Output fields cannot be Group By fields
  - When invoking, you must always pass the Group By field's value

Click **Save**

---

## Step 4: Activate the Decision Table

**Pre-activation requirement:**
- The source object must contain **100,000 or fewer** rule records. If it has more, activation fails.

To activate: open the decision table → action menu → **Activate**

> Activation can take **several minutes**. The **Last Activated Date** field shows when it was most recently activated.

To deactivate: action menu → **Deactivate** (deactivated tables cannot be run in flows)

---

## Input Fields Condition Examples

| Condition | Business Rules (Example) | Input Values | Output |
|-----------|--------------------------|--------------|--------|
| **AND** | Rule 1: Qty < 50, Product = Running Shoes, Category = Shoes → 5% discount | Qty=60, Product=Running Shoes, Category=Shoes | 10% (matches Rule 2: Qty ≥ 50) |
| **OR** | Same rules | Qty=60, Product=Running Shoes, Category=Shoes | 5%, 10%, 7% (any field matches any rule) |
| **Custom Logic** `(1 AND 2) OR 3` | Rules as above | Qty=20, Product=Athletic Shorts, Category=Accessories | 7% (fields 1+2 don't match Rule 1/2 as a pair, but field 3 alone matches Rule 3) |

---

## Group By in Practice

**When to use Group By:**
- You have a widely used input field that divides your rules into manageable groups
- You want to invoke the decision table more than 30,000 times per hour
- Best when groups have fewer than 1,000 records each

**Example:**
A shoe company has 30,000 rules for discount by shoe type and quantity.
- Group By: `Shoe Type`
- When the decision table is invoked with `Shoe Type = Running`, only the ~900 Running rules are evaluated instead of all 30,000

**Invocation requirement:** When Group By is configured, the Group By field value **must be included** in the invocation — otherwise the invocation fails.

---

## Refresh the Decision Table

After adding, updating, or deleting rule records in the source object, refresh the decision table so it reads the latest rules.

**Manual refresh:** Open the decision table → click **Refresh**

> Refresh can take **several minutes**. The **Last Refresh Date** field shows when it was most recently refreshed.

**Flow-based refresh (async, schedulable):**
1. Setup → Flows → **New Flow**
2. Select flow type and layout
3. Drag **Action** element → select **Refresh Decision Table**
4. In `DecisionTableApiName` field: enter the API name of the decision table
5. Click **Done** → Save and activate the flow

Use a scheduled-trigger flow to automate refreshes when rules change frequently.

---

## Distribute Decision Tables

Decision tables can be shared with other Salesforce orgs via:
- **Change Sets**
- **Managed Packages**
- **Unmanaged Packages**

ISVs and partners can distribute decision tables to their customers using managed packages.

---

## DecisionTable Metadata Type — Complete Reference

Represents a decision table.

**File suffix:** `.decisionTable`
**Directory:** `decisionTables`
**Available version:** 51.0 and later
**Parent type:** Metadata (inherits `fullName`)
**Special Access Rules:** Requires a Loyalty Management or Rebate Management license.
**Wildcard support in package.xml:** Yes (implied by Metadata base type)

### DecisionTable Fields

| Field | Type | Description |
|-------|------|-------------|
| `collectOperator` | string | Aggregate function for results. Valid values: `Count`, `Maximum`, `Minimum`, `None`, `Sum`. |
| `conditionCriteria` | string | Custom boolean logic for condition evaluation. |
| `conditionType` | string | How conditions are evaluated. Valid values: `All`, `Any`, `Custom`. |
| `dataSourceType` | string | The type of data source. Valid values: `ContextDefinition`, `CsvUpload`, `MultipleSobjects`, `SingleSobject`. |
| `decisionTableParameters` | DecisionTableParameter[] | List of parameters (input, output, and row criteria columns). |
| `decisionTableSourceCriterias` | DecisionTableSourceCriteria[] | List of source criteria (pre-filters on source data). |
| `description` | string | A description of the decision table. |
| `doesConsiderNullValue` | boolean | Whether null values are considered during evaluation. Default: `false`. |
| `downloadStatus` | string | Download status of the decision table. Valid values: `Completed`, `DownloadInProgress`, `Failed`. Available v64.0+. |
| `executionType` | string | The execution engine. Valid values: `Dmo`, `Hbase`, `Hbpo`, `Solr`, `Soql`. Note: `Hbase` must be passed as `HBASE` in POST/PATCH requests. |
| `filterResultBy` | string | How results are filtered. Valid values: `AnyValue`, `CollectOperator`, `FirstMatch`, `OutputOrder`, `Priority`, `RuleOrder`, `UniqueValues`. |
| `hasIncrementalSyncFailed` | boolean | Whether the last incremental sync failed. |
| `isIncrementalSyncEnabled` | boolean | Whether incremental sync is enabled. |
| `lastIncrementalSyncDate` | string | Date of the last incremental sync. |
| `lastSyncDate` | string | Date of the last sync. |
| `refreshFailureReason` | string | Reason why the last refresh failed. |
| `refreshStatus` | string | Current refresh status. Valid values: `Completed`, `Failed`, `InProgress`, `Initiated`. |
| `setupName` | string | **Required.** The name appearing in Setup. |
| `sourceConditionLogic` | string | Logic for source conditions. |
| `sourceObject` | string | **Required.** The source Salesforce object. |
| `status` | string | Current status. Valid values: `ActivationInProgress`, `Active`, `Draft`, `Inactive`. |
| `type` | string | Decision table type. Valid values: `Advanced`, `HighScaleExecution`, `HighVolume`, `LowVolume`, `MediumVolume`, `RealTime`. |
| `uploadStatus` | string | Upload status. Valid values: `Completed`, `CompletedWithErrors`, `Failed`, `UploadInProgress`. |
| `usageType` | string | Intended use case. Valid values: `Bre`, `ComplianceControl`, `DecompositionEnrichmentMapping`, `DefaultPricing`, `DefaultRating`, `EventOrchestration`, `FinancialServicesCloud`, `FulfillmentCondition`, `GpaCalculation`, `InsuranceClaimProcessing`, `ItServiceManagement`, `PlanCostCalculation`, `PriceProtection`, `PricingDiscovery`, `ProductCategoryQualification`, `ProductQualification`, `RatingDiscovery`, `RecordAlert`, `ShipAndDebit`, `StudentInformationSystem`, `StudentSuccess`, `TestProcess`, `WarrantyClaim`. |

### DecisionTableParameter (child element)

Defines an input, output, or row-criteria column of the decision table.

| Field | Type | Description |
|-------|------|-------------|
| `fieldName` | string | **Required.** The API name of the field. |
| `usage` | string | **Required.** The parameter usage. Valid values: `INPUT`, `OUTPUT`, `ROWCRITERIA`. Note: `ROWCRITERIA` defines an additional row-level filter applied after initial matching. |
| `dataType` | string | The data type. Valid values: `Boolean`, `Currency`, `Date`, `DateTime`, `Number`, `Percent`, `String`. |
| `decimalScale` | int | Number of decimal places for numeric values. |
| `domainObject` | string | The domain object for polymorphic fields. |
| `fieldPath` | string | The field path in relation to the source object. |
| `isGroupByField` | boolean | Whether this parameter is the Group By field. |
| `isPriorityField` | boolean | Whether this parameter is the priority field (sort key when `filterResultBy = Priority`). Only one parameter per table can have this set. |
| `isRequired` | boolean | Whether this field is required at invocation time. |
| `length` | int | Maximum length of the field value. |
| `operator` | string | Comparison operator. Valid values: `Contains`, `DoesNotExistIn`, `DoesNotMatch`, `Equals`, `ExistsIn`, `GreaterOrEqual`, `GreaterThan`, `IsNotNull`, `IsNull`, `LessOrEqual`, `LessThan`, `Matches`, `NotEquals`. |
| `sequence` | int | Sequence number (order of evaluation). Available v52.0+. |
| `sortType` | string | Sort type. Valid values: `AscNullFirst`, `AscNullLast`, `DescNullFirst`, `DescNullLast`, `None`. Available v56.0+. |

### DecisionTableSourceCriteria (child element)

Defines a pre-filter applied to the source data.

| Field | Type | Description |
|-------|------|-------------|
| `sequenceNumber` | int | **Required.** The sequence number of this source criteria. |
| `sourceFieldName` | string | **Required.** The API name of the source field to filter on. |
| `operator` | string | The comparison operator. Valid values: `Contains`, `DoesNotExistIn`, `DoesNotMatch`, `Equals`, `ExistsIn`, `GreaterOrEqual`, `GreaterThan`, `IsNotNull`, `IsNull`, `LessOrEqual`, `LessThan`, `Matches`, `NotEquals`. |
| `value` | string | The value to compare against. |
| `valueType` | string | The type of the value. Valid values: `Formula`, `Literal`, `Lookup`, `Parameter`, `Picklist`. |

### XML Sample Definition

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DecisionTable xmlns="http://soap.sforce.com/2006/04/metadata">
    <collectOperator>None</collectOperator>
    <conditionType>All</conditionType>
    <dataSourceType>SingleSobject</dataSourceType>
    <decisionTableParameters>
        <dataType>String</dataType>
        <fieldName>ProductCode</fieldName>
        <isRequired>true</isRequired>
        <operator>Equals</operator>
        <sequence>1</sequence>
        <usage>INPUT</usage>
    </decisionTableParameters>
    <decisionTableParameters>
        <dataType>Currency</dataType>
        <fieldName>UnitPrice</fieldName>
        <isRequired>false</isRequired>
        <sequence>2</sequence>
        <usage>OUTPUT</usage>
    </decisionTableParameters>
    <description>Price lookup table for products</description>
    <doesConsiderNullValue>false</doesConsiderNullValue>
    <executionType>Soql</executionType>
    <filterResultBy>FirstMatch</filterResultBy>
    <setupName>ProductPriceLookup</setupName>
    <sourceObject>Product2</sourceObject>
    <status>Active</status>
    <type>LowVolume</type>
    <usageType>DefaultPricing</usageType>
</DecisionTable>
```

### package.xml Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>ProductPriceLookup</members>
        <name>DecisionTable</name>
    </types>
    <version>66.0</version>
</Package>
```
