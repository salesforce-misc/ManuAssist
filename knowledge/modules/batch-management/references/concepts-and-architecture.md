# Batch Management — Concepts & Architecture

---

## What Is Batch Management?

Batch Management is a **no-code, UI-driven** Salesforce feature for processing large volumes of
standard and custom object records without writing Apex code. It splits work into **Batch Job Parts**
(record subsets) and executes a business process on each subset sequentially.

### Batch Management vs Batch Apex

| Aspect | Batch Management | Batch Apex |
|--------|-----------------|------------|
| Code required | None — configure in UI | Apex code required |
| Maintainability | Click-based; admin-friendly | Developer-maintained |
| Monitoring | Monitor Workflow Services | Apex Jobs page |
| Multiple jobs in one flow | Yes | No (each class = one job) |
| Failed record resubmission | Built-in UI action | Custom code needed |

---

## Availability

Batch Management is available in Professional, Enterprise, Unlimited, and Developer editions,
and is licensed with: Automotive, Commerce, Communications, Consumer Goods, Education,
Energy & Utilities, Financial Services, Health, Insurance, Life Sciences, Loyalty Management,
Manufacturing, Media, Net Zero, Nonprofit, Public Sector, Rebates, Revenue, Sales, and Service.

---

## Two Distinct Workflows

### 1. Batch Job Configuration Workflow

```
Step 1: Create the business process (Flow or other Salesforce product)
Step 2: Configure the batch job (process type, execution process, batch size, retry)
Step 3: Create a flow with a Batch Job action to run the batch job
```

- For **Flow** process type: Create and activate a Flow that has a **Text type input variable**
  that identifies each record (the "Flow Input Variable").
- For **other Salesforce products** (e.g., BRE, Loyalty Management): Complete the
  product-specific prerequisite tasks, then configure the batch job to reference that process.

### 2. Automated Batch Job Run Sequence

```
1. Flow with Batch Job Action runs
2. Batch job creates child parts (record subsets)
3. A batch job part releases its record set to the business process
4. Business process executes on the record subset
5. After one part completes, the next part sends its records → repeat
```

A **Batch Job** record is created in Monitor Workflow Services for every run.

---

## Key Terms

| Term | Meaning |
|------|---------|
| **Batch Job** | The configuration that defines which object, which process, batch size, retry settings, and filter conditions |
| **Batch Job Part** | A subset of records (up to 2,000) processed in one execution unit; also called a Task in Monitor Workflow Services |
| **Execution Process** | The API name of the flow or business process the batch job sends records to |
| **Batch Size** | Number of records per batch job part (max 2,000) |
| **Retry Count** | Number of automatic reruns if a batch job part fails (max 3) |
| **Retry Interval** | Milliseconds to wait before retrying a failed part (1,000–10,000 ms) |
| **Flow Input Variable** | The Text-type flow variable that the batch job uses to pass the record ID to the flow |
| **Object** | The source object whose records are filtered and sent to the business process |
| **Conditions** | Filter criteria (field-value or field-input-variable) that determine which records are included |
| **Input Variable** | Placeholder in conditions whose value is set dynamically in the running flow |
| **Group By** | Field used to group records for processing together (available only for certain process types) |

---

## Process Types

The **Process Type** selected when creating a batch job determines what product the batch job
sends records to and what configuration options are available.

| Process Type | Business Process Location | Notable Config Options |
|-------------|--------------------------|------------------------|
| **Flow** | Salesforce Flow | Flow Input Variable, Object, Conditions, Input Variables |
| **BRE / Expression Sets** | Business Rules Engine | Object, Related Objects, Conditions, Group By, Input Variables |
| **Loyalty Management** | Loyalty Management | Object, Related Objects, Conditions, Group By |
| Others (per product license) | Product-specific | Product-specific |

For Flow process type, the flow **must** have a Text-type input variable that the batch job can use
to pass the record identifier (typically the record Id).

---

## Internal Connections

### Batch Management + Business Rules Engine (BRE)

**Pattern: Bulk expression set processing.**

When a Salesforce Flow (invoked by Batch Management) calls expression sets via the `runExpressionSet`
invocable action, the calls are automatically **bulkified** — multiple record inputs are sent as
a single batch request rather than individual calls. This is the recommended pattern for applying
BRE business rules to millions of records.

Typical sequence:
```
Scheduled Flow
  → Batch Job action (Batch Management)
    → Flow invoked per batch job part (auto-bulkified calls)
      → Expression Set invocable action (BRE)
        → Results written back to records
```

> **See Also:** `business-rules-engine` skill → `invoke-and-integrate.md`
> (Batch invocation note, Invoking an Expression Set in Flow)

### Batch Management + Data Processing Engine (DPE)

Both Batch Management and DPE track their runs in **Monitor Workflow Services**. In the list view:
- Batch Management runs have type **Batch**
- DPE runs have type **Calc**

They can be orchestrated in the same flow — e.g., a scheduled flow that:
1. Runs a DPE definition to compute aggregated values
2. Waits for the DPE definition run to complete (using the `Batch Job Status Changed Event`)
3. Runs a Batch Management job to apply BRE rules on the updated records

> **See Also:** `data-processing-engine` skill → `run-and-monitor.md`

### Batch Management + Context Service

When a batch job drives a Flow that uses Context Service (e.g., calls **Build Context** before
invoking an expression set), the Context ID is generated per record subset. The batch job handles
record selection; Context Service handles data hydration for BRE.

> **See Also:** `context-service` skill → `invocable-actions.md`

---

## Platform Event: Batch Job Status Changed Event

Use the **Batch Job Status Changed Event** platform event to:
- **Pause a flow** using a `Wait` element while a batch job is running
- **Resume the flow** after the batch job run completes

This enables sequential orchestration — run Batch Job A, wait for it to complete, then run
Batch Job B — all in a single scheduled flow.

Key event fields you can condition on:
- Job status (Completed, Completed with Failures, Failed, Canceled)
- Batch job ID
- Run timestamp

---

## Data Model

Batch Management creates these records for every run:
- **BatchApexJobDefinition** (or `BatchProcessJobDefinition`) — the batch job metadata
- **Batch Job** (in Monitor Workflow Services) — one record per run instance
- **Batch Job Part** (Task) — one record per subset of records processed
- **Batch Job Part Failed Record** — one record per failed record within a part
