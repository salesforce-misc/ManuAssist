---
name: context-service
description: >
  Foundational Manufacturing Cloud skill for understanding, configuring, testing, and
  troubleshooting Context Service — the data-sharing layer used by Manufacturing Cloud
  Advanced pricing, billing, and procedure engines. Invoke this skill when the user
  asks about Context Service setup, Context Definitions, Context Mappings, Context
  Filters, context hydration, TTL/scoping, invocable actions in flows, or when
  writing E2E tests that touch any RCA feature backed by Context Service (pricing
  procedures, billing calculations, order orchestration). Triggers on prompts like
  "set up Context Service", "create a context definition", "test context hydration",
  "context mapping for pricing", "context TTL", "build context flow action",
  "context filter for assets", or "migrate context definition to another org".
---

# Context Service — Manufacturing Cloud Domain Skill

> **Category: Common Service Skill** — available across Salesforce Industries clouds; used heavily in Manufacturing Cloud Advanced (RCA) pricing, billing, and contract workflows.

Context Service is a **foundational infrastructure layer** in Manufacturing Cloud Advanced (RCA).
It acts as a data-caching and distribution middleware between applications (e.g. pricing
procedures, billing engines) and the Salesforce data layer. Understanding it is a prerequisite
for writing reliable E2E tests for any RCA feature that involves price calculation, order
orchestration, or billing.

Always read the reference docs at the start of each session:
- `skills/context-service/references/concepts-and-architecture.md` — core concepts, key terms, architecture
- `skills/context-service/references/definition-lifecycle.md` — create, activate, extend, clone, upgrade, migrate
- `skills/context-service/references/mappings-and-filters.md` — mapping types, intents, filters, data types
- `skills/context-service/references/invocable-actions.md` — Flow invocable actions reference
- `skills/context-service/references/limits-and-gotchas.md` — org limits, known pitfalls for tests

---

## Phase 1: Understand What Context Service Is Doing in This Feature

Before writing tests or config for any RCA feature, identify whether Context Service is
involved and what role it plays.

Ask / infer:
- **Which procedure or engine is being tested?** (pricing, billing, order orchestration)
- **Which Context Definition does it use?** (standard shipped definition, or a custom/extended one)
- **Is it request-scoped or session-scoped?** (affects how long data lives in the cache)
- **What mapping is active?** (default mapping, or a named mapping passed explicitly)
- **Are any Context Filters applied?** (can cause unexpected data scoping in tests)

If the user is asking about a test failure, check:
- Is the Context Definition active?
- Does it have at least one mapping set as default?
- Have there been Salesforce metadata changes (object field changes) in the last 24 hours?
  (Schema cache can be stale — see `limits-and-gotchas.md`)

---

## Phase 2: Configuration Guidance (Admin / Setup)

If the user needs to **set up or configure** Context Service for their feature:

### Enable Context Service
1. Setup → Quick Find → `Context Service` → **Context Service Settings**
2. Turn on **Context Definitions** toggle
3. Assign permission sets to users (see `concepts-and-architecture.md` for the two PSLs)

### Create or Customize a Context Definition
Follow the lifecycle in `definition-lifecycle.md`:
1. Identify if a **standard definition** already exists for this use case (check Standard Definitions tab)
2. Prefer **Extend** over **Clone** when you need to track upstream upgrades
3. If you need full flexibility, **Clone** with Preserve Inheritance enabled
4. Always: Create structure (nodes + attributes) → Add mapping → Mark default → Activate

### Choosing the Right Mapping Type
Refer to `mappings-and-filters.md`:
- **Automatic Salesforce Object Mapping** — quickest, matches node/attribute names to SObject field names
- **Input Mapping** — when data is passed via JSON at hydration time (not from SObjects)
- **Mapping Intent** — choose Hydration (read), Persistence (write back), Translation (transform), or Association (metadata only)

---

## Phase 3: Test Scenario Design for Context Service

When writing E2E tests that involve Context Service, always account for:

### What to verify in a context-aware E2E test

```
1. Context Definition is Active before the test runs
   → Assert: [SELECT Id, Status FROM ContextDefinition WHERE DeveloperName = 'YourDefName']
              Status = 'Active'

2. Default mapping is set
   → Assert: ContextMapping with IsDefault = true exists for the definition

3. Context hydrates with correct data
   → After triggering the procedure/flow, assert on output values that Context Service provides
   → e.g. price calculation result reflects the correct Product attributes from the context

4. Context scope is correct for the test
   → Request-scoped: context data exists only within the Apex/REST/Flow execution
   → Session-scoped: context data persists up to TTL (default 10 min, max 45 min)
   → For session-scoped tests: assert data is present within TTL; verify expiry behavior separately

5. Filters applied to the definition narrow data correctly
   → If a Context Filter is active, assert that only filtered records appear in the hydrated context
```

### Test isolation for Context Service

- Context Service holds data in an **in-memory cache** — not in the database
- Tests that rely on session-scoped context must account for TTL expiry
- Use the **Delete Context Cache** invocable action (or REST endpoint) to clear cache between test runs
- Do NOT rely on org-level context state from a previous test — always hydrate fresh in `beforeEach`

---

## Phase 4: Invocable Actions in Flow Tests

When testing a Salesforce Flow that uses Context Service invocable actions, refer to
`invocable-actions.md` for the full action reference. The key actions to test:

| Action | What to assert in the test |
|--------|---------------------------|
| **Build Context** | Context ID returned, context contains expected node/attribute values |
| **Query Context Tags** | Tag values match expected data from the mapped SObjects |
| **Update Context Attributes** | Attribute values in context reflect the update |
| **Persist Context Data** | Target SObject record updated with context values |
| **Delete Context Cache** | Subsequent Query Context Tags returns empty / throws not-found |

### Testing gotcha: Flow-triggered hydration does NOT auto-sync extended definitions
Extended definitions are NOT automatically synced when hydration is triggered by Apex or Flow.
Always verify that the extended definition is in sync before flow-based tests.

---

## Phase 5: Migration & Deployment Guidance

When deploying a Context Definition to another org (sandbox → QA → prod):
1. Context definitions must be deployed **before** dependent components (procedures, pricing elements)
2. Both orgs must be on the **same Salesforce release version**
3. Deactivate the definition in the target org **before** deploying — cannot be done during deployment
4. After deployment: re-activate manually; verify mappings are intact
5. Never run Sync in production — run in sandbox first, then export and deploy as a package

Refer to `definition-lifecycle.md` for the full migration checklist.

---

## When to Ask Clarifying Questions

Only pause when you cannot proceed:
- Which Context Definition (name/developer name) is being used — affects all test assertions
- Whether the context is request-scoped or session-scoped — affects test cleanup strategy
- Whether custom mappings or filters are applied — affects what data appears in the context
