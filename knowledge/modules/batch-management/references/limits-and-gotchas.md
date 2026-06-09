# Batch Management — Limits & Gotchas

---

## Hard Limits

| Limit | Value |
|-------|-------|
| Max records per batch job part | 2,000 |
| Max simultaneous batch jobs | 5 |
| Max retry count per batch job part | 3 |
| Retry interval range | 1,000 – 10,000 milliseconds |
| Max specific failed records for manual resubmission | 200 |
| Max related objects per batch job | 3 |

---

## Restrictions

| Restriction | Details |
|-------------|---------|
| Salesforce Shield encrypted fields | Cannot be used in filter conditions |
| Multiple versions | Cannot create multiple versions of a batch job |
| Active batch job editing | Cannot edit an active batch job; must deactivate first |
| Rerunning completed jobs | Cannot rerun a completed batch job; trigger the flow again to start a new run |
| Parallel batch jobs in one flow | A single flow cannot run multiple batch jobs simultaneously; use the Wait element to sequence them |
| View successfully processed records | Details of successfully processed records are not available in Monitor Workflow Services |

---

## Known Gotchas

### 1. Flow Must Have a Text-Type Input Variable (Flow Process Type)

**What happens:** When creating a batch job with Process Type = Flow, the Execution Process
dropdown only shows flows that have at least one **Text-type input variable**. Flows without
this variable will not appear.

**Fix:** Ensure the flow has a Text-type input variable (e.g., `RecordID`) set as available for
input from outside the flow before creating the batch job.

---

### 2. Deactivating a Batch Job Fails Already-Scheduled Runs

**What happens:** If you deactivate a batch job that is already scheduled to run (via a
scheduled flow), the scheduled runs will fail.

**Fix:** Reschedule or disable the flow before deactivating the batch job. Reactivate the batch
job and flow together when ready.

---

### 3. Cancel Does Not Roll Back Completed Parts

**What happens:** When you cancel an in-progress batch job run, only parts that have not yet
started are canceled. Parts that have already completed their record processing are NOT reverted.

**Symptom:** After cancellation, some records are updated and others are not — a partial result.

**Fix:** Design flows to be idempotent (safe to run multiple times). For record updates, this
typically means using upsert operations rather than blind inserts.

---

### 4. Failed Records Resubmission Creates a New Run

**What happens:** When you submit failed records, Batch Management creates a **new batch job run**
for just those records. The original run is not modified.

**Symptom:** After resubmission, if those records fail again, you cannot resubmit them from the
original run — you must use the new run that was created by the first resubmission.

**Fix:** Track the resubmitted batch job ID (available in the Failed Records tab) to manage
subsequent resubmission if needed.

---

### 5. Cannot View Canceled Batch Job Parts

**What happens:** After a run is canceled, only **completed** batch job parts are visible in
the Tasks tab. Canceled parts disappear.

**Fix:** Record the state of in-progress parts before canceling if audit trail is important
(e.g., download failed record details first).

---

### 6. Modifying the Source Object Breaks the Batch Job

**What happens:** If the object or object field names used in a batch job's filter conditions
are renamed or deleted, the batch job fails.

**Fix:** Delete the batch job and create a new one with the updated object or field names. Or
use the `BatchProcessJobDefinition` Metadata API to update the batch job definition.

---

### 7. Direct DML on BatchProcessJobDefinition Is Unsupported

**What happens:** Directly inserting, updating, or deleting the `BatchProcessJobDefinition`
SObject record via Apex DML or API can corrupt live processes and data in the org.

**Fix:** Always use the **Batch Management UI** or the **`BatchProcessJobDefinition` Metadata API**
for all lifecycle operations on batch jobs.

---

### 8. BRE Auto-Bulkification Requires the Batch Job to Drive the Flow

**What happens:** Expression set calls from a Flow are auto-bulkified **only** when the Flow
is invoked by Batch Management (i.e., as the "Execution Process" of a batch job).

**Symptom:** If a developer calls expression sets from a stand-alone flow (not batch-driven),
calls are not bulkified and may hit per-transaction limits for high-volume processing.

**Fix:** For bulk BRE processing (millions of records), use a Batch Management job as the driver.

> **See Also:** `business-rules-engine` skill → `invoke-and-integrate.md`

---

### 9. Batch Job Status Changed Event Fires for Both BM and DPE Runs

**What happens:** The `Batch Job Status Changed Event` fires for **both** Batch Management runs
and Data Processing Engine runs. If a flow Wait element listens for this event without filtering
by the specific batch job ID, it may resume prematurely on a DPE event (or vice versa).

**Fix:** Always filter the Wait element's resume condition on the **specific batch job ID**
returned by the Batch Job or DPE action, not just on the event type.

> **See Also:** `data-processing-engine` skill → `run-and-monitor.md`

---

### 10. BatchJobStatusChangedEvent `Status` Values Are NOT `Completed`/`Failed`

**What happens:** The `Status` field on `BatchJobStatusChangedEvent` uses different values than what developers commonly expect. The correct picklist values are:

| Correct value | ❌ Common mistake |
|---------------|-----------------|
| `Success` | `Completed` |
| `Failure` | `Failed` |
| `Canceled` | `Cancelled` (different spelling) |

**Symptom:** Flow resume conditions or Apex filters using `Completed` or `Failed` never match — silently breaking automation that waits on job completion.

**Fix:** Use `Success`, `Failure`, `Canceled` exactly as shown above in all Wait element conditions and Apex SOQL filters.

---

### 11. `BatchProcessJobDefinition` `Type` Field — Full Value List

Beyond `Calc` and `Flow`, the `Type` field accepts:

| Value | Description                                       |
|-------|---------------------------------------------------|
| `BulkUpdate` | Bulk record update jobs                           |
| `ConsumptionOveragesCalculation` | Consumption overage billing calculations          |
| `DecisionTableRefresh` | Decision Table refresh orchestrated as a batch job |
| `HighScaleBreProcess` | High-scale BRE expression set processing          |
| `LoyaltyBatch` | Loyalty Management batch jobs                     |
| `PricingBatch` | Manufacturing batch jobs                          |
| `RebateManagement` | Rebate Management batch jobs                      |

Passing an incorrect `Type` value in Metadata API deployments results in a `FIELD_INTEGRITY_EXCEPTION`.

#### Complete Canonical Type Picklist (API v55.0+)

The `Type` field on `BatchProcessJobDefinition` (Tooling API, API version 55.0+) has these additional values beyond what the UI exposes:

| Value | Description |
|-------|-------------|
| `Flow` | Standard Flow-driven batch job (default) |
| `BulkUpdate` | Bulk record update jobs |
| `ConsumptionOveragesCalculation` | Consumption overage billing calculations |
| `DecisionTableRefresh` | Decision Table refresh |
| `DeepCloneSalesAgreement` | Deep clone of Sales Agreement records |
| `EntitlementCreationBatchJob` | Entitlement creation batch |
| `HighScaleBreProcess` | High-scale BRE expression set processing |
| `IndustriesLSCommercial` | Life Sciences Commercial |
| `LoyaltyProgramProcess` | Loyalty Management batch jobs |
| `ManagerProvisioning` | Manager provisioning |
| `NetUnitRateCalculation` | Net unit rate calculation |
| `PbbToOptyConversion` | PBB to Opportunity conversion |
| `ProductCatalogCacheRefresh` | Product catalog cache refresh |
| `RatableSummaryCreation` | Ratable summary creation |
| `SummaryCreation` | Summary creation |

> Other types may be available based on your org's installed licenses. Passing an invalid `Type` value in a Metadata API deployment causes a `FIELD_INTEGRITY_EXCEPTION`.

---

### 12. Group By Is Not Available for Flow Process Type

**What happens:** The **Group By** configuration option is only available for non-Flow process
types (e.g., BRE, Loyalty Management). When Process Type = Flow, there is no Group By option.

**Fix:** If grouping is needed for Flow-type batch jobs, implement the grouping logic inside
the flow itself.

---

## Migration and Sharing Quick Reference

| Scenario | Approach |
|----------|----------|
| Share batch job with another org | Use managed package, unmanaged package, or change set |
| Create/update batch job via code | Use `BatchProcessJobDefinition` Metadata API |
| Run a batch job from code | Use Batch Job invocable action |
| Submit failed records from code | Use Submit Failed Records invocable action |
| Know when a run completes | Listen to `Batch Job Status Changed Event` platform event |
| Cancel an in-progress run via code | Use Batch Job Cancel Business API |
