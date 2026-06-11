# Context Service — Concepts & Architecture

**Last updated from:** Salesforce Context Service documentation, 2026.04.27

---

## What Context Service Is

Context Service is a **generic data-caching and distribution middleware** that sits between
Salesforce applications (e.g. RCA pricing procedures, billing engines, order orchestration)
and the underlying Salesforce data layer (SObjects, DMOs).

**Without Context Service:**
A multi-step procedure (e.g. a pricing calculation with 5 steps) makes repeated database
queries for overlapping data — one per step.

**With Context Service:**
The application sends one request. Context Service fetches all required data once, loads it
into an in-memory cache (the "context instance"), and distributes it to each step on demand.
This eliminates redundant queries and reduces procedure latency.

```
APPLICATION
  Step 1 ──┐
  Step 2 ──┤
  Step 3 ──┼──► CONTEXT DEFINITION ──► MAPPING ──► DATA SOURCE (Salesforce SObjects)
  Step 4 ──┤         │                                    │
  Step 5 ──┘   [Nodes + Attributes]          (fetched once, cached in context instance)
```

Context Service provides data at both:
- **Design time** (when configuring the procedure/application)
- **Run time** (when executing the procedure/application)

---

## Key Terms

| Term | Definition |
|------|-----------|
| **Context Service** | The middleware layer between applications and Salesforce data. Acts as a generic, reusable data cache and distributor. |
| **Context Definition** | The complete specification: nodes, attributes, context tags, and mappings. Defines the data structure a procedure can access. |
| **Node** | A canonical object within a context definition. Represents a logical entity (e.g. Account, Product, Quote). Nodes can have parent-child hierarchy (up to 5 levels deep). |
| **Attribute** | A field on a node. Mapped to a real Salesforce object field or input data. |
| **Context Tag** | A unique identifier for a specific node or attribute within a context definition. Tags are how consuming applications query data from the context. Each tag is unique within a definition. |
| **Context Mapping** | The connection between a context definition's nodes/attributes and their actual data source (SObjects, DMOs, other context definitions, or input JSON). Every definition must have at least one mapping. |
| **Context Hydration** | The process of reading data from the mapped data sources and loading it into the context instance (in-memory cache). |
| **Context Instance** | The live, in-memory object that holds the hydrated data for a specific execution. |
| **Request-scoped context** | A context instance that lives only for the duration of the triggering request (Apex method, REST API call, Flow, or Event). |
| **Session-scoped context** | A context instance that persists until its TTL expires. Used when data must span multiple requests. |
| **TTL (Time To Live)** | How long a session-scoped context instance remains available. Default: 10 minutes. Maximum: 45 minutes. Applies to extended, cloned, and custom definitions. |
| **Mark as Default** | Setting that designates which context mapping is used when no explicit mapping name/ID is provided. Every active definition must have exactly one default mapping. |
| **Mark as Transposable** | Node option that stores its attributes as key-value pairs instead of fixed fields. Used when a single attribute needs to store varying values (e.g. ProductAttribute node with AttributeName/AttributeValue). |
| **Reference Definition** | A flag on a context definition that allows other definitions to reference it as a data source in their mappings. Enable this when you want the definition to serve as a shared data model referenced by other context definitions. To link two reference definitions together, use the **+Add Reference Definition** option during creation. |
| **Standard context definition** | Shipped read-only definition from Salesforce. Cannot be edited or deleted. Can only be extended or cloned. |
| **Extended context definition** | Created by extending a standard definition. Inherits all standard nodes, attributes, and mappings. Auto-upgraded when the parent standard definition is upgraded. Only additive changes allowed. |
| **Cloned context definition** | Created by copying a standard or custom definition. Fully customizable (add, edit, delete). NOT auto-upgraded from standard; must be manually synced. |

---

## Context Definition Structure

```
Context Definition
  ├── Name, Description, Effective From/To, TTL
  ├── Reference Definition flag (can be referenced by other definitions)
  ├── Structure
  │   ├── Node (Level 1)
  │   │   ├── Attribute (INPUT / OUTPUT / INPUT OUTPUT / REFERENCE)
  │   │   ├── Attribute
  │   │   └── Child Node (Level 2)
  │   │       ├── Attribute
  │   │       └── ...  (max 5 levels of hierarchy)
  │   └── Node (sibling)
  ├── Context Tags (one per node and attribute; unique within definition)
  └── Mappings (at least one; exactly one must be marked default when active)
```

### Attribute Types

| Type | Access | Persistence | Use when |
|------|--------|-------------|----------|
| **INPUT** | Read-only | Not persisted to DB (except REFERENCE) | Data hydrated from SObjects, consumed read-only |
| **OUTPUT** | Write | Written back to SObjects | Procedure writes results back to records |
| **INPUT OUTPUT** | Read + Write | Written back to SObjects | Hydrated initially, then updated by the procedure |
| **REFERENCE** | INPUT only | Persisted | Establishes links between nodes. **Must always be INPUT type — cannot be OUTPUT or INPUT OUTPUT.** |
| **Transient** | Temporary | NOT persisted | Cached in context only; not saved to DB. Explicitly skipped during context persistence. |

### Special `fieldType` and `dataType` Values (v63.0+)

| Value | Where | Description |
|-------|-------|-------------|
| `aggregate` | `fieldType` on `ContextAttribute` | Attribute is a computed aggregate value (e.g., sum/count derived from related records). Requires a corresponding aggregation mapping. |
| `selfreference` | `dataType` on `ContextAttribute` | Attribute holds a reference back to the same definition's own record ID; used for recursive relationship modeling. |

### Metadata Flags (v63.0+)

| Field | Type | Description |
|-------|------|-------------|
| `canBeReferenceDefinition` | Boolean | When `true`, this definition can be imported as a reference node in another definition. Default `false`. |
| `hasSystemTags` | Boolean | When `true`, the platform automatically injects system-managed tags into the context at hydration time. |

> **Date/time timezone behavior:** Context Service returns all date and time attributes in the **UTC time zone**. The consuming application (Flow, Apex, UI) is responsible for converting to the user's or org's local time zone as needed.

---

## Permission Set Licenses

| PSL Name | Role | Access |
|----------|------|--------|
| **Context Service Admin** | Admin persona | Create, manage, activate all context definitions and mappings |
| **Context Service Runtime** | Runtime user | Read context definitions; read/write context instances in cache |

System Admins have default access without requiring either PSL.

To check available PSL count: Setup → Company Information.

---

## Tooling API Objects — Complete Inventory

The following objects are available in the Context namespace via the Tooling API (REST or SOAP). All support `DELETE`, `GET`, `HEAD`, `PATCH`, `POST`, and `Query` REST methods unless noted.

| Tooling Object | Available Since | Description |
|----------------|-----------------|-------------|
| `ContextAttrHydrationDetail` | v59.0 | SOQL queries that fetch data for a chosen attribute from the input schema |
| `ContextAttribute` | v59.0 | Attribute used to describe a context node |
| `ContextAttributeMapping` | v59.0 | Relationship between a context attribute and values in related objects |
| `ContextDefinition` | v59.0 | Information about a context definition |
| `ContextDefinitionReference` | v60.0 | Reference from one Context Definition to another |
| `ContextDefinitionSync` | v62.0 | Sync operation records for custom-to-standard definition sync |
| `ContextDefinitionVersion` | v59.0 | Version information for a context definition; only one can be active |
| `ContextMapping` | v59.0 | Mapping of attributes and nodes to related objects |
| `ContextMappingIntent` | v61.0 | Purpose (intent) associated with a context mapping |
| `ContextNode` | v59.0 | Structure of the nodes within the context |
| `ContextNodeAttrDictionary` | v62.0 | Junction between ContextNodeMapping and ContextDictionary |
| `ContextNodeMapping` | v59.0 | Relationship between a context node and values in the input schema |
| `ContextTag` | v59.0 | Shortened name (alias) of an attribute or node |
| `CtxAttrHydrationCtx` | v61.0 | Queries fetching data for context-to-context mapping hydration |

### ContextDefinition (Tooling API) — Field Reference

**Supported Calls:** `create()`, `delete()`, `describeSObjects()`, `query()`, `retrieve()`, `update()`, `upsert()`

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `CanBeReferenceDefinition` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether this definition can be referenced by other context definitions. Default `false`. Available v63.0+. |
| `ClonedFrom` | string | Create, Filter, Group, Nillable, Sort, Update | Name of the definition used to clone this one. |
| `ContextTtl` | int | Create, Filter, Group, Nillable, Sort, Update | Duration (minutes) for cached context data to remain in cache. Default 10. |
| `Description` | string | Create, Filter, Group, Nillable, Sort, Update | Description of the context definition. |
| `DeveloperName` | string | Create, Filter, Group, Sort, Update | Unique API name of the context definition. |
| `DisplayName` | string | Create, Filter, Group, Nillable, Sort, Update | Display name. |
| `HasSystemTags` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether the definition has system tags. Default `false`. Available v63.0+. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Name of the parent definition this is derived from. Available v60.0+. |
| `InheritedFromVersion` | string | Create, Filter, Group, Nillable, Sort, Update | Version number of parent definition. Available v60.0+. |
| `Language` | picklist | Create, Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort, Update | Language of the definition. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. Values: `beta`, `deleted`, `deprecated`, `deprecatedEditable`, `installed`, `installedEditable`, `released`, `unmanaged`. |
| `MasterLabel` | string | Create, Filter, Group, Sort, Update | UI label. |
| `NamespacePrefix` | string | Filter, Group, Nillable, Sort | Namespace prefix. Max 15 characters. |
| `Title` | string | Create, Filter, Group, idLookup, Sort, Update | API name of the context definition. |

### ContextNode (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `CanonicalNodeId` | reference | Create, Filter, Group, Nillable, Sort, Update | Canonical node associated with this context node. Available v61.0+. Refers To: ContextNode. |
| `ContextDefinitionVersionId` | reference | Create, Filter, Group, Sort | Associated definition version. Refers To: ContextDefinitionVersion. |
| `Description` | textarea | Create, Filter, Nillable, Sort, Update | Description of the context node. |
| `DisplayName` | string | Create, Filter, Group, Nillable, Sort, Update | Display name. Available v61.0+. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent node this is derived from. Available v60.0+. |
| `IsTransposable` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether node stores key-value pairs. Default `false`. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `Title` | string | Create, Filter, Group, Sort, Update | Name of the context node. |

### ContextAttribute (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextNodeId` | reference | Create, Filter, Group, Sort | Parent context node. Refers To: ContextNode. |
| `DataType` | picklist | Create, Defaulted on create, Filter, Group, Restricted picklist, Sort, Update | Data type. Values: `boolean`, `currency`, `date`, `datetime`, `lookup`, `number`, `percent`, `picklist`, `reference`, `string`. Default `string`. |
| `DomainSet` | string | Create, Filter, Group, Nillable, Sort, Update | Comma-separated node names referenced by this attribute (parent-child relationship list). |
| `FieldType` | picklist | Create, Defaulted on create, Filter, Group, Restricted picklist, Sort, Update | Field type. Values: `input`, `inputoutput`, `output`. Default `input`. |
| `IsKey` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether attribute is a key attribute (used for transposable feature). Default `false`. |
| `IsTransient` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether attribute is skipped during context persistence. Default `false`. |
| `IsValue` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether attribute identifies as the value in a transposable node. Default `false`. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `Title` | string | Create, Filter, Group, Sort, Update | Name of the context attribute. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent attribute this is derived from. Available v60.0+. |

### ContextMapping (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextDefinitionVersionId` | reference | Create, Filter, Group, Sort | Associated definition version. Refers To: ContextDefinitionVersion. |
| `Description` | string | Create, Filter, Group, Nillable, Sort, Update | Description. |
| `IsDefault` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether this is the default mapping. Default `false`. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `Title` | string | Create, Filter, Group, Sort, Update | Name of the context mapping. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent mapping this is derived from. Available v60.0+. |

### ContextMappingIntent (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextMappingId` | reference | Create, Filter, Group, Sort | Parent mapping. Master-detail. Refers To: ContextMapping. |
| `MappingIntent` | picklist | Create, Filter, Group, Restricted picklist, Sort, Update | Intent. Values: `association`, `hydration`, `persistence`, `translation`. |

### ContextTag (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextAttributeId` | reference | Create, Filter, Group, Nillable, Sort, Update | Associated attribute. Refers To: ContextAttribute. |
| `ContextNodeId` | reference | Create, Filter, Group, Nillable, Sort, Update | Associated node. Refers To: ContextNode. |
| `Title` | string | Create, Filter, Group, Sort, Update | Name of the context tag. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent tag this is derived from. Available v60.0+. |

### ContextDefinitionSync (Tooling API) — Field Reference

**Available v62.0+**

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextDefinitionName` | string | Create, Filter, Group, Sort, Update | Developer name of the definition being synced. |
| `EndDateTime` | dateTime | Create, Filter, Nillable, Sort, Update | When the sync ended. |
| `Name` | string | Autonumber, Defaulted on create, Filter, idLookup, Sort | Auto-generated record name. |
| `OwnerId` | reference | Create, Defaulted on create, Filter, Group, Sort, Update | Record owner. Polymorphic: Group or User. |
| `StartDateTime` | dateTime | Create, Filter, Sort, Update | When the sync started. |
| `Status` | picklist | Create, Filter, Group, Restricted picklist, Sort, Update | Sync status. Values: `failed`, `in_progress`, `success`. |
| `SynchronizationInformation` | textarea | Create, Nillable, Update | Details/log of the sync operation. |

### ContextNodeMapping (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextMappingId` | reference | Create, Filter, Group, Sort | Parent mapping. Refers To: ContextMapping. |
| `ContextNodeId` | reference | Create, Filter, Group, Nillable, Sort, Update | Associated node. Refers To: ContextNode. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `Object` | string | Create, Filter, Group, Nillable, Sort, Update | Name of the SObject used for the mapping. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent node mapping this is derived from. Available v60.0+. |
| `MappedContextDefinition` | string | Create, Filter, Group, Nillable, Sort, Update | API name of the context definition for context-to-context mappings. Available v61.0+. |

### ContextNodeAttrDictionary (Tooling API) — Field Reference

**Available v62.0+**

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextAttrrDictIdentifier` | string | Create, Filter, Group, Sort, Update | Developer name of the context attribute dictionary. |
| `ContextNodeId` | reference | Create, Filter, Group, Nillable, Sort, Update | Associated context node. Refers To: ContextNode. |
| `ContextNodeMapingId` | reference | Create, Filter, Group, Nillable, Sort, Update | Associated context node mapping. Refers To: ContextNodeMapping. |
| `ContextNodeTagPrefix` | string | Create, Filter, Group, Sort, Update | Tag prefix for creating unique identifier of the parent node. |

### ContextAttrHydrationDetail (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextAttributeMappingId` | reference | Create, Filter, Group, Sort | Parent attribute mapping. Refers To: ContextAttributeMapping. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `ObjectName` | string | Create, Filter, Group, Sort, Update | Object used for attribute hydration detail. |
| `ParentHydrationDetailId` | reference | Create, Filter, Group, Nillable, Sort, Update | Parent hydration detail (supports nested multi-source hydration). Refers To: ContextAttrHydrationDetail. |
| `QueryAttribute` | string | Create, Filter, Group, Sort, Update | SOQL query or field path that is the source of hydration. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent hydration detail this is derived from. Available v60.0+. |

### ContextAttributeMapping (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextAttributeId` | reference | Create, Filter, Group, Nillable, Sort, Update | Associated context attribute. Refers To: ContextAttribute. |
| `ContextInputAttributeName` | string | Create, Filter, Group, Sort, Update | Name of the input attribute. |
| `ContextNodeMappingId` | reference | Create, Filter, Group, Sort | Parent node mapping. Refers To: ContextNodeMapping. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent attribute mapping this is derived from. Available v60.0+. |

### ContextDefinitionReference (Tooling API) — Field Reference

**Available v60.0+**

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextDefinitionId` | reference | Create, Filter, Group, Sort | Parent context definition. Master-detail. Refers To: ContextDefinition. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent definition reference this is derived from. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `ReferenceContextDefinition` | picklist | Create, Filter, Group, Restricted picklist, Sort, Update | Specifies the referenced context definition. |

### ContextDefinitionVersion (Tooling API) — Field Reference

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextDefinitionId` | reference | Create, Filter, Group, Sort | Parent definition. Refers To: ContextDefinition. |
| `EndDate` | dateTime | Create, Filter, Nillable, Sort, Update | When the version becomes inactive. |
| `IsActive` | boolean | Create, Defaulted on create, Filter, Group, Sort, Update | Whether this version is active. Default `false`. |
| `ManageableState` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Package manageability state. |
| `StartDate` | dateTime | Create, Filter, Sort, Update | When the version becomes active. |
| `VersionNumber` | int | Create, Filter, Group, Sort, Update | Version number. |

### CtxAttrHydrationCtx (Tooling API) — Field Reference

**Available v61.0+**

| Field | Type | Properties | Description |
|-------|------|-----------|-------------|
| `ContextAttributeMappingId` | reference | Create, Filter, Group, Sort | Parent attribute mapping. Master-detail. Refers To: ContextAttributeMapping. |
| `ContextQueryAttribute` | string | Create, Filter, Sort, Update | Attribute in context definition that is the source of context-to-context hydration. |
| `InheritedFrom` | string | Create, Filter, Nillable, Sort, Update | Parent hydration ctx this is derived from. |

---

## How Context Service Is Used in Manufacturing Cloud Advanced

In RCA, Context Service is the data backbone for:
- **Pricing Procedures** — caches Quote, QuoteLineItem, Product, Pricebook data during price calculation
- **Billing Calculations** — caches Asset, BillingSchedule, BillingPolicy data during invoice generation
- **Order Orchestration** — caches Order, OrderItem, Asset data during fulfillment
- **Decision Matrix / Business Rule Engine lookups** — uses context to supply input data

When a pricing procedure runs, it builds a context from the active Context Definition (e.g. a
standard RC pricing context definition), hydrates it with the Quote's data, then each pricing
step reads from and writes to that context instance instead of hitting the database directly.
