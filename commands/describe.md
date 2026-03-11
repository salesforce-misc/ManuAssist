---
description: Describe a Salesforce object to see its fields and metadata
---

# Describe Salesforce Object

Get detailed metadata about a Salesforce object including all fields, types, and properties.

$ARGUMENTS

## Steps

1. Verify org connection with `check_mfg_setup`

2. If an object name was provided in arguments:
   - Use `describe_sobject` to get metadata
   - Display fields in a formatted table

3. If no object specified:
   - Ask which object to describe
   - Suggest starting points:
     - `SalesAgreement` - Run-rate business agreements
     - `WarrantyTerm` - Warranty term definitions
     - `WarrantyClaim` - Warranty claims
     - `AccountForecast` - Account-level forecast records
     - `Visit` - Partner visit records
   - Note: Manufacturing Cloud uses standard platform object names — always use `describe_sobject` to discover the actual schema in your org

4. Highlight key field information:
   - Required fields
   - Field types
   - Updateable status
   - Picklist values (if applicable)

5. Provide tips for common operations with the object

Format output for easy reference when building queries or integrations.
