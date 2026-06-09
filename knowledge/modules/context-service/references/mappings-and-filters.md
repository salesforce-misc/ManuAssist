# Context Service — Mappings & Filters

---

## Mapping Types

Context Service has two mapping types that determine **where data comes from**:

### 1. Automatic Salesforce Object Mapping
- Context Service automatically matches node/attribute names to SObject field names with the same name
- Example: Node named `Account` with attribute `Name` → automatically maps to `Account.Name`
- Select **Automatic Salesforce Object Mapping** checkbox on the Add Context Mapping page
- Fastest setup; best when your node/attribute names mirror the SObject field API names

### 2. Input Mapping
- Hydrates context from a **JSON payload** passed at the time of the hydration request
- Used when data comes from the calling application (not from SObjects)
- After defining the context structure: Map Data tab → select **Input Mapping**
- Click **Retain and Generate** to generate mapping only for attributes that have no mapping yet

---

## Mapping Intent Types

Mapping Intent specifies **what you intend to do** with the context mapping.
One or more intents can be selected; cardinality support is the intersection of all selected intents.

| Intent | Data direction | Supported cardinality | Use case |
|--------|---------------|----------------------|---------|
| **Hydration** | Data source → Context (read) | 1:1, many:1 | Load Salesforce records into the context for a procedure to consume |
| **Persistence** | Context → Salesforce Objects (write) | 1:1, 1:many | Write procedure outputs back to SObject records |
| **Translation** | Context → Context (transform) | 1:1, 1:many | Transform data hydrated from one mapping into the format of another mapping. A context definition can have more than one mapping. Through translation, data hydrated from a Quote mapping can be transformed to correspond to an Order mapping — enabling Quote-to-Order transformations without re-querying the database. |
| **Association** | Metadata only (custom logic) | 1:1, 1:many, many:1, cross-attribute | Use mapping metadata in custom business logic; NOT hydrated or persisted via standard APIs |

> ⚠️ **Case-sensitive API values:** The `ContextMappingIntent` values in API payloads and metadata XML are **lowercase**: `hydration`, `association`, `persistence`, `translation`. Using initial-caps values (as displayed in the UI) causes a validation error during deployment or API calls.

### `contextTtl` Metadata Field

`contextTtl` (integer, minutes) on `ContextDefinition` metadata sets the time-to-live for cached context data. **Default: 10 minutes.** After this duration, cached context entries are invalidated and the next invocation triggers a full re-hydration. Maximum: 45 minutes.

> **Combined intents:** Only the intersection of cardinalities is supported. E.g. Hydration + Translation = 1:1 only.

---

## Object Field Data Types → Attribute Data Types

When mapping, the attribute data type must match a supported object field data type:

| Attribute Data Type | Supported Object Field Data Types |
|--------------------|----------------------------------|
| **String** | String, Textarea, Email, Phone, Picklist, Reference, Time, URL, EncryptedText, Address, Combobox, MultiEnum |
| **Date** | DateTime, Date |
| **Currency** | Currency |
| **Boolean** | Boolean |
| **Number** | Int, Number, Double, Decimal |
| **DateTime** | DateTime, Date |
| **Percent** | Int, Number, Double, Percent |
| **Reference** | Reference |
| **Picklist** | Picklist |
| **SelfReference** | Reference |

> Attributes can only be mapped to fields where the data types match or are supported conversions.

---

## Data Source Options for Node Mapping

When mapping a node to an object, three source types are available:

| Source | How to select | Constraint |
|--------|--------------|------------|
| **Standard SObjects or Data Model Objects (DMOs)** | sObjects & DMO tab → search and select | One type per mapping |
| **Context Definition** | Context Definition tab → Proceed → select definition | Only one reference definition per mapping |
| **Input JSON** | Select Input Mapping | Defines fields from a JSON payload |

> Cannot mix source types within a single context mapping.

---

## Edit and Remove Mappings

### Edit a mapping
On the Map Data tab, click the mapping → add or remove custom attributes or node mappings → **Save and Publish**. Review the summary of changes.

> If you added new nodes or attributes to the context definition, update your mapping too — otherwise the new nodes/attributes won't have a data source and won't be hydrated.

### Remove a node mapping
Click the node → click the mapped object → **Clear All** → save.

### Remove an attribute mapping
Click the mapped field → **Clear All** → save.

---

## Map to a Custom Data Space (for DMOs)

For extended context definitions that map Data Model Objects (DMOs):
- Requires Context Service + Data 360 enabled
- Allows switching DMOs from the default Data Space to a custom Data Space in your org

**Steps:**
1. Setup → Context Definitions → Custom Definitions tab → select definition → Map Data tab
2. Under Data Space Mapping column → **Select Dataspace**
3. Enter a Context Mapping Name
4. Choose **One data space for all DMOs** or **Individual data space for each DMO**
5. Select Target Data Space → **Create New Mapping**
6. Set the new mapping as default for it to take effect

> The previous mapping is **retained** in the org. Setting the new mapping as default is what activates the switch.

---

## Context Filters

Context Filters let you retrieve **precise, scoped, dynamic data** from your context definitions
without modifying code. Up to **5 conditions** per filter.

### When to use filters
- Retrieve only assets nearing renewal (`LifecycleEndDate <= upcoming 7 days`)
- Scope context data to a specific Account (`Account.Name = 'Acme'`)
- Filter billing data by currency or billing frequency

### Create a Context Filter

**Permission required:** Context Service Admin

1. Setup → Context Definitions → Custom Definitions tab → select definition → **Filters** tab
2. **New Filter** → Filter Name, API Name, Description
3. Add conditions: Node → Attribute → Operator → Value
4. For Date attributes, use **Date Range** filter:
   - Operator: `<=`, `>=`, `=`
   - Date Range: `Upcoming Days`, `Past Days`, specific date
   - Days Count: number of days
5. Click **Add Condition** to add more conditions (up to 5 total)
6. Add Sort Order: Node → Attribute → Sort Direction → **Limit** (optional integer; caps the number of records returned for that node)
7. Save

### Filter condition example (asset renewal)
```
Node: Asset
Attribute: LifecycleEndDate
Operator: <=
Date Range: Upcoming Days
Days Count: 7
```

### Filter condition example (account scoping)
```
Node: Account
Attribute: Name
Operator: =
Value: Acme
```

### Manage filters
| Action | Who can | Where |
|--------|---------|-------|
| View | Context Service Admin | Standard Definitions → Filters tab → View |
| Edit | Context Service Admin | Custom Definitions → Filters tab → Edit |
| Clone | Context Service Admin | Custom Definitions → Filters tab → Clone |
| Delete | Context Service Admin | Custom Definitions → Filters tab → Delete → OK |

> Standard definition filters are **view-only**. To customize, clone the standard definition first.

---

## Context Tags API — Referenced Definitions

`GET /connect/context/tags?includeReferencedDefinitionTag=true`

When `includeReferencedDefinitionTag=true`, the response includes tags from any referenced (embedded) context definitions in addition to the primary definition's tags. Tags from referenced definitions are prefixed: `ReferencedContextName.TagName`. Without this parameter, only the primary definition's tags are returned.

---

## Configure Node Relationships via API

`POST /connect/context-nodes/{nodeId}/configurerelationship` (v61.0)

Request body: `parentNodeId` (string) and `relationshipFieldName` (string). Establishes a parent-child relationship between two context nodes within a definition programmatically — replaces manual metadata editing for this step.

---

## Clone a Context Mapping

Save time by cloning an existing mapping:
1. Setup → Context Definitions → Custom Definitions → select definition → Edit
2. Map Data tab → select a mapping → action menu → **Clone**

---

## Context Service Business APIs — Complete Endpoint Reference

All endpoints are under:  
`https://yourInstance.salesforce.com/services/data/v{version}/`

Requires `Authorization: Bearer {token}`. Follows Connect REST API conventions.

---

### Context Definition Endpoints

#### `GET /connect/context-definitions` (v59.0+)
List all context definitions.  
**Response:** Context Definition List

#### `POST /connect/context-definitions` (v59.0+)
Create a context definition, clone an existing one, or extend a standard definition. Can also accept a full `payload` JSON to persist an entire definition at once.

**Request body properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | String | **Required** | Name of the context definition. |
| `developerName` | String | **Required** | API name / developer name. |
| `startDate` | String | **Required** | Start date (ISO 8601, e.g. `2023-06-02T00:00:00.000Z`). |
| `description` | String | Optional | Short description. |
| `endDate` | String | Optional | End date (ISO 8601). |
| `isActive` | Boolean | Optional | Whether to activate immediately. Default `false`. |
| `payload` | String | Optional | Full definition + mappings as a JSON string (for bulk creation). |
| `sourceDefinitionId` | String | Optional | ID of an existing definition to clone or extend from. |
| `contextTtl` | Integer | Optional | Cache TTL in minutes. Default 10. |

**Response:** Context Definition Information

#### `GET /connect/context-definitions/{contextDefinitionId}` (v59.0+)
Retrieve a specific context definition by ID.  
**Response:** Context Definition Output

#### `PATCH /connect/context-definitions/{contextDefinitionId}` (v59.0+)
Update a context definition.  
**Response:** Context Definition Information

#### `DELETE /connect/context-definitions/{contextDefinitionId}` (v59.0+)
Delete a context definition (must be inactive).

#### `PATCH /connect/context-definitions/upgrades` (v64.0+)
Upgrade an extended definition to reflect changes from its parent standard definition.

**Request body properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextDefinitionId` | String | **Required** | ID of the definition to upgrade. |
| `upgradeMode` | String | Optional | `Sync` (default), `Preview`, or `Override`. |

**Response:** Context Definition Information

#### `GET /connect/context-definitions/{contextDefinitionId}/context-filters` (v65.0+)
List context filters for a definition.  
**Response:** Context Definition Filter List

#### `POST /connect/context-definitions/{contextDefinitionId}/context-filters` (v65.0+)
Create one or more filters for a definition.

**Request body — `filters` array element properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filterApiName` | String | **Required** | Unique API name for the filter. |
| `filterName` | String | **Required** | Display name. |
| `filtersPerNode` | String | **Required** | JSON string of filter condition logic (field names, operators, values). |
| `contextDefinitionVersionId` | String | **Required** | Version ID this filter belongs to. |
| `description` | String | Optional | Documentation for the filter. |

**Response:** Context Definition Filter List

#### `GET /connect/context-definitions/{contextDefinitionId}/context-filters/{filterId}` (v65.0+)
Get a single filter.  
**Response:** Context Definition Filter

#### `PATCH /connect/context-definitions/{contextDefinitionId}/context-filters/{filterId}` (v65.0+)
Update a filter. Same properties as POST filter.  
**Response:** Context Definition Filter

#### `DELETE /connect/context-definitions/{contextDefinitionId}/context-filters/{filterId}` (v65.0+)
Delete a filter.

---

### Context Node Endpoints

#### `POST /connect/context-definitions/{contextDefinitionId}/context-nodes` (v59.0+)
Create one or more context nodes (with nested child nodes and attributes).

**Request body — `contextNodes` array element properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | String | **Required** | Name of the node. |
| `contextNodeId` | String | Required for update | ID of the node (required for PATCH). |
| `isTransposable` | Boolean | Optional | Whether node stores key-value pairs. |
| `parentNodeId` | String | Optional | ID of the parent node for hierarchical placement. |
| `attributes` | Context Attributes Input[] | Optional | Attributes to create on this node. |
| `childNodes` | Context Nodes Input[] | Optional | Nested child nodes. |
| `tags` | Context Tag Input[] | Optional | Tags for this node. |

**Response:** Context Node List Output

#### `PATCH /connect/context-definitions/{contextDefinitionId}/context-nodes` (v59.0+)
Update one or more context nodes.  
**Response:** Context Node List Output

#### `GET /connect/context-definitions/{contextDefinitionId}/context-nodes/{contextNodeId}` (v59.0+)
Retrieve a specific node.  
**Response:** Context Node Output

#### `DELETE /connect/context-definitions/{contextDefinitionId}/context-nodes/{contextNodeId}` (v59.0+)
Delete a node (deletes all child nodes).

#### `POST /connect/context-nodes/{contextNodeId}/configurerelationship` (v61.0+)
Add child nodes to a specific context node.

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextNodeIds` | String[] | **Required** | List of context node IDs to add as children to the node in the path. |

**Response:** Context Node List

---

### Context Attribute Endpoints

#### `POST /connect/context-nodes/{contextNodeId}/context-attributes` (v59.0+)
Create attributes on a node.

**Request body — `contextAttributes` array element properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | String | **Required** | Name of the attribute. |
| `dataType` | String | **Required** | Data type: `STRING`, `NUMBER`, `DATE`, `DATETIME`, `BOOLEAN`, `CURRENCY`, `PERCENT`, `PICKLIST`, `REFERENCE`. |
| `fieldType` | String | **Required** | Field type: `INPUT`, `OUTPUT`, `INPUTOUTPUT`. |
| `contextAttributeId` | String | Required for update | ID (required for PATCH). |
| `domainSet` | String | Optional | Comma-separated node names this attribute references. |
| `isKey` | Boolean | Optional | Key attribute for transposable node. |
| `isValue` | Boolean | Optional | Value attribute for transposable node. |
| `tags` | Context Tag Input[] | Optional | Tags for this attribute. |

**Response:** Context Attribute List

#### `PATCH /connect/context-nodes/{contextNodeId}/context-attributes` (v59.0+)
Update attributes.  
**Response:** Context Attribute List

#### `GET /connect/context-nodes/{contextNodeId}/context-attributes/{contextAttributeId}` (v59.0+)
Retrieve a specific attribute.  
**Response:** Context Attribute Output

#### `DELETE /connect/context-nodes/{contextNodeId}/context-attributes/{contextAttributeId}` (v59.0+)
Delete an attribute.

---

### Context Tag Endpoints

#### `GET /connect/context-definitions/{contextDefinitionId}/context-tags` (v59.0+)
List all tags for a definition.  
**Query parameter:** `includeReferencedDefinitionTag=true` — include tags from referenced definitions (prefixed as `ContextDeveloperName.tagName`).  
**Response:** Context Tag List Output

#### `POST /connect/context-definitions/{contextDefinitionId}/context-tags` (v59.0+)
Create tags.

**Request body — `contextTags` array element properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | String | **Required** | Name of the tag. |
| `contextAttributeId` | String | Required (or nodeId) | ID of the attribute this tag is for. |
| `contextNodeId` | String | Required (or attrId) | ID of the node this tag is for. |
| `contextTagId` | String | Required for update | ID of the tag (required for PATCH). |

**Response:** Context Tag List Output

#### `PATCH /connect/context-definitions/{contextDefinitionId}/context-tags` (v59.0+)
Update tags.  
**Response:** Context Tag List Output

#### `GET /connect/context-definitions/{contextDefinitionId}/context-tags/{contextTagId}` (v59.0+)
Get a specific tag.  
**Response:** Context Attribute Tag Output

#### `DELETE /connect/context-definitions/{contextDefinitionId}/context-tags/{contextTagId}` (v59.0+)
Delete a tag.

---

### Context Mapping Endpoints

#### `POST /connect/context-definitions/{contextDefinitionId}/context-mappings` (v59.0+)
Create one or more mappings.

**Request body — top-level properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextMappings` | Context Mappings Input[] | Required | Array of mapping objects. |
| `generateInputMappings` | Boolean | Optional | Auto-generate input mappings. |
| `generateSObjectMappings` | Boolean | Optional | Auto-generate SObject mappings. |

**Mapping object properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | String | **Required** | Name of the mapping. |
| `contextMappingId` | String | Required for update | ID (required for PATCH). |
| `isDefault` | Boolean | Optional | Whether this is the default mapping. |
| `description` | String | Optional | Description. |
| `intents` | List<String> | Optional | List of intent values: `HYDRATION`, `PERSISTENCE`, `ASSOCIATION`, `TRANSLATION`. (v61.0+) |
| `contextNodeMappings` | Context Node Mappings Input[] | Optional | Node-level mappings to create inline. |

**Response:** Context Mapping List Output

#### `PATCH /connect/context-definitions/{contextDefinitionId}/context-mappings` (v59.0+)
Update mappings.  
**Response:** Context Mapping List Output

#### `GET /connect/context-definitions/{contextDefinitionId}/context-mappings/{contextMappingId}` (v59.0+)
Retrieve a mapping.  
**Response:** Context Mapping Output

#### `DELETE /connect/context-definitions/{contextDefinitionId}/context-mappings/{contextMappingId}` (v59.0+)
Delete a mapping.

---

### Context Node Mapping Endpoints

#### `POST /connect/context-mappings/{contextMappingId}/context-node-mappings` (v59.0+)
Create node mappings within a context mapping.

**Request body — `contextNodeMappings` array element properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextNodeId` | String | Optional | Reference to context node. |
| `sObjectName` | String | Optional | SObject name to map to. |
| `contextNodeMappingId` | String | Required for update | ID (required for PATCH). |
| `attributeMappings` | Context Attribute Mappings Input[] | Required | Attribute-level mappings. |

**Response:** Context Node Mapping List Output

#### `PATCH /connect/context-mappings/{contextMappingId}/context-node-mappings` (v59.0+)
Update node mappings.  
**Response:** Context Node Mapping List Output

#### `GET /connect/context-mappings/{contextMappingId}/context-node-mappings/{contextNodeMappingId}` (v59.0+)
Get a specific node mapping.  
**Response:** Context Node Mapping Output

#### `DELETE /connect/context-mappings/{contextMappingId}/context-node-mappings/{contextNodeMappingId}` (v59.0+)
Delete a node mapping.

---

### Context Attribute Mapping Endpoints

#### `POST /connect/context-node-mappings/{contextNodeMappingId}/context-attribute-mappings` (v59.0+)
Create attribute mappings.

**Request body — `contextAttributeMappings` array element properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextAttributeId` | String | **Required** | ID of the context attribute. |
| `contextAttributeMappingId` | String | Required for update | ID (required for PATCH). |
| `contextInputAttributeName` | String | Optional | Input attribute name. |
| `hydrationDetails` | Context Attribute Hydration Details Input[] | Optional | SOQL/field path sources for hydration. |

**Hydration detail properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sObjectDomain` | String | Optional | SObject domain. |
| `queryAttribute` | String | Optional | Field or query path. |
| `contextAttrHydrationDetailId` | String | Optional | ID for updates. |
| `parentAttributeMappingId` | String | Required | Parent mapping ID. |
| `parentDetailId` | String | Required | Parent hydration detail ID. |
| `childDetails` | Context Attribute Hydration Details Input[] | Required | Child detail entries. |

**Response:** Context Attribute Mapping List Output

#### `PATCH /connect/context-node-mappings/{contextNodeMappingId}/context-attribute-mappings` (v59.0+)
Update attribute mappings.  
**Response:** Context Attribute Mapping List Output

#### `GET /connect/context-node-mappings/{contextNodeMappingId}/context-attribute-mappings/{contextAttributeMappingId}` (v59.0+)
Retrieve an attribute mapping.  
**Response:** Context Attribute Mapping Output

#### `DELETE /connect/context-node-mappings/{contextNodeMappingId}/context-attribute-mappings/{contextAttributeMappingId}` (v59.0+)
Delete an attribute mapping.

---

### Context Service Runtime Endpoints

#### `POST /connect/contexts` (v59.0+)
Create a new context instance. Context objects created via this endpoint are **request-scoped** — they cannot be shared across multiple requests.

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `metadata` | Context Metadata Input | **Required** | Contains `contextDefinitionId` and `mappingId`. |
| `data` | String | **Required** | Stringified JSON of record data to hydrate. |

**Metadata Input properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextDefinitionId` | String | **Required** | ID of the context definition. |
| `mappingId` | String | **Required** | ID of the mapping to use. |
| `taggedData` | Boolean | Optional | Return tagged attribute names in the created context. |

**Response:** Context Info (`contextId`)

#### `GET /connect/contexts/{contextId}` (v59.0+)
Retrieve context details.  
**Response:** Context Info

#### `DELETE /connect/contexts/{contextId}` (v59.0+)
Delete a context instance from the cache.  
**Response:** None (204)

#### `PATCH /connect/contexts/attributes` (v59.0+)
Update attributes in a context record using canonical field names.

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `updateContextAttributesInput` | Object | **Required** | Contains `contextId` and `nodePathAndAttributes` (list of `{ nodePath: { dataPath: [...] }, attributes: [{ attributeName, attributeValue }] }`). |

> **Note:** When a definition is mapped to Account and a field is mapped to `Account.RecordType.Name`, updating the RecordType ID does not update the mapped display field.

**Response:** Context Output (`isSuccess`)

#### `DELETE /connect/context-runtime-schema/clear` (v65.0+)
Clear the runtime schema cache.

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `contextDefinitionName` | String | **Required** | Developer name of the definition whose cache to clear. |
| `contextMappingNames` | String[] | Optional | Comma-separated mapping names to clear. If omitted, the default mapping cache is cleared. |

**Response:** 204 No Content

#### `GET /connect/context-definition-interfaces` (v62.0+)
Get metadata for all context definition interfaces.  
**Response:** Context Definition Interface Metadata List

#### `GET /connect/context-definition-interfaces/{contextDefinitionInterfaceName}` (v62.0+)
Get details for a specific context definition interface by name.  
**Response:** Context Definition Interface

#### `POST /connect/contexts/query-record` (v59.0+)
Query a context record and optionally its children.

**Query parameter:** `children=true|false` (optional)

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextId` | String | **Required** | ID of the context. |
| `attributes` | String[] | Optional | Specific attributes to retrieve. |
| `businessObjectTypeFilter` | String | Optional | Filter by business object type. |
| `queryPath` | String[] | Optional | Path to the parent node. |

**Response:** Query Context Record Result

#### `POST /connect/contexts/query-record-status` (v59.0+)
Create processing status and error records for query data records.  
**Response:** Query Record Status Result

#### `PATCH /connect/contexts/query-record-status` (v59.0+)
Update processing status for query data records.  
**Response:** Context Output

#### `POST /connect/contexts/query-tags` (v59.0+)
Query context data by tag names.

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextId` | String | **Required** | ID of the context. |
| `tags` | String[] | **Required** | List of tag names to query. |

**Response:** Query Tags Result

#### `PATCH /connect/contexts/write-through-tags` (v63.0+)
Update context attributes through tags (tag-name-based update, vs. canonical-name-based update via `/contexts/attributes`).

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextId` | String | **Required** | ID of the context to update. |
| `nodePathAndTagValues` | List<NodePathAndTagValuesInput> | **Required** | List of `{ nodePath: { dataPath: [...] }, tagValues: [{ tagName, tagValue }] }` objects. |

**Response:** Context Output

#### `POST /connect/contexts/query-tags-leaner` (v66.0+)
Query tags and return a memory-optimized result. Use for Apex and low-heap clients.

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextId` | String | **Required** | ID of the context. |
| `tags` | String[] | **Required** | Tag names to query (attribute-level and node-level). |

**Response:** Leaner Query Tags Result

---

### Context Persistence Endpoint

#### `POST /connect/contexts/persist-records` (v59.0+)
Persist context data to Salesforce database records.

**Request body:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextPersistInput` | Object | **Required** | Contains `contextId` (String) and `targetMappingId` (String, optional). |

> **Note:** Reference field pointers in the context (e.g., the Account FK on an Order) may not be persisted. The persist operation focuses on direct attributes of the main entity.

**Response:** Persist Context Output (`referenceId`)

---

## API Response Bodies Reference

### Context Information
| Property | Type | Description |
|----------|------|-------------|
| `contextId` | String | ID of the context instance. |
| `contextName` | String | Name of the context. |
| `contextVersion` | String | Version of the context. |

### Context Definition Output
| Property | Type | Description |
|----------|------|-------------|
| `id` | String | ID of the context definition. |
| `name` | String | Name. |
| `description` | String | Description. |
| `status` | String | Status (e.g., active/inactive). |
| `version` | String | Version. |
| `definitionType` | String | `standard_executable`, `standard_nonexecutable`, or `custom_nonexecutable`. |
| `contextNodes` | Context Node[] | Nodes in this definition. |

### Context Node (Response)
| Property | Type | Description |
|----------|------|-------------|
| `contextNodeID` | String | ID of the node. |
| `name` | String | API name. |
| `displayName` | String | UI name. Available v61.0+. |
| `isTransposable` | Boolean | Transposable flag. |
| `parentNodeId` | String | Parent node ID. |
| `contextDefinitionVersionID` | String | Definition version ID. |
| `attributes` | Context Attribute List[] | Attributes on this node. |
| `childNodes` | Context Node Output[] | Child nodes. |
| `tags` | Context Attribute Tag Output[] | Tags. |
| `canonicalNodeId` | String | Canonical node ID. Available v61.0+. |
| `baseReference` | String | Parent definition's node ID this was inherited from. Available v60.0+. |
| `isSuccess` | Boolean | Operation success flag. |

### Context Attribute Output
| Property | Type | Description |
|----------|------|-------------|
| `contextAttributeId` | String | ID. |
| `name` | String | Name. |
| `dataType` | String | Data type. |
| `fieldType` | String | Field type. |
| `domainSet` | String | Referenced node names. |
| `isKey` | Boolean | Key flag. |
| `isValue` | Boolean | Value flag. |
| `parentNodeId` | String | Parent node ID. |
| `attributeTags` | Context Attribute Tag[] | Tags. |
| `isSuccess` | Boolean | Operation success flag. |

### Context Attribute Tag Output
| Property | Type | Description |
|----------|------|-------------|
| `contextTagId` | String | ID of the tag. |
| `contextAttributeId` | String | Parent attribute ID. |
| `name` | String | Tag name. |
| `dynamic` | Boolean | Whether tag is dynamic. |

### Context Tag Data (Query Tags response)
| Property | Type | Description |
|----------|------|-------------|
| `tagValue` | Object | Value of the tag. |
| `dataPath` | String[] | Path in the context structure to the tag location. |

### Context Tag Data Leaner (v66.0+)
| Property | Type | Description |
|----------|------|-------------|
| `tagValue` | Object | Tag value (primitive for attribute tags; nested map for node tags). |
| `recordIdIndexesForPath` | Integer[] | Indexes into the shared `recordIds` array to reconstruct the data path. |
| `nodeLevelTag` | Boolean | Whether this tag is at node level. |

### Leaner Query Tags Result (v66.0+)
| Property | Type | Description |
|----------|------|-------------|
| `contextId` | String | Context ID. |
| `isSuccess` | Boolean | Success flag. |
| `errorMessage` | String | Error message if failed. |
| `recordIds` | String[] | All record IDs in the context included in the result. |
| `queryResultLeanerRepresentation` | Map<String, Context Tag Data Leaner[]> | Tag name → list of lean tag data. |

### Query Context Record Result
| Property | Type | Description |
|----------|------|-------------|
| `contextId` | String | Context ID queried. |
| `isDone` | Boolean | Whether query is complete. |
| `isSuccess` | Boolean | Success flag. |
| `queryRecords` | Context Query Record[] | Retrieved records. |

### Context Query Record
| Property | Type | Description |
|----------|------|-------------|
| `record` | Context Data Record | The primary record. |
| `childQueryRecords` | Context Query Record[] | Child records. |

### Context Data Record
| Property | Type | Description |
|----------|------|-------------|
| `contextDataRecordId` | String | Unique ID. |
| `businessObjectType` | String | Object type (e.g., `Account`). |
| `attributesAndValues` | Map<String,Object> | Field name → value pairs. |
| `childBusinessObjectTypes` | String[] | Child object types. |
| `currentState` | String | Status (e.g., `CREATED`). |
| `lastUpdatedTimeStamp` | String | Last update timestamp. |

### Persist Context Output
| Property | Type | Description |
|----------|------|-------------|
| `referenceId` | String | Reference ID mapping to the `ContextPersistenceEvent`. Available v58.0+. |

### Context Error Response
| Property | Type | Description |
|----------|------|-------------|
| `errorCode` | String | Error code. |
| `errorMessage` | String | Error message. |
| `errorType` | String | Error type. |

### Context Definition Filter (Response)
| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Filter ID. |
| `name` | String | Filter name. |
| `contextDefinitionId` | String | Parent definition ID. |
| `contextNodeId` | String | Node ID the filter applies to. |
| `contextNodeName` | String | Node name. |
| `filterExpression` | String | Filter expression string. |
| `sequence` | Integer | Filter sequence order. |

### Context Mapping Output
| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Mapping ID. |
| `name` | String | Mapping name. |
| `contextDefinitionId` | String | Definition ID. |
| `attributeMappings` | Context Attribute Mapping[] | Attribute mappings. |
| `sourceContextNodeName` | String | Source node name. |
| `targetContextNodeName` | String | Target node name. |

### Context Node Mapping Output
| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Node mapping ID. |
| `contextDefinitionId` | String | Definition ID. |
| `contextNodeId` | String | Node ID. |
| `contextNodeName` | String | Node name. |
| `mappingType` | String | Mapping type. |
| `nodePath` | String | Full path. |
| `sourceNodeName` | String | Source node. |

### Context Attribute Mapping (Response)
| Property | Type | Description |
|----------|------|-------------|
| `contextAttributeMappingId` | String | ID. |
| `contextAttributeId` | String | Attribute ID. |
| `contextInputAttributeName` | String | Input attribute name. |
| `parentNodeMappingId` | String | Parent node mapping ID. |
| `contextAttrHydrationDetailList` | Context Attribute Hydration Detail[] | Hydration sources. |
| `contextAttrContextHydrationDetailList` | Context Attribute Context Hydration Detail[] | Context-to-context hydration sources. Available v61.0+. |
| `isSuccess` | Boolean | Success flag. |

### Context Attribute Hydration Detail (Response)
| Property | Type | Description |
|----------|------|-------------|
| `contextAttrHydrationDetailId` | String | ID. |
| `sObjectDomain` | String | SObject domain. |
| `queryAttribute` | String | Query attribute/field path. |
| `parentMappingAttributeId` | String | Parent attribute mapping ID. |
| `childDetails` | Context Attribute Hydration Detail[] | Nested child details. |
| `mappedAttributeDataTypeInfo` | Mapped Attribute Data Type[] | Data type info. |
| `isSuccess` | Boolean | Success flag. |

### Mapped Attribute Data Type
| Property | Type | Description |
|----------|------|-------------|
| `dataType` | String | Data type of the mapped field. |
| `supportedPicklistValues` | String[] | Valid picklist values (when `dataType = picklist`). |

### Query Record Status Result
| Property | Type | Description |
|----------|------|-------------|
| `contextRecordStatusListId` | String | Unique ID for LDS. |
| `isSuccess` | Boolean | Success flag. |
| `queryResult` | Context Data Record Status[] | Status list. |

### Context Data Record Status
| Property | Type | Description |
|----------|------|-------------|
| `dataPath` | String | Path of the data record. |
| `processingStatus` | String | Status of the record processing. |
| `contextErrors` | Context Error[] | List of errors if failed. |
