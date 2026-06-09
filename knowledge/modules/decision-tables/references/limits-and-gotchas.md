# Decision Tables — Limits & Known Gotchas

---

## Hard Limits

### Design-Time Limits

| Limit | Value |
|-------|-------|
| Business rules readable per decision table | 100,000 |
| Input fields per decision table | 30 |
| Output fields per decision table | 5 |
| Dataset links per decision table | 5 |
| Source objects per dataset link | 5 |
| Decision tables per org | 10 |
| Outcomes per invocation (custom invocable action) | 50 |

### Invocation Rate Limits (cumulative per org per hour)

| Scenario | Limit |
|----------|-------|
| All tables combined | 430,000 |
| Tables with < 10,000 rules | 400,000 |
| Tables with > 10,000 rules (includes Connect API + custom invocable) | 30,000 |
| Tables with Group By + < 10,000 rules | 1,500,000 |
| Tables with Group By + > 10,000 rules | 150,000 |

### Input Field Constraints

| Field type | Constraint |
|------------|------------|
| Picklist (Multi-Select) | Reads up to 512 characters (including semicolons); first values totaling 512 chars are considered |
| Number | Reads only the first 15 digits |

---

## Known Gotchas for Testing

### 1. Activation Required Before Invoking in Flow
**What happens:** A flow that invokes a deactivated or never-activated decision table fails at runtime.

**Symptom:** Flow error when the Decision Table action element is reached.

**Fix:** Activate the decision table before running the flow. Activation can take several minutes. Check the **Last Activated Date** field to confirm it completed.

---

### 2. Rules Updated After Activation Are Invisible Until Refresh
**What happens:** If you add, update, or delete rule records in the source object after the decision table was last activated or refreshed, the decision table will NOT see those changes until it is explicitly refreshed.

**Symptom:** Decision table returns stale or incorrect outcomes even though the rule records have been updated.

**Fix:** Click **Refresh** on the decision table (or run the Refresh Decision Table flow action) after every rule change. Refresh takes several minutes. Check the **Last Refresh Date**.

---

### 3. More Than 100,000 Rules Blocks Activation
**What happens:** If the source object contains more than 100,000 records, the decision table cannot be activated.

**Symptom:** Activation fails with an error about exceeding the rule limit.

**Fix:** Archive or delete rule records until the count is ≤ 100,000, then activate. For large rule sets, consider splitting into multiple decision tables.

---

### 4. Group By Field Must Be Passed at Invocation
**What happens:** If a decision table has a Group By field configured and the invocation does not include that field's value, the invocation fails.

**Symptom:** Flow or API call returns an error when invoking a decision table with Group By.

**Fix:** Always include the Group By field and its value whenever invoking a decision table that has Group By configured. This applies to both direct-value invocations and dataset link invocations.

---

### 5. Group By Requires AND Condition + Equals Operator
**What happens:** You cannot configure Group By with OR or Custom Logic condition types. You must use AND. The Group By field must also use the Equals operator.

**Symptom:** The Group By option is unavailable or configuration fails.

**Fix:** Set Input Fields Condition to **All conditions are met (AND)** and set the Group By field's operator to **Equals** before selecting Group By.

---

### 6. Blank Rule Field Produces Unexpected Extra Outcomes
**What happens:** A rule record with a blank value for one or more input fields causes the decision table to skip evaluating that field — making the rule match more broadly than expected.

**Symptom:** Decision table returns more outcomes than expected; a "catch-all" rule matches alongside a specific rule.

**Fix:** This is intended behavior — design rules with blank fields deliberately for catch-all scenarios. In tests, always account for rules with blank fields when computing expected outcome counts.

**Example:** Rule A: Category=Shoe, Price≤500 → 5%. Rule B: Category=(blank), Price≤2000 → 8%. A $400 shoe matches BOTH rules and returns two outcomes: 5% and 8%.

---

### 7. Multi-Select Picklist: One Value Only at Invocation
**What happens:** When an input field is Picklist (Multi-Select), you can only pass one value at invocation time. Passing multiple values separated by semicolons does not work.

**Symptom:** Only the first value is evaluated; subsequent values are ignored, or an error is returned.

**Fix:** Pass a single value for Picklist (Multi-Select) input fields. If you need to evaluate multiple values, invoke the decision table multiple times (once per value).

---

### 8. Cannot Use Prohibited Standard Objects as Source
**What happens:** Attempting to use Account, Contact, Lead, Opportunity, or Case as the source object for business rules is not supported.

**Symptom:** These objects don't appear in the Source Object selector, or selection fails.

**Fix:** Create a custom object or use a custom metadata type to store the business rules. Map the object fields to the relevant standard objects via dataset links.

---

### 9. Cannot Sort on Picklist or Multi-Select Picklist Output Fields
**What happens:** Selecting a picklist or multi-select picklist field as the sort order field is not allowed.

**Symptom:** Sort order configuration fails or the picklist field is not available in the sort dropdown.

**Fix:** Use a text, number, date, or other non-picklist field for sort order.

---

### 10. Dataset Link: Multi-Select Picklist Cannot Map to Multi-Select Picklist
**What happens:** A Picklist (Multi-Select) input field in the decision table cannot be mapped to a Picklist (Multi-Select) field in the source object within a dataset link.

**Symptom:** Multi-select picklist source fields are unavailable for mapping to multi-select picklist input fields.

**Fix:** Map the Picklist (Multi-Select) input field to a **Text**, **Picklist** (single), or **Lookup** field on the source object instead.

---

### 11. Org-Wide Invocation Limits Are Cumulative
**What happens:** The invocation rate limits apply to the **entire org**, not to each individual decision table. If one decision table consumes most of the 400,000/hour budget, other tables are throttled.

**Symptom:** Decision table invocations start failing with rate limit errors despite an individual table being invoked less than the limit.

**Fix:** Monitor invocation volume across all decision tables. Use Group By to increase the per-hour limit for high-volume tables (Group By + < 10,000 rules = 1.5M/hour).

---

### 12. Async Refresh and Download State — Tooling API Fields

The Tooling API `DecisionTable` object exposes fields to programmatically inspect operation status:

| Field | Values | Notes |
|-------|--------|-------|
| `refreshStatus` | `NotStarted`, `InProgress`, `Completed`, `Failed` | Current refresh state |
| `refreshFailureReason` | String | Error message when `refreshStatus = Failed`; the only programmatic way to retrieve refresh failure details outside the UI |
| `downloadStatus` | `NotStarted`, `InProgress`, `Completed`, `Failed` | (v64.0+) Tracks state of an async data download request |

Use these fields to build monitoring logic instead of polling the UI.

---

## Decision Table Tooling API Objects — Complete Reference

### DecisionTable (Tooling API)

Available in API version 51.0 and later.

**Supported SOAP Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`
**Supported REST Methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`
**Available in:** Enterprise, Unlimited, Performance Editions with Loyalty Management or Rebate Management.

#### Fields

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `CollectOperator` | string | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | For internal use only. |
| `ConditionCriteria` | string | Filter, Group, Nillable, Sort | Custom logic for input field processing. |
| `ConditionType` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Input field logic. Valid values: `All` (AND), `Any` (OR), `Custom`. Default: `All`. |
| `DataSourceType` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Type of data source. Available v59.0+. Valid values: `ContextDefinition`, `CsvUpload`, `MultipleSobjects`, `SingleSobject`. Default: `SingleSobject`. |
| `DecisionTableParameters` | QueryResult | Nillable | Input/output field parameters (child relationship). |
| `DecisionTableSourceCriterias` | QueryResult | Nillable | Source filter criteria (child relationship). Available v59.0+. |
| `Description` | textarea | Filter, Nillable, Sort | Description of the decision table. |
| `DeveloperName` | string | Filter, Group, Sort | Developer name of the decision table. |
| `DoesConsiderNullValue` | boolean | Defaulted on create, Filter, Group, Nillable, Sort | Whether null columns are considered for lookup. Default: `false`. Available v60.0+. |
| `DownloadStatus` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | CSV download status. Available v64.0+. Valid values: `Completed`, `DownloadInProgress`, `Failed`. |
| `executionType` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Backing storage engine. Valid values: `Dmo`, `Hbase`, `Hbpo`, `Solr`, `Soql`. |
| `FilterResultBy` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | How results are filtered when multiple outputs match. Available v59.0+. Valid values: `AnyValue`, `CollectOperator`, `FirstMatch`, `OutputOrder`, `Priority`, `RuleOrder`, `UniqueValues`. |
| `FullName` | string | Create, Group, Nillable | Name of the decision table. Query only when result ≤ 1 record (performance limit). |
| `Language` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Language of creation. Values: `da`, `de`, `en_US`, `es`, `es_MX`, `fi`, `fr`, `it`, `ja`, `ko`, `nl_NL`, `no`, `pt_BR`, `ru`, `sv`, `th`, `zh_CN`, `zh_TW`. |
| `LastSyncDate` | dateTime | Filter, Nillable, Sort | Latest date on which the decision table was refreshed. |
| `ManageableState` | ManageableState enumerated list | Filter, Group, Nillable, Restricted picklist, Sort | Manageable state in a package. Values: `beta`, `deleted`, `deprecated`, `deprecatedEditable`, `installed`, `installedEditable`, `released`, `unmanaged`. |
| `MasterLabel` | string | Filter, Group, Sort | Label of the decision table. |
| `Metadata` | complexvalue | Create, Nillable, Update | Metadata of the decision table. Query only when result ≤ 1 record. |
| `NamespacePrefix` | string | Filter, Group, Nillable, Sort | Namespace prefix. Limit: 15 characters. |
| `PricingElementDecisionTables` | QueryResult | Nillable | Reserved for future use. |
| `RefreshFailureReason` | string | Filter, Nillable, Sort | Reason for refresh failure. Available v60.0+. The only programmatic way to retrieve refresh failure details outside the UI. |
| `RefreshStatus` | string | Filter, Group, Nillable, Restricted picklist, Sort | Refresh status. Available v60.0+. Valid values: `Initiated`, `Failed`, `Completed`, `In Progress`. |
| `RowLevelOverrideType` | picklist | Create, Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort, Update | Row-level criteria override type. Valid values: `Both`, `Condition`, `None`. Default: `None`. `Condition` allows runtime override of condition values only; `Both` allows override of both conditions and outputs. **Not exposed in the metadata type — set via Tooling API only.** |
| `SetupName` | string | Filter, Group, Sort | **Required.** Name of the decision table appearing in Setup. |
| `SourceConditionLogic` | string | Filter, Group, Nillable, Sort | Condition logic for filtering source data. Available v59.0+. |
| `SourceObject` | string | Filter, Group, Nillable, Sort | **Required.** Object containing the rules. |
| `Status` | picklist | Filter, Group, Restricted picklist, Sort | **Required.** Status. Valid values: `ActivationInProgress`, `Active`, `Draft`, `Inactive`. |
| `Type` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Data volume type. Available v59.0+. Valid values: `Advanced`, `HighScaleExecution`, `HighVolume` (reserved for future use), `LowVolume`, `MediumVolume`, `RealTime`. Default: `LowVolume`. |
| `UsageType` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Usage type. Available v59.0+. Valid values: `Bre` (default when BRE enabled), `ProductCategoryQualification`, `ProductQualification`, `RecordAlert`. Other values may be available depending on industry solution. |

---

### DecisionTableDatasetLink (Tooling API)

Available in API version 51.0 and later. Dataset links are supported only for Standard decision tables.

**Supported SOAP Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`
**Supported REST Methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`

#### Fields

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `DecisionTableId` | reference | Filter, Group, Sort | **Required.** ID of the associated decision table. Refers To: `DecisionTable`. |
| `Description` | textarea | Filter, Nillable, Sort | Description of the dataset link. |
| `DeveloperName` | string | Filter, Group, Sort | Developer name of the dataset link. |
| `FullName` | string | Create, Group, Nillable | Name of the dataset link. Query only when result ≤ 1 record. |
| `IsDefault` | boolean | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Whether this is the default dataset link for the decision table. |
| `Language` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Language of creation. Same values as DecisionTable. |
| `ManageableState` | ManageableState enumerated list | Filter, Group, Nillable, Restricted picklist, Sort | Manageable state. Same values as DecisionTable. |
| `MasterLabel` | string | Filter, Group, Sort | Label of the dataset link. |
| `Metadata` | complexvalue | Create, Nillable, Update | Dataset link metadata. Query only when result ≤ 1 record. |
| `NamespacePrefix` | string | Filter, Group, Nillable, Sort | Namespace prefix. Limit: 15 characters. |
| `SetupName` | string | Filter, Group, Sort | **Required.** Name of the dataset link appearing in Setup. |
| `SourceObject` | string | Filter, Group, Nillable, Sort | The name of the dataset link's source object. |

---

### DecisionTableParameter (Tooling API)

Available in API version 51.0 and later.

**Supported SOAP Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`
**Supported REST Methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`

#### Fields

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `DecisionTableId` | reference | Create, Filter, Group, Sort | ID of the associated decision table. Refers To: `DecisionTable`. |
| `DomainObject` | string | Create, Filter, Group, Sort | For polymorphic fields, the domain object in the field hierarchy. Available v59.0+. |
| `FieldName` | string | Create, Filter, Group, Nillable, Sort, Update | The API name of the input or output field. |
| `FieldPath` | string | Create, Filter, Group, Nillable, Sort, Update | The path of the field relative to its object. Available v59.0+. |
| `IsGroupByField` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether this field is the Group By field. Default: `false`. Available v55.0+. |
| `IsRequired` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether this field must have a value at lookup time. Default: `false`. Available v59.0+. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Manageable state in a package. |
| `Operator` | picklist | Create, Filter, Group, Nillable, Restricted picklist, Sort, Update | Operator for the input field. Valid values: `Contains`, `DoesNotExistsIn`, `DoesNotMatch`, `Equals`, `ExistsIn`, `GreaterOrEqual`, `GreaterThan`, `IsNotNull`, `IsNull`, `LessOrEqual`, `LessThan`, `Matches`, `NotEquals`. |
| `Sequence` | int | Create, Filter, Group, Nillable, Sort, Update | Sequence in which input fields are processed. |
| `SortType` | picklist | Create, Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort, Update | Sort order for outputs. Available v56.0+. Valid values: `AscNullFirst`, `AscNullLast`, `DescNullFirst`, `DescNullLast`, `None`. Default: `None`. Picklist and multi-select picklist fields cannot be sorted. |
| `Usage` | picklist | Create, Filter, Group, Restricted picklist, Sort, Update | **Required.** Usage type. Valid values: `INPUT`, `OUTPUT`, `ROWCRITERIA`. |

---

### DecisionTblDatasetParameter (Tooling API)

Available in API version 51.0 and later. Represents the mapping between a decision table parameter and a source object field.

**Supported SOAP Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`
**Supported REST Methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`

#### Fields

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `DatasetFieldName` | string | Create, Filter, Group, Sort, Update | **Required.** The source object field whose value is compared against the decision table parameter. |
| `DatasetSourceObject` | string | Create, Filter, Group, Nillable, Sort, Update | The source object whose field values are evaluated. |
| `DecisionTableDatasetLinkId` | reference | Create, Filter, Group, Sort | The ID of the associated dataset link. Refers To: `DecisionTableDatasetLink`. |
| `DecisionTableParameterId` | reference | Create, Filter, Group, Sort, Update | **Required.** The ID of the associated decision table parameter. Refers To: `DecisionTableParameter`. |
| `ManageableState` | ManageableState enumerated list | Filter, Group, Nillable, Restricted picklist, Sort | Manageable state in a package. |

---

### DecisionTableSourceCriteria (Tooling API)

Available in API version 59.0 and later. Represents source data filter conditions applied before the decision table evaluates rules.

**Supported SOAP Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`
**Supported REST Methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`

#### Fields

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `DecisionTableId` | reference | Create, Filter, Group, Sort | ID of the associated decision table. Refers To: `DecisionTable`. |
| `ManageableState` | ManageableState enumerated list | Filter, Group, Nillable, Restricted picklist, Sort | Manageable state in a package. |
| `Operator` | picklist | Create, Defaulted on create, Filter, Group, Restricted picklist, Sort, Update | The filter operator. Valid values: `Contains` (v64.0+), `DoesNotExistIn`, `DoesNotMatch` (v64.0+), `Equals`, `ExistsIn`, `GreaterOrEqual`, `GreaterThan`, `IsNotNull`, `IsNull`, `LessOrEqual`, `LessThan`, `Matches`, `NotEquals`. Default: `Equals`. |
| `SequenceNumber` | int | Create, Filter, Group, Sort, Update | The sequence number used in the source condition logic. |
| `SourceFieldName` | string | Create, Filter, Group, Sort, Update | The name of the field used for filtering. |
| `Value` | textarea | Create, Nillable, Update | The expected value in the source field. |
| `ValueType` | picklist | Create, Defaulted on create, Filter, Group, Restricted picklist, Sort, Update | The type of value used for filtering. Valid values: `Formula`, `Literal`, `Lookup`, `Parameter`, `Picklist`. Default: `Literal`. |

---

### 13. Activation State Not Preserved Across Deployments
**What happens:** When deploying a decision table via change sets or packages to a target org, the decision table may arrive in an inactive state.

**Fix:** After every deployment, manually activate the decision table in the target org.
