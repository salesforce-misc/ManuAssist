# Context Service — Invocable Actions (Flow Integration)

Context Service exposes invocable actions that can be called from Salesforce Flows.
These are the primary way to use Context Service programmatically in RCA workflows
and in E2E tests that validate flow-based procedures.

**Permission required to invoke:** Context Service Admin OR Context Service Runtime

---

## Invocable Actions Reference

### Build Context
**Purpose:** Build and cache context data for a context definition. This is the entry point —
call this first before any other context action.

**URI:** `POST /services/data/v59.0/actions/standard/buildContext`  
**Available from:** API v59.0  
**Editions:** Developer, Enterprise, Professional, Unlimited (Industries clouds with Context Service enabled)

#### Inputs

| Input Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `contextDefinitionId` | String | **Required** | The ID or developer name of the active context definition record. |
| `contextData` | String | Optional | JSON data used to build context data (for input-mapping hydration). |
| `contextMappingId` | String | Optional | Context mapping record ID or name. If omitted, the default mapping is used. |
| `isTaggedData` | Boolean | Optional | Whether the associated context node is tagged with a key (`true`) or not (`false`). |

#### Outputs

| Output Parameter | Type | Description |
|-----------------|------|-------------|
| `contextId` | String | ID of the cached context data. Use this in all subsequent context actions. |
| `contextDefinitionId` | String | ID or Developer Name of the definition that was used. |
| `contextMappingId` | String | ID or Name of the mapping that was used. |

#### Example Request

```json
{
  "inputs": [
    {
      "contextDefinitionId": "AccountContextDef",
      "ContextData": {
        "Account": [
          {
            "id": "account1",
            "businessObjectType": "Account",
            "Name": "AcmeFlow",
            "Contact": [
              {
                "id": "contact1",
                "businessObjectType": "Contact",
                "FirstName": "John",
                "LastName": "Miller",
                "ParentReference": "account1"
              }
            ]
          }
        ]
      },
      "contextMappingId": "accountmap1",
      "isTaggedData": false
    }
  ]
}
```

#### Example Response

```json
{
  "actionName": "buildContext",
  "errors": null,
  "isSuccess": true,
  "outputValues": {
    "contextDefinitionId": "11Oxx0000006PXVEA2",
    "contextId": "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439c45aa",
    "contextMappingId": "11jxx0000004L59AAE"
  },
  "version": 1
}
```

---

### Query Context Tags
**Purpose:** Read tag values from a context instance. Use this to assert on what data was
hydrated into the context.

**URI:** `POST /services/data/v59.0/actions/standard/queryContextTags`  
**Available from:** API v63.0

#### Inputs

| Input Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `contextId` | String | **Required** | The ID of the context instance (from Build Context output). |
| `tagsList` | String | **Required** | A collection of tags to be queried. |

#### Outputs

| Output Parameter | Type | Description |
|-----------------|------|-------------|
| `queryResult` | String | The output of the queried context instance. Map of tag names to their values and data paths. |

#### Example Request

```json
{
  "inputs": [
    {
      "contextId": "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439cc609",
      "tagList": [
        "Account_Name",
        "Contact_LastName"
      ]
    }
  ]
}
```

#### Example Response

```json
{
  "actionName": "queryContextTags",
  "errors": null,
  "isSuccess": true,
  "outputValues": {
    "queryResult": {
      "Contact_LastName": [
        {
          "tagValue": "Miller",
          "dataPath": [
            "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439cc609",
            "account1",
            "contact1"
          ],
          "eTag": "fba12e2955bf4a46354fee73ee8b238c",
          "weakEtag": 0
        }
      ],
      "Account_Name": [
        {
          "tagValue": "AcmeFlow",
          "dataPath": [
            "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439cc609",
            "account1"
          ],
          "eTag": "fa0867f98939f191957687c1456715f7",
          "weakEtag": 0
        }
      ]
    }
  },
  "version": 1
}
```

---

### Update Context Attributes
**Purpose:** Update attribute values in the context instance using tags. Used when a procedure step
writes intermediate results back to the context.

**URI:** `POST /services/data/v59.0/actions/standard/updateContextAttributes`  
**Available from:** API v63.0

#### Inputs

| Input Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `contextId` | String | **Required** | The ID of the context instance. |
| `nodePathAndUpdatedValues` | String | Optional | JSON containing the node path (as `dataPath` array) and the updated tag name/value pairs. |

#### Outputs

None.

#### Example Request

```json
{
  "inputs": [
    {
      "contextId": "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439cc609",
      "NodePathAndUpdatedValues": [
        {
          "nodePath": {
            "dataPath": [
              "account1",
              "contact1"
            ]
          },
          "tagValues": [
            {
              "tagName": "Contact_LastName",
              "tagValue": "UPDATED_MILLER"
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Persist Context Data
**Purpose:** Write cached context data back to Salesforce SObject records. This is the
write-back step — use it when a procedure result should be saved to the database.

**URI:** `POST /services/data/v59.0/actions/standard/persistContextData`  
**Available from:** API v59.0

#### Inputs

| Input Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `contextId` | String | **Required** | The ID of the context data record with cached data to be persisted. |
| `contextMappingId` | String | Optional | Context Mapping record ID or Name to use for transforming cached context data into SObject fields. |
| `trackingId` | String | Optional | ID of a Context Mapping record used to track the persist request processing status. |

#### Outputs

| Output Parameter | Type | Description |
|-----------------|------|-------------|
| `referenceId` | String | ID of the response event used to track the persist request status. Subscribe to `ContextPersistenceEvent` using this ID. |

#### Example Request

```json
{
  "inputs": [
    {
      "contextId": "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439cc609",
      "contextMappingId": "16Pxx0000004CCGEA2",
      "trackingId": "16Pxx0000004CCGEA2"
    }
  ]
}
```

#### Example Response

```json
{
  "actionName": "persistContextData",
  "errors": null,
  "isSuccess": true,
  "outputValues": {
    "referenceId": "16Pxx0000004CAeEAM"
  },
  "version": 1
}
```

> ⚠️ **Known limitation:** If existing SObject field values were overridden during the
> Build Context flow, Persist Context Data does NOT store those overridden values in the DB.

> ⚠️ **Compound fields cannot be persisted.** For example, `Contact.Name` (combines
> salutation, first name, last name) must be persisted field by field individually.

> ⚠️ **Reference field updates:** When a context has reference fields and the ID is updated
> in an active context, the corresponding reference fields are NOT automatically updated.
> The persist operation focuses on direct attributes of the main entity, not the reference pointer.

---

### Delete Context Cache
**Purpose:** Remove a specific context instance from the in-memory cache. Does NOT
perform any database writes. Use for test cleanup between runs.

**URI:** `POST /services/data/v59.0/actions/standard/deleteContextCache`  
**Available from:** API v63.0

#### Inputs

| Input Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `contextId` | String | **Required** | The ID of the context instance to delete from the in-memory cache. |

#### Outputs

None.

#### Example Request

```json
{
  "inputs": [
    {
      "contextId": "0000000a07da09100251752497651022c35b6150a4d04cd6a84bf1a0439cc609"
    }
  ]
}
```

---

## Context Persistence Platform Event

Use the `ContextPersistenceEvent` platform event to subscribe to notifications after a context persistence operation has completed.

**Available from:** API v59.0  
**Org permission required:** `IndustriesContextService` org permission enabled  
**Streaming channel:** `/event/ContextPersistenceEvent`  
**Supported calls:** `describeSObjects()`

### Supported Subscribers

| Subscriber | Supported |
|------------|-----------|
| Apex Triggers | Yes |
| Flows | Yes |
| Processes | Yes |
| Streaming API (CometD) | Yes |

### Fields

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `CorrelationId` | String | Nillable | Unique identifier of the parent request this event belongs to. Use for correlating multiple async events. |
| `EventUuid` | String | Create | **Required.** UUID that uniquely identifies this platform event message. |
| `HasErrors` | Boolean | Nillable | `true` if the persistence operation failed; `false` if successful. |
| `ReplayId` | String | Nillable | Platform-assigned position in the event stream. Store this to re-subscribe and retrieve missed events within the retention window. |
| `RequestIdentifier` | String | Nillable | Identifier of the synchronous or asynchronous request that triggered this event. Maps to the `referenceId` returned by the Persist Context Data action. |

### Usage Pattern

1. Call **Persist Context Data** action (or `POST /connect/contexts/persist-records`)
2. Receive `referenceId` in the response
3. Subscribe to `/event/ContextPersistenceEvent` via CometD, Apex trigger, or Flow
4. Match the incoming event's `RequestIdentifier` to your stored `referenceId`
5. Check `HasErrors` to determine success or failure

---

## Flow Metadata — `actionType` Values (v64.0+)

When authoring Flow metadata XML directly, use these exact `actionType` values on `FlowActionCall`:

| Action | `actionType` (v64.0+) |
|--------|----------------------|
| Delete Context Cache | `deleteContextCache` |
| Query Context Tags | `queryContextTags` |
| Update Context Attributes | `updateContextAttributes` |

Prior to v64.0 these actions were not available as native Flow metadata and required the `InvocableApex` wrapper approach.

---

## How to Add a Context Service Action to a Flow

1. Setup → Flows → **New Flow** → Start From Scratch → Screen Flow → Create
2. Click **+** → select **Action**
3. Category: select **Context Service**
4. Select the action (e.g. Build Context)
5. Enter a label (API name auto-populates)
6. Set input values (Context Definition ID, etc.)
7. In Advanced section: enable **manual assignment for output variables** to capture the output
8. Click **Done** → Save the flow with a label

---

## Testing Flows with Context Service Actions

### Test structure for a Build Context → Query → Persist flow

```apex
@isTest
static void testBuildContextAndPersist() {
    // 1. Set up test data (Account, Product, Quote)
    Account acc = new Account(Name = 'CS-Test-Account');
    insert acc;
    // ... set up full test dataset

    // 2. Get the context definition (must be active in the test org)
    // Note: Context Definitions are metadata; they must exist in the org under test
    // You cannot create them in @isTest — they are admin-configured

    // 3. Run the flow that uses Build Context
    Map<String, Object> inputs = new Map<String, Object>{
        'AccountId' => acc.Id
    };
    Flow.Interview.YourFlowApiName flow = new Flow.Interview.YourFlowApiName(inputs);
    flow.start();

    // 4. Assert on the flow's output variable (which was set from Query Context Tags)
    String pricingResult = (String) flow.getVariableValue('ContextPricingResult');
    System.assertNotEquals(null, pricingResult, 'Build Context should have hydrated pricing data');
    System.assertEquals('Expected Value', pricingResult, 'Context tag should match expected pricing');

    // 5. Assert on DB record if Persist Context Data was called
    Quote updatedQuote = [SELECT TotalPrice FROM Quote WHERE Id = :quoteId LIMIT 1];
    System.assertEquals(500.00, updatedQuote.TotalPrice, 'Persist should have written price back to Quote');
}
```

### Extended definition auto-sync caveat (critical for test environments)
Extended definitions are NOT automatically synced when hydration is triggered by Apex or Flow.
Before flow-based context tests, always verify:
- The extended definition is in sync with its parent standard definition
- Check: does the extended definition's Sync Status show "Up to Date"?
- If not: Setup → Context Definitions → Custom Definitions → select definition → Sync Now

### Clearing context cache between test runs
Use the REST API endpoint (not available in Apex @isTest context):
```
DELETE /connect/context-runtime-schema/clear
```
Or use the Delete Context Cache invocable action in a cleanup flow.

---

## Context Service in Apex (Developer Reference)

For Apex-based context usage (not covered in the admin doc, but important for test authors):
- Context instances are built and accessed via the Context Service Apex API
- Request-scoped contexts are automatically cleaned up after the Apex transaction ends
- Session-scoped contexts persist in the cache until TTL expires; must be explicitly deleted
  for test isolation

---

## Context Service Apex Reference

### Namespace: `Context`

The `Context` namespace provides classes and methods to manage the sharing and consumption of business application data using Context Service.

### Class: `Context.IndustriesContext`

Contains methods to create, query, persist, or delete a context instance. Also supports querying record status, querying tags, and updating context attributes.

**Instantiation:**
```apex
Context.IndustriesContext industriesContexts = new Context.IndustriesContext();
```

All methods accept and return `Map<String,Object>`. Parameters are passed as key-value pairs in the input map.

---

#### `addRecordsToContext(input)`

Adds one or more records at a user-defined level in the context hierarchy.

**Signature:**
```apex
public Map<String,Object> addRecordsToContext(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context to add records to. |
| `inputData` | String | **Required.** Hierarchical record data as stringified JSON. |
| `overWriteExistingRecords` | Boolean | Whether to overwrite an existing record with the same ID. |
| `isTaggedData` | Boolean | Whether `inputData` uses the tagged data format. |

**Return:** `Map<String,Object>`

**Example:**
```apex
Map<String, Object> inputAddRecord = new Map<String, Object>();
inputAddRecord.put('contextId', context.get('contextId').toString());
inputAddRecord.put('overWriteExistingRecords', true);
inputAddRecord.put('isTaggedData', false);
inputAddRecord.put('inputData',
  '{"Account":[{"id":"synthetic","businessObjectType":"Account","Name":"test_account"}]}');
Map<String, Object> ouputAddRecord = industriesContexts.addRecordsToContext(inputAddRecord);
```

---

#### `buildContext(input)`

Creates a context instance from the specified definition and data.

**Signature:**
```apex
public Map<String,Object> buildContext(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `metadata` | Map<String,String> | **Required.** Must contain `contextDefinitionId` and `mappingId` (or `contextDefinitionName` and `mappingName`). |
| `data` | String | **Required.** Stringified JSON of record data to hydrate. |

**Return:** `Map<String,Object>` — contains `contextId` (String).

**Example:**
```apex
Map<String, Object> input = new Map<String, Object>();
Map<String, String> metadata = new Map<String, String>();
metadata.put('contextDefinitionId', '1lOxx0000006PinEAE');
metadata.put('mappingId', '1ljxx0000004LGRAA2');
input.put('metadata', metadata);
input.put('data', '{"Account":[{"id":"001xx000003GYK0AA0","businessObjectType":"Account"}]}');
Map<String, Object> context = industriesContexts.buildContext(input);
System.debug(context.get('contextId'));
```

---

#### `deleteContext(input)`

Deletes a context instance from the cache.

**Signature:**
```apex
public void deleteContext(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context to delete. |

**Return:** `void`

**Example:**
```apex
input.put('contextId', '1f6ef0f4f9f361ef966d8a292db12ce90ce20bef22efb4afac431762ac71998d');
industriesContexts.deleteContext(input);
```

---

#### `evictContextDefinition(input)`

Removes the context definition details from the schema cache (equivalent to `DELETE /connect/context-runtime-schema/clear`).

**Signature:**
```apex
public void evictContextDefinition(Map<String,ANY> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextDefinitionName` | String | **Required.** API name of the context definition to evict from cache. |

**Return:** `void`

**Example:**
```apex
input.put('contextDefinitionName', 'definitionName');
industriesContexts.evictContextDefinition(input);
```

---

#### `filteringContext(input)`

Builds or queries a context with server-side filter criteria applied. Avoids loading irrelevant records into memory.

**Signature:**
```apex
public Map<String, Object> filteringContext(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `type` | String (Enum) | **Required.** Operation type: `BUILD`, `QUERYRECORDANDCHILDREN`, or `QUERYRECORDS`. |
| `build` | Map<String,Object> | Build input (same shape as `buildContext` input). Required when `type = BUILD`. |
| `query` | Map<String,Object> | Query input (contextId + queryPaths). Required when `type = QUERYRECORDANDCHILDREN` or `QUERYRECORDS`. |
| `filter` | String | **Required.** Stringified JSON of filter criteria. |

**Filter JSON shape for BUILD:**
```json
{ "buildFilter": {"NodeName":[{"filterType":"WHERE","node":"NodeName","attribute":"FieldName","dataType":"String","operands":["value"],"operator":"Equals"}]}}
```

**Filter JSON shape for QUERY:**
```json
{"queryFilter":[{"filterType":"WHERE","node":"NodeName","attribute":"FieldName","dataType":"String","operands":["value"],"operator":"Equals"}]}
```

**Return:** `Map<String,Object>` — contains `contextId` for BUILD, or `queryResults` for QUERY types.

---

#### `getContext(input)`

Retrieves the full details of an existing context instance.

**Signature:**
```apex
public Map<String,Object> getContext(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context to retrieve. |

**Return:** `Map<String,Object>` — full context details.

---

#### `getContextTranslation(input)`

Retrieves context data transformed through a target mapping (Translation intent). Used for Quote-to-Order or similar cross-mapping transformations.

**Signature:**
```apex
public Map<String,Object> getContextTranslation(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context. |
| `contextMappingId` | String | **Required.** ID of the target translation mapping. |
| `persistAttributeTypes` | List<String> | Which attribute types to include. Values: `OUTPUT`, `INPUTOUTPUT`. |
| `isDependenciesEstablished` | Boolean | Whether dependencies between records have already been established. |
| `removeRestrictedFields` | Boolean | Whether to exclude restricted fields from the result. |

**Return:** `Map<String,Object>` — translated context data.

---

#### `leanerQueryTags(input)`

Queries context tags and returns a memory-optimized result set. Use this instead of `queryTags` in Apex when heap size is a concern.

**Signature:**
```apex
public Map<String,Object> leanerQueryTags(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context to query. |
| `tags` | List<String> | **Required.** List of tag names to retrieve. |

**Return map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | ID of the context. |
| `recordIds` | List<String> | All record IDs in the context that appear in the tag result. |
| `leanerQueryTagResult` | Map<String,Object> | Map of tag name → List of `ContextTagDataLean` objects. Each lean object contains `tagValue`, `recordIdIndexesForPath` (integer indexes into `recordIds` list), and `nodeLevelTag` (boolean). |

**Example:**
```apex
Map<String, Object> inputTag = new Map<String, Object>();
List<String> tags = new List<String>{ 'Contact_FirstName', 'Contact_Email' };
inputTag.put('contextId', (String)context.get('contextId'));
inputTag.put('tags', tags);
Map<String, Object> output = industriesContexts.leanerQueryTags(inputTag);
List<String> recordIds = (List<String>)output.get('recordIds');
Map<String, Object> leanResult = (Map<String, Object>)output.get('leanerQueryTagResult');
```

---

#### `persistContext(input)`

Persists the current state of a context instance to the Salesforce database.

**Signature:**
```apex
public Map<String,Object> persistContext(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context to persist. |
| `targetMappingId` | String | Optional. ID of the persistence mapping to use. If blank, default mapping is used. |

**Return map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `referenceId` | String | Reference ID for the async persist operation. Use with `ContextPersistenceEvent`. |

---

#### `queryContextRecordsAndChildren(input)`

Queries context records and their child records by data path (not by tags).

**Signature:**
```apex
Map<String, Object> industriesContexts.queryContextRecordsAndChildren(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context. |
| `queryPaths` | List<Map<String,Object>> | **Required.** List of `{ "dataPath": ["recordId1", ...] }` objects specifying which records to retrieve. |

**Return:** `Map<String,Object>` — `queryResults` containing the record data tree.

---

#### `queryRecordStatus(input)`

Queries the processing status of one or more records in the context.

**Signature:**
```apex
public Map<String,Object> queryRecordStatus(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context. |
| `queryPaths` | List<Map<String,Object>> | **Required.** List of `{ "dataPath": ["recordId"] }` objects. |

**Return:** `Map<String,Object>` — query status results including `processingStatus` and any `contextErrors`.

---

#### `queryTags(input)`

Queries a context by tag names and returns full tag data including data paths.

**Signature:**
```apex
public Map<String,Object> queryTags(Map<String,Object> input)
```

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context. |
| `tags` | List<String> | **Required.** List of tag names to query. |

**Return map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `queryResult` | Map<String,Object> | Map of tag name → List of `{ tagValue, dataPath[], eTag, weakEtag }` objects. |

> **Note:** Use `leanerQueryTags` instead when working in heap-constrained Apex contexts. `queryTags` returns full `dataPath` strings for every record, which is expensive at scale.

---

#### `updateContextAttributes(input)`

Updates attributes of a context record using canonical field names (not tags).

**Signature:**
```apex
public Map<String,Object> updateContextAttributes(Map<String,Object> input)
```

**Important constraints:**
- Works with canonical structure names, NOT tag names
- The `dataType` of each value must match the attribute's declared `dataType` and the underlying SObject field type
- Supports updates at any level of the hierarchy
- Operates per-record (one `dataPath` entry per record)

**Input map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `contextId` | String | **Required.** ID of the context. |
| `nodePathAndAttributes` | List<Map<String,Object>> | **Required.** List of `{ nodePath: { dataPath: [...] }, attributes: [{ attributeName, attributeValue }] }` objects. |

**Return map keys:**

| Key | Type | Description |
|-----|------|-------------|
| `isSuccess` | Boolean | Whether the update succeeded. |

**Example:**
```apex
Map<String, Object> attrValue = new Map<String, Object>();
attrValue.put('attributeName', 'Name');
attrValue.put('attributeValue', 'Elon');

Map<String, Object> nodePath = new Map<String, Object>();
nodePath.put('dataPath', new List<String>{ '001xx000003GaX6AAK' });

Map<String, Object> nodePathAndAttrs = new Map<String, Object>();
nodePathAndAttrs.put('nodePath', nodePath);
nodePathAndAttrs.put('attributes', new List<Map<String,Object>>{ attrValue });

input.put('contextId', 'f4fe20aa8ffb441998a3bba42c7a0452d9b104dcadd9907810cbacff4db7c39a');
input.put('nodePathAndAttributes', new List<Map<String,Object>>{ nodePathAndAttrs });

Map<String, Object> res = industriesContexts.updateContextAttributes(input);
System.debug(res.get('isSuccess'));
```
