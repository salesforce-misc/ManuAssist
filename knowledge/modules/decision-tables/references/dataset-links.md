# Decision Tables — Dataset Links

---

## What Dataset Links Are

A **dataset link** maps a decision table's input fields to fields on one or more Salesforce
objects. It tells the decision table *which object field values* to evaluate when the table
is invoked with records (instead of hardcoded values).

Without a dataset link, you must explicitly pass each input field's value at invocation time.
With a dataset link, you pass a record (or collection of records), and the decision table
reads the mapped field values directly.

```
DECISION TABLE INPUT FIELDS
  ├── Maximum Quantity ──────────► Order.Order_Quantity__c   (via dataset link)
  ├── Minimum Quantity ──────────► Order.Order_Quantity__c   (via dataset link)
  └── Product Name ──────────────► Product.Name              (via dataset link)
```

---

## Dataset Link Limits

| Limit | Value |
|-------|-------|
| Dataset links per decision table | 5 |
| Source objects per dataset link | 5 |

---

## Type Compatibility Rules

When mapping object fields to decision table input fields:
- Object field must have the **same data type** as the input field
- **Exception:** Picklist (Multi-Select) input fields **cannot** be mapped to Picklist (Multi-Select) source fields. They can only be mapped to source fields of type: **Text**, **Picklist**, or **Lookup**
- Only input fields can be mapped — output fields are not mapped in dataset links

---

## Create a Dataset Link

**Permission required:** System Administrator

1. Open the decision table you want to add a dataset link to
2. On the **Dataset Links** card → click **New**
3. Fill in:

| Field | Description |
|-------|-------------|
| **Name** | Name for the dataset link. API name is auto-populated. |
| **Source Object** | The objects whose field values the decision table will evaluate. Select up to 5 objects. |
| **Source Object Field** | Map each source object's field to the corresponding decision table input field. |

4. If the decision table has a **Group By** input field: select a source object and the field that provides the group value
5. Save

> **Important:** If an input field is not mapped to any object field in the dataset link, the decision table ignores that input field when evaluating records (it effectively becomes blank for all evaluated records).

---

## How Dataset Link Invocations Work

When invoking a decision table with a dataset link:
1. You pass one or more **records** of the mapped source objects to the Flow action
2. The decision table reads the mapped field values from those records
3. It evaluates those values against the business rules
4. Returns outcomes for each record (or set of records)

**In Flow:** The action is named `[Decision Table Name] - [Dataset Link Name]` (not `default`)

---

## Example: Order Discount Dataset Link

**Business scenario:** Determine discount percentages for orders based on quantity and product.

**Source object (business rules):** `Order_Discount_Rule__c`
- Input fields: `Maximum_Quantity__c`, `Minimum_Quantity__c`, `Product_Name__c`
- Output field: `Discount__c`

**Dataset link mapping:**

| Decision Table Input Field | Source Object | Source Object Field |
|---------------------------|---------------|---------------------|
| Maximum Quantity | Order | Order_Quantity__c |
| Minimum Quantity | Order | Order_Quantity__c |
| Product Name | Product | Name |

When the flow passes an Order record and its linked Product record, the decision table reads:
- `Order.Order_Quantity__c` → evaluated against both Maximum and Minimum Quantity rules
- `Product.Name` → evaluated against the Product Name rule

---

## When to Use Dataset Links vs. Direct Input

| Scenario | Approach |
|----------|----------|
| Evaluating a specific record from your org (Order, Quote, Product, etc.) | Dataset Link — pass the record, let the mapping do the work |
| Evaluating a hardcoded or calculated value (not from a specific record) | No dataset link — pass each input field value directly in the Flow action |
| Evaluating records from multiple objects in one invocation | Dataset Link — map fields from up to 5 source objects |
| One-off checks in test/debugging | No dataset link — simpler to pass values directly |

---

## DecisionTableDatasetLink Metadata Type — Complete Reference

Represents the link between a decision table and a source object used to evaluate records.

**File suffix:** `.decisionTableDatasetLink`
**Directory:** `decisionTableDatasetLinks`
**Available version:** 51.0 and later
**Parent type:** Metadata (inherits `fullName`)
**Special Access Rules:** Requires a Loyalty Management or Rebate Management license.

> Dataset links are supported only for Standard decision tables (not Advanced).

### DecisionTableDatasetLink Fields

| Field | Type | Description |
|-------|------|-------------|
| `decisionTableName` | string | The API name of the associated decision table. |
| `decisionTblDatasetParameters` | DecisionTblDatasetParameter[] | List of field mappings between decision table parameters and source object fields. |
| `description` | string | A description of the dataset link. |
| `isDefault` | boolean | Whether this is the default dataset link for the decision table. Default links use `_Default` as the suffix in invocable action URIs. |
| `setupName` | string | **Required.** The name of the dataset link appearing in Setup. |
| `sourceObject` | string | **Required.** The name of the source object being evaluated. |

### DecisionTblDatasetParameter (child element)

Represents the mapping between a decision table parameter and a field of the source object.

| Field | Type | Description |
|-------|------|-------------|
| `fieldName` | string | **Required.** The API name of the decision table field (input or output) being mapped. |
| `datasetFieldName` | string | **Required.** The name of the source object field whose value is compared against the decision table parameter. |

### XML Sample Definition (non-default)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DecisionTableDatasetLink xmlns="http://soap.sforce.com/2006/04/metadata">
    <decisionTableName>Sample_DT</decisionTableName>
    <decisionTblDatasetParameters>
        <fieldName>IsDeleted</fieldName>
        <datasetFieldName>IsDeleted</datasetFieldName>
    </decisionTblDatasetParameters>
    <decisionTblDatasetParameters>
        <fieldName>LimitNumber</fieldName>
        <datasetFieldName>CallDurationInSeconds</datasetFieldName>
    </decisionTblDatasetParameters>
    <decisionTblDatasetParameters>
        <fieldName>Name</fieldName>
        <datasetFieldName>Subject</datasetFieldName>
    </decisionTblDatasetParameters>
    <description>DSL created for md-common tests</description>
    <isDefault>false</isDefault>
    <sourceObject>Task</sourceObject>
    <setupName>DSL Sample</setupName>
</DecisionTableDatasetLink>
```

### XML Sample Definition (default / no field mappings)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DecisionTableDatasetLink xmlns="http://soap.sforce.com/2006/04/metadata">
    <decisionTableName>Sample_DT</decisionTableName>
    <isDefault>true</isDefault>
    <sourceObject>WorkBadgeDefinition</sourceObject>
    <setupName>Default DSL Sample</setupName>
</DecisionTableDatasetLink>
```

### package.xml Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Sample DT Package</fullName>
    <types>
        <members>Sample_DT</members>
        <name>DecisionTable</name>
    </types>
    <types>
        <members>DSL_Sample</members>
        <members>Sample_DT_Default</members>
        <name>DecisionTableDatasetLink</name>
    </types>
    <version>51.0</version>
</Package>
```
