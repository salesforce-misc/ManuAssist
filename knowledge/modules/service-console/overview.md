# Service Console for Manufacturing — Overview

The Service Console for Manufacturing is the customer-service workspace that ties together identity verification, customer interaction history, alerts, related records (orders, cases, assets), recommended actions, and knowledge — so a CSR can resolve issues and upsell from a single page.

It is a preconfigured Lightning Console app delivered with Manufacturing Cloud and powered by reusable **Service Console Components** that you can extend or drop onto other pages.

## What's Included

The Service Console for Manufacturing app includes these preconfigured components:

| Component | Purpose |
|-----------|---------|
| **Contact Details** | Customer contact card |
| **Timeline (Interaction Timeline)** | Chronological view of engagement interactions tied to the contact |
| **Alerts (Record Alerts)** | Contextual alerts about the customer (warranty expiring, asset issue, delayed order) |
| **Orders for Parent Account** | Account-scoped order list |
| **Cases for Parent Account** | Open / recent cases |
| **Assets for Parent Account** | Asset roster |
| **Actions & Recommendations** | Configurable flow-driven action launcher |
| **Knowledge** | Search and present knowledge articles |
| **Identity Verification** | Preconfigured "Verify Customer Identity" flow |
| **Audit Trail** | Identity verification log |

## Sister: Asset Service Console for Manufacturing

A separate but related console focused on a single Asset (instead of a Contact). See `asset-service-lifecycle` module for details. Both consoles share many components.

## Component Compatibility Matrix

| Capability | Service Console for MFG | Asset Service Console for MFG | Reusable on Other Pages? |
|------------|:----------------------:|:-----------------------------:|--------------------------|
| Identity Verification | Yes | No | Yes |
| Record Alerts | Yes | Yes | Yes |
| Timeline | Yes (Interaction Timeline) | Yes (Asset Timeline) | Yes |
| Audit Trail | Yes | No | No |
| Actions & Recommendations | Yes | Yes | Yes |
| Action Launcher | No (manual add) | No (manual add) | Yes |
| Knowledge | Yes | No | Yes |
| Milestones | No | Yes | Yes |

## Key Objects & Capabilities

| Object | Purpose |
|--------|---------|
| `EngagementInteraction` | A single CSR-customer interaction (call, chat, email) |
| `EngagementAttendee` | Attendee on the interaction (contact, user) |
| `EngagementTopic` | Topic / reason for the interaction |
| `Case` | Standard service case |
| `KnowledgeArticleVersion` | Knowledge article served by the Knowledge component |
| `Asset` | Customer-owned product instance |
| `Order` | Customer order tied to the account |
| `IdentityVerification` | Identity verification record (logged in Audit Trail) |

## Permission Sets

| Permission Set | What It Grants |
|---------------|----------------|
| **Industries Service Excellence** | Admin access to objects and features for Industries Service Excellence |
| **Service Console for Manufacturing** | User access to the console app |
| **OmniStudio Admin** | Required to view Record Alerts (per setup prereq) |
| **OmniStudio User** | End-user access to OmniScript-driven components |
| **Manufacturing Cloud for Service** | PSL underpinning everything |

## Integration Points

- **CTI / Service Cloud Voice** — softphone integrates with identity verification flow; Engagement Connect APIs auto-create `EngagementInteraction` on inbound call
- **Knowledge** — standard Salesforce Knowledge with permission set + object permission setup
- **OmniStudio** — Record Alerts and other components require Standard OmniStudio Runtime
- **Pre-Work Estimation** — separate mobile app, available alongside Service Console; see `asset-service-lifecycle`

## Console Workflow (CSR's Day)

```
Inbound call (CTI) → Engagement Interaction record created
        ↓
Identity Verification flow
        ↓
Audit Trail entry logged
        ↓
Console opens on Contact record
        ├── Timeline: prior interactions
        ├── Alerts: warranty expiring, asset overheating, delayed order
        ├── Account snapshots: orders, cases, assets
        └── Actions & Recommendations: Create Case, Schedule Service, Sell Extended Warranty, Buy Renewal
        ↓
Resolve case / log activity / create child records
```

## Customizing the Console

Service Console Components are **versatile** — they can be:
- Customized within the preconfigured consoles (e.g., add Sales Agreements to the timeline)
- Added to other standard pages (e.g., Account record page → Timeline of Work Orders)
- Configured individually for different use cases

Use **Lightning App Builder** to drop components onto custom pages and configure their properties.

## Common Pitfalls

- Forgetting to enable Standard OmniStudio Runtime — Record Alerts and other components render blank
- Leaving the **Industry Service Excellence** PSL unassigned — admins can't configure components
- Anchoring Timeline to the wrong object (defaults to Contact, often needs Account or Asset)
- Not adding Order / Asset related lists to Account page layout — console snapshots show empty
- Mismatched CTI configuration — Engagement Interaction not auto-created on inbound call

See `configuration.md` for setup steps and troubleshooting.
