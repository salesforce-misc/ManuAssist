---
name: mfg-asset-service-lifecycle
description: Expert guidance on Manufacturing Cloud Asset Service Lifecycle — Asset Service Console, Pre-Work Estimation, Connected Assets, Fleet Management, Asset Hierarchy, Asset Coverage, Product Service Campaigns, Service Parts Return, Timesheet Automation, Asset Account/Contact Participants. Use when user asks about Asset records, AssetWarranty, AssetMilestone, ProductServiceCampaign, Fleet, FleetAsset, FleetParticipant, ParentAssetId hierarchy, Pre-Work Estimation OmniScript, Connected Assets / telematics, or Service Part Return.
---

# Manufacturing Cloud Asset Service Lifecycle

End-to-end management of an asset's life — sale, install, warranty, work, claims, recalls, end-of-life — anchored by the **Asset Service Console for Manufacturing**.

## What's in Scope

- Asset Service Console for Manufacturing
- Pre-Work Estimation (mobile OmniScript app)
- Connected Assets (telematics via Data Cloud)
- Work Order Estimation (Salesforce Pricing)
- Product Service Campaigns (recalls / upgrades)
- Asset Interactive Hierarchy
- Asset Coverage View
- Service Parts Return
- Timesheet Automation & Labor Cost Association
- Asset Account / Contact Participants
- Fleet Management

## Key Objects

| Object | Purpose |
|--------|---------|
| `Asset` | Product instance |
| `AssetAccountParticipant` | Accounts associated with the asset |
| `AssetContactParticipant` | Contacts associated with the asset |
| `AssetWarranty` | Warranties on the asset |
| `AssetMilestone` | Lifecycle milestones |
| `Claim` / `ClaimItem` / `ClaimCoverage` / `ClaimCoveragePaymentDetail` | Warranty claim chain |
| `WorkOrder` / `WorkOrderLineItem` | Service work |
| `ReturnOrder` / `ReturnOrderLineItem` / `ReturnOrderItemAdjustment` | Service parts return |
| `Fleet` / `FleetAsset` / `FleetParticipant` | Fleet management |
| `ProductServiceCampaign` / `ProductServiceCampaignItem` | Recall / upgrade campaign |

## Asset Service Console vs. Service Console

| | Service Console for MFG | Asset Service Console for MFG |
|---|---|---|
| Anchor | Contact | Asset |
| Timeline | Engagement Interactions | Work Orders / WOLIs |
| Identity Verification | Yes | No |
| Audit Trail | Yes | No |
| Knowledge | Yes | No |
| Milestones | No | Yes |

## Pre-Work Estimation Setup

A Lightning App Page (NOT delivered preconfigured) named **Pre-Work Estimation** with an OmniScript component:
- Type: `team`
- Subtype: `createOrder`
- Theme: `Newport`

Add to mobile navigation. Field techs use Mobile Only mode in the Salesforce mobile app.

## Fleet Status Values

`FleetAsset.Status`: Registered, Active, Assigned, Under Maintenance, Out of Service, Inactive

`Fleet.ActiveAssetCount` only counts assets where `FleetAsset.Status = 'Active'`.

## Constraints

- Record Alerts work for Fleet, NOT FleetAsset or FleetParticipant
- Action Plan Templates can target Fleet
- Fleet objects are available to Experience Cloud users
- Service Part Return quantity ≤ claim coverage payment detail or WOLI quantity
- Connected Assets requires Data Cloud subscription

## Common SOQL

```sql
-- Asset hierarchy depth
SELECT Id, Name, ParentAssetId, Account.Name, SerialNumber
FROM Asset
WHERE Account.Name = '<account>'
ORDER BY ParentAssetId NULLS FIRST, Name

-- Active fleets and asset counts
SELECT Id, Name, FleetType, Status, ActiveAssetCount FROM Fleet WHERE Status = 'Active'

-- Open claims for an asset
SELECT Id, ClaimNumber, Status, AccountId, StartDate FROM Claim
WHERE AssetId = '<id>' AND Status NOT IN ('Closed', 'Cancelled')

-- Asset milestones
SELECT Id, AssetId, MilestoneTypeId, ActualCompletionDate FROM AssetMilestone

-- Recall campaign coverage
SELECT ProductServiceCampaign.Name, COUNT(Id) impactedAssets
FROM ProductServiceCampaignItem
GROUP BY ProductServiceCampaign.Name
```

## Troubleshooting Cheatsheet

| Symptom | First Check |
|---------|-------------|
| Asset Service Console missing from App Launcher | App not activated for user's profile |
| Asset Timeline empty | No WOLIs on asset, or Timeline component not on page |
| Pre-Work Estimation app missing in mobile menu | Lightning page not added to Mobile Navigation |
| Pre-Work Estimation OmniScript fails to load | Wrong Type/Subtype/Theme on component (use team/createOrder/Newport) |
| Email PDF button missing in Pre-Work app | OrderDetails Document Template missing |
| Service Parts Return rejects quantity | Exceeds claim coverage payment detail or WOLI quantity |
| Fleet alert won't save on FleetAsset | Alerts only supported on Fleet, not children |
| Choose Coverage button missing | Not added to Case / Work Order page layout |
| Connected Assets ingestion silent | Data Cloud connector not configured |

## When to Use This Skill

- Service track rollout
- Standing up Pre-Work Estimation
- Onboarding fleets
- Configuring recall / upgrade campaigns
- Setting up Asset Coverage on cases
- Diagnosing parts-return mismatches
- Wiring Connected Assets to Data Cloud
- Building the asset interactive hierarchy

## Detailed Documentation

Use `get_mfg_module_docs` with slug `asset-service-lifecycle`.
