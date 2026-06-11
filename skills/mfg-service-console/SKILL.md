---
name: mfg-service-console
description: Expert guidance on Manufacturing Cloud Service Console for Manufacturing — preconfigured Lightning console app, Service Console Components (Timeline, Record Alerts, Actions & Recommendations, Knowledge, Identity Verification, Audit Trail), Engagement Interactions, CTI integration, and customization. Use when user asks about Service Console, console components, Identity Verification flow, Engagement Interaction, EngagementInteraction object, customizing the timeline, OmniStudio Standard Runtime, or making the console show specific records.
---

# Service Console for Manufacturing

A preconfigured Lightning Console app and a suite of reusable **Service Console Components** that give CSRs a 360° view of a customer in one screen.

## What's Bundled

- Contact Details
- Timeline (Interaction Timeline anchored to Contact)
- Record Alerts
- Orders / Cases / Assets snapshots for the parent account
- Actions & Recommendations
- Knowledge
- Identity Verification (preconfigured Verify Customer Identity flow)
- Audit Trail

## Prerequisites

- Manufacturing Cloud for Service PSL
- Industries Service Excellence PSL
- OmniStudio Standard Runtime enabled
- Timeline enabled
- Knowledge enabled (if Knowledge component used)
- Order + Asset related lists on Account page layout

## Key Objects

| Object | Purpose |
|--------|---------|
| `EngagementInteraction` | The interaction (call/chat/email) |
| `EngagementAttendee` | Who's on the interaction |
| `EngagementTopic` | Reason for the interaction |
| `Case` | Service case |
| `Asset` | Customer asset |
| `Order` | Order at the parent account |
| `IdentityVerification` | Audit log entry from Verify Customer Identity flow |
| `KnowledgeArticleVersion` | Knowledge article shown in the console |

## Permission Sets

| Permission Set | Audience |
|---------------|----------|
| Industries Service Excellence | Admins (configure components) |
| Service Console for Manufacturing | CSRs (use the app) |
| OmniStudio Admin | Required to view Record Alerts |
| Manufacturing Cloud for Service | PSL anchor |

## Component Reusability

All Service Console Components can be added to other pages via Lightning App Builder. Common extensions:
- Timeline on Account showing Work Orders
- Record Alerts on Sales Agreement
- Actions & Recommendations on Asset

## Common SOQL

```sql
-- Recent engagement interactions
SELECT Id, Subject, Status, CommunicationChannel, StartDateTime, EndDateTime,
       OwnerId, Owner.Name
FROM EngagementInteraction
ORDER BY StartDateTime DESC
LIMIT 50

-- Identity verifications today
SELECT Id, Status, ContactId, Contact.Name, CreatedDate
FROM IdentityVerification
WHERE CreatedDate = TODAY

-- Cases queued for an account
SELECT Id, CaseNumber, Subject, Status, Priority, OwnerId
FROM Case
WHERE AccountId = '<id>' AND IsClosed = false
ORDER BY CreatedDate DESC
```

## Troubleshooting Cheatsheet

| Symptom | First Check |
|---------|-------------|
| App missing from App Launcher | Service Console for Manufacturing permission set not assigned |
| Record Alerts blank | OmniStudio Standard Runtime off |
| Timeline empty | Timeline disabled / no EngagementInteraction records |
| Orders / Cases / Assets empty | Related lists not on Account page layout |
| Identity Verification does not start | Verify Customer Identity flow inactive |
| CTI not auto-creating interaction | Engagement Connect APIs not configured |
| Knowledge not surfacing articles | Articles inactive or wrong data category for user profile |

## Extending Patterns

- Customize the Interaction Timeline to include Sales Agreements
- Configure alerts based on warranty term expiry, asset health score, delayed order count
- Wire Actions & Recommendations to specific Flows for Create Case, Renew Warranty, Schedule Service Appointment
- Add Knowledge to other console apps (Cases console)

## When to Use This Skill

- New Service track rollout
- Console showing blank components
- CTI / Service Cloud Voice integration
- Identity Verification flow customization
- Adding console components to non-standard pages
- Diagnosing CSR performance issues tied to the console

## Detailed Documentation

Use `get_mfg_module_docs` with slug `service-console`.
