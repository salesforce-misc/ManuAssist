# Decision Tables — Invoke & Refresh

---

## How to Invoke a Decision Table

Decision tables are invoked via:
- **Salesforce Flow** — using the Decision Table custom action (most common)
- **Connect REST API** — for programmatic invocations
- **Apex** — using Apex methods
- **Custom Invocable Action** — wraps the decision table for use in other contexts

Only **active** decision tables can be invoked.

---

## Invoking in Flow — Without Dataset Link

Use this when you want to pass specific values directly (not records from an object).

1. Setup → Flows → **New Flow** → select flow type
2. Drag **Action** element onto the canvas
3. In the Action window:
   - Category: **Decision Table**
   - Search for the decision table and select the result **suffixed with `default`**
   - Enter a name for the action element
4. For each input field to include:
   - Add the input field
   - Provide the value to evaluate (from a Flow variable or literal)
5. **Important:** If the decision table has a **Group By** field, you **must** include that field and provide its value
6. For Picklist (Multi-Select) input fields: provide **only one value** — you cannot use semicolons as separators
7. Click **Done** → wire up subsequent elements → Save and activate

**Reading outcomes:**
- `{!ActionName.outcomeType}` — Single, Multiple, or Zero
- `{!ActionName.singleOutcome.<FieldApiName>}` — when one match
- Loop `{!ActionName.outcomeList}` — when multiple matches

---

## Invoking in Flow — With Dataset Link

Use this when evaluating records from objects that are mapped in a dataset link.

1. Follow steps 1–3 above, but select the action result **suffixed with the dataset link name** (not `default`)
2. Specify the records whose field values the decision table must evaluate:
   - Pass the record variable(s) from earlier Get Records steps
3. For Picklist (Multi-Select) input fields mapped in the dataset link: ensure the source record field contains only **one value**
4. If Group By is configured: the dataset link must include the source object and field for the group input field
5. Click **Done** → wire up elements → Save and activate

**Choosing the right action suffix:**
- `[Table Name] - default` → invocation without dataset link
- `[Table Name] - [Dataset Link Name]` → invocation with that dataset link's record mapping

---

## Outcome Variables

| Variable | Description |
|----------|-------------|
| `outcomeType` | `Single`, `Multiple`, or `Zero` — tells you how many rules matched |
| `singleOutcome` | Populated when exactly one rule matched (or first outcome after sort). Access fields via `.singleOutcome.<FieldApiName>` |
| `outcomeList` | Populated when two or more rules matched. A collection to loop over. Fields accessible as `.Discount__c`, etc. |

**Sort order and singleOutcome:** If a sort order is configured and multiple rules match, `singleOutcome` holds the **first** outcome after sorting. `outcomeList` holds all outcomes in sort order.

---

## Example Flow: Weekly Order Discount Update

This flow evaluates all Order records with no discount and updates them weekly.

**Flow type:** Scheduled-Triggered Flow

**Elements (in order):**
1. **Get Records** (`Get Order Records`) — fetch all Orders where `Discount` is null
2. **Loop** (`Loop All Order Records`) — iterate first to last
3. **Get Records** (`Get Order Product Records`) — for the current Order, get the linked Order Product (filter by `OrderId = {!Loop_All_Order_Records.Id}`, first record only)
4. **Get Records** (`Get Product Records`) — get the Product (filter by `Id = {!Get_Order_Product_Records.Product2Id}`, first record only)
5. **Action** (`Evaluate Order Records`) — Decision Table action with dataset link
   - Order field: `{!Loop_All_Order_Records}`
   - Product field: `{!Get_Product_Records}`
6. **Update Records** (`Update Order Records`) — update the Order's `Discount__c` with `{!Evaluate_Order_Records.singleOutcome.Discount__c}`
7. Loop back to **Loop All Order Records**

**Connect order:** Get Order Records → Loop → Get Order Product Records → Get Product Records → Evaluate Order Records → Update Order Records → (back to loop)

---

## Refresh a Decision Table

After rules are added, updated, or deleted in the source object, the decision table must be
refreshed to pick up the changes. An activated decision table does NOT automatically pick up
rule changes.

**Manual refresh:** Open the decision table → click **Refresh**

**Flow-based refresh:**
1. Setup → Flows → **New Flow** → select flow type
2. Drag **Action** element → select **Refresh Decision Table**
3. In `DecisionTableApiName`: enter the API name of the decision table
4. Save and activate the flow

> Refresh takes several minutes. **Last Refresh Date** shows when it was most recently refreshed.

Use a **Scheduled-Triggered Flow** to automate refreshes when rules change regularly (e.g. nightly or weekly).

---

## Runtime Override Behavior and Gotchas

### operator Field Replaces Definition Operator at Runtime

When passing `conditionsList` in a Decision Table invocation call, each entry's `operator` field **completely replaces** the operator stored in the table definition — not just the value. A table defined with `Equals` can be invoked with `GreaterThan` at runtime without modifying the definition.

### Prohibited Input Fields

`IsDeleted` and `LastModifiedDate` are explicitly rejected as condition input field names with a validation error. These system fields cannot be used in condition definitions regardless of the source object.

### Group By Values Must Be Strings

In the Decision Table invocation request body, **all Group By field values must be passed as strings** — including integers and decimals. For example, a numeric Group By value of `100` must be submitted as `"100"`. Passing a bare JSON number causes a matching failure even when the stored data has the same numeric value.

---

## Invocation Rate Limits Summary

| Scenario | Max invocations/hour |
|----------|---------------------|
| All decision tables combined (cumulative org-wide cap) | 430,000 |
| Tables evaluating < 10,000 rules (cumulative) | 400,000 |
| Tables evaluating > 10,000 rules (cumulative) | 30,000 |
| Tables with Group By, < 10,000 rules (cumulative) | 1,500,000 |
| Tables with Group By, > 10,000 rules (cumulative) | 150,000 |

> Limits are **cumulative across all decision tables in the org** — not per individual table.
> Limits for Connect REST API invocations and custom invocable action count against the > 10,000 rule limit.

**Example:** Two tables each with < 10,000 rules, invoked 265,000 + 135,000 = 400,000 times/hour — exactly at the < 10,000 rules cumulative limit.

---

## Invocable Actions — Full API Reference

### Decision Matrix Actions (`runDecisionMatrix`)

Invoke a decision matrix directly from a flow, integration procedure, or REST.

**URI:** `POST /services/data/v55.0/actions/custom/runDecisionMatrix/{UniqueName}`

Where `{UniqueName}` is the `UniqueName` field value on the `CalculationMatrix` record.

**Available version:** 55.0
**Authentication:** `Authorization: Bearer token`
**Formats:** JSON

#### Inputs

Inputs vary per decision matrix. Pass the matrix's input column headers as keys.

#### Outputs

Outputs vary per decision matrix. Output column headers are returned as keys in `outputValues`.

#### Request / Response Shape

**Request:**
```json
{
  "inputs": [
    { "age": "25", "state": "NY" },
    { "age": "25", "state": "CA" }
  ]
}
```

**Response:**
```json
[
  {
    "actionName": "premiumTaxLookup",
    "errors": null,
    "isSuccess": true,
    "outputValues": { "premium": 2400.0, "tax": 200.0 }
  },
  {
    "actionName": "premiumTaxLookup",
    "errors": [{ "statusCode": "REQUIRED_FIELD_MISSING", "message": "Missing required input parameter: age", "fields": [] }],
    "isSuccess": false,
    "outputValues": null
  }
]
```

**Flow configuration:** Set `actionType = runDecisionMatrix` on `FlowActionCall`.

---

### Decision Table Refresh Action (`refreshDecisionTable`)

Refresh business rules for an active decision table.

**URI:** `GET/POST /services/data/vXX.X/actions/standard/refreshDecisionTable`
**Available version:** 51.0
**Authentication:** `Authorization: Bearer token`

#### Input Parameters

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `decisionTableApiName` | string | **Required** | API name of the active decision table to refresh. |
| `isIncremental` | boolean | Optional | Whether to trigger an incremental refresh (`true`) instead of a full refresh (`false`). Default: `false`. Incremental refresh only processes changes to recent sObject data. **Important:** A full refresh must be performed first before any incremental refresh. If changes exceed 2,000 records, the incremental refresh fails and a full refresh is required. |

#### Output Parameters

| Output | Type | Description |
|--------|------|-------------|
| `status` | string | Whether the decision table is queued. Valid values: `Queued`, `Failed`. |
| `errorMessage` | string | Error message if the request was not successful. |

#### Request/Response Example

```json
// Request
{ "inputs": [{ "decisionTableApiName": "Points_to_Redeem_Based_on_Product_and_Order_Channel", "isIncremental": true }] }

// Response
{ "status": "Queued", "errorMessage": "" }
```

---

### Decision Table Actions (`decisionTableAction`)

Invoke an active decision table.

**Available version:** 51.0
**Authentication:** `Authorization: Bearer token`
**HTTP Methods:** GET, POST

#### URI Patterns

| Scenario | URI Pattern |
|----------|-------------|
| Without dataset link | `/services/data/vXX.X/actions/custom/decisionTableAction/{dtApiName}_Default` |
| With dataset link | `/services/data/vXX.X/actions/custom/decisionTableAction/{datasetLinkApiName}` |

To determine which URI to use, query `DecisionTableDatasetLink` — if your decision table's ID appears there, a dataset link is active.

#### Input Parameters

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| Input fields defined at DT creation | Various | At least one required | For invocations without dataset link: pass input field names directly as keys. |
| `sObjectType` | sObject | Optional | For invocations with dataset link: the name of the dataset link's source object whose records the decision table must evaluate. |

#### Output Parameters

| Output | Type | Description |
|--------|------|-------------|
| `outcomeType` | string | Outcome type. Valid values: `Multiple Match`, `No Match`, `Single Match`. |
| `singleOutcome` | sObject | The outcome when a single match is returned, or one outcome when multiple match. |
| `outcomeList` | sObject (collection) | All outcome rows when two or more rules match. **A decision table invoked via the custom invocable action can return up to 50 outcomes.** |

#### Request/Response Examples

**Without dataset link:**
```json
// Request
{ "inputs": [{ "Product__c": "Cloud Kicks", "Price__c": 1000 }] }

// Response
[{ "outcomeType": "SINGLE MATCH", "singleOutcome": { "Points": 100 }, "outcomeList": [{ "Points": 100 }] }]
```

**With dataset link (single source object):**
```json
{ "inputs": [{ "Transaction__c": { "Product__c": "Cloud Kicks", "Price__c": 1000 } }] }
```

**With dataset link (multiple source objects):**
```json
{
  "inputs": [
    { "Transaction__c": { "Product__c": "Cloud Kicks", "Price__c": 1000 } },
    { "Catalog__c": { "name": "Highest_Price_Point_c", "value": "500" } }
  ]
}
```

---

## ConnectApi Apex Reference — Decision Table

### ConnectApi.DecisionTable.execute()

Execute an active decision table from Apex.

**API version:** 51.0
**Requires Chatter:** No

**Signature:**
```apex
public static ConnectApi.DecisionTableOutcome execute(
    String decisionTableId,
    ConnectApi.DecisionTableInput decisionTableInput
)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `decisionTableId` | String | ID of the decision table to execute. |
| `decisionTableInput` | ConnectApi.DecisionTableInput | Input object containing conditions and optional dataset link name. |

**Return value:** `ConnectApi.DecisionTableOutcome`

**Example:**
```apex
ConnectApi.DecisionTableInput input = new ConnectApi.DecisionTableInput();
input.datasetLinkName = 'DSL1'; // Optional
input.conditions = new List<ConnectApi.DecisionTableCondition>();

ConnectApi.DecisionTableCondition condition = new ConnectApi.DecisionTableCondition();
condition.fieldName = 'Brand__c';
condition.value = 'Cloud Kicks';
input.conditions.add(condition);

ConnectApi.DecisionTableOutcome output = ConnectApi.DecisionTable.execute('01Dxxxj23444', input);
```

---

### ConnectApi.DecisionTableInput (Input Class)

| Property | Type | Required | Available Version | Description |
|----------|------|----------|-------------------|-------------|
| `conditions` | `List<ConnectApi.DecisionTableCondition>` | Required | 51.0 | List of conditions for the decision table execution. |
| `datasetLinkName` | String | Optional | 51.0 | API name of the dataset link to use. |

### ConnectApi.DecisionTableCondition (Input Class)

| Property | Type | Required | Available Version | Description |
|----------|------|----------|-------------------|-------------|
| `fieldName` | String | Required | 51.0 | API name of the input field. |
| `value` | Object | Required | 51.0 | Value of the data type selected as input. |
| `operator` | String | Optional | 51.0 | Runtime operator — **overrides the operator stored in the table definition**. Valid values: `DoesNotExistIn`, `Equals`, `ExistsIn`, `GreaterOrEqual`, `GreaterThan`, `LessOrEqual`, `LessThan`, `Matches`, `NotEquals`. |
| `sourceObject` | String | Optional | 52.0 | Name of the source object. Required only when the dataset link has multiple source objects. |

### ConnectApi.DecisionTableOutcome (Output Class)

| Property | Type | Available Version | Description |
|----------|------|-------------------|-------------|
| `errorCode` | Integer | 51.0 | Error code if the transaction failed. |
| `errorMessage` | String | 51.0 | Error message if the transaction failed. |
| `outcomeList` | `List<ConnectApi.DecisionTableOutcomeItem>` | 51.0 | All outcome rows. **Maximum 50 outcomes when invoked via custom invocable action.** |
| `outcomeType` | String | 51.0 | Outcome type. Valid values: `MultipleMatch`, `NoMatch`, `SingleMatch`. |
| `successStatus` | Boolean | 51.0 | Whether the execution was successful. |

### ConnectApi.DecisionTableOutcomeItem (Output Class)

| Property | Type | Available Version | Description |
|----------|------|-------------------|-------------|
| `values` | `Map<String, Object>` | 51.0 | Key-value pairs of output field API names to their values. Returned in sort order if sort is configured. |
