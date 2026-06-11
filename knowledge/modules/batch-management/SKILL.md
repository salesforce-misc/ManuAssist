# Batch Management Skill

## Purpose

> **Category: Common Service Skill** — available across Salesforce Industries clouds; used in Manufacturing for bulk processing of pricing, billing, and BRE/DPE workloads.

Answer questions about Salesforce Batch Management — the no-code alternative to Batch Apex for
processing large record volumes. Covers batch job creation, configuration, Flow integration,
monitoring via Monitor Workflow Services, failed-record resubmission, and limits.

---

## When to Invoke This Skill

Invoke `/revenue-cloud-q3:batch-management` when the user asks about any of the following:

- Batch Management setup, batch job creation, or batch job configuration
- Running batch jobs from Salesforce Flow or scheduled flows
- Batch job parts, batch size, retry count, retry interval
- Monitoring batch jobs in Monitor Workflow Services
- Canceling a batch job run
- Submitting or resubmitting failed records
- `Batch Job Status Changed Event` / Platform Event for batch job completion
- Pausing/resuming a flow using a Wait element after a batch job
- Running multiple batch jobs sequentially in a single flow
- Batch Management + Business Rules Engine (BRE) bulk processing pattern
- Batch Management + Expression Sets (auto-bulkification of BRE calls)
- Batch Management limits (max batch parts, simultaneous jobs, Shield fields, etc.)
- Batch Management vs Batch Apex comparison
- Sharing batch jobs via managed/unmanaged packages or change sets
- Deleting batch job runs, batch job parts, or failed records
- Batch Management Metadata API / developer resources

---

## Skill Protocol

### Phase 1 — Understand the Request

Identify the exact Batch Management question type:
- **Design** — which process type, batch size, retry configuration, Group By
- **Configuration** — Flow input variable, object, filter conditions, input variables
- **Integration** — how BM connects with Flow, BRE, DPE, or other Salesforce products
- **Monitoring** — Monitor Workflow Services, batch job runs, tasks, failed records
- **Recovery** — resubmitting failed records, canceling runs
- **Limits** — what constraints apply

### Phase 2 — Apply Domain Knowledge

Reference the documents in `references/`:
- `concepts-and-architecture.md` — what Batch Management is, how it works, two workflows,
  key terms, connection to BRE and DPE
- `create-and-configure.md` — step-by-step: create batch job (process type, execution process,
  batch size, retry), configure conditions, Group By, input variables, Flow input variable
- `run-and-monitor.md` — run from Flow (scheduled/triggered/autolaunched), pause/resume
  with Wait element and Platform Event, Monitor Workflow Services UI, cancel, submit failed records
- `limits-and-gotchas.md` — hard limits, Shield field restriction, cannot-rerun constraint,
  partial commit behavior, and known gotchas

### Phase 3 — Cross-Reference Related Skills

When the answer touches these areas, cross-reference the relevant skill:
- **BRE expression sets called from a batch job** → See `business-rules-engine` skill
  (invoke-and-integrate.md — Batch invocation note, auto-bulkification)
- **Data Processing Engine** → See `data-processing-engine` skill
  (both use Monitor Workflow Services; DPE definition runs appear as batch jobs of type `Calc`)
- **Context Service** → See `context-service` skill
  (if the Flow invoked by the batch job uses Build Context before calling an expression set)

### Phase 4 — Provide the Answer

Structure the response to directly answer the question:
1. Concept explanation (what and why)
2. Step-by-step configuration or code (if relevant)
3. Gotchas and limits (always mention the most relevant ones)
4. Cross-references to related skills (if the user will need them next)

---

## Quality Standards

- Always state which **process type** a batch job uses — Flow vs. other Salesforce product —
  because configuration fields differ between the two.
- Clarify that **only active batch jobs** appear in Flow Builder as actions.
- When discussing BRE + Batch Management, always note the **auto-bulkification** behavior:
  when Flow (invoked by a batch job) calls expression sets, calls are bulkified automatically.
- Remind users that **canceling a run** only cancels parts that have not yet started;
  already-completed parts are NOT rolled back.
- Warn that **rerunning a completed batch job** is not supported — a new run must be triggered.
