# Rebate Management — Configuration & Troubleshooting

## Prerequisites

- Manufacturing Cloud for Sales license with Rebate Management add-on
- Partner accounts (distributors/dealers) set up in Salesforce
- Order or transaction data available for rebate calculation

## Configuration Steps

### Step 1: Enable Rebate Management
Go to **Setup > Manufacturing Settings > Enable Rebate Management** and toggle on.

### Step 2: Create a Rebate Program
Navigate to **App Launcher > Rebate Programs > New**:

Required fields:
- **Name**: Program name (e.g., "Q1 2026 Volume Incentive")
- **Rebate Type**: Volume, Tiered, Flat Rate, Special Pricing
- **Start Date / End Date**: Program validity period
- **Status**: Draft (while configuring), then Active

### Step 3: Define Payout Periods
Create `RebateProgramPayoutPeriod` records within the program:
- Monthly, Quarterly, or Annual payout periods
- Each period triggers a calculation run at period close

### Step 4: Enroll Program Members
Create `RebateProgramMember` records for each participating partner:
1. Link the `RebateProgram` to the partner `Account`
2. Set member-specific thresholds or overrides (if different from program defaults)
3. Set `Status = Active`

### Step 5: Configure Calculation Rules
Depending on rebate type:
- **Volume**: Set the purchase threshold and rebate percentage
- **Tiered**: Define tier breakpoints and rates (e.g., $0–$100K = 2%, $100K–$500K = 3%)
- **Flat Rate**: Set rebate amount per unit
- **Special Pricing**: Link to `RebatePartnerSpecialPrcTrm` records

### Step 6: Load Transaction Data
Rebate calculation requires purchase transaction data:
- Load sales orders via ERP integration (MuleSoft Accelerator for Manufacturing)
- Or populate `RebateMemberAggregateItem` records directly via API / Data Loader

### Step 7: Run Rebate Calculation
At period close:
1. Trigger the rebate calculation job (manual or scheduled)
2. System creates `RebateProgramMemberPayout` records with calculated amounts
3. Review payouts for accuracy before submitting claims

### Step 8: Claims and Payment Processing
1. Create `RebateClaim` records from the calculated payouts
2. Submit for approval via standard Approval Process
3. On approval, create `RebatePayment` records to record disbursement
4. Use `RebateClaimAdjustment` for manual corrections

### Step 9: Assign Permission Sets
| Permission Set | Who Needs It |
|---------------|-------------|
| `ManufacturingSalesUser` | Account managers viewing partner rebate status |
| `RebateManagementUser` | Rebate program administrators |

## Validation Checklist

- [ ] Rebate Management enabled in Manufacturing Settings
- [ ] At least one active RebateProgram
- [ ] RebateProgramMember records for enrolled partners
- [ ] RebateProgramPayoutPeriod records defined
- [ ] RebateMemberAggregateItem data loaded for calculation
- [ ] RebateManagementUser permission set assigned

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Calculation returns zero payouts | No `RebateMemberAggregateItem` data loaded | Load transaction aggregates for the program period |
| Partners not receiving rebate visibility | Missing permission set or Experience Cloud access | Assign `RebateManagementUser`; configure partner portal |
| Payout amount incorrect | Tier thresholds or percentages misconfigured | Review program calculation rules and correct tier definitions |
| Claim stuck in pending | Approval process not configured | Set up Approval Process for `RebateClaim` object |
| Special pricing not applying | `RebatePartnerSpecialPrcTrm` not linked to member | Link partner special pricing terms to the program member |
| Duplicate aggregate records | Transaction data loaded twice | Check for duplicate `RebateMemberAggregateItem` records before calculation |
