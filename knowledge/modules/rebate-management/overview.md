# Rebate Management — Overview

Rebate Management enables manufacturers to define, track, and pay incentive programs for distributors and dealers. It handles volume-based rebates, tiered payouts, partner special pricing agreements, and aggregated claim calculation — eliminating manual spreadsheet-based rebate tracking.

## Business Value

- Define rebate programs with flexible payout structures (volume tiers, flat rates, percentage-based)
- Automatically aggregate sales data to calculate earned rebates per partner
- Manage partner special pricing agreements and associated benefits
- Track rebate claims, approvals, and payment processing in one system
- Provide partners with visibility into their earned and projected rebates

## Key Objects

| Object | Purpose |
|--------|---------|
| `RebateProgram` | Defines the rebate program — type, period, payout structure |
| `RebateProgramMember` | Enrollment of a partner (account) in a rebate program |
| `RebateProgramPayoutPeriod` | Defines the payout period within a program |
| `RebateProgramMemberPayout` | Calculated payout for a specific member in a period |
| `RebateClaim` | A claim submitted against earned rebates |
| `RebateClaimAdjustment` | Manual adjustment to a rebate claim |
| `RebateMemberAggregateItem` | Aggregated transaction data per member for rebate calculation |
| `RebateMemberClaimAggregate` | Consolidated claim aggregate per member |
| `RebateMemberProductAggregate` | Product-level aggregate data for a program member |
| `RebatePayment` | Payment record for an approved rebate claim |
| `RebatePayoutAdjustment` | Adjustment to a payout after calculation |
| `RebatePartnerSpecialPrcTrm` | Partner special pricing term (e.g., contract pricing) |
| `RebatePtnrSpclPrcTrmBnft` | Benefits associated with a partner special pricing term |

## Program Types

| Type | How It Works |
|------|-------------|
| Volume Rebate | Partner earns rebate when purchases exceed a threshold |
| Tiered Rebate | Payout percentage increases as purchase tiers are hit |
| Flat Rate | Fixed rebate per unit purchased |
| Special Pricing | Negotiated price reductions tracked as rebate credits |

## Rebate Calculation Flow

```
Sales Transactions (Orders / ERP data)
        ↓
RebateMemberAggregateItem (aggregated purchase data)
        ↓
Rebate Calculation Engine (evaluates tiers and thresholds)
        ↓
RebateProgramMemberPayout (calculated earned amount)
        ↓
RebateClaim (submitted for approval)
        ↓
RebatePayment (disbursed to partner)
```

## Permission Sets Required

| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers viewing partner rebate status |
| `RebateManagementUser` | Rebate program administrators |

## SOQL Quick Reference

```sql
-- Active rebate programs
SELECT Id, Name, Status, StartDate, EndDate, RebateType
FROM RebateProgram
WHERE Status = 'Active'
ORDER BY EndDate ASC

-- Program members (enrolled partners)
SELECT Id, RebateProgramId, RebateProgram.Name, MemberId, Member.Name, Status
FROM RebateProgramMember
WHERE Status = 'Active'
ORDER BY RebateProgram.Name

-- Member payouts by period
SELECT Id, RebateProgramMemberId, RebateProgramMember.Member.Name,
       PayoutPeriodId, CalculatedAmount, Status
FROM RebateProgramMemberPayout
ORDER BY CreatedDate DESC LIMIT 50

-- Open rebate claims
SELECT Id, Name, Status, RebateProgramMemberId, ClaimAmount, SubmittedDate
FROM RebateClaim
WHERE Status NOT IN ('Paid', 'Cancelled')
ORDER BY SubmittedDate DESC

-- Partner aggregate data — top earners
SELECT MemberId, Member.Name, TotalPurchaseAmount, EarnedRebateAmount
FROM RebateMemberClaimAggregate
ORDER BY EarnedRebateAmount DESC LIMIT 20

-- Rebate payments processed this year
SELECT Id, RebateClaimId, PaymentAmount, PaymentDate, Status
FROM RebatePayment
WHERE PaymentDate = THIS_YEAR
ORDER BY PaymentDate DESC

-- Partner special pricing terms
SELECT Id, Name, AccountId, Account.Name, StartDate, EndDate, Status
FROM RebatePartnerSpecialPrcTrm
WHERE Status = 'Active'
ORDER BY Account.Name
```
