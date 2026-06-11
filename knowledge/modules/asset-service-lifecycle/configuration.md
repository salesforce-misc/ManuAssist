# Asset Service Lifecycle — Configuration & Troubleshooting

## Prerequisites

- General Settings configured (`general-settings`)
- Service Console for Manufacturing set up (`service-console`)
- Manufacturing Cloud for Service PSL active
- Industries Service Excellence PSL active
- Warranty Lifecycle Management Psl active (for warranty / claim flows)
- Claims Management Foundation PSL active (for participants and parts return)
- (Optional) Data Cloud subscription for Connected Assets

## Configuration Steps

### Step 1: Verify Asset Service Console Access
Setup → App Manager. Confirm **Asset Service Console for Manufacturing** is present. Activate for relevant profiles.

### Step 2: Assign Asset Service Permission Sets
```bash
sf data create record --sobject PermissionSetAssignment \
  --values "AssigneeId=<UserId> PermissionSetId=<ServiceConsoleforManufacturingId>" \
  --target-org <alias>
```

Required permission sets per role:
- **CSR / warranty adjudicator** — Service Console for Manufacturing + Claims Management Foundation
- **Service technician** — OmniStudio User + DocGen Runtime User (for Pre-Work Estimation)
- **Field manager** — Use Fleet Management Features + Fleet Management
- **Service admin** — Industries Service Excellence + Claims Management Foundation

### Step 3: Configure Asset Page Layout
Setup → Object Manager → Asset → Page Layouts. Add:
- **Asset Timeline** component (Lightning App Builder)
- **Record Alerts** component
- **Actions & Recommendations** component
- **Events and Milestones** component (Asset record page only)
- **Warranties View** + **Contracts View** components (for Asset Coverage)
- Related lists: Asset Account Participants, Asset Contact Participants, Asset Warranties, Cases, Work Orders, Claim Items

### Step 4: Configure Asset Account Participant Picklist
Object Manager → Asset Account Participant → Fields → Stakeholder Role → Add picklist values: `Financier`, `Customer`, `Sales Dealer`, `Supplier`, etc.

### Step 5: Configure Asset Contact Participant Picklist
Object Manager → Asset Contact Participant → Fields → Stakeholder Role → Add: `Technician`, `Owner`, `Finance Manager`, etc.

### Step 6: Set Up Asset Interactive Hierarchy
- Asset records use `ParentAssetId` to model parent-child structure
- Asset Interactive View renders the tree on Asset detail (desktop or Field Service mobile)
- Service techs can replace / relocate children from this view

### Step 7: Set Up Asset Coverage View
On Case + Work Order page layouts, add buttons:
- **Choose Coverage** (desktop)
- **Select Coverage** (mobile)
On Asset record page, add **Warranties View** and **Contracts View** components.

### Step 8: Set Up Pre-Work Estimation App
1. Setup → User Interface → **Lightning App Builder** → New → App Page → Label `Pre-Work Estimation`
2. One Region layout → drop **OmniScript** component
3. Properties:
   - Type: `team`
   - Subtype: `createOrder`
   - Theme: `Newport`
   - Display: `Display OmniScript on page`
   - Language: `English`
   - Direction: `Left to Right`
4. Save → Activate
5. In Lightning Experience apps, add to Manufacturing app
6. In Mobile Navigation, add to mobile menu (recommend Mobile Only navigation)
7. Setup Document Generation (optional):
   - Foundation Document Generation enabled
   - `OrderDetails` Document Template record exists
   - Assign DocGen Designer + DocGen Runtime User PS

### Step 9: Configure Fleet Management
Setup → Fleet Management → Enable.

Create fleets:
- App Launcher → Fleets → New → Type (Employee/Material/Executive/Commercial), Status (Active)

Add assets:
- App Launcher → Fleet Assets → New → Asset + Fleet + dates + Status

Add participants:
- App Launcher → Fleet Participants → New → Participant (Account/Contact/User) + Role + Status

### Step 10: Configure Service Parts Return
- Assign **Service Part Return Management** + **Warranty Lifecycle Management Psl** permission sets
- Add **New Service Part Return** quick action to Claim and Work Order page layouts
- Ensure work orders have product + price book + line items + service appointment associations

### Step 11: Configure Product Service Campaign (Recalls / Upgrades)
- Assign Service Manager permissions
- Build a `ProductServiceCampaign` record with criteria for impacted assets
- Use bulk work order creation on `ProductServiceCampaignItem` to schedule services

### Step 12: Connect Telematics (Connected Assets — optional)
- Requires Data Cloud subscription
- Configure Data Cloud connector for asset telemetry
- Enable Connected Assets in Setup → Manufacturing Settings
- Set up event detection and Salesforce action triggers (e.g., create Case when ambient temp > threshold)

## Validation Checklist

- [ ] Asset Service Console app accessible
- [ ] Asset record page customized with required components
- [ ] Asset participant picklists populated
- [ ] Asset Coverage components on Case / Work Order page layouts
- [ ] Pre-Work Estimation Lightning page activated and added to apps
- [ ] Fleet Management enabled (if in scope)
- [ ] Permission sets assigned by role
- [ ] At least one test asset has milestones, warranty, work order, related case

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Asset Service Console not in App Launcher | App not activated for user's profile | App Manager → activate |
| Asset Timeline empty | No work orders on asset, or Timeline not added to Asset page | Add Asset Timeline component via Lightning App Builder |
| Milestones component missing | Events and Milestones component not added to Asset page | Add via Lightning App Builder |
| Asset Account Participant won't save | Picklist value missing on Stakeholder Role | Object Manager → add picklist value |
| Asset hierarchy graph empty | No `ParentAssetId` set on child assets | Build hierarchy by setting Parent Asset on child records |
| Pre-Work Estimation app missing in mobile menu | Page not added to Mobile Navigation in App Builder | Edit Lightning page → Page Settings → Mobile Navigation |
| Pre-Work Estimation OmniScript fails | Type/Subtype/Theme mismatch on OmniScript component | Set Type=team, Subtype=createOrder, Theme=Newport |
| Email PDF button missing | Document Generation prereq missing — `OrderDetails` template absent | Create OrderDetails Document Template |
| Service Parts Return rejects quantity | Quantity > claim coverage payment detail / WOLI quantity | Reduce quantity or split return |
| Fleet record alert won't save | Alerts not supported for FleetAsset or FleetParticipant | Set alert at Fleet level instead |
| Active Asset Count on Fleet incorrect | Counts only FleetAsset with `Status = 'Active'` | Update FleetAsset records to Active |
| Connected Assets not ingesting telemetry | Data Cloud not configured, or Connected Assets toggle off | Configure Data Cloud connector + enable in Manufacturing Settings |
| Choose Coverage button missing on Case | Button not added to Case page layout | Setup → Object Manager → Case → add Choose Coverage button |
| Service tech can't generate estimate | Missing OmniStudio User or DocGen Runtime User permission | Assign both PS to user |

## Best Practices

- Build the Asset Hierarchy early — many lifecycle features (Coverage, Recalls) cascade from parent assets
- Standardize Stakeholder Role picklists at the org level so participant data is consistent
- Use Action Plan Templates with Fleet as target for recurring fleet maintenance schedules
- Pre-create Document Templates before enabling Pre-Work Estimation
- Audit Connected Assets event-action mappings quarterly so ingestion stays trusted
- Use Asset Coverage View systematically on every work order to avoid double-billing
- Use Product Service Campaigns for any recall — never bulk-create work orders by hand
