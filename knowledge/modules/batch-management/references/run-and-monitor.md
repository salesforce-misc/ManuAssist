# Batch Management — Run & Monitor

---

## Running a Batch Job

Batch jobs run via **Salesforce Flow**. After a batch job is activated, it appears as an **Action**
in Flow Builder under the **Batch Job** category (named by the batch job's API name).

**Permissions required:**
- To create a flow: `Manage Flows` system permission
- To run a flow: `Run Flows` system permission
- To run a batch job: System Administrator profile

### Flow Types That Can Run a Batch Job

| Flow Type | Use When |
|-----------|---------|
| **Schedule-Triggered Flow** | Run the batch job on a recurring schedule (daily, weekly, monthly, once) |
| **Triggered Flow** | Run the batch job on a record creation or update event |
| **Autolaunched Flow** | Run the batch job from an external system trigger (API) |

### Add Batch Job Action to a Flow

1. From Setup → Flows → **New Flow** → select flow type
2. Drag the **Action** element onto the canvas at the point where the batch job should run
3. In the New Action window, either:
   - Search for the batch job by its API name, or
   - Browse to the **Batch Job** category
4. Select the batch job action
5. Enter the **Label** and **API Name** for the action element
6. In **Set Input Values**, specify values for:
   - Any **input variables** defined in the batch job's filter conditions
   - Any **input variables** defined in the business flow (for Flow process type)
7. Click **Done**
8. Save and activate the flow

### Example: Passing Input Variable Values

For a batch job with an input variable `CaseCloseDate`:

```
Action: Delete_Cases_Older_Than_12_Months
Label: Run Batch Job to Delete Cases
Set Input Values:
  CaseCloseDate → Running Flow Interview > CurrentDateTime
```

---

## Batch Management Invocable Actions

### Action 1: Run Batch Job (batchJobAction)

Triggers a batch management job. Returns a batch job ID immediately (asynchronous execution).

**URI:** `/services/data/vXX.X/actions/custom/batchJobAction`
**HTTP Methods:** GET, POST
**Formats:** JSON
**Authentication:** Required
**Available from:** API version 54.0

**Inputs:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batchJobDefinitionName` | string | Yes | Developer name (API name) of the batch job definition to execute. |

**Outputs:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `batchJobId` | string | ID of the batch job run created. Use this ID to track progress in Monitor Workflow Services or to filter `BatchJobStatusChangedEvent` in a Wait element. |

**Sample request:**

```json
POST /services/data/v54.0/actions/custom/batchJobAction
{
  "inputs": [
    {
      "batchJobDefinitionName": "MyBatchJobDefinition"
    }
  ]
}
```

**Sample response:**

```json
[
  {
    "actionName": "batchJobAction",
    "errors": null,
    "isSuccess": true,
    "outputValues": {
      "batchJobId": "0XxXXXXXXXXXXXXX"
    }
  }
]
```

> Send an empty body `{}` if no inputs are required by the batch job definition.

---

### Action 2: Submit Failed Records (submitFailedRecordsBatchJob)

Reprocesses failed records from a previous batch job run. Creates a new batch job run for the failed records.

**URI:** `/services/data/vXX.X/actions/standard/submitFailedRecordsBatchJob`
**HTTP Methods:** GET, POST
**Formats:** JSON
**Authentication:** Required

**Inputs:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `parentBatchJobId` | string | Yes | ID of the batch job run that contains the failed records (the original run's `BatchJob.Id`). |
| `failedRecordIds` | array | No | Array of specific failed record IDs to reprocess. Omit to resubmit ALL failed records from the parent batch job. Max 200 specific records. |

**Outputs:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `batchJobId` | string | ID of the new batch job run created to process the failed records. |
| `status` | string | Status of the submit operation (e.g., `Submitted`). |

**Sample request:**

```json
POST /services/data/v54.0/actions/standard/submitFailedRecordsBatchJob
{
  "inputs": [
    {
      "parentBatchJobId": "0XxXXXXXXXXXXXXX",
      "failedRecordIds": ["001XXXXXXXXXXXX", "001XXXXXXXXXXXX"]
    }
  ]
}
```

**Sample response:**

```json
[
  {
    "actionName": "submitFailedRecordsBatchJob",
    "errors": null,
    "isSuccess": true,
    "outputValues": {
      "batchJobId": "0XxXXXXXXXXXXXXX",
      "status": "Submitted"
    }
  }
]
```

> After resubmission, the status of resubmitted `BatchJobPartFailedRecord` entries changes from `Failed` to `Resubmitted`. If those records fail again in the new run, you must resubmit from the **new run's ID** (not the original).

---

## Running Multiple Batch Jobs Sequentially in One Flow

A single scheduled flow can run multiple batch jobs. Use a **Wait element** between them to
ensure they execute one at a time (batch jobs cannot run in parallel from the same flow).

**Pattern:**
```
Flow Start
  → Batch Job A action
  → Wait element (Batch Job Status Changed Event: Batch Job A completed)
  → Batch Job B action
  → Wait element (Batch Job Status Changed Event: Batch Job B completed)
  → [Next element or end]
```

---

## Pausing and Resuming a Flow (Platform Event)

Use the **Batch Job Status Changed Event** to pause a flow while the batch job runs and resume
it after completion. This is the correct approach when subsequent flow elements depend on
batch job results.

**Steps:**
1. After the Batch Job action, add a **Wait** element
2. Configure the Wait element to resume when the `Batch Job Status Changed Event` fires
3. Use event fields to set the resume condition:
   - Filter on the specific batch job ID (from the action's output)
   - Filter on the desired status (e.g., `Completed`, `Completed with Failures`, `Failed`)
4. Add downstream elements after the Wait element

> **Important:** The `Batch Job Status Changed Event` fires for both Batch Management jobs
> **and** Data Processing Engine definition runs. When filtering in the Wait element, always
> filter by the specific batch job ID to avoid resuming on the wrong event.

---

## BatchJobStatusChangedEvent — Full Reference

Notifies subscribers when a batch job completes in a flow. Available in API version 51.0 and later.

**Fires for:** Both Batch Management runs (Type = `Batch`) and Data Processing Engine runs (Type = `Calc`).

**Supported Calls:** `describeSObjects()`

**Supported Subscribers:**

| Subscriber | Supported |
|------------|-----------|
| Flows | Yes |

### Fields

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `BatchJob` | string | — | Unique identifier of the batch job run. Filter on this to target a specific run. |
| `BatchJobDefinition` | string | Nillable | Unique identifier of the batch job's definition (the template, not the run). |
| `EndDateTime` | dateTime | Nillable | Timestamp for when batch job execution completed. |
| `EventUuid` | string | Nillable | UUID that identifies a platform event message. Available in API version 52.0 and later. |
| `ReplayId` | string | Nillable | System-populated. Refers to the position of the event in the event stream. Used for event replay. |
| `StartDateTime` | dateTime | Nillable | Timestamp for when batch job execution started. |
| `Status` | picklist | Restricted picklist | Status of the batch job when the event fired. **See critical values below.** |

### Status Field Values — CRITICAL

> **Warning:** These values are NOT what most developers expect. Using the wrong values in Wait element conditions or Apex SOQL filters causes silent failures where the flow never resumes.

| Correct API Value | What it means | Common (WRONG) Assumption |
|-------------------|---------------|--------------------------|
| `Success` | The job completed with no failures | `Completed` (WRONG) |
| `Failure` | The job ended in failure | `Failed` (WRONG) |
| `Canceled` | The job was canceled | `Cancelled` (WRONG — note single `l`) |

> There is no `CompletedWithFailures` value on `BatchJobStatusChangedEvent`. A job that completes with some failed parts fires as `Success` (the job itself completed) unless the job itself fatally failed (which fires `Failure`).

> **Note:** `BatchJob.Status` uses different values (`Completed`, `Failed`) than `BatchJobStatusChangedEvent.Status` (`Success`, `Failure`). This is a known platform inconsistency.

### When It Fires

| Scenario | Fires? | Status value |
|----------|--------|--------------|
| Batch Management job completes normally | Yes | `Success` |
| Batch Management job completes with some failed parts | Yes | `Success` |
| Batch Management job fails entirely | Yes | `Failure` |
| Batch Management job is canceled | Yes | `Canceled` |
| DPE definition run completes | Yes | `Success` |
| DPE definition run fails | Yes | `Failure` |
| DPE definition run is canceled | Yes | `Canceled` |

### How to Subscribe (Flow Wait Element)

1. After the Batch Job or DPE action, add a **Wait** element
2. Set event to `Batch Job Status Changed Event`
3. Set resume condition on **`BatchJob`** field = `{!actionOutput.batchJobId}` (always filter by the specific job ID)
4. Optionally add a second condition on **`Status`** = `Success` (or `Failure` or `Canceled`)
5. Logic: ALL conditions met

### Filtering Guidance

- **Always filter by `BatchJob` ID.** The event fires for every DPE and BM run in the org. Without an ID filter, a Wait element may resume on a completely unrelated run.
- **Filter by `Status` when the downstream logic differs.** Example: resume on `Success` and route to a "send confirmation" path; resume on `Failure` and route to an "alert admin" path. Use separate Wait elements or a Decision element after resuming.
- **Apex SOQL filter example:** `SELECT BatchJob, Status FROM BatchJobStatusChangedEvent WHERE BatchJob = '0mdXX...' AND Status = 'Success'`

---

## Monitor Workflow Services

Use **Monitor Workflow Services** (Setup → Monitor Workflow Services) to track all batch job
runs and DPE definition runs.

The list displays all run instances. The **Type** column distinguishes:
- `Batch` — Batch Management job runs
- `Calc` — Data Processing Engine definition runs

---

## Monitor Workflow Services — Standard Objects Reference

These objects track every DPE and Batch Management run. They are **not available in Object Manager**. Query them via SOQL or REST API.

> The Type field distinguishes runs: `Calc` = Data Processing Engine, `Batch` (or other type values) = Batch Management.

### BatchJob — Complete Field Table

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `AdditionalInformation` | textarea | Create, Nillable, Update | JSON string with additional context about the batch job run. |
| `BatchJobDefinitionId` | reference | — | Lookup to `BatchJobDefinition`. Relationship name: `BatchJobDefinition`. |
| `BatchJobDefinitionName` | string | — | Developer name of the batch job definition. |
| `EndTime` | dateTime | Nillable | Timestamp when the batch job completed. |
| `ErrorDescription` | string | Nillable | Error message if the batch job failed. |
| `ExecutionStage` | picklist | — | Current stage when the event was recorded. Available in API version 66.0 and later. Values: `Datasync`, `Execution`, `Preprocessing`, `Writeback`. |
| `ExternalReference` | string | — | Unique identifier of the running process. |
| `IsDebugOn` | boolean | — | Whether debug mode is enabled for this run. Default: `false`. |
| `IsDebugRecipeDeleted` | boolean | — | Whether the debug recipes have been deleted (auto-deleted after 7 days). Default: `false`. |
| `LastReferencedDate` | dateTime | Nillable | Date and time last referenced. |
| `LastViewedDate` | dateTime | Nillable | Date and time last viewed. |
| `Name` | string | — | Name of the batch job run. |
| `OwnerId` | reference | — | Polymorphic lookup to `Group` or `User`. |
| `ProcessGroup` | string | — | Group or team for which the batch job ran. |
| `RetryCount` | int | — | Configured number of automatic reruns on failure. |
| `RuntimeParameter` | textarea | Nillable | Input variable values used for filter criteria in this run. |
| `StartTime` | dateTime | Nillable | Timestamp when the batch job started. |
| `Status` | picklist | Restricted | **Current run status.** Values: `Canceled`, `Completed`, `CompletedWithFailures`, `Failed`, `InProgress`, `Queued`, `QueueingInProgress`, `Submitted`. |
| `TotalInputRecordCount` | int | Create, Filter, Group, Nillable, Sort, Update | Total records provided as input to the batch job. Available in API version 66.0 and later. |
| `TotalProcessedRecordCount` | int | Filter, Group, Nillable, Sort | Total records processed across all batch job parts. Available in API version 66.0 and later. |
| `Type` | picklist | Defaulted on create, Filter, Group, Restricted picklist, Sort | Type of batch job. Values: `Calc` (DPE), `DecisionTableRefresh`, `Flow`, `DeepCloneSalesAgreement`, `ManagerProvisioning`. Other types available based on org licenses. |
| `UtilisedExecutionLimit` | string | Create, Filter, Group, Nillable, Sort, Update | CRMA or Data Cloud execution capacity utilised before this run started. Available in API version 66.0 and later. |
| `UtilisedWritebackLimit` | string | Create, Filter, Group, Nillable, Sort, Update | CRMA or Data Cloud writeback capacity utilised before this run started. Available in API version 66.0 and later. |

**Associated Objects:** `BatchJobFeed` (feed tracking), `BatchJobHistory` (field change history).

> **Note:** `BatchJob.Status` uses different values than `BatchJobStatusChangedEvent.Status`. `BatchJob.Status` = `Completed` whereas the event fires with `Status` = `Success`. See the BatchJobStatusChangedEvent section for the full mapping.

### BatchJobPart — Complete Field Table

One `BatchJobPart` represents one task/stage in a batch run. For DPE runs, tasks correspond to data sync, execution, and writeback nodes. For Batch Management runs, each task processes one subset (part) of records.

**Supported Calls:** `describeLayout()`, `describeSObjects()`, `getDeleted()`, `getUpdated()`, `query()`, `retrieve()`

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `BatchJobId` | reference | Filter, Group, Sort | ID of the parent `BatchJob`. Lookup. |
| `EndTime` | dateTime | Filter, Nillable, Sort | Timestamp when this part finished. |
| `ErrorDescription` | string | Filter, Nillable, Sort | Error message if this part failed. |
| `FailedRecFileBody` | base64 | Nillable | Body of the failed records file. |
| `FailedRecFileContentType` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | MIME type of the failed records file (e.g., `text/csv`, `application/html`). |
| `FailedRecFileLength` | int | Filter, Group, Nillable, Sort | Character length of the failed records file. |
| `FailedRecFileName` | string | Filter, Group, Nillable, Sort | File name of the failed records file. |
| `FailedRecordCount` | int | Filter, Group, Nillable, Sort | Number of records this part could not process. |
| `FailedRowCount` | long | Filter, Group, Nillable, Sort | Records processed but failed to write back (DPE runs only). Available in API version 66.0 and later. |
| `InputRecordCount` | int | Filter, Group, Nillable, Sort | Records assigned to this part for processing. |
| `InputRowCount` | long | Filter, Group, Nillable, Sort | Records submitted to this part (DPE runs). Available in API version 66.0 and later. |
| `Name` | string | Filter, Group, idLookup, Sort | Name of the batch job part. |
| `OutputRecordCount` | int | Filter, Group, Nillable, Sort | Records successfully processed. |
| `OutputRowCount` | long | Filter, Group, Nillable, Sort | Records successfully processed (DPE runs). Available in API version 66.0 and later. |
| `ParentBatchJobPartId` | reference | Filter, Group, Nillable, Sort | Parent part ID (for hierarchical part relationships). |
| `RecordFileBody` | base64 | Nillable | Body of the processed records file. |
| `RecordFileContentType` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | MIME type of the processed records file. |
| `RecordFileLength` | int | Filter, Group, Nillable, Sort | Character length of the processed records file. |
| `RecordFileName` | string | Filter, Group, Nillable, Sort | File name of the processed records file. |
| `RetryCount` | int | Filter, Group, Nillable, Sort | Number of automatic reruns for this part. |
| `StartTime` | dateTime | Filter, Nillable, Sort | Timestamp when this part started. |
| `Status` | picklist | Defaulted on create, Filter, Group, Restricted picklist, Sort | Part status: `Canceled`, `Completed`, `Failed`, `InProgress`, `New`, `Waiting`. |
| `Type` | picklist | Filter, Group, Nillable, Restricted picklist, Sort | Node type (for DPE `Calc` batch jobs). Values: `Aggregate`, `Analysis`, `Append`, `AtomicWriteback`, `Compute`, `CsvIngestion`, `Custom`, `Datasync`, `Execution`, `Filter`, `Forecast`, `Hierarchy`, `Join`, `OutputRecordsNode`, `Register`, `Slice`, `Source`, `Summary`, `Transform`, `Writeback`. |
| `UserReference` | string | Filter, Group, Nillable, Sort | ID of the writeback user assigned to the DPE writeback node. Available in API version 66.0 and later. |

**Associated Objects:** `BatchJobPartFeed`, `BatchJobPartHistory`.

### BatchJobPartFailedRecord — Complete Field Table

Represents a single record that a batch job part could not process.

**Supported Calls:** `describeLayout()`, `describeSObjects()`, `getDeleted()`, `getUpdated()`, `query()`, `retrieve()`

| Field | Type | Properties | Description |
|-------|------|------------|-------------|
| `BatchJobId` | reference | Filter, Group, Nillable, Sort | ID of the parent `BatchJob`. |
| `BatchJobPartId` | reference | Filter, Group, Sort | ID of the parent `BatchJobPart`. |
| `ErrorDescription` | string | Filter, Nillable, Sort | Error message explaining why the record failed. |
| `Name` | string | Filter, Group, idLookup, Sort | Name of the failed record entry. |
| `Record` | string | Filter, Group, Nillable, Sort | Unique identifier of the failed record (the batch record ID, not the Salesforce record ID). |
| `RecordName` | string | Filter, Group, Nillable, Sort | Name of the Salesforce record that failed. |
| `ResubmittedBatchJobId` | reference | Filter, Group, Nillable, Sort | ID of the batch job created to reprocess this record. Available in API version 52.0 and later. |
| `Status` | picklist | Defaulted on create, Filter, Group, Nillable, Restricted picklist, Sort | Status of this failed record entry. Available in API version 52.0 and later. Values: `Failed` (default), `Resubmitted`. |

**Associated Objects:** `BatchJobPartFailedRecordFeed`, `BatchJobPartFailedRecordHistory`.

### Viewing a Batch Job Run

1. Open the batch job run (name matches the batch job's name; use status and start time to identify)
2. **Details tab** — run parameters, input variable values used
3. **Tasks tab** — one row per batch job part (Task); review Input, Output, and Total Failure counts
4. **Failed Records tab** — records the batch job could not process

### Parameters Section (Details Tab)

Shows the values of the business flow and batch job input variables that were used when the batch
job ran. Useful for debugging unexpected filtering or processing behavior.

### Tasks Tab

Each **Task** = one **Batch Job Part**. Review:
- Input record count — records sent to the business process
- Output record count — records successfully processed
- Total Failure count — records that failed in this part
- Status — Completed, Failed, Canceled

---

## Cancel a Batch Job Run

**Steps:**
1. Setup → Monitor Workflow Services → Open the in-progress run (Type: Batch)
2. Click **Cancel Run** → confirm

**Key behavior:**
- Only batch job **parts that have not yet started** are canceled
- Parts that have already completed are **NOT rolled back** — their changes persist
- You **cannot view canceled parts** in the Tasks tab (only completed parts are shown)

---

## Submitting Failed Records

When a run completes with failed records, you can resubmit them for processing.

### Resubmit All Failed Records

In the batch job run: click **Submit Failed Records** (without selecting specific records).

### Resubmit Specific Failed Records

1. In the batch job run → Failed Records tab → select the records you want to resubmit
2. Click **Submit Failed Records**

Limit: up to **200 specific records** can be selected for manual resubmission.

After resubmission, the selected records' status changes from `Failed` to `Resubmitted`.
A **new batch job run** is created automatically to process the resubmitted records.

> **Note:** If the resubmitted records fail again in the new run, you must use that **new run**
> (not the original run) to resubmit them again.

### Resubmit via Flow

Use the **Submit Failed Records** invocable action in Flow:
1. Flow Builder → Add **Action** element
2. Category: **Batch Job** → Select **Submit Failed Records**
3. Set **Batch Job ID** (from the run record's Run ID)
4. Optionally set **Failed Records IDs** (comma-separated list for specific resubmission)
5. Save and activate the flow

---

## Batch Job Cancel REST API

Cancels a batch job of type Data Processing Engine (Calc) or Batch Management. A batch job with status `Submitted` or `InProgress` can be canceled.

**Resource:** `POST /connect/batch-job/{batchJobId}/cancel-job`

**Resource example:** `POST /connect/batch-job/0mdxx00000000fxAAA/cancel-job`

**Available version:** 52.0

**HTTP method:** POST

**Request body:** None (POST does not take request parameters or a request body)

**Response on success:** HTTP 201

**Special Access Rules:**
- Batch Management and Data Processing Engine licenses are required.
- System Administrator profile is required.

**Error Response Body:**

The response body on failure contains a single field:

| Property | Type | Description |
|----------|------|-------------|
| `message` | String | Details about why the batch job cancel request failed. |

**HTTP Error Codes:**

| HTTP Status | Error Code | Full Error Message |
|-------------|-----------|-------------------|
| 400 | `INVALID_STATUS` | We can't cancel the batch job that doesn't have an active run. Specify the ID of a batch job with an active run and try again. |
| 400 | `INVALID_STATUS` | We can't cancel the batch job that is already canceled or completed. Specify the ID of a valid batch job with the status InProgress or Submitted and try again. |
| 400 | `DELETE_FAILED` | We can't cancel the batch job of which the results are already being written back. |
| 400 | `DELETE_FAILED` | We can't cancel the batch job because of an error in processing your org's data. Run the Data Processing Engine definition and try again. |
| 403 | `FORBIDDEN` | You don't have the permission to cancel a batch job. Ask your Salesforce admin for help. |
| 404 | `RESOURCE_NOT_FOUND` | Specify the ID of a valid batch job and try again. |
| 500 | `INTERNAL_SERVER_ERROR` | Something went wrong when we tried to cancel the batch job. Try again or ask your Salesforce admin for help. |

---

## Delete Batch Job Runs

**Delete a complete run (and all its parts + failed records):**
1. Setup → Monitor Workflow Services → dropdown next to the run → **Delete** → **Delete**

**Delete individual batch job parts or failed records (Flow and Loyalty process types only):**
1. Open the batch job run → Tasks tab (or Failed Records tab)
2. Dropdown next to the part/record → **Delete** → **Delete**

> Only **completed or failed** runs can be deleted. In-progress runs must first be canceled.

---

## Example: Full End-to-End Run (Delete Closed Cases)

**Business flow:** `Delete_Closed_Cases` (autolaunched, input variable `RecordID`)
**Batch job:** `Process_Closed_Cases` (filters Cases where IsClosed = True)

**Scheduled flow to run it:**
```
Flow: Run_Batch_to_Delete_Closed_Cases
Type: Schedule-Triggered Flow
Schedule: January 1, 2027 | 12:00 AM | Weekly
Action: Process Closed Cases (Batch Job)
Label: Delete Closed Cases
```

The flow runs weekly, triggers the batch job, which filters all closed cases and sends
them in parts to the `Delete_Closed_Cases` flow for deletion.
