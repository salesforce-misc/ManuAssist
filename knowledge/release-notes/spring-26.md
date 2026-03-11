# Spring '26 Release Notes — Manufacturing Cloud

## Key Features

### Agentforce for Manufacturing Cloud (GA)
- Account Manager Agent now generally available
- Pre-built topics and actions for common account manager workflows
- Einstein Studio integration for custom agent configuration
- Support for Sales Agreement review, forecast adjustment, and account health check via natural language

### Sales Agreements Enhancements
- Weighted revenue split across multiple products in a single Sales Agreement
- Shared territory quotas for collaborative account management
- Improved batch job performance for actuals synchronization
- New Sales Agreement cloning API for rapid contract replication

### Advanced Account Forecasting
- New AAF dashboard with period-over-period comparison charts
- Enhanced DPE template library with pre-built manufacturing KPI measures
- Support for quarterly and annual forecast periods alongside monthly
- Account Manager Targets rollup to sales hierarchy

### Partner Visit Management
- Dynamic Action Plans based on distributor tier or account segment
- Improved offline support for visit completion on mobile
- Push notification integration for visit reminders
- New bulk visit import API for territory-wide scheduling

### Warranty & Asset Management
- Product Service Campaigns for proactive recall and notice management
- Enhanced `Asset` timeline with warranty and service history
- Inventory Management integration with warranty claim parts fulfillment
- BRE (Business Rules Engine) version management for adjudication rules

### MuleSoft Integration Improvements
- Manufacturing Cloud Accelerator for MuleSoft updated with new ERP connectors
- Pre-built SAP S/4HANA actuals sync templates for Sales Agreements
- Enhanced Oracle NetSuite integration for inventory data

## API Changes

- New `MfgProgram` REST API endpoints for program management
- Enhanced `Visit` and `ActionPlan` Tooling API support
- `SalesAgreementProduct` bulk upsert performance improvements
- New `AcctMgrTarget` history tracking API

## Deprecations

- Legacy forecast period generation via manual UI (use DPE batch jobs)
- Classic Sales Agreement list views (use Lightning App Builder pages)

## Known Issues

- AAF batch job may timeout for orgs with 1,000+ account manager target records
- Sales Agreement actuals sync may experience delays if ERP integration has high latency
