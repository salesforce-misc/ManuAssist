# Asset Service Lifecycle — Overview

The Asset Service Lifecycle in Manufacturing Cloud manages every stage in an asset's life — from sale and installation through warranties, service appointments, work orders, claims, and end of life. The hub of this lifecycle is the **Asset Service Console for Manufacturing**.

## What's Covered

| Capability | Purpose |
|------------|---------|
| **Asset Service Console for Manufacturing** | 360° workspace per asset (milestones, alerts, related warranties / cases / work orders / claims) |
| **Pre-Work Estimation** | OmniStudio mobile app for technicians to generate quotes on site |
| **Connected Assets** | Telematics / IoT data ingestion via Data Cloud — health scores, predictive maintenance |
| **Work Order Estimation** | Quote generation for service work (uses Salesforce Pricing) |
| **Product Service Campaign** | Recall, upgrade, or repair campaigns at scale |
| **Asset Interactive Hierarchy (AIH)** | Tree visualization of asset structure (parent/child) |
| **Asset Coverage View** | Eligible warranties / contracts / maintenance plans for an asset |
| **Service Parts Return** | Return defective parts associated with a claim or work order |
| **Timesheet Automation & Labor Cost Association** | Validate technician time against labor rules |
| **Asset Account / Contact Participants** | Track all accounts / contacts associated with an asset |
| **Fleets** | Manage groups of assets together |

## Asset Service Console for Manufacturing

CSRs, warranty adjudicators, service techs, and field managers use this console to act on a single asset.

### Preconfigured Components

| Component | Behavior |
|-----------|----------|
| **Asset header** | Asset Number, Serial No, Account, Contact, Quantity |
| **Alerts** | Pending Service Appointment, Warranty Expiring, etc. |
| **Milestones** | Manufactured / Order Received / Delivered / Installed / Sold (key lifecycle events) |
| **Asset Timeline** | Work Orders + Work Order Line Items related to the asset |
| **Actions & Recommendations** | Configurable actions: Add to Action Plan, Verify Identity, Reset Password, etc. |
| **Tabs**: Overview, Details, Warranties, Cases, Work Orders, Claims |

### Asset Service Console vs. Service Console for Manufacturing

| | Service Console for MFG | Asset Service Console for MFG |
|---|---|---|
| Anchor object | Contact | Asset |
| Timeline | Engagement Interactions | Work Orders / Work Order Line Items |
| Includes Identity Verification | Yes | No |
| Includes Audit Trail | Yes | No |
| Includes Knowledge | Yes | No |
| Includes Milestones | No | Yes |

## Key Objects

| Object | Purpose |
|--------|---------|
| `Asset` | Customer-owned product instance |
| `Asset.ParentAssetId` | Asset Interactive Hierarchy parent link |
| `AssetAccountParticipant` | Account participants on an asset (supplier, customer, financier, sales dealer) |
| `AssetContactParticipant` | Contact participants (technician, owner, finance manager) |
| `AssetWarranty` | Warranties on the asset |
| `AssetMilestone` | Lifecycle milestone records |
| `WorkOrder` | Service work to be performed |
| `WorkOrderLineItem` | Line items on a work order |
| `Claim` | Warranty claim |
| `ClaimItem` | Specific asset on a claim |
| `ClaimCoverage` | Coverage applied to a claim |
| `ClaimCoveragePaymentDetail` | Per-charge breakdown of a claim payment |
| `ReturnOrder` | Service Parts Return order |
| `ReturnOrderLineItem` | Items on a return order |
| `ReturnOrderItemAdjustment` | Price adjustments on returned items |
| `Fleet` | Group of assets (employee fleet, material fleet, executive, commercial) |
| `FleetAsset` | Asset in a fleet (status: Registered, Active, Assigned, Under Maintenance, Out of Service, Inactive) |
| `FleetParticipant` | Account/Contact/User participating on a fleet (role: Driver, Maintenance Associate, Manager, Operations Manager) |
| `ProductServiceCampaign` | Campaign (recall / upgrade / repair) |
| `ProductServiceCampaignItem` | Asset enrolled in the campaign |

## Permission Sets

| Permission Set | Used For |
|----------------|----------|
| Service Console for Manufacturing | Use the console |
| Industries Service Excellence | Configure components |
| Claims Management Foundation | Asset Account/Contact Participants, Service Part Returns |
| Service Part Return Management | Create/manage part returns |
| Warranty Lifecycle Management Psl | Underpinning warranty / claim work |
| Use Fleet Management Features | Fleets, Fleet Assets, Fleet Participants |
| Fleet Management | Fleet user permission |

## Pre-Work Estimation Workflow

Field technicians generate quotes on site:

```
Service Tech (mobile)
  ├── Search and add products / jobs
  ├── Get total charges (Salesforce Pricing computes)
  ├── Get customer approval
  ├── Generate PDF (Document Generation)
  ├── Send estimate via email
  └── Finish service (creates draft Order)
        │
        └── Back-end: Manufacturing Service Quoting App
                ├── Get product / job details
                ├── Compute charges (price books)
                ├── Create draft Order
                ├── Documentation generation
                └── Email template with PDF attachment
```

### Pre-Work Estimation Prerequisites

- Account, Product, Pricebook records exist
- Each Product has at least one active PricebookEntry
- (Optional) Foundation Document Generation for PDF
- (Optional) `OrderDetails` Document Template record
- OmniStudio Admin + DocGen Designer permissions for admins
- OmniStudio User + DocGen Runtime User for field techs
- Lightning App Page named **Pre-Work Estimation** with the OmniScript component (Type=team, Subtype=createOrder, Theme=Newport)

## Fleet Management

Track operations of grouped assets (truck fleet, mobile equipment, power tools).

### Fleet Types
- Employee
- Material
- Executive
- Commercial

### Fleet Asset Status Values
- Registered, Active, Assigned, Under Maintenance, Out of Service, Inactive
- Active Asset Count on a Fleet record only counts `FleetAsset.Status = 'Active'`

### Fleet Considerations
- Record Alerts can be created for Fleet, but **not** for FleetAsset or FleetParticipant
- Action Plan Templates can be created with Fleet as the target object
- Fleet, Fleet Asset, Fleet Participant are available to Experience Cloud users

## Asset Coverage View

For a given asset, surface eligible:
- Asset Warranties
- Maintenance Plans
- Service Contracts

Add the **Choose Coverage** (desktop) and **Select Coverage** (mobile) buttons to Case and Work Order page layouts. Add **Warranties View** and **Contracts View** components to the Asset record page.

## Service Parts Return

Two creation paths:

1. **From a Claim** — only products listed in the claim coverage payment details can be returned; quantity bounded by claim payment detail
2. **From a Work Order** — only products in the work order line items can be returned; quantity bounded by work order line item quantity

Both paths auto-generate `ReturnOrder` + `ReturnOrderLineItem` records on the source's Details tab.

## Common Pitfalls

- Forgetting Industries Service Excellence PSL — admins can't configure console components
- Adding Asset Account / Contact Participant picklist values without Object Manager permissions
- Pre-Work Estimation app missing — must be created via Lightning App Builder; not delivered preconfigured
- Setting Fleet record alerts on FleetAsset (not supported)
- Service Part Return quantity > claim coverage payment detail quantity (rejected)
- Connected Assets without Data Cloud — telematics ingest won't work

See `configuration.md` for full setup.
