# Batch Management — Create & Configure

---

## Prerequisites

Before creating a batch job:
1. **For Flow process type:** Create and **activate** the business flow. The flow must include a
   **Text type input variable** that identifies each record (typically the record Id). This variable
   is the "Flow Input Variable" that the batch job uses to pass records to the flow.
2. **For other process types (BRE, Loyalty, etc.):** Complete all product-specific prerequisite
   tasks (e.g., activate the expression set in BRE).

**Permission required:** System Administrator profile.

---

## Create a Batch Job — Step by Step

### Step 1: Open Batch Management

From Setup → Quick Find → `Batch Management` → Click **New**.

### Step 2: Define the Batch Job Header

| Field | Required | Notes |
|-------|----------|-------|
| **Name** | Yes | Human-readable name |
| **API Name** | Auto-populated | Same name is used as the Flow action name |
| **Description** | No | Recommended for documentation |
| **Process Type** | Yes | `Flow` if using Salesforce Flow; otherwise select the product-specific type |
| **Execution Process** | Yes | For Flow type: select the active flow. For other types: select the business process |
| **Group** | No | Organizes batch jobs by product or team (e.g., Loyalty, Support) |
| **Batch Size** | Yes | Number of records per batch job part (max 2,000) |
| **Retry Count** | Yes | How many times to retry a failed part (max 3) |
| **Retry Interval** | Yes | Milliseconds to wait before retry (1,000–10,000 ms) |

Click **Next**.

### Step 3: Configure the Batch Job

Configuration options differ by process type:

#### For Flow Process Type

| Field | Required | Notes |
|-------|----------|-------|
| **Flow Input Variable** | Yes | The Text variable in the flow that the batch job uses to pass the record identifier to the flow |
| **Object** | Yes | Standard or custom object whose records are selected and sent to the flow |
| **Conditions** | No | Filter criteria to limit which records are selected. Supports field-value filters and field-input-variable filters |

#### For Other Salesforce Products (e.g., BRE, Loyalty)

| Field | Required | Notes |
|-------|----------|-------|
| **Object** | Yes | Source object. Some process types auto-filter available objects |
| **Related Objects** | No | Up to 3 related objects; enables filtering and Group By on related fields |
| **Conditions** | No | Filter criteria. Can reference fields from the selected object and related objects |
| **Group By** | No | Field to group records for joint processing (only available for select process types) |

### Step 4: Save and Activate

Click **Save**, then **Activate** the batch job.

> **Important:** You **cannot edit an active batch job**. Deactivate it first, make changes,
> then re-activate. If a batch job is deactivated, any already-scheduled runs for it will fail.

---

## Conditions in Detail

### Field-Value Conditions

Standard filter: select a field, operator, and a literal value.

```
Field: IsClosed | Operator: Equals | Type: Value | Value: True
```

### Input Variable Conditions

Use **Input Variables** when the filter value changes between runs:

```
Field: Activity Date | Operator: Greater Than or Equal | Type: Input Variable | Value: runDate
```

The actual value for `runDate` is provided when the batch job's Flow action runs (see
`run-and-monitor.md` for how to pass input variable values in the flow).

### Date Literals (Input Variable)

To filter records based on relative dates, pass the following SOQL date literals as input
variable values from a Flow or Apex resource:

| Date Literal | Meaning |
|-------------|---------|
| `NEXT_N_DAYS:n` | Records where the date field falls within the next n days |
| `N_DAYS_AGO:n` | Records where the date field was n days ago |

> **Limitation:** Salesforce Shield encrypted fields **cannot** be used in filter conditions.

---

## Group By

**Group By** groups records by a common field value so they are processed together in the same
batch job part. Available only for non-Flow process types (e.g., BRE, Loyalty).

**Example:** If the source object is `Quote` and a related object is `Opportunity`, you can
Group By the Opportunity's associated Account — so all quotes for the same account are processed
together.

- The Group By field can be from the selected object or from a related object.
- Up to 3 related objects can be selected to support cross-object filtering and grouping.

---

## Example: Create a Batch Job for Flow (Delete Closed Cases)

**Business flow:** `Delete_Closed_Cases` (active autolaunched flow with a Text variable `RecordID`)

**Batch job configuration:**

```
Name: Process Closed Cases
API Name: Process_Closed_Cases
Group: Support
Process Type: Flow
Execution Process: Delete_Closed_Cases
Batch Size: 1500
Retry Count: 2
Retry Interval: 1000

Flow Input Variable: RecordID
Object: Case
Conditions:
  - Field: IsClosed | Operator: Equals | Type: Value | Value: True
```

---

## Programmatic Creation

Use the **`BatchProcessJobDefinition` Metadata API** to create, update, or delete batch jobs
programmatically. Do not directly insert/update/delete the underlying `BatchProcessJobDefinition`
record via DML — doing so can corrupt org data.

> **Warning:** Always use the Metadata API (or UI) for batch job lifecycle operations. Direct
> DML on `BatchProcessJobDefinition` records is unsupported and can impact live processes.

---

## Batch Management Tooling API Objects

### BatchDataSource (Tooling API, v66.0+)

Represents the source of information from which a batch job retrieves records for processing. Available in API version 66.0 and later.

**Supported Calls:** `describeSObjects()`, `query()`, `retrieve()`

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `BatchJobDefinitionId` | reference | Filter, Group, Sort | ID of the associated batch job definition. Master-detail to `BatchJobDefinition`. |
| `CriteriaJoinCondition` | string | Filter, Group, Nillable, Sort | Custom logic expression for how filter conditions are applied. |
| `CriteriaJoinType` | picklist | Defaulted on create, Filter, Group, Restricted picklist, Sort | How conditions are joined: `all` (AND), `any` (OR), `custom`, `none`. Default: `all`. |
| `DataSourceType` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Source type: `MultipleSobjects`, `SingleSobject`. |
| `RelatedSobjects` | string | Filter, Group, Nillable, Sort | List of related objects used as additional data sources. |
| `SourceFieldName` | string | Filter, Group, Nillable, Sort | Field from the source object used to run the batch job. |
| `SourceTableName` | string | Filter, Group, Sort | API name of the source object. |

### BatchDataSrcFilterCriteria (Tooling API, v66.0+)

Represents a single filter condition on the batch data source. Available in API version 66.0 and later.

**Supported Calls:** `describeSObjects()`, `query()`, `retrieve()`

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `BatchDataSourceId` | reference | Filter, Group, Sort | ID of the associated `BatchDataSource`. Master-detail. |
| `DomainObjectName` | string | Filter, Group, Nillable, Sort | Object that contains the field used in this filter condition. |
| `DynamicValueType` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Data type of the input variable used in this condition: `boolean`, `currency`, `date`, `datetime`, `integer`, `picklist`, `reference`, `string`. |
| `FieldName` | string | Filter, Group, Sort | Field used in the filter condition. |
| `FieldPath` | string | Filter, Group, Nillable, Sort | Path to the related object field. |
| `FieldValue` | string | Filter, Group, Sort | Literal value to filter on. |
| `FilterCriteriaSequence` | int | Filter, Group, Sort | Sequence number of this condition. |
| `IsDynamicValue` | boolean | Defaulted on create, Filter, Group, Sort | Whether the value is supplied by an input variable. Default: `false`. |
| `Operator` | picklist | Filter, Group, Restricted picklist, Sort | Filter operator: `equals`, `excludes`, `greaterThan`, `greaterThanOrEqualTo`, `in`, `includes`, `isNotNull`, `isNull`, `lessThan`, `lessThanOrEqualTo`, `like`, `notEquals`, `notIn`. |

### BatchProcessJobDefinition (Tooling API, v51.0+)

Represents the complete configuration of a Batch Management job. Available in API version 51.0 and later.

> **Critical warning:** Directly updating or deleting a `BatchProcessJobDefinition` record via DML or REST API write operations can corrupt org data and live processes. Always use the Metadata API or UI for lifecycle operations.

**Supported SOAP API Calls:** `describeSObjects()`, `query()`, `retrieve()`

**Supported REST API Methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `BatchJobDefinitionId` | reference | Filter, Group, Nillable, Sort | ID of the associated `BatchJobDefinition`. Lookup relationship. |
| `BatchJobDefinitionName` | string | Filter, Group, Nillable, Sort | Developer name of the associated batch job definition. |
| `BatchSize` | int | Filter, Group, Sort | **Required.** Records per batch job part. Max: 2,000 for Flow or Loyalty Program process types. |
| `Description` | textarea | Filter, Group, Nillable, Sort | Description of the batch job. |
| `DeveloperName` | string | Filter, Group, Sort | API name of the batch job. |
| `FlowDefinitionId` | reference | Filter, Group, Nillable, Sort | Input variable of the associated flow that uniquely identifies each record passed to the flow. |
| `FullName` | string | Create, Group, Nillable | Full name of the batch job. Single-record query only. |
| `Language` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Language of the batch job definition. Values: `da`, `de`, `en_US`, `es`, `es_MX`, `fi`, `fr`, `it`, `ja`, `ko`, `nl_NL`, `no`, `pt_BR`, `ru`, `sv`, `th`, `zh_CN`, `zh_TW`. |
| `ManageableState` | ManageableState enum | Filter, Group, Nillable, Restricted picklist, Sort | Package state: `beta`, `deleted`, `deprecated`, `deprecatedEditable`, `installed`, `installedEditable`, `released`, `unmanaged`. |
| `MasterLabel` | string | Filter, Group, Sort | Display label. |
| `Metadata` | complexvalue | Create, Nillable, Update | Full metadata structure. Single-record query only. |
| `NamespacePrefix` | string | Filter, Group, Nillable, Sort | Namespace prefix from managed package. Limit: 15 characters. |
| `ProcessGroup` | string | Filter, Group, Nillable, Sort | Group or team for which the batch job processes records. |
| `RecordIdVariable` | string | Filter, Group, Nillable, Sort | Unique identifier passed to the execution process for each record. |
| `RetryCount` | int | Defaulted on create, Filter, Group, Sort | **Required.** Automatic reruns on failure. Max: 3. |
| `RetryInterval` | int | Defaulted on create, Filter, Group, Sort | **Required.** Milliseconds between retries. Range: 1,000–10,000 ms. |
| `Status` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Job status: `Active`, `Inactive`. |
| `Type` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | **Complete list of process types** (available in API version 55.0 and later): `Flow` (default), `BulkUpdate`, `ConsumptionOveragesCalculation`, `DecisionTableRefresh`, `DeepCloneSalesAgreement`, `EntitlementCreationBatchJob`, `HighScaleBreProcess`, `IndustriesLSCommercial`, `LoyaltyProgramProcess`, `ManagerProvisioning`, `NetUnitRateCalculation`, `PbbToOptyConversion`, `ProductCatalogCacheRefresh`, `RatableSummaryCreation`, `SummaryCreation`. Other types may be available based on org licenses. |
| `TypeInstance` | string | Filter, Group, Sort | **Required.** API name of the flow or business process to execute. |

### BatchProcessJobDefView (Standard Object, read-only view)

**Supported Calls:** `describeSObjects()`, `query()`

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `DurableId` | string | Filter, Group, Nillable, Sort | Stable unique identifier. Always retrieve before use. Use instead of multiple queries. |
| `IsActive` | boolean | Defaulted on create, Filter, Group, Sort | Whether the definition is active. |
| `Label` | string | Filter, Group, Nillable, Sort | Display label. |
| `Name` | string | Filter, Group, Nillable, Sort | API name. |
| `NamespacePrefix` | string | Filter, Group, Nillable, Sort | Namespace prefix from managed package. |
| `ProcessDefinition` | textarea | Nillable | Name of the process group. |
| `ProcessGroup` | string | Filter, Group, Nillable, Sort | Team or group for which the definition processes records. |
| `SourceObjectName` | string | Filter, Group, Nillable, Sort | API name of the source object. |
| `Type` | string | Filter, Group, Nillable, Sort | Process type. Values shown in this view: `Flow`, `LoyaltyProgramProcess`. |

---

## BatchProcessJobDefinition — Metadata API (Complete Reference)

**File suffix:** `.batchProcessJobDefinition`
**Directory:** `batchProcessJobDefinitions`
**Wildcard support:** Yes (`*` in `package.xml`)
**Available:** API version 51.0 and later

**Special Access Rules:** Must have a Loyalty Management or Rebate Management license.

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `batchSize` | int | Records to process in each batch. |
| `dataSource` | `BatchDataSource[]` | Data source configuration. |
| `description` | string | Description of the batch job definition. |
| `executionProcessApiName` | string | API name of the Flow or loyalty program process executed by the batch job. |
| `flowApiName` | string | API name of the Flow used. |
| `flowInputVariable` | string | Input variable in the Flow used to pass the record identifier. |
| `masterLabel` | string | Display label. |
| `processGroup` | string | Group or team for which the batch job processes records. |
| `retryCount` | int | Max automatic reruns on failure. Valid values: 1–3. |
| `retryInterval` | int | Milliseconds between retries. Valid values: 1,000–10,000 ms. |
| `status` | string | Status: `Active`, `Inactive`. |
| `type` | string | Process type: `Flow`, `Loyalty Program Process`. |

### BatchDataSource (Metadata API sub-type)

| Field | Type | Description |
|-------|------|-------------|
| `condition` | string | Condition used for filtering records (e.g., `AND`). |
| `criteria` | string | Record selection criteria (e.g., `ALL`). |
| `dataSourceType` | string | Source type: `SingleSobject`, `MultiSobject`. Available in API version 64.0 and later. |
| `filters` | `BatchDataSrcFilterCriteria[]` | Filter criteria for the data source. |
| `orderFields` | `BatchDataSourceOrderField[]` | Fields used to order records. |
| `sourceObject` | string | API name of the source object (for Loyalty Program Process, this is the loyalty program object). |
| `sourceObjectField` | string | Field on the source object. |

### BatchDataSrcFilterCriteria (Metadata API sub-type)

| Field | Type | Description |
|-------|------|-------------|
| `domainObjectName` | string | API name of the domain object containing the filter field. Available in API version 64.0 and later. |
| `dynamicValueType` | string | Data type of the dynamic value (input variable). |
| `fieldName` | string | API name of the field used in this filter condition. |
| `fieldPath` | string | Path to a related object field. Available in API version 64.0 and later. |
| `fieldValue` | string | Literal value for the filter. |
| `isDynamicValue` | boolean | Whether the value is supplied by an input variable. |
| `operator` | string | Filter operator: `equals`, `excludes`, `greaterThan`, `greaterThanOrEqualTo`, `in`, `includes`, `lessThan`, `LessThanOrEqualTo`, `GreaterOrEqual`, `like`, `notEquals`, `notIn`. |
| `sequenceNo` | int | Sequence number of this filter condition. |

### BatchDataSourceOrderField (Metadata API sub-type)

| Field | Type | Description |
|-------|------|-------------|
| `domainObjectName` | string | API name of the domain object. Available in API version 64.0 and later. |
| `fieldName` | string | Field used for ordering. Available in API version 64.0 and later. |
| `fieldPath` | string | Path to the field. Available in API version 64.0 and later. |

### XML Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<BatchProcessJobDefinition xmlns="http://soap.sforce.com/2006/04/metadata">
    <batchSize>200</batchSize>
    <dataSource>
        <condition>AND</condition>
        <criteria>ALL</criteria>
        <dataSourceType>SingleSobject</dataSourceType>
        <filters>
            <fieldName>Status</fieldName>
            <fieldValue>Active</fieldValue>
            <isDynamicValue>false</isDynamicValue>
            <operator>equals</operator>
            <sequenceNo>1</sequenceNo>
        </filters>
        <orderFields>
            <fieldName>CreatedDate</fieldName>
        </orderFields>
        <sourceObject>Account</sourceObject>
    </dataSource>
    <description>Sample Batch Process Job Definition</description>
    <executionProcessApiName>MyFlow</executionProcessApiName>
    <flowApiName>MyFlow</flowApiName>
    <masterLabel>Sample Batch Job</masterLabel>
    <processGroup>SalesTeam</processGroup>
    <retryCount>2</retryCount>
    <retryInterval>5000</retryInterval>
    <status>Active</status>
    <type>Flow</type>
</BatchProcessJobDefinition>
```
