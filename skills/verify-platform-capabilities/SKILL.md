---
name: verify-platform-capabilities
description: |
  Verify that a BPO (Base Platform Object) entity.xml has all required platform capabilities properly configured.
  Use when the user asks to verify, check, audit, or validate entity platform capabilities, BPO configuration, or entity.xml completeness.
  This includes requests like "verify entity capabilities", "check platform features", "audit entity configuration", or "validate BPO setup".
  Performs comprehensive 79-point verification based on official Entity Platform Capabilities reference and BPO Master List.
---

# BPO Entity Platform Capabilities Verification

Comprehensive checklist for verifying that a BPO (Base Platform Object) entity.xml has all required platform capabilities properly configured. Derived from the official Entity Platform Capabilities reference and the BPO Attributes & Features Master List.

## Quick Start

```bash
# 1. Navigate to the UDD package containing the entity
cd path/to/module-udd/

# 2. Find the entity.xml file
find . -name "*.entity.xml"

# 3. Invoke this skill with the entity name
# The skill will walk through all 79 checks and generate a comprehensive report
```

## How This Skill Works

When invoked, this skill will:

1. **Read the target `*.entity.xml` file** and related configuration files
2. **Walk through each of 79 numbered checks** grouped into 15 sections
3. **For each check, verify EXACTLY** what is present in the code (no guessing or inferring)
4. **Mark each as**: ✅ Enabled, ❌ Not Enabled, ⚠️ Partially Enabled, or N/A (with reason)
5. **Generate three outputs**:
   - **Part 1**: Platform Capabilities Matrix (table format)
   - **Part 2**: Missing Capabilities Analysis (detailed list)
   - **Part 3**: Action Items (prioritized by High/Medium/Low/PO Decision)

## Important: Top-Level vs Child Entity Behaviour

Before checking, the skill determines the entity type by inspecting the `<platformEntity>` tag:

- **Top-Level entity**: Has `isTopLevel="true"` and typically has its own `orgAccess`/`userAccess` pointing to dedicated permissions.
- **Child entity**: Has a `MASTERDETAIL` field (slot 0), and uses `accessDelegate` and `cudAccessDelegate` to derive access from its parent.

Child entities with `cudAccessDelegate` are **expected** to have `userAccess="External.enforcedByCRUD"`. This is NOT a defect — the Quip doc states: "When we provide Cud Access to any of the child entity, the Child Entity won't appear here in the list as it is controlled by parent entity." Only flag `userAccess="External.enforcedByCRUD"` on **top-level** entities as a potential revenue leakage risk.

---

## SECTION A: Access Control (Checks 1–8)

### 1. Org Access
**Attribute:** `orgAccess` on `<platformEntity>`  
**Expected:** A boolean expression referencing an orgPermission (e.g., `"ModuleName.orgHasFeatureEnabled"`)  
**Status:** ✅ / ❌

### 2. User Access
**Attribute:** `userAccess` on `<platformEntity>`  
**Expected (top-level entity):** Expression pointing to at least one `userPermission` (e.g., `"ModuleName.userCanManageFeature"`)  
**Expected (child entity with cudAccessDelegate):** `userAccess="External.enforcedByCRUD"` is acceptable  
**Bad Example (top-level only):** `userAccess="External.enforcedByCRUD || isAutomatedProcess || isAuthenticatedUser"` — revenue leakage risk on top-level entities  
**Status:** ✅ / ❌ / ⚠️

### 3. API Access
**Attribute:** `apiAccess` on `<platformEntity>`  
**Expected:** A boolean expression (e.g., `"ModuleName.orgHasFeatureEnabled"`)  
**Status:** ✅ / ❌

### 4. Create Access
**Attribute:** `createAccess` on `<platformEntity>`  
**Expected:** A boolean expression referencing userPermission(s)  
**Status:** ✅ / ❌

### 5. Delete Access
**Attribute:** `deleteAccess` on `<platformEntity>`  
**Expected:** A boolean expression referencing userPermission(s)  
**Status:** ✅ / ❌

### 6. Edit Access
**Attribute:** `editAccess` on `<platformEntity>`  
**Expected:** A boolean expression referencing userPermission(s)  
**Status:** ✅ / ❌

### 7. Access Delegate (Child Entities)
**Attributes:** `accessDelegate`, `cudAccessDelegate`, `cudAccessDelegateMapping` on `<platformEntity>`  
**Applies to:** Child entities with MASTERDETAIL relationship only  
**Expected:** `accessDelegate="ParentEntityName"` and `cudAccessDelegate="ParentEntityName"`  
**For top-level entities:** N/A  
**Status:** ✅ / ❌ / N/A

### 8. Has Owner Field
**Attribute:** `hasOwnerField` on `<platformEntity>`  
**Expected (top-level):** Not set to `"false"` (defaults to true)  
**Expected (child with MASTERDETAIL):** N/A — child entities don't have owner fields  
**Status:** ✅ / ❌ / N/A

---

## SECTION B: Sharing & Security (Checks 9–15)

### 9. Default Sharing (OWD)
**Attributes:** `orgShareAccess` and `sharingModelOrgValue` on `<platformEntity>`  
**Also check:** Corresponding `*.settings.xml` in the same UDD package for the `<sharingModel>` definition  
**Expected:** `orgShareAccess="OrgPermissions.SharingModel"` and `sharingModelOrgValue="[EntityName]Share"`  
**Default:** BPO entities default to Private sharing  
**Status:** ✅ / ❌

### 10. Criteria Based Sharing (CBS)
**Attribute:** `isBpoCbsEnabled` on `<platformEntity>`  
**Expected:** `isBpoCbsEnabled="true"` — only meaningful for entities with `isTopLevel="true"`  
**Note:** If set on a non-top-level entity, it is harmless but unnecessary. Flag as informational only.  
**Status:** ✅ / ❌ / N/A (not top-level)

### 11. Sharing Set Enabled
**Attribute:** `isSharingSetEnabled` on `<platformEntity>`  
**Expected:** `isSharingSetEnabled="true"`  
**Purpose:** Required for Experience Cloud sharing functionality for BPOs  
**Status:** ✅ / ❌

### 12. Sharing via Role Hierarchy
**Expected:** Enabled by default for most entities. No explicit attribute needed unless overridden.  
**Status:** ✅ (by default)

### 13. FLS (Field Level Security)
**Attribute:** `usesFieldSecurity="true"` on individual `<flexField>` tags  
**Check:** Verify ALL non-exempt fields have `usesFieldSecurity="true"`  
**Exempt fields (should NOT have FLS):**
  - Fields with `required="true"` (this attribute replaced the older `dbValueRequired="true"` — both mean the field is DB-required and must not have FLS)
  - Fields with `fieldType="MASTERDETAIL"`  
**Also check:** If OTHER entities have FOREIGNKEY fields pointing to this entity, verify those lookup fields also have `usesFieldSecurity="true"` in their respective entity.xml files.  
**Status:** ✅ All appropriate fields have FLS / ⚠️ Partially (list fields missing FLS) / ❌

### 14. Shield Encryption
**Attribute:** `encryptableAccess="always"` on desired `<flexField>` tags  
**Expected:** Present on fields that should support Shield Platform Encryption  
**Note:** Requires Product Owner decision. Not all entities need this.  
**Status:** ✅ / ❌ / N/A (PO decision)

### 15. Queue Enabled
**Applies to:** Top-level entities with sharing enabled  
**Expected:** Enabled for top-level entities with `isSharingSetEnabled="true"`  
**Status:** ✅ / N/A (not top-level)

---

## SECTION C: Customisation & Extensibility (Checks 16–22)

### 16. Custom Fields
**Attribute:** `customizable` on `<platformEntity>`  
**Expected:** `customizable="true"`  
**Status:** ✅ / ❌

### 17. Triggers
**Attribute:** `isApexTriggerable` on `<platformEntity>` (optional)  
**Default:** Defaults to the value of `customizable`. If `customizable="true"` and `isApexTriggerable` is absent, triggers are enabled.  
**Status:** ✅ / ❌

### 18. Validation Rules
**Attribute:** `isValidatable` on `<platformEntity>` (optional)  
**Default:** Defaults to the value of `customizable`. If absent and `customizable="true"`, validation rules are enabled.  
**Status:** ✅ / ❌

### 19. Record Types
**Attribute:** `recordTypeHidden` on `<platformEntity>` (optional)  
**Default:** Defaults to `false`. If absent, record types are available.  
**Expected:** `recordTypeHidden="false"` or absent  
**Status:** ✅ / ❌

### 20. Manageability (Package-able)
**Attribute:** `manageability` on `<platformEntity>`  
**Expected:** `manageability="manageable"`  
**Purpose:** Allows entity and its fields to be included in managed packages  
**Important:** If `crudEnabled="false"` is set on the entity, you must ALSO explicitly set `isChildComponentPackageable="true"` — otherwise the entity cannot be packaged even with `manageability="manageable"`.  
**Status:** ✅ / ❌

### 21. isChildComponentPackageable
**Attribute:** `isChildComponentPackageable` on `<platformEntity>` or child packaging configuration  
**Expected:** `isChildComponentPackageable="true"` if entity should be packageable as a child component  
**Note:** Requires Product Owner decision on packaging requirements.  
**Status:** ✅ / ❌ / N/A (PO decision)

### 22. Entity Rename-able
**Attribute:** `isRenamable` on `<platformEntity>`  
**Expected:** `isRenamable="true"`  
**Status:** ✅ / ❌

---

## SECTION D: Workflows & Automation (Checks 23–27)

### 23. Workflows / Flow Builder
**Attribute:** `isWorkflowEnabled` on `<platformEntity>` (optional)  
**Default:**
  - If entity is internal: defaults to `false`
  - If entity is top-level without an owner: defaults to `false`
  - Otherwise: defaults to `true`  
**Note:** This single attribute governs Workflow Rules, Process Builder, and Flow Builder.  
**Status:** ✅ / ❌

### 24. Approval Process
**Attribute:** `isProcessEnabled` on `<platformEntity>`  
**Expected:** `isProcessEnabled="true"`  
**Status:** ✅ / ❌

### 25. Omni-Channel Enabled
**Default:** May not be applicable to all entities. Omni-Channel routing is primarily relevant for service/support entities.  
**Note:** Per the BPO Master List: "This may not be applicable to us." Only flag if entity specifically requires Omni-Channel routing.  
**Status:** ✅ / N/A (not applicable)

### 26. Change Data Capture (CDC)
**Attribute:** `minChangeEventVersion` on `<flexField>` tags  
**Also check:** Existence of `<EntityName>ChangeEvent.entity.xml` in the same directory  
**Expected:** `minChangeEventVersion="[version]"` on relevant fields  
**Note:** Requires explicit opt-in. Not all entities need CDC.  
**Status:** ✅ / ❌ / N/A (PO decision)

### 27. Kanban View
**Check:** Verify entity supports Kanban view for its list views. Requires a picklist/enum field for grouping.  
**How to enable:** Reference PR: https://swarm.soma.salesforce.com/changes/54299066  
**Note:** Useful for entities with status-based workflows. Requires a STATICENUM field to group by.  
**Status:** ✅ / ❌ / N/A (PO decision)

---

## SECTION E: UI & Layout (Checks 28–40)

### 28. Supported Page Types
**Attribute:** `supportedPageTypes` on `<platformEntity>`  
**Expected:** `supportedPageTypes="DETAIL,OVERVIEW,LIST"` (minimum) or `"DETAIL,EDIT,OVERVIEW,LIST"`  
**Status:** ✅ / ❌

### 29. Fields on Record Detail (Page Layout)
**Check:** `<layout><default>` section exists with `<section>` and `<row>` definitions  
**Expected:** Fields properly configured in layout sections  
**Status:** ✅ / ❌

### 30. Expose System Fields in UI
**Check:** Layout `<item>` entries exist for ALL of these system fields:
  - `CreatedBy`, `CreatedDate`, `LastModifiedBy`, `LastModifiedDate`, `RecordType`  
**Optional:** `CurrencyIsoCode` (if multi-currency org)  
**Status:** ✅ / ❌ (list missing fields)

### 31. Compact Layout Fields
**Check:** `<compactLayout>` section exists with `<item>` definitions  
**Expected:** At minimum Name + 2-3 key identifying fields  
**Status:** ✅ / ❌

### 32. Entity Tab
**Check:** `<entityTab>` entry in `module.xml` file in the same UDD package directory  
**Expected:** `<entityTab name="[EntityName]" availableUiTypes="Aloha,Lightning" access="always" availableFormfactors="Large,Small,Medium" />`  
**Status:** ✅ / ❌

### 33. Default Tab in APP (Tab Upgrade Action)
**Check:** `*TabUpgradeActionsProvider.java` file exists in the module's Java source  
**Expected:** Entity tab listed in the provider's supported tabs, setting visibility to "Default On"  
**Where:** Module's upgrade actions directory (e.g., `[module]-impl/java/src/system/organization/setting/`)  
**Status:** ✅ / ❌

### 34. Motif
**Attribute:** `motifName` on `<platformEntity>`  
**Also check:** Entity entry in `core/aloha-ui/config/motif/motif.xml`  
**Expected:** `motifName="[EntityName]"` and matching entry in motif.xml  
**Status:** ✅ / ❌

### 35. MRU Enabled
**Attribute:** `mruEnabled` on `<platformEntity>`  
**Requires:** `motifName` must also be set  
**Expected:** `mruEnabled="true"`  
**Status:** ✅ / ❌

### 36. Quick Actions
**Attribute:** `allowsWebLinks` on `<platformEntity>`  
**Expected:** `allowsWebLinks="true"`  
**Note:** `allowsQuickActions` defaults to `allowsWebLinks` or `canTrackFeedHistory` value. This single attribute enables both custom buttons/links and quick actions.  
**Status:** ✅ / ❌

### 37. Global Quick Actions
**Attribute:** `isQuickActionTargetable` on `<platformEntity>`  
**Expected:** `isQuickActionTargetable="true"`  
**Note:** Requires Product Owner decision.  
**Status:** ✅ / ❌ / N/A (PO decision)

### 38. Create From Lookup
**Check:** `core/sfdc/config/actions.xml` for `<button action='CreateFromLookup'/>` within the entity's `<lookup>` tag  
**Expected:** CreateFromLookup action configured for the entity  
**Status:** ✅ / ❌

### 39. Actions & Recommendations
**Check:** Entity supports the Actions & Recommendations Lightning component for guided engagement  
**Note:** Requires Product Owner decision.  
**Status:** ✅ / ❌ / N/A (PO decision)

### 40. Remove Unnecessary Actions
**Check:** Look for `*ActionsFilterPredicate.java` in the module's Java source  
**Expected:** Class implementing `VisibleActionsFilterPredicate` with the entity in `TARGET_ENTITIES` and irrelevant actions in `HIDDEN_ACTIONS`  
**Purpose:** Hides irrelevant actions like "New Opportunity", "New Case" etc.  
**Status:** ✅ / ❌

---

## SECTION F: Activities & Tracking (Checks 41–47)

### 41. Activities
**Attribute:** `hasActivities` on `<platformEntity>`  
**Expected:** `hasActivities="true"`  
**Status:** ✅ / ❌

### 42. Feed Tracking
**Attribute:** `canTrackFeedHistory` on `<platformEntity>` (or implied by `minTrackFeedHistoryVersion`)  
**Expected:** `canTrackFeedHistory="true"` or `minTrackFeedHistoryVersion="[version]"` present  
**Status:** ✅ / ❌

### 43. Feed Tracking By Default
**Attribute:** `trackFeedHistoryByDefault` on `<platformEntity>`  
**Expected:** `trackFeedHistoryByDefault="true"`  
**Status:** ✅ / ❌

### 44. Feed-Based Page Layouts
**Attribute:** `isEntityFeedLayoutable` on `<platformEntity>`  
**Expected:** `isEntityFeedLayoutable="true"`  
**Status:** ✅ / ❌

### 45. History Tracking
**Attribute:** `canTrackHistory` on `<platformEntity>` (or implied by `minTrackHistoryVersion`)  
**Expected:** `canTrackHistory="true"` or `minTrackHistoryVersion="[version]"` present  
**Status:** ✅ / ❌

### 46. Topics
**Attribute:** `canTopicsBeEnabled` on `<platformEntity>`  
**Expected:** `canTopicsBeEnabled="true"`  
**Status:** ✅ / ❌

### 47. Notes & Attachments
**Attribute:** `hasAttachments` on `<platformEntity>`  
**Expected:** `hasAttachments="true"`  
**Status:** ✅ / ❌

---

## SECTION G: Related Lists (Checks 48–53)

Check the `<layout>` section for each of these `<relatedList>` entries.

### 48. Open Activities Related List
**Check:** `<relatedList>` with `javaClass` containing `RelatedActivityList`  
**Expected:** `<relatedList javaClass="core.activity.RelatedActivityList" .../>` or similar  
**Status:** ✅ / ❌

### 49. Activity History Related List
**Check:** `<relatedList>` with `javaClass` containing `RelatedHistoryList` (from `core.activity`)  
**Expected:** `<relatedList columnSet="historyWithWho" javaClass="core.activity.RelatedHistoryList" .../>`  
**Status:** ✅ / ❌

### 50. Entity History Related List
**Check:** `<relatedList>` with `javaClass` containing `RelatedEntityHistoryList`  
**Expected:** `<relatedList javaClass="common.history.ui.RelatedEntityHistoryList" .../>`  
**Status:** ✅ / ❌

### 51. Approval History Related List
**Check:** `<relatedList>` with `javaClass` containing `RelatedProcessHistoryList`  
**Expected:** `<relatedList javaClass="core.workflow.process.RelatedProcessHistoryList" .../>`  
**Note:** NOT available by default — must be explicitly added to entity XML  
**Status:** ✅ / ❌

### 52. Files Related List
**Check:** `<relatedList>` with `javaClass` containing `RelatedFileList`  
**Expected:** `<relatedList javaClass="content.view.lists.RelatedFileList" .../>` or `<relatedList javaClass="core.file.RelatedFileList" .../>`  
**Status:** ✅ / ❌

### 53. Notes Related List
**Check:** `<relatedList>` with `javaClass` containing `RelatedNoteList` or `RelatedContentNoteList`  
**Expected:** `<relatedList javaClass="core.note.RelatedNoteList" .../>` or `<relatedList javaClass="core.content.RelatedContentNoteList" .../>`  
**Status:** ✅ / ❌

---

## SECTION H: Search & Reporting (Checks 54–57)

### 54. Searchable
**Attribute:** `isTextIndexed` on `<platformEntity>`  
**Expected:** `isTextIndexed="true"`  
**Status:** ✅ / ❌

### 55. List Views / Default Views (All, My, Recent)
**Attribute:** `defaultFilterColumns` on `<platformEntity>`  
**Also check:** `*FilterUpgradeActionsProvider.java` in the module's Java source to verify filter upgrade actions exist  
**Expected:** `defaultFilterColumns="Field1,Field2,Field3"` and filter upgrade action provider includes the entity  
**Status:** ✅ / ❌

### 56. Custom Report Types (CRT)
**Check:** `*.crt.xml` file in the UDD package's report directory  
**Expected:** CRT fragment file exists with `<table entity="[EntityName]" ...>` entry  
**Status:** ✅ / ❌

### 57. Name Field - Auto Number
**Attributes:** `nameFieldIsAutoNumber` and `autonumberMask` on `<platformEntity>`  
**Expected:** `nameFieldIsAutoNumber="true"` and `autonumberMask="PREFIX-{0000}"` (or similar pattern)  
**Status:** ✅ / ❌

---

## SECTION I: Fields & Indexing (Checks 58–60)

### 58. Slot 0 Assignment
**Check:** Look for `slot="0"` on a `<flexField>` tag  
**Rule:** If a MASTERDETAIL field exists, it must have `slot="0"`. If no MASTERDETAIL, the most-queried mandatory FOREIGNKEY should have `slot="0"`.  
**Purpose:** Slot 0 (std0) is indexed for performance.  
**Status:** ✅ / ❌

### 59. Aggregate Relationship Names
**Check:** `aggregateRelationshipName` attribute on FOREIGNKEY and MASTERDETAIL `<flexField>` tags  
**Expected:** All relationship fields should have `aggregateRelationshipName` defined  
**Status:** ✅ / ❌

### 60. Visible In Formula
**Check:** `visibleInFormula="always"` on ALL FOREIGNKEY and MASTERDETAIL `<flexField>` tags  
**Expected:** Every FOREIGNKEY/MASTERDETAIL field has `visibleInFormula="always"`  
**Status:** ✅ All / ⚠️ Partially (list missing fields) / ❌

---

## SECTION J: Change Owner (Check 61)

### 61. Change Owner
**Applies to:** Top-level entities only (requires `isTopLevel="true"` and `hasOwnerField` not false)  
**Check both:**
  1. `hasOwnerField` not set to `"false"` on `<platformEntity>`
  2. Entity configured in ONE of:
     - `core/metadata-catalog/java/src/metadata/catalog/ownerchange/OwnerChangeOptionsFactory.java`
     - Module-specific config file (e.g., `*Config.java` in the module)  
**Status:** ✅ / ⚠️ Partially (hasOwnerField OK but missing config) / ❌ / N/A (child entity)

---

## SECTION K: UI API & Mobile (Checks 62–63)

### 62. UI API Allowlisted
**Check:** Entity listed in `core/ui-services-private/java/resources/module-config/ui-services-private-uiservices.yaml` under `StandardWhiteListedEntities`  
**Expected:** Entity name present with form factors (e.g., `SMALL,MEDIUM,LARGE`)  
**Status:** ✅ / ❌

### 63. SFX/S1 (Mobile)
**Check:** Entity tab in `module.xml` includes `availableFormfactors="Large,Small,Medium"` AND entity is in UI API allowlist  
**Expected:** Both conditions met for mobile accessibility  
**Status:** ✅ / ❌

---

## SECTION L: Licensing & Integration Users (Checks 64–69)

### 64. Licensing Setup
**Check:** Verify that `orgPermission`, `userPermission`, and/or `orgPreference` entries exist in the `*.settings.xml` file for the entity's module  
**Expected:** Proper licensing elements defined for the entity's feature  
**Status:** ✅ / ❌

### 65. Communities Allowlisting
**Check:** Look for `entityPermission.<EntityName>` entries in community-related ULD files in `core/licensing-management/config/licensing/metadata/`  
**Files to check:** `PartnerCommunity-1.uld.xml`, `PartnerCommunityLogin-1.uld.xml`, `CustomerCommunityPlus-1.uld.xml`, `CustomerCommunityPlusLogin-1.uld.xml`  
**Note:** Requires Product Owner decision. Child entities may not need separate community permissions if parent is allowlisted.  
**Status:** ✅ (found in [file(s)]) / ❌ / N/A (PO decision)

### 66. Guest User Allowlisting
**Check:** Look for entity in `core/licensing-management/config/licensing/metadata/ChannelPartnerCommunity-1.uld.xml`  
**Note:** Requires Product Owner decision.  
**Status:** ✅ / ❌ / N/A (PO decision)

### 67. Data Cloud Integration User Access
**Check:** `core/licensing-management/config/licensing/metadata/CloudIntegrationUser-1.uld.xml` for `entityPermission.<EntityName>`  
**Status:** ✅ / ❌

### 68. API Integration User Access
**Check:** `core/licensing-management/config/licensing/metadata/SalesforceAPIIntegrationPsl-1.uld.xml` for entity  
**Status:** ✅ / ❌

### 69. Automated Process User Access
**Check:** `core/licensing-management/config/licensing/metadata/AutomatedProcess-1.uld.xml` for entity  
**Status:** ✅ / ❌

---

## SECTION M: Labels & Motif (Checks 70–71)

### 70. Label Translation
**Check:** Entity label entries exist in `shared-labels/java/resources/sfdc/i18n/shared_core_ui_labels/` with module-specific XML file  
**Expected:** Labels with `all_languages="yes"` and UDD section entries like `udd_[EntityName]`  
**Status:** ✅ / ❌

### 71. Logging
**Check:** `<EntityName>Functions.java` file exists in the module's Java source with `SfdcLogFactory` logger  
**Where:** Module's impl package (e.g., `[module]-impl/java/src/.../`)  
**Status:** ✅ / ❌

---

## SECTION N: Upgrade Actions (Checks 72–75)

All upgrade action providers live in the module's Java source, typically under `system/organization/setting/`.

### 72. Filter Upgrade Actions (List Views)
**Check:** `*FilterUpgradeActionsProvider.java` exists and entity is listed  
**Purpose:** Ships OOB list views ("My [Entity]s", "All [Entity]s")  
**Status:** ✅ / ❌

### 73. FLS Upgrade Actions
**Check:** `*FLSUpgradeActionsProvider.java` exists and entity + its FLS-enabled fields are listed  
**Purpose:** Ensures FLS read/write is enabled by default for OOB profiles  
**Status:** ✅ / ❌

### 74. Layout Upgrade Actions
**Check:** `*LayoutUpgradeActionsProvider.java` exists and entity is listed  
**Purpose:** Ensures default page layout is available under Object Manager  
**Status:** ✅ / ❌

### 75. Tab Upgrade Actions
**Check:** `*TabUpgradeActionsProvider.java` exists and entity tab is listed  
**Purpose:** Sets OOB tab visibility to "Default On"  
**Note:** Same as Check 33 — verified here as part of upgrade action completeness.  
**Status:** ✅ / ❌

---

## SECTION O: Optional / PO-Decision Features (Checks 76–79)

These features require explicit Product Owner input on whether to enable.

### 76. Path Assistant
**Check:** Entity entry in `shared-pathassistant/java/src/common/udd/constants/pathassistant/PathAssistantSupportedEntities.java`  
**Status:** ✅ / ❌ / N/A (PO decision)

### 77. Printable View
**Check:** Entity allowlisted in `core/sfdc-impl/java/src/common/udd/actions/impl/PrintableViewAction.java` and `PrintableListViewAction.java`  
**Status:** ✅ / ❌ / N/A (PO decision)

### 78. Softphone Layout
**Check:** Entity in `SOFTPHONE_LAYOUTABLE_ENTITIES` set in `core/sfdc/java/src/moduleapi/cti/CtiService.java`  
**Note:** Only for call center entities.  
**Status:** ✅ / ❌ / N/A (not a call center entity)

### 79. Audience Record Criteria
**Check:** Entity in `SupportedEntities` list in `core/audience-shared/resources/module-config/record-based-audience-criteria-entities.yaml`  
**Note:** For community personalization.  
**Status:** ✅ / ❌ / N/A (PO decision)

---

## Additional Informational Checks

### Unique Indices (Informational)
**Check:** Look for `<flexIndex>` definitions with `unique="true"` attribute  
**Note:** Unique index is one way to restrict duplicate data. Not all entities require this — depends on business requirements.  
**Status:** ✅ Has unique indices / ❌ None defined / N/A (not required)

### Disable Storage Count (Informational)
**Attribute:** `isStorageCounted` on `<platformEntity>`  
**Expected:** `isStorageCounted="false"` if storage counting should be disabled  
**Default:** Storage counting is ON (true) by default. Only set to false if explicitly needed.  
**Status:** ✅ Disabled / ❌ Enabled (default) / N/A

### Analytics Integration User Access (Informational)
**Check:** `core/licensing-management/config/licensing/metadata/InsightsIntegrationUser-1.uld.xml` for entity  
**Status:** ✅ / ❌

---

## Output Format

After verification, the skill produces output in THREE parts:

### PART 1: Platform Capabilities Matrix

Generate a table grouped by section. One row per capability, one column per entity. Use ONLY these cell values: `Yes`, `No`, `N/A`, `Partial`.

```
## Platform Capabilities Matrix

**Module:** [module-name] | **Entities:** [count] | **Date:** [today]

### Section A: Access Control

| # | Capability | [Entity1] | [Entity2] | [Entity3] | ... |
|---|-----------|:---------:|:---------:|:---------:|:---:|
| 1 | Org Access | Yes | Yes | Yes | ... |
| 2 | User Access | Yes | Yes (delegate) | Yes (delegate) | ... |
| ... | ... | ... | ... | ... | ... |

### Section B: Sharing & Security
| # | Capability | [Entity1] | [Entity2] | ... |
|---|-----------|:---------:|:---------:|:---:|
| ... | ... | ... | ... | ... |

[Continue for all sections A through O]

### Summary
| Entity | Enabled | Partial | Not Enabled | N/A | Score |
|--------|---------|---------|-------------|-----|-------|
| [Entity1] | X | X | X | X | X/Y |
| [Entity2] | X | X | X | X | X/Y |
```

### PART 2: Missing Capabilities Analysis

For every capability marked `No` in Part 1, produce one entry per entity. Skip capabilities marked `Yes`, `N/A`, or `Partial`.

```
## Missing Capabilities — [EntityName]

| # | Missing Capability | What It Does | Benefit of Enabling | Priority |
|---|-------------------|--------------|---------------------|----------|
| [num] | [name] | [definition from the check description above] | [what the entity gains] | [priority] |
```

**Priority values:**
- **High**: Functional gaps or compliance issues (e.g., Change Owner config, Integration User access, Community allowlisting for Experience Cloud entities)
- **Medium**: Degrades user experience but entity functions (e.g., Remove Unnecessary Actions, Printable View, Activity History RL)
- **PO Decision**: Requires Product Owner input (e.g., Global Quick Actions, Path Assistant, Shield Encryption, CDC, Kanban View)
- **Low**: Nice-to-have or informational (e.g., Disable Storage Count, Softphone Layout, Audience Record Criteria)

### PART 3: Action Items

Prioritised list across ALL entities:

```
## Action Items

### High Priority
1. [Entity] — [Capability] — [one-line description of what to do]

### Medium Priority
1. [Entity] — [Capability] — [one-line description]

### PO Decisions Required
1. [Entity] — [Capability] — [question for PO]

### Low Priority / Informational
1. [Entity] — [Capability] — [note]
```

---

## Cross-Reference

This verification checklist maps to the BPO Master List (Quip: 3HqJACZ32Gkt):

| Feature | Master List # | Skill Check # |
|---------|:------------:|:-------------:|
| Org Access | 2 | 1 |
| User Access | 3 | 2 |
| API Access | 4 | 3 |
| Create Access | 5 | 4 |
| Delete Access | 6 | 5 |
| Edit Access | 7 | 6 |
| Default Sharing (OWD) | 8 | 9 |
| Custom Fields | 9 | 16 |
| Triggers | 10 | 17 |
| Validation Rules | 11 | 18 |
| Record Types | 12 | 19 |
| Workflows / Flow Builder | 13, 63 | 23 |
| Activities | 14 | 41 |
| Feed Tracking | 15 | 42 |
| Feed Tracking By Default | 16 | 43 |
| Feed-Based Page Layouts | 17 | 44 |
| History Tracking | 18 | 45 |
| Change Owner | 19 | 61 |
| Name Field - Auto Number | 20 | 57 |
| Package-able / Manageability | 21, 49, 55 | 20 |
| Searchable | 22 | 54 |
| Quick Actions | 24 | 36 |
| Custom Button or Link | 25 | 36 |
| Global Quick Actions | 26 | 37 |
| Entity Tab | 27 | 32 |
| CBS | 28 | 10 |
| Custom Report Types | 31 | 56 |
| SFX/S1 | 32 | 63 |
| MRU Enabled | 33 | 35 |
| Entity Rename-able | 35 | 22 |
| Compact Layout | 36 | 31 |
| Queue Enabled | 37 | 15 |
| FLS Enabled | 39 | 13 |
| Communities Allowlisting | 40 | 65 |
| Guest User Allowlisting | 41 | 66 |
| List Views / Default Views | 42, 62 | 55 |
| UI API | 43 | 62 |
| Motif | 44 | 34 |
| FLS on lookups from other entities | 45 | 13 (note) |
| FLS Upgrade Action | 46 | 73 |
| Label Translation | 47 | 70 |
| Path Assistant | 48 | 76 |
| Shield Encryption | 50 | 14 |
| Printable View | 51 | 77 |
| Create From Lookup | 52 | 38 |
| Aggregate Relationship Names | 53 | 59 |
| Fields on Record Detail | 56 | 29 |
| Slot 0 | 57 | 58 |
| Unique Indices | 58 | Informational |
| Data Cloud Integration User | 59, 79 | 67 |
| Change Data Capture (CDC) | 60 | 26 |
| API Integration User | 61 | 68 |
| Notes & Attachments | 64 | 47 |
| Has Owner Field | 65 | 8 |
| Sharing via Role Hierarchy | 66 | 12 |
| Files Related List | 70 | 52 |
| Notes | 71 | 53 |
| Record Type in UI | 72 | 30 |
| Topics | 73 | 46 |
| Logging | 74 | 71 |
| Approval Process | 77 | 24 |
| Analytics Integration User | 78 | Informational |
| Supported Page Types | 80 | 28 |
| Expose System Fields | 81 | 30 |
| Access Delegate | 82 | 7 |
| Approval History RL | 83 | 51 |
| Automated Process User | 85 | 69 |
| Visible In Formula | 86 | 60 |
| Remove Unnecessary Actions | 87 | 40 |
| Disable Storage Count | 88 | Informational |
| Softphone Layout | 90 | 78 |
| Audience Record Criteria | 91 | 79 |
| Entity History RL | 92 | 50 |
| Activity History RL | 93 | 49 |
| Open Activities RL | 94 | 48 |
| Upgrade Actions | 95 | 72–75 |
| Kanban View | 96 | 27 |
| Actions & Recommendations | — | 39 |
| Sharing Set | — | 11 |
| isChildComponentPackageable | — | 21 |

---

## Critical Rules When Using This Skill

1. **Do NOT guess or infer** — only report what is explicitly present in the code.
2. **Read ALL related files** — entity.xml, settings.xml, module.xml, Java source files, and global config files.
3. **Distinguish top-level from child entities** — different expectations apply.
4. **Mark PO decisions as N/A** if not explicitly configured — don't flag as missing unless the feature is clearly needed.
5. **Generate all three output parts** — Matrix, Missing Capabilities, and Action Items.
6. **Prioritize accurately** — High for compliance/functional gaps, Medium for UX, PO Decision for optional features, Low for informational.

---

## Getting Help

- Entity Platform Capabilities reference: Quip CdnZAclcNTuX
- BPO Master List: Quip 3HqJACZ32Gkt
- CDP Core team: `#help-cdp-core` on Slack