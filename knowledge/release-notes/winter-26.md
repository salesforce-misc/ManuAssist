# Winter '26 Release Notes — Manufacturing Cloud

## Key Features

### Agentforce for Manufacturing Cloud (Beta)
- Introduction of Account Manager Agent for Manufacturing Cloud
- Pre-built topics: Sales Agreement Review, Forecast Adjustment, Account Health Check
- Pre-built actions: Update Sales Agreement Status, Log Account Visit, Adjust Forecast Period
- Einstein Studio configuration for agent customization
- Available for web app (desktop) only

### Sales Agreements Enhancements
- Improved planned vs. actual revenue tracking with real-time actuals sync
- Enhanced Sales Agreement activation workflow with multi-level approval support
- Bulk status update for Sales Agreements via API
- New `SalesAgreementProductSchedule` API enhancements for period-level adjustments

### Advanced Account Forecasting (AAF) Updates
- DPE (Data Processing Engine) template improvements for custom measure calculations
- New batch job scheduling options for forecast period generation
- Enhanced Account Manager Targets with territory rollup support
- Improved forecast variance reporting

### Partner Visit Management
- Action Plan templates for standardized distributor/dealer visit workflows
- Enhanced visit scheduling with territory-based auto-assignment
- New OmniStudio integration for visit checklist completion on Experience Cloud
- Bulk visit creation via API

### Warranty Lifecycle Management
- Business Rules Engine (BRE) enhancements for automated claims adjudication
- Supplier Recovery workflow improvements
- New `WarrantyClaim` status lifecycle events for automation triggers
- Asset-to-warranty linking improvements

### User Management
- Simplified Manufacturing Cloud permission set assignment via Setup
- License capacity monitoring via API
- Improved role hierarchy for manufacturing org structures

## API Changes

- New `SalesAgreement` Connect API endpoints for bulk status management
- `AccountForecast` REST API enhancements for period-level adjustments
- Enhanced `diff_orgs` capability for Manufacturing Cloud configuration comparison
- New `AcctMgrTarget` bulk upsert support

## Deprecations

- Legacy Sales Agreement activation via record edit (use dedicated Activate button or API)
- Classic UI pages for Warranty Term setup (use Lightning Setup)
