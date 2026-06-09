# Service Console for Manufacturing — Configuration & Troubleshooting

## Prerequisites

- General Settings configured (see `general-settings`)
- Manufacturing Cloud for Service PSL provisioned
- Industries Service Excellence PSL provisioned
- OmniStudio Standard Runtime enabled
- Timeline enabled
- Salesforce Knowledge enabled (if using the Knowledge component)

## Configuration Steps

### Step 1: Verify PSLs
Setup → Company Information → Permission Set Licenses. Confirm capacity for:
- Manufacturing Cloud for Service
- Industries Service Excellence
- OmniStudio (if not bundled)

### Step 2: Enable Standard OmniStudio Runtime
Setup → OmniStudio Settings → toggle **Standard OmniStudio Runtime**. Required for the Record Alerts component.

### Step 3: Enable Timeline
Setup → Timeline → toggle on. The console comes with a preconfigured **Interaction Timeline** anchored to Contact. To use a custom timeline, configure the Timeline component included with Industries Service Excellence and add it to the page.

### Step 4: Add Order / Asset Related Lists to Account
Setup → Object Manager → Account → Page Layouts. Add to the related lists section:
- Orders
- Assets
Without these, the console snapshots render empty.

### Step 5: Configure Knowledge (if used)
- Setup → Knowledge → enable
- Assign Knowledge user permissions to CSRs
- Ensure object permissions on `KnowledgeArticleVersion`
- Categorize or assign data category groups so relevant articles surface in the console

### Step 6: Configure Identity Verification
Use the preconfigured **Verify Customer Identity** flow that ships with Manufacturing Service Excellence, or clone and customize. Setup → Flows → activate the chosen flow.

### Step 7: Configure Engagement / CTI (if applicable)
- Salesforce Open CTI for softphone integration (Service Cloud Voice or partner BYOT)
- Use Engagement Connect APIs to link the softphone session to an `EngagementInteraction` so an interaction record is automatically created on inbound call
- See Set Up Service Cloud Voice with Partner Telephony for BYOT setup

### Step 8: Assign Permission Sets
Setup → Permission Sets:

| Permission Set | Audience |
|---------------|----------|
| Industries Service Excellence | Admins |
| Service Console for Manufacturing | CSRs |
| OmniStudio Admin | Admins (for Record Alerts) |
| OmniStudio User | End users running OmniScripts |

```bash
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<PSId>" \
  --target-org <alias>
```

### Step 9: Customize Console Components
Use Lightning App Builder:
- Update preconfigured Timeline to show Sales Agreements / Cases / Work Orders along with engagement interactions
- Configure Record Alerts based on business rules (warranty expiring in 30 days, asset health score < 70, delayed order > 2 days)
- Configure Actions & Recommendations to point at specific flows (Create Case, Renew Warranty, Schedule Service)
- Add the Knowledge component to a custom Lightning console app if needed
- Add Action Launcher (manually) if you have configured one — it lists Salesforce Flows, OmniScripts, and Quick actions
- Add Events and Milestones component to Account / Contact / Asset record pages where milestone tracking is relevant

### Step 10: Test the Console as a CSR
- Log in as a CSR test user
- Trigger an inbound call (or simulate Engagement Interaction creation)
- Walk the Identity Verification flow
- Confirm Timeline, Alerts, Orders, Cases, Assets all populate
- Click an action from Actions & Recommendations
- Search Knowledge

## Validation Checklist

- [ ] Manufacturing Cloud for Service PSL active and assigned
- [ ] Industries Service Excellence PSL active and assigned to admins
- [ ] OmniStudio Standard Runtime enabled
- [ ] Timeline enabled with at least one configuration
- [ ] Order and Asset related lists on Account page layout
- [ ] Knowledge enabled and CSRs have Knowledge user permission
- [ ] Verify Customer Identity flow active
- [ ] Engagement / CTI integration tested (if applicable)
- [ ] CSR test user can launch console and see all components populated

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Service Console for MFG app missing from App Launcher | PSL not assigned, or app permission missing | Assign Service Console for Manufacturing permission set |
| Record Alerts component blank | Standard OmniStudio Runtime off | Setup → OmniStudio Settings → enable |
| Timeline shows nothing | Timeline disabled, or no Engagement Interaction records | Enable Timeline; verify EngagementInteraction records exist |
| Orders / Cases / Assets snapshots empty | Related lists missing on Account page layout | Add Orders, Assets, Cases related lists |
| Identity Verification does not run | Verify Customer Identity flow inactive | Setup → Flows → activate |
| CTI doesn't create Engagement Interaction | Engagement Connect API not wired up | Configure Engagement Connect to link softphone to EngagementInteraction |
| Knowledge component shows no articles | Article version inactive, or data categories not assigned | Publish articles, assign data categories matching the user's profile |
| Actions & Recommendations shows nothing | No flows pointed at console actions | Configure flows; set component properties to reference them |
| Audit Trail empty | Identity Verification not run, or audit records not enabled | Run Verify Customer Identity flow at least once |
| Alerts component shows wrong alerts | Alert criteria not refreshed, or wrong configuration assigned | Review Record Alert configuration; rerun any DPE that calculates alerts |
| Asset Service Console not showing milestones | Events and Milestones component missing | Add component to Asset record page |

## Extending the Console

- Add a Timeline to **Account** page showing Work Orders and Service Appointments
- Add Record Alerts to **Sales Agreement** page warning about expiry and below-target compliance
- Add Knowledge to a custom **Cases** console app
- Build a **Work Order Quoting** experience by combining Pre-Work Estimation OmniScripts + Document Generation
- Integrate **Asset Coverage View** to surface warranty / contract entitlements when creating work orders

## Related Modules

- **Asset Service Lifecycle** — Asset Service Console for Manufacturing, fleets, milestones, work order estimation, parts return
- **Warranty Management** — Claims and adjudication that originate from the console
- **Inventory Management** — searches and transfers triggered from work orders
- **Pre-Work Estimation** — OmniStudio app for in-field estimation, accessible alongside the console
