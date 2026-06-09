# Context Service — Limits & Known Test Gotchas

---

## Hard Limits (Contact Salesforce Support to increase)

### Context Definition Design-Time Limits

| Limit | Default | Maximum |
|-------|---------|---------|
| Nodes per context definition | 80 | — (no documented maximum; 80 is the default) |
| Attributes per context definition | 1,500 | 1,600 |
| Attributes per node | 400 | 500 |
| Levels of hierarchy | 5 | 5 |

### Context Instance Runtime Limits

| Limit | Default | Maximum |
|-------|---------|---------|
| Active context instances per app within TTL | — | 20,000 |
| Records per context instance | 10,000 | 20,000 |
| TTL (Time To Live) | 10 minutes | 45 minutes |

---

## Monitoring Sync Operations — `ContextDefinitionSync` (Tooling API, v62.0+)

`ContextDefinitionSync` stores one record per sync operation for a context definition.

**Supported Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`  
**Supported REST methods:** `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, `Query`

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextDefinitionName` | String | Create, Filter, Group, Sort, Update | Developer name of the definition being synced. |
| `EndDateTime` | dateTime | Create, Filter, Nillable, Sort, Update | When the sync operation ended. |
| `Name` | String | Autonumber, Defaulted on create, Filter, idLookup, Sort | Auto-generated record name. |
| `OwnerId` | reference | Create, Defaulted on create, Filter, Group, Sort, Update | Owner of the record. Polymorphic: Group or User. |
| `StartDateTime` | dateTime | Create, Filter, Sort, Update | When the sync operation started. |
| `Status` | picklist | Create, Filter, Group, Restricted picklist, Sort, Update | Sync status. Values: `failed`, `in_progress`, `success`. |
| `SynchronizationInformation` | textarea | Create, Nillable, Update | Detailed log / error details of the sync operation. |

Query this object to programmatically monitor sync state instead of polling the Setup UI.

---

## Known Pitfalls for Testing

### 1. Schema Cache Is Stale After Metadata Changes
**What happens:** When a Salesforce Object field is modified (added, renamed, changed type),
the change takes up to **24 hours** to reflect in context instances. Tests running against
the stale schema will hydrate old/missing field data.

**Symptom:** Context tag returns null for a field that was recently added to the SObject.
Or context throws a field-not-found error for a recently deleted field.

**Fix:** Manually clear the runtime schema cache:
```
DELETE /services/data/vXX.0/connect/context-runtime-schema/clear
```
Cache refreshes on the next Build Context request.

---

### 2. Context Definition Must Be Active Before Any Test Can Hydrate
**What happens:** Calling Build Context against an inactive context definition returns an error.
Tests that assume the definition is active will fail if it was recently edited (editing requires
temporary deactivation or the definition was never activated).

**Symptom:** Build Context invocable action fails with "Definition not active" or similar error.

**Fix:** Add a pre-test assertion or setup check:
```apex
// Verify the definition is active before running tests
// Context definitions are metadata — check this in your sandbox setup doc
// Query ContextDefinition object if available in your API version:
List<ContextDefinition__mdt> defs = [
    SELECT DeveloperName, IsActive__c
    FROM ContextDefinition__mdt
    WHERE DeveloperName = 'YourDefinitionDeveloperName'
];
System.assert(!defs.isEmpty() && defs[0].IsActive__c,
    'Context Definition must be active before tests run');
```

---

### 3. No Default Mapping = Build Context Fails
**What happens:** If a context definition has zero mappings set as default, Build Context
fails at runtime. This is easy to miss when creating a definition for the first time or when
adding a second mapping.

**Symptom:** Build Context invocable action returns an error about missing default mapping.

**Fix:** In test setup documentation, add:
- Verify exactly one mapping on the definition is marked `IsDefault = true`
- If definition has only one mapping, it MUST be set as default

---

### 4. Extended Definitions Are NOT Auto-Synced in Apex/Flow Hydrations
**What happens:** When the parent standard definition is upgraded, extended definitions are
auto-synced only when accessed via Setup UI or when the app hydrates via non-Apex/Flow paths.
When hydration is triggered by Apex or Flow, auto-sync does NOT run.

**Symptom:** Test expects a new node/attribute that was added to the standard definition,
but it's not present in the hydrated context instance.

**Fix:** After any Salesforce release upgrade, always manually check and sync extended
definitions before running flow-based or Apex-based context tests:
Setup → Context Definitions → Custom Definitions → select extended def → **Sync Now**

---

### 5. Context Cache Persists Between Test Runs for Session-Scoped Contexts
**What happens:** Session-scoped context instances live for their TTL (up to 45 min) in the
cache. If a test hydrates a session-scoped context and the next test runs within the TTL,
it may pick up stale cached data.

**Symptom:** Test 2 reads context data that Test 1 wrote, producing unexpected results.

**Fix:** Explicitly delete the context cache at the end of each test that uses session-scoped context:
- Use the **Delete Context Cache** invocable action with the Context ID from Test 1
- Or call the REST endpoint: `DELETE /connect/context-service/contexts/{contextId}`
- In Apex tests, request-scoped context is automatically cleaned up after the transaction

---

### 6. Compound Field Types Cannot Be Persisted
**What happens:** Attempting to persist a compound field (e.g. `Contact.Name`, which combines
salutation + first name + last name) via Persist Context Data fails.

**Symptom:** Persist Context Data completes without error but the compound field is not updated.

**Fix:** Map and persist each component field individually. For `Contact.Name`:
- Map `Contact.Salutation`, `Contact.FirstName`, `Contact.LastName` as separate attributes
- Persist each field independently

---

### 7. Override During Sync Is Irreversible
**What happens:** When an extended definition's sync fails due to a conflict, you can click
**Override** — but this permanently removes conflicting custom artifacts.

**Fix:** Before performing an Override on any extended definition:
1. Export the definition as a package (Package Manager) to create a backup
2. Only then proceed with Override

---

### 8. Cannot Deploy Across Different Release Versions
**What happens:** Context definitions cannot be deployed from an org on a newer Salesforce
release to an org on an older release (e.g. Spring '26 → Winter '26).

**Symptom:** Package deployment fails with a version mismatch error.

**Fix:** Ensure both source and target orgs are on the same release before any
context definition package deployment.

---

### 9. Mapping Can Only Be Added to an Inactive Definition
**What happens:** You cannot add NEW mappings to an active context definition. You can
add new nodes and attributes, but not new top-level mappings.

**Symptom:** "Add Mapping" button is disabled on an active definition.

**Fix:** Deactivate the definition → add the mapping → reactivate.
For active definitions where you need a new mapping: deactivation is required.

---

### 10. Filters Are Not Available in Standard Definitions (View Only)
**What happens:** Context Filters can only be viewed in standard definitions, not edited.
To customize filters, you must clone the standard definition first.

**Fix:** Clone the standard definition (with Preserve Inheritance if desired) → edit filters
in the cloned (custom) definition.

---

### 11. RecordType.Name Not Updated via Attribute Patch

**What happens:** When a context definition maps a field to `Account.RecordType.Name`, and you update the RecordType ID via `PATCH /connect/contexts/attributes` (or `updateContextAttributes` Apex), the mapped display field (`RecordType.Name`) is **not** updated. Updating the ID of a RecordType does not cascade to other fields on that related object.

**Symptom:** After updating a `RecordTypeId` attribute in the context and calling `queryTags` for the `RecordType.Name` tag, the old name is still returned.

**Fix:** Re-hydrate the context (Build Context again) after changing a RecordType relationship if the display field matters to downstream logic.

---

### 12. `write-through-tags` Operates via Tag Names, not Canonical Names

**What happens:** The `PATCH /connect/contexts/write-through-tags` endpoint and the `nodePathAndTagValues` payload use **tag names** (the aliases). The `PATCH /connect/contexts/attributes` endpoint uses **canonical attribute names** (the raw field names defined in the node structure). Mixing them up causes updates to silently fail or produce unexpected results.

**Symptom:** Attribute update appears to succeed (`isSuccess: true`) but the value is not changed in the context.

**Fix:** Use `/write-through-tags` with tag names, or `/attributes` with canonical names. Never mix the two in the same call.

---

### 13. `leanerQueryTags` Path Reconstruction Requires Index Lookup

**What happens:** Unlike `queryTags`, the `leanerQueryTags` API returns `recordIdIndexesForPath` (integer array) instead of full `dataPath` string arrays. The caller must look up each integer as an index into the shared `recordIds` array to reconstruct the actual data path.

**Symptom:** Code that reads `dataPath` directly from a leaner result fails with null or throws an index error.

**Fix:** Always reconstruct the path: for each entry in `recordIdIndexesForPath`, use it as the index into `output.get('recordIds')` to get the actual record ID. See the `leanerQueryTags` Apex example in the Apex Reference section.

---

### 14. `contextDefinitionName` + `mappingName` vs. IDs in Apex buildContext

**What happens:** The `buildContext` Apex method accepts either IDs or names in the `metadata` map. Using `contextDefinitionId` + `mappingId` (record IDs) is the stable approach. Using `contextDefinitionName` + `mappingName` (string names) is more human-readable but can break if the definition is renamed.

**Fix:** In production code, prefer IDs. Use names only in test code where human readability matters more than stability.

---

## Context Attribute Input Specification

The `Context Attribute Input` representation is used for the `PATCH /connect/contexts/attributes` endpoint and the `updateContextAttributes` Apex method.

### JSON Shape

```json
{
  "contextId": "3729ed60-d16d-41b8-8951-9ad4f6407ad2",
  "nodePathAndAttributes": [
    {
      "nodePath": {
        "dataPath": [
          "TestOrder123"
        ]
      },
      "attributes": [
        {
          "attributeName": "Status",
          "attributeValue": "DISPATCHED"
        }
      ]
    }
  ]
}
```

### Top-Level Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `updateContextAttributesInput` | Object | **Required** | Wrapper object containing contextId and nodePathAndAttributes. |

### `updateContextAttributesInput` Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `contextId` | String | **Required** | ID of the context instance to update. |
| `nodePathAndAttributes` | List<Object> | **Required** | Per-record update instructions. |

### `nodePathAndAttributes` Item Properties

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `nodePath` | Object `{ dataPath: String[] }` | **Required** | Path to the context record to update. `dataPath` is ordered from root record ID to the target record ID. |
| `attributes` | List<Object> | **Required** | List of `{ attributeName: String, attributeValue: Any }` pairs. `attributeName` is the canonical field name (NOT the tag name). |
