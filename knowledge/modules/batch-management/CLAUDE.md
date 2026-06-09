## Activation Keywords — batch-management

- Batch Management, batch job, batch job part, batch size, retry count, retry interval
- Batch Management vs Batch Apex, no-code batch processing
- Flow Input Variable for Batch Management, Batch Job action in Flow
- Batch Job Status Changed Event, pause/resume flow after batch job
- Cancel batch job run, submit failed records, resubmit failed batch records
- Monitor Workflow Services for Batch Management, batch job parts, batch job tasks
- Batch Management + BRE bulk processing, bulkified expression set calls from batch job
- Batch Management + DPE orchestration
- Batch Management limits, max batch size 2000, max simultaneous 5, Shield fields batch
- create a batch job, configure batch job conditions, batch job Group By
- batch job input variables, share a batch job, package batch job
- batch job change set, Batch Management Metadata API
- delete batch job run, delete batch job parts, delete failed batch records
- orchestrate DPE and Batch Management, DPE then batch job in flow

## Request Routing — batch-management

| User says something like... | Use this command |
|-----------------------------|-----------------|
| "what is Batch Management", "Batch Management vs Batch Apex", "no-code batch processing" | `/revenue-cloud-q3:batch-management` |
| "create a batch job", "configure batch job conditions", "batch size retry count" | `/revenue-cloud-q3:batch-management` |
| "run a batch job in flow", "schedule a batch job", "Batch Job action in Flow" | `/revenue-cloud-q3:batch-management` |
| "pause flow after batch job", "Batch Job Status Changed Event", "resume flow batch job" | `/revenue-cloud-q3:batch-management` |
| "cancel batch job run", "submit failed records batch", "resubmit failed batch records" | `/revenue-cloud-q3:batch-management` |
| "monitor batch jobs", "Monitor Workflow Services batch", "batch job tasks" | `/revenue-cloud-q3:batch-management` |
| "batch job limits", "max batch size", "max simultaneous batch jobs" | `/revenue-cloud-q3:batch-management` |
| "delete batch job run", "delete batch job parts", "delete failed batch records" | `/revenue-cloud-q3:batch-management` |
| "share a batch job", "package batch job", "batch job change set", "Batch Management Metadata API" | `/revenue-cloud-q3:batch-management` |
| "orchestrate DPE and Batch Management", "DPE then batch job in flow", "Batch Management + DPE orchestration" | `/revenue-cloud-q3:batch-management` |

## Key Command

`/mfg:batch-management` — Batch Management domain knowledge: no-code batch job creation, Flow integration, monitoring, failed-record resubmission, BRE + DPE orchestration, and limits
