# Context Service — Context Definition Lifecycle

This file covers the full lifecycle: enable → create → map → activate → extend/clone → upgrade → migrate.

---

## Step 0: Enable Context Service

**Permission required:** Customize Application

1. Setup → Quick Find → `Context Service` → **Context Service Settings**
2. Toggle **Context Definitions** ON

> If your cloud's licenses were enabled after you turned on Context Definitions,
> turn the toggle off and back on to make existing definitions visible.

---

## Step 1: Create a Context Definition

**Permission required:** Context Service Admin

### Rules for names
- Node, attribute, and context tag names must be **unique** within the definition
- Must **begin with a letter**
- No special characters except underscore (`_`)
- Cannot begin with a number, include spaces, end with `_`, or have consecutive `__`

### Creation wizard steps
1. Setup → `Context Definitions` → **New**
2. Fill in: Name, Description (optional), Effective From/To, TTL, Reference Definition flag
   - **Effective From**: If left blank, definition is effective from the current date and time
   - **Effective To**: If left blank, the definition stays active forever (no expiry)
   - **TTL**: Duration for session-scoped context instances. Default 10 minutes (max 45). Takes effect only in applications that support longer TTLs; most contexts live only for the duration of the request (typically seconds).
3. **Next** → Define node structure (parent-child / sibling hierarchy, up to 5 levels)
   - Mark nodes as **Transposable** if they store key-value pairs
   - Check **System Information Node** to auto-generate system metadata attributes
   - ⚠️ Deleting a parent node deletes ALL its child nodes
4. **Next** → Add attributes for each node (choose INPUT / OUTPUT / INPUT OUTPUT; set data type)
5. **Next** → Generate context tags
   - **Generate All Tags** — generate for all nodes and attributes at once
   - **Generate Node Tags** — generate for a single node/attribute
   - **Regenerate All** — replace all existing tags
   - **Retain and Generate** — generate only for nodes/attributes that don't have tags yet
6. **Save** — definition appears under Custom Definitions tab (inactive by default)
7. **Add mapping** (required before activation)
8. **Activate**

### Standard vs Custom definitions
| | Standard | Custom (Extended/Cloned) |
|--|----------|--------------------------|
| Editable | ❌ Read-only | ✅ |
| Deletable | ❌ | ✅ (only when inactive) |
| Activatable/Deactivatable | ❌ Inherently Active — cannot be deactivated | ✅ |
| Auto-upgraded | N/A (it IS the standard) | ✅ (extended only) |
| Can extend | ✅ | ❌ (can only extend standard) |
| Can clone | ✅ | ✅ |

> ⚠️ Standard definitions are **inherently Active** — you cannot deactivate or delete them. To customize, always extend or clone.

---

## Step 2: Map the Context Definition

**Permission required:** Context Service Admin  
**Important:** Mappings can only be added to **inactive** definitions.  
Always create all mappings before activating.

### Mapping rules
- Map **nodes first**, then attributes (deleting a node mapping also deletes its attribute mappings)
- Must map at least one node AND one attribute to save
- Only one type of data source per mapping (can't mix SObjects and DMOs in same mapping)
- The Profile, UserRole, RecordType, and PermissionSetAssignment entities are **not available** for mapping

### To add a mapping
1. Open the context definition → **Map Data** tab → **Add Mapping**
2. Name the mapping; choose Automatic Salesforce Object Mapping or leave unchecked for manual
3. Select **Mark as Default** if this is the only mapping or the primary one
4. **Next** → choose Mapping Intent (Hydration, Persistence, Translation, Association)
5. **Map** → builder opens: select objects for each node, then map attributes to fields

### Mapping types
| Type | Description |
|------|-------------|
| **Automatic Salesforce Object Mapping** | Context Service matches node/attribute names to SObject field names automatically. Fastest setup. |
| **Input Mapping** | Hydrates context from a JSON payload passed at hydration time. Used when data comes from the calling application, not from SObjects. |

### Mapping intents
| Intent | Direction | Supported cardinality |
|--------|-----------|----------------------|
| **Hydration** | Data source → Context | 1:1, many:1 |
| **Persistence** | Context → Salesforce Objects | 1:1, 1:many |
| **Translation** | Context → Context (different mapping format) | 1:1, 1:many |
| **Association** | Metadata only (custom business logic) | 1:1, 1:many, many:1, cross-attribute |

> When combining intents, only the intersection of supported cardinalities applies.
> E.g. Hydration + Translation = only 1:1 supported.

---

## Step 3: Activate a Context Definition

**Permission required:** Context Service Admin

**Pre-activation checklist:**
- [ ] At least one mapping exists
- [ ] Exactly one mapping is marked as Default
- [ ] No pending Salesforce metadata changes (schema cache can be stale up to 24 hours)

To activate: Context Definitions page → action menu → **Activate**

> ⚠️ After activating, you can ADD new nodes/attributes/mappings but CANNOT edit or delete
> existing ones. To make breaking changes, deactivate first.

**Schema cache:** If you modified Salesforce Object fields, changes take up to 24 hours to
reflect in context instances. To clear immediately:
```
DELETE /connect/context-runtime-schema/clear
```
Cache refreshes on the next context build request.

---

## Step 4: Extend a Context Definition (preferred for standard definitions)

**Permission required:** Context Service Admin  
**Applies to:** Standard definitions only

- Inherits ALL standard nodes, attributes, mappings
- Only **additive** changes allowed (add new components; cannot edit/delete inherited ones)
- **Auto-upgraded** when the parent standard definition is upgraded (on Setup access or app hydration)
- Note: Auto-sync does NOT trigger when hydration is called from Apex or Flow

To extend: Standard Definitions tab → action menu → **Extend**

### Auto-sync failure causes
| Cause | Fix |
|-------|-----|
| Artifact conflict in custom definition | Click Sync → manually resolve conflicts |
| User lacks copy permissions | Ensure user has Context Service Admin PSL |
| Node/attribute count exceeds limits | Delete unused custom nodes/attributes |
| Invalid mapping records | Contact Salesforce Support |

### Sync conflict options
| Option | Effect |
|--------|--------|
| **Preview** | Lists conflicting artifacts (no changes made) |
| **Override** | Permanently removes conflicting custom artifacts and replaces with standard ones. **Irreversible.** Export package first. |

> ⚠️ Never run Sync directly in production. Run in sandbox → export as package → deploy to prod.

---

## Step 5: Clone a Context Definition

**Permission required:** Context Service Admin  
**Applies to:** Standard or custom definitions

| Feature | Clone | Extend |
|---------|-------|--------|
| Applicable to | Standard + Custom | Standard only |
| Auto-upgrade | ❌ (manual sync for clones of extended with Preserve Inheritance) | ✅ |
| Edit/delete standard components | ✅ | ❌ |
| Full customization | ✅ | Additive only |

**Preserve Inheritance:** When cloning an extended definition, select this checkbox to keep
the clone eligible for future upgrades. The clone is created in **inactive** state to allow
editing before activation.

> ⚠️ Clones of standard definitions are NOT auto-upgraded. Must manually sync.

> ⚠️ **Activation state inheritance:** A newly cloned definition inherits the activation state of the source definition. The exception is: when cloning an **extended** definition with **Preserve Inheritance** selected — in that case the clone is always created in **inactive** state regardless of the source state.

---

## Step 6: Migrate Context Definitions (Sandbox → QA → Production)

**Deployment rules:**
- Both orgs must be on the **same Salesforce release version**
  - Can deploy Winter '26 → Spring '26 (forward)
  - Cannot deploy Spring '26 → Winter '26 (backward)
- Cannot update or delete custom nodes/attributes in **active** definitions during deployment
- Cannot deactivate a definition during deployment — must deactivate manually first
- When a definition is deactivated in the target org, deployment replaces ALL custom artifacts

**Deployment order (critical):**
1. Deploy Context Definitions first (they are the foundational layer)
2. Only after definitions are deployed AND activated: deploy dependent applications/metadata

### Migration checklist
```
□ Source org: definition is complete (structure + mappings + active)
□ Target org: Context Service is enabled
□ Target org: definition is deactivated (if updating an existing one)
□ Both orgs: same Salesforce release version
□ Package created via Package Manager with correct context definition components
□ Package deployed to target org
□ Post-deploy: manually re-activate the definition in target org
□ Post-deploy: verify mappings are intact and default mapping is still set
□ Post-deploy: deploy dependent applications (pricing procedures, flows, etc.) AFTER definitions
```

### Create and deploy a package
1. Setup → Package Manager → **New** → name the package
2. Components tab → **Add** → select Component Type = Context Definition
3. Select the definition(s) to include → **Add to Package**
4. **Upload** → version name + number → Upload
5. In target org: use the installation URL from Version Detail → install
   - Choose: **Install for admins only** | **Install for all users** | **Install for specific profiles**
   - After install: activate the definition and verify default mapping is still set
   - Ensure required permissions for the context definition are enabled in the target org

---

## Metadata API Type — ContextDefinition

**File suffix:** `.contextDefinition`  
**Directory:** `contextDefinitions/`  
**Available from:** API version 59.0  
**Wildcard support (`*` in package.xml):** Yes  
**Org permission required:** `ContextDefinitionsEnabled`  
**Parent type:** Metadata (inherits `fullName`)

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `canBeReferenceDefinition` | boolean | No | Whether this definition can be referenced by other definitions. Default `false`. Available v63.0+. |
| `clonedFrom` | string | No | Name of the source definition used to create this clone. |
| `contextDefinitionReferences` | ContextDefinitionReference[] | No | References this definition has to other definitions. |
| `contextDefinitionVersions` | ContextDefinitionVersion[] | No | One or more version objects; only one can be active at a time. |
| `contextTtl` | int | No | Cache TTL in minutes. Default 10. Maximum 45. |
| `description` | string | No | Human-readable description. |
| `hasSystemTags` | boolean | No | Whether platform injects system-managed tags at hydration time. Default `false`. Available v63.0+. |
| `inheritedFrom` | string | No | Name of the parent (standard) definition this extends. |
| `inheritedFromVersion` | string | No | Version of the parent definition. |
| `isProtected` | boolean | No | Auto-generated; does not affect behavior. |
| `masterLabel` | string | **Required** | User-friendly UI label. |
| `title` | string | **Required** | API name of the definition. |

### Child Type: ContextDefinitionReference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `inheritedFrom` | string | No | ID of the parent definition reference this is derived from. |
| `referenceContextDefinition` | string | **Required** | ID or name of the referenced context definition. |

### Child Type: ContextDefinitionVersion

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextMappings` | ContextMapping[] | No | Mapping objects for this version. |
| `contextNodes` | ContextNode[] | No | Node structure for this version. |
| `endDate` | string | No | Datetime when this version becomes inactive (`YYYY-MM-DD HH:MM:SS` format). |
| `isActive` | boolean | No | Whether this version is active. Default `false`. |
| `startDate` | string | **Required** | Datetime when this version becomes active. |
| `versionNumber` | int | **Required** | Integer version number. |

### Child Type: ContextMapping

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextMappingIntents` | ContextMappingIntent[] | No | One or more intents for this mapping. |
| `contextNodeMappings` | ContextNodeMapping[] | No | Node-level mappings. |
| `default` | boolean | No | Whether this is the default mapping. Default `false`. Exactly one mapping per active definition must be `true`. |
| `description` | string | No | Description. |
| `inheritedFrom` | string | No | Parent mapping this is derived from. |
| `title` | string | **Required** | Name of the context mapping. |

### Child Type: ContextMappingIntent

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mappingIntent` | ContextMappingIntentType (string enum) | **Required** | Intent value. Valid values (lowercase): `hydration`, `association`, `persistence`, `translation`. |

### Child Type: ContextNodeMapping

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextAttributeMappings` | ContextAttributeMapping[] | No | Attribute-level mappings. |
| `contextNode` | string | No | Name of the context node record associated with this mapping. |
| `contextNodeAttrDictionaries` | ContextNodeAttrDictionary[] | No | Relationships to context dictionaries. |
| `inheritedFrom` | string | No | Parent node mapping this is derived from. |
| `mappedContextDefinition` | string | No | API name of a referenced context definition (for context-to-context mappings). |
| `object` | string | No | Name of the SObject used for the mapping. |

### Child Type: ContextAttributeMapping

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextAttrHydrationDetails` | ContextAttrHydrationDetail[] | No | SOQL queries fetching data for this attribute. |
| `contextAttribute` | string | No | Name of the context attribute record. |
| `contextInputAttributeName` | string | **Required** | Name of the input attribute. |
| `ctxAttrHydrationCtxs` | CtxAttrHydrationCtx[] | No | Context-to-context hydration queries. |
| `inheritedFrom` | string | No | Parent attribute mapping this is derived from. |

### Child Type: ContextAttrHydrationDetail

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextAttrHydrationDetails` | ContextAttrHydrationDetail[] | No | Nested child hydration details (multi-source). |
| `inheritedFrom` | string | No | Parent hydration detail this is derived from. |
| `objectName` | string | **Required** | Name of the SObject for this hydration detail. |
| `queryAttribute` | string | **Required** | SOQL query or field path that is the source of hydration. |

### Child Type: CtxAttrHydrationCtx

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextQueryAttribute` | string | **Required** | Attribute in the source context definition that is the hydration source. |
| `inheritedFrom` | string | No | Parent ctx this is derived from. |

### Child Type: ContextNodeAttrDictionary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextAttrDictIdentifier` | string | **Required** | Developer name of the context attribute dictionary. |
| `contextNodeTagPrefix` | string | **Required** | Tag prefix of the context node for constructing the unique parent identifier. |

### Child Type: ContextNode

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `canonicalNode` | string | No | Canonical node associated with this context node. |
| `contextAttributes` | ContextAttribute[] | No | Attributes belonging to this node. |
| `contextNodeAttrDictionaries` | ContextNodeAttrDictionary[] | No | Dictionary relationships. |
| `contextTags` | ContextTag[] | No | Tags for this node. |
| `displayName` | string | No | UI display name. |
| `inheritedFrom` | string | No | Parent node this is derived from. |
| `title` | string | **Required** | API name of the node. |
| `transposable` | boolean | No | Whether node stores key-value pairs. Default `false`. |

### Child Type: ContextAttribute

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contextTags` | ContextTag[] | No | Tags for this attribute. |
| `dataType` | ContextAttributeDataType (string enum) | **Required** | Data type. Valid values: `boolean`, `currency`, `date`, `datetime`, `number`, `percent`, `picklist`, `reference`, `string`, `selfreference` (v63.0+). |
| `description` | string | No | Description. |
| `displayName` | string | No | UI display name. |
| `domainSet` | string | No | List of node references for parent-child relationship. |
| `fieldType` | ContextAttributeFieldType (string enum) | **Required** | Field type. Valid values: `aggregate`, `input`, `inputoutput`, `output`. |
| `inheritedFrom` | string | No | Parent attribute this is derived from. |
| `key` | boolean | No | Whether attribute is a key (used for transposable feature). Default `false`. |
| `title` | string | **Required** | API name of the attribute. |
| `transient` | boolean | No | Whether attribute is skipped during persistence. Default `false`. Available v63.0+. |
| `value` | boolean | No | Whether attribute identifies as the value in a transposable node. Default `false`. |

### Child Type: ContextTag

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | **Required** | Name of the context tag. |
| `inheritedFrom` | string | No | Parent tag this is derived from. |

### Declarative Metadata Sample Definition

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ContextDefinition xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Test</fullName>
    <contextDefinitionVersions>
        <contextMappings>
            <contextNodeMappings>
                <contextAttributeMappings>
                    <contextAttrHydrationDetails>
                        <objectName>Account</objectName>
                        <queryAttribute>Name</queryAttribute>
                    </contextAttrHydrationDetails>
                    <contextAttribute>AccountName</contextAttribute>
                    <contextInputAttributeName>AccountName</contextInputAttributeName>
                </contextAttributeMappings>
                <contextNode>Praneeth</contextNode>
                <object>Account</object>
            </contextNodeMappings>
            <contextMappingIntents>
                <mappingIntent>hydration</mappingIntent>
            </contextMappingIntents>
            <default>true</default>
            <title>AccountMapping</title>
        </contextMappings>
        <contextNodes>
            <contextAttributes>
                <contextTags>
                    <title>AccountName</title>
                </contextTags>
                <dataType>string</dataType>
                <fieldType>inputoutput</fieldType>
                <key>false</key>
                <title>AccountName</title>
                <displayName>AccountName</displayName>
                <value>false</value>
            </contextAttributes>
            <contextTags>
                <title>Praneeth</title>
            </contextTags>
            <title>Praneeth</title>
            <transposable>false</transposable>
        </contextNodes>
        <endDate>2097-05-10 00:00:00</endDate>
        <startDate>2023-05-10 00:00:00</startDate>
        <versionNumber>1</versionNumber>
        <isActive>true</isActive>
    </contextDefinitionVersions>
    <description>Test Description</description>
    <contextTtl>10</contextTtl>
    <isProtected>false</isProtected>
    <masterLabel>Test Label</masterLabel>
    <title>TestTitle</title>
</ContextDefinition>
```

### Example package.xml

```xml
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Test</members>
        <name>ContextDefinition</name>
    </types>
    <types>
        <members>Account.CustomAccountName__c</members>
        <name>CustomField</name>
    </types>
    <version>64.0</version>
</Package>
```

### Context Definition Upgrade API (PATCH)

**Endpoint:** `PATCH /connect/context-definitions/upgrades` (v64.0+)

Use this endpoint to programmatically upgrade an extended definition after its parent standard definition has been updated.

**Request body:**

```json
{
    "contextDefinitions": [
        {
            "contextDefinitionId": "11Oxx0000006PfZEAU",
            "upgradeMode": "Sync"
        }
    ]
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `contextDefinitionId` | String | Required | ID of the definition to upgrade. |
| `upgradeMode` | String | Optional | How to apply the upgrade. Values: `Sync` (default — apply changes directly), `Preview` (show what would change, no modifications), `Override` (overwrite conflicting custom artifacts — irreversible). |
