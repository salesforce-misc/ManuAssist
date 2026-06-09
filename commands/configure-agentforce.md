---
description: Configure Agentforce for Manufacturing Cloud — AI-powered agents for inventory management, sales agreements, and asset service
---

# Configure Agentforce for Manufacturing Cloud

Interactive wizard to configure and deploy Agentforce agents for Manufacturing Cloud use cases.

## What This Command Does

Guides you through configuring AI-powered agents for Manufacturing Cloud including:
- **Agentforce for Inventory Management** — AI-powered product search and smart replenishment
- **Agentforce for Asset Service Management** — Proactive maintenance and service estimates
- **Agentforce for Manufacturing (Sales Agreements)** — Bulk updates and compliance tracking

## Steps

1. **Check prerequisites**:
   - Verify Einstein Generative AI is enabled
   - Check Manufacturing Cloud license and permissions
   - Validate user access to Agentforce Builder

2. **Ask the user which agent type to configure**:
   - Inventory Management
   - Asset Service Management
   - Sales Agreement Automation
   - All three (comprehensive setup)

3. **For each selected agent type**, guide through:

   ### Inventory Management Agent
   
   **Prerequisites Check**:
   - Query for ProductItem, SerializedProduct, ProductBatchItem records
   - Verify Asset Service Lifecycle Management is enabled
   - Check user has ManufacturingSalesUser or ManufacturingServiceUser permission set
   
   **Configuration**:
   - Create agent using Inventory Management template
   - Configure topics:
     - Search Products (natural language product search)
     - Check Stock Levels (real-time inventory queries)
     - Recommend Replenishment (smart restock suggestions)
     - Create Product Request (automate request creation)
   - Set up Data Library with ProductItem, Location objects
   - Configure actions for inventory search and replenishment
   - Test with sample queries
   - Deploy to Manufacturing Console
   
   **Sample Queries to Test**:
   ```
   - "Find hydraulic pumps with low stock"
   - "Which warehouse has the most engine oil?"
   - "Recommend replenishment for ProductX"
   - "Show me products below minimum quantity"
   ```

   ### Asset Service Management Agent
   
   **Prerequisites Check**:
   - Query for Asset records with service history
   - Verify Work Order object is accessible
   - Check user has appropriate service permissions
   
   **Configuration**:
   - Create agent using Asset Service Management template
   - Configure topics:
     - Asset Service Estimation (summarize assets, create quotes)
     - Work Order Management (retrieve quotes, create work orders)
   - Link to Asset and WorkOrder objects
   - Configure quote generation and email templates
   - Test agent scenarios
   - Deploy to Service Console
   
   **Sample Queries to Test**:
   ```
   - "Summarize the asset record and estimate the asset service"
   - "Create a quote and work order for general service"
   - "What's the service history for this asset?"
   ```

   ### Sales Agreement Automation Agent
   
   **Prerequisites Check**:
   - Query for SalesAgreement, SalesAgreementProduct records
   - Verify user has SalesAgreementsUser permission set
   - Check for active sales agreements
   
   **Configuration**:
   - Create agent using Manufacturing template
   - Configure topics:
     - Sales Agreement Management (bulk updates)
     - Agreement Compliance (planned vs. actual tracking)
   - Set up Data Library with SalesAgreement objects
   - Configure validation and update actions
   - Test with sample scenarios
   - Deploy to Sales Console
   
   **Sample Queries to Test**:
   ```
   - "Update all active sales agreements for AccountX"
   - "Check compliance status for Q1 agreements"
   - "Show me agreements with quantity discrepancies"
   ```

4. **Configure Agentforce Testing Center**:
   - Set up test suite for each agent
   - Create test cases for critical workflows
   - Configure custom evaluations for quality checks
   - Run regression tests

5. **Enable Agentforce Analytics**:
   - Track agent performance metrics
   - Monitor task resolution rates
   - Analyze Einstein Request consumption
   - Review session deep-dive capabilities

6. **Deploy to users**:
   - Add agents to relevant console home pages
   - Configure access for internal users
   - Enable for Experience Cloud (partner portals) if applicable
   - Create user documentation with sample queries

7. **Provide post-deployment guidance**:
   - Monitor agent analytics for optimization opportunities
   - Review common queries and improve agent responses
   - Track Einstein credit consumption
   - Schedule regular testing and updates

## Example Usage

```
User: /mfg:configure-agentforce

Claude: I'll help you configure Agentforce for Manufacturing Cloud.

        First, let me check your org's Agentforce readiness...
        
        ✓ Einstein Generative AI: Enabled
        ✓ Manufacturing Cloud License: Active
        ✓ Asset Service Lifecycle Management: Enabled
        ✓ ProductItem records: 2,847 found
        ✓ SalesAgreement records: 156 found
        
        Which Agentforce agent would you like to configure?
        
        1. Inventory Management Agent
           - AI-powered product search
           - Smart replenishment recommendations
           - Natural language inventory queries
        
        2. Asset Service Management Agent
           - Proactive asset maintenance
           - Service estimate generation
           - Work order automation
        
        3. Sales Agreement Automation Agent
           - Bulk agreement updates
           - Compliance tracking
           - Agreement validation
        
        4. All Three (recommended for comprehensive setup)

User: 1 - Inventory Management

Claude: Great! Let's configure the Inventory Management Agent.
        
        Step 1: Creating agent in Agentforce Builder...
        
        I'll configure the following topics:
        • Search Products — AI-powered natural language product search
        • Check Stock Levels — Real-time inventory queries across locations
        • Recommend Replenishment — Smart restock suggestions based on thresholds
        • Create Product Request — Automate product request creation
        
        Step 2: Setting up Data Library...
        
        Adding objects:
        • ProductItem (2,847 records)
        • SerializedProduct (1,203 records)
        • ProductBatchItem (892 records)
        • Location (15 warehouses)
        
        Step 3: Configuring actions...
        
        • Inventory search flow: Connected
        • Replenishment API: Connected
        • Product request workflow: Connected
        
        Step 4: Testing the agent...
        
        Running test queries:
        ✓ "Find hydraulic pumps with low stock"
          → Found 3 products, 2 below minimum quantity
        
        ✓ "Which warehouse has the most engine oil?"
          → Seattle Warehouse: 450 units
        
        ✓ "Recommend replenishment for brake pads"
          → 5 products need restocking, recommended source: Dallas DC
        
        Step 5: Deploying to Manufacturing Console...
        
        ✓ Agent added to Console home page
        ✓ Welcome recommendations configured
        ✓ User documentation generated
        
        Your Inventory Management Agent is ready!
        
        Next steps:
        • Train users with sample queries
        • Monitor Agentforce Analytics for optimization
        • Review Einstein Request consumption
        • Schedule regular test suite runs
        
        Would you like to configure another agent?
```

## When to Use

- **Initial Agentforce deployment** — Setting up AI agents for the first time
- **New use case enablement** — Adding agent capabilities for new business processes
- **Org refresh** — Reconfiguring agents after sandbox refresh
- **Troubleshooting** — Validating agent configuration when issues arise
- **Optimization** — Reviewing and improving agent performance

## Prerequisites

### Licenses Required
- Manufacturing Cloud license
- Einstein Generative AI (may consume Einstein Requests or Flex Credits)
- Asset Service Lifecycle Management (for asset-related agents)

### Permission Sets Required
For Inventory Management:
- `ManufacturingSalesUser` or `ManufacturingServiceUser`
- `InventoryAllocationUser` (if using allocation features)

For Asset Service Management:
- `ManufacturingServiceUser`
- Telemetry Definition and Action Management Designer
- Telemetry Definition and Action Management Viewer

For Sales Agreement Automation:
- `ManufacturingSalesUser`
- `SalesAgreementsUser`

### Setup Requirements
- Lightning Experience enabled
- Agentforce Builder access
- Einstein Generative AI enabled in org
- Appropriate Manufacturing Cloud modules configured

## Related Commands

| Command | Purpose |
|---------|---------|
| `/mfg:configure-users` | Assign Manufacturing and Agentforce permissions |
| `/mfg:health-check` | Verify org readiness for Agentforce |
| `/mfg:status` | Check Manufacturing Cloud setup status |
| `/mfg:configure-sales-agreements` | Configure Sales Agreements for agent automation |
| `/mfg:help` | Search Manufacturing Cloud knowledge base |

## Important Notes

- **English Only**: Agentforce for Manufacturing is available only in English (Winter '26)
- **Einstein Credit Consumption**: AI agents consume Einstein Requests or Flex Credits — monitor usage
- **Data Residency**: Einstein Generative AI features are on separate infrastructure — review Trust and Compliance Documentation
- **Security**: Agents respect object-level and field-level security — users only see data they have access to
- **Testing**: Always test thoroughly in sandbox before deploying to production

## Troubleshooting

### Agent Not Responding
1. Check Einstein credit availability
2. Verify Data Library objects are accessible
3. Review Agentforce Session Tracing logs
4. Check user permissions

### Incorrect Results
1. Review Data Library retrieval settings
2. Update agent topic instructions
3. Add more training examples
4. Use custom evaluations to identify issues

### Performance Issues
1. Optimize Data Library (reduce objects/fields)
2. Use ensemble retrievers strategically
3. Monitor Agentforce Analytics
4. Check for API governor limit issues

## Support

For Agentforce-specific questions:
- Review Agentforce Features release notes
- Check Agentforce & Einstein Platform documentation
- Use Agentforce Testing Center for diagnostics
- Review Agentforce Optimization guides

For Manufacturing Cloud integration:
- `/mfg:help` — Search Manufacturing Cloud knowledge base
- `/mfg:docs` — Browse documentation by category
