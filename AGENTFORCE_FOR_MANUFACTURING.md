## Agentforce for Manufacturing Cloud — Skill & Command Documentation

### Overview

Created comprehensive Agentforce for Manufacturing Cloud skill and configuration command based on Salesforce Winter '26 release notes. This enables Claude to help users configure and troubleshoot AI-powered agents for Manufacturing Cloud use cases.

### Files Created

#### 1. Skill File
**Location**: `/skills/mfg-agentforce/SKILL.md`

**Purpose**: Auto-invoked when users ask about Agentforce for Manufacturing Cloud

**Trigger Phrases**:
- "Agentforce for Manufacturing"
- "AI-powered inventory management"
- "Smart replenishment"
- "Configure AI agents for products"
- "Agentforce for sales agreements"
- "AI for asset service"
- "Set up intelligent inventory search"

**Key Content**:
- Agentforce for Inventory Management configuration
- Agentforce for Asset Service Management setup
- Agentforce for Manufacturing (Sales Agreements) configuration
- Customer query handling patterns
- Troubleshooting common issues
- Best practices for agent design and deployment

#### 2. Command File
**Location**: `/commands/configure-agentforce.md`

**Purpose**: User-invoked wizard via `/mfg:configure-agentforce` slash command

**Workflow**:
1. Check prerequisites (licenses, permissions, data)
2. Ask which agent type to configure
3. Guide through step-by-step configuration
4. Set up testing and validation
5. Deploy to users with documentation

#### 3. CLAUDE.md Updates
**Changes**:
- Added `mfg-agentforce` to Skills table
- Added `/mfg:configure-agentforce` to Commands table
- Updated project structure to include new skill directory

---

## Agentforce for Manufacturing Capabilities (Winter '26)

### 1. Agentforce for Inventory Management

**Use Case**: AI-powered natural language search for products, parts, and inventory across locations

**Key Features**:
- Natural language inventory queries
- AI-powered product search and discovery
- Intelligent restock recommendations
- Stock shortage identification
- Optimal source location suggestions
- Automated replenishment workflows
- Fast product request creation

**Configuration**:
1. Create agent using "Inventory Management" template
2. Configure topics:
   - **Search Products**: Natural language product search
   - **Check Stock Levels**: Real-time inventory queries
   - **Recommend Replenishment**: Smart restock suggestions
   - **Create Product Request**: Automate request creation
3. Set up Data Library with:
   - ProductItem object
   - SerializedProduct object (if using)
   - ProductBatchItem object (if using)
   - Location object (warehouses/sites)
4. Configure actions for search and replenishment
5. Test with sample queries
6. Deploy to Manufacturing Console

**Sample Customer Queries**:
```
"Do you have hydraulic pumps in stock?"
"Which warehouse has the most engine oil?"
"What products need restocking this week?"
"Find brake pads with low stock"
"Show me serialized products in Seattle warehouse"
```

**Where Available**: Lightning Experience in Automotive Cloud, Communications Cloud, and Manufacturing Cloud where Asset Service Lifecycle Management is enabled

**Language**: English only

**Permissions Required**:
- `ManufacturingSalesUser` or `ManufacturingServiceUser`
- `InventoryAllocationUser` (if using allocation)

---

### 2. Agentforce for Asset Service Lifecycle Management

**Use Case**: Proactive customer support for asset maintenance and service estimates

**Key Features**:
- Access detailed asset information
- Generate comprehensive asset summaries
- Create accurate service estimates
- Prepare work orders
- Draft clear customer communications

**Configuration**:
1. Create agent using "Asset Service Management" template
2. Configure topics:
   - **Asset Service Estimation**: Summarize assets, create quotes, draft emails
   - **Asset Service Work Order Management**: Retrieve quotes, create work orders, share details
3. Link to Asset and WorkOrder objects
4. Configure quote generation and email templates
5. Test agent scenarios
6. Deploy to Service Console

**Sample Customer Queries**:
```
"How much would it cost to service my vehicle?"
"Summarize the asset record and estimate the asset service"
"Create a quote and work order for general service"
"What's the service history for this equipment?"
```

**How to Use**:
- Launch from Asset record page in Agentforce panel
- Specify task (e.g., "Summarize the asset record and estimate the asset service")
- Agent accesses asset details, generates estimate, creates quote and work order

**Where Available**: Lightning Experience in Automotive Cloud, Communications Cloud, and Manufacturing Cloud where Asset Service Lifecycle Management is enabled

**Language**: English only

**Permissions Required**:
- `ManufacturingServiceUser`
- Telemetry Definition and Action Management Designer
- Telemetry Definition and Action Management Viewer

---

### 3. Agentforce for Manufacturing (Sales Agreements)

**Use Case**: Optimize inventory management and simplify bulk updates of sales agreements

**Key Features**:
- Bulk sales agreement updates
- Automated agreement validations
- Smart agreement recommendations
- Compliance tracking (planned vs. actual quantities)

**Configuration**:
1. Create agent using "Manufacturing" template
2. Configure topics:
   - **Sales Agreement Management**: Bulk updates and validations
   - **Agreement Compliance**: Track planned vs. actual
3. Set up Data Library with:
   - SalesAgreement object
   - SalesAgreementProduct object
   - SalesAgreementProductSchedule object
4. Configure validation and update actions
5. Test with sample scenarios
6. Deploy to Sales Console

**Sample Customer Queries**:
```
"Update all active sales agreements for AccountX"
"Check compliance status for Q1 agreements"
"Show me agreements with quantity discrepancies"
"Which agreements are behind on actuals?"
```

**Where Available**: Lightning Experience in Manufacturing Cloud

**Language**: English only

**Permissions Required**:
- `ManufacturingSalesUser`
- `SalesAgreementsUser`

---

## Customer Query Response Patterns

### Pattern 1: Product/Inventory Search

**Customer Query**: "Do you have hydraulic pumps in stock?"

**Agent Response Flow**:
1. Interprets natural language query
2. Searches ProductItem records for "hydraulic pumps"
3. Checks QuantityOnHand across locations
4. Returns results with:
   - Product names and SKUs
   - Available quantities by location
   - Replenishment recommendations if low stock

**Configuration Required**:
- Inventory Management agent with Search Products topic
- Data Library includes ProductItem, Location objects
- Search action configured

---

### Pattern 2: Service Estimates

**Customer Query**: "How much would it cost to service my vehicle?"

**Agent Response Flow**:
1. Accesses Asset record
2. Summarizes asset details (mileage, service history)
3. Generates service estimate based on:
   - Recommended maintenance intervals
   - Parts pricing
   - Labor rates
4. Creates quote and work order
5. Drafts customer communication email

**Configuration Required**:
- Asset Service Management agent
- Asset Service Estimation topic
- Quote generation action
- Email template

---

### Pattern 3: Replenishment Recommendations

**Customer Query**: "What products need restocking this week?"

**Agent Response Flow**:
1. Analyzes inventory levels across locations
2. Compares against minimum/shortage thresholds
3. Summarizes inventory data from multiple locations
4. Provides intelligent restock recommendations
5. Suggests optimal source locations
6. Can auto-create product requests

**Configuration Required**:
- Inventory Management agent
- Recommend Replenishment topic
- Product request creation action
- Threshold configuration

---

## Troubleshooting Guide

### Issue 1: Agent Not Finding Products

**Symptoms**: Agent returns "No products found" for valid queries

**Solutions**:
1. Check Data Library configuration
2. Verify ProductItem records exist:
   ```sql
   SELECT COUNT() FROM ProductItem WHERE QuantityOnHand > 0
   ```
3. Verify search index is up to date
4. Check agent has access to ProductItem object
5. Review retrieval settings in Data Library

---

### Issue 2: Agent Responses Are Slow

**Symptoms**: Long wait times for agent responses

**Solutions**:
1. Optimize Data Library retrieval settings
2. Limit number of objects in data library
3. Use custom retriever for targeted queries
4. Check Einstein Request consumption and limits
5. Review Agentforce Analytics for bottlenecks

---

### Issue 3: Agent Can't Create Work Orders

**Symptoms**: Agent can summarize but can't create records

**Solutions**:
1. Verify agent has Create permission on WorkOrder object
2. Check Flow or Apex action is properly connected
3. Review required fields on WorkOrder
4. Test action independently in Agentforce Testing Center
5. Check for validation rule failures

---

### Issue 4: Incorrect Replenishment Recommendations

**Symptoms**: Agent suggests restocking products that are in stock

**Solutions**:
1. Review and update minimum/shortage quantity thresholds:
   ```sql
   SELECT Product2.Name, MinimumInventoryQuantity, ShortageQuantity, 
          QuantityOnHand 
   FROM ProductItem 
   WHERE QuantityOnHand < MinimumInventoryQuantity
   ```
2. Verify replenishment policy configuration
3. Check location-specific inventory levels
4. Update Product Inventory Searchable Field object configuration

---

## Best Practices

### 1. Agent Design
- Start with predefined templates (Inventory Management, Asset Service Management)
- Customize topics based on specific business processes
- Use Asset Library for reusable topics and actions across agents
- Test thoroughly with real-world queries before deployment

### 2. Data Library Optimization
- Only include objects necessary for agent tasks
- Configure retrieval to focus on relevant fields
- Use custom retrievers for complex data relationships
- Monitor Einstein Request consumption

### 3. User Training
- Provide sample queries for common use cases
- Create welcome recommendations in Agentforce Builder (minimum 3, up to 20)
- Document agent capabilities in user guides
- Train users on natural language query patterns

### 4. Testing & Quality
- Use Agentforce Testing Center for regression testing
- Create test suites for critical workflows
- Monitor agent performance with Agentforce Analytics
- Track task resolution metrics
- Use custom evaluations for quality checks

### 5. Security & Compliance
- Respect object-level and field-level security
- Agent operates with user's permissions
- Use trusted URL allowlisting for external integrations
- Ensure Einstein Generative AI features comply with data residency requirements

---

## Prerequisites & Requirements

### Licenses Required
- Manufacturing Cloud license
- Einstein Generative AI (may consume Einstein Requests or Flex Credits)
- Asset Service Lifecycle Management (for asset-related agents)

### Permission Sets Required

**For Inventory Management**:
- `ManufacturingSalesUser` OR `ManufacturingServiceUser`
- `InventoryAllocationUser` (if using allocation features)

**For Asset Service Management**:
- `ManufacturingServiceUser`
- Telemetry Definition and Action Management Designer
- Telemetry Definition and Action Management Viewer

**For Sales Agreement Automation**:
- `ManufacturingSalesUser`
- `SalesAgreementsUser`

### Setup Requirements
- Lightning Experience enabled
- Agentforce Builder access
- Einstein Generative AI enabled in org
- Appropriate Manufacturing Cloud modules configured
- ProductItem/Asset/SalesAgreement records exist

---

## Tools Used in Skill

### Configuration & Setup
- `check_mfg_setup`: Verify Salesforce CLI and org authentication
- `list_sf_orgs`: List available orgs
- `set_target_org`: Set which org to configure
- `run_soql`: Query configuration and validate setup
- `describe_sobject`: Check object metadata and permissions

### Permission Management
- `list_permission_sets`: List Manufacturing permission sets
- `assign_permission_set`: Assign Agentforce and Manufacturing permissions
- `list_users`: Identify users who need access

### Data Validation
- `run_soql`: Query ProductItem, SerializedProduct, SalesAgreement data
- `get_record`: Retrieve specific asset or product records
- `run_apex`: Execute validation scripts

### Health Checks
- `health_check`: Comprehensive org health including Agentforce status
- `get_org_status`: Quick dashboard of Manufacturing Cloud setup

---

## Important Notes

- **Agentforce for Inventory Management uses Einstein Generative AI** and may consume Einstein Requests or Flex Credits or Customer Data Cloud Requests
- **Einstein Generative AI Features** and Data Cloud are provided on a separate infrastructure with different security protections and physical hosting locations than the Services
- **See Salesforce Trust and Compliance Documentation** for details on data handling
- **Agentforce for Manufacturing is available only in English** (Winter '26)
- **Requires Lightning Experience** with Manufacturing Cloud license
- **Asset Service Lifecycle Management must be enabled** for asset-related agents

---

## Release Information

**Available**: Winter '26 (December 2025)

**Where**: Lightning Experience in Enterprise, Performance, Unlimited, and Developer Editions with:
- Manufacturing Cloud
- Asset Service Lifecycle Management (for asset agents)
- Einstein Generative AI

**Who**: Users with appropriate Manufacturing permission sets and Agentforce access

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/mfg:configure-agentforce` | Interactive wizard to configure Agentforce agents |
| `/mfg:configure-users` | Assign Manufacturing and Agentforce permissions |
| `/mfg:health-check` | Verify org readiness for Agentforce |
| `/mfg:status` | Check Manufacturing Cloud setup status |
| `/mfg:configure-sales-agreements` | Configure Sales Agreements for agent automation |
| `/mfg:configure-inventory` | Configure Inventory Management |
| `/mfg:help` | Search Manufacturing Cloud knowledge base |

---

## Example Workflows

### Workflow 1: Configure Inventory Management Agent

```
User: /mfg:configure-agentforce

1. Claude checks prerequisites
   - Einstein Generative AI: Enabled ✓
   - Manufacturing Cloud License: Active ✓
   - ProductItem records: 2,847 found ✓

2. User selects "Inventory Management Agent"

3. Claude configures:
   - Creates agent using template
   - Adds Search Products, Check Stock, Recommend Replenishment topics
   - Sets up Data Library (ProductItem, SerializedProduct, Location)
   - Configures search and replenishment actions

4. Claude tests agent with sample queries
   - "Find hydraulic pumps with low stock" ✓
   - "Which warehouse has the most engine oil?" ✓
   - "Recommend replenishment for brake pads" ✓

5. Claude deploys to Manufacturing Console
   - Adds to home page
   - Creates welcome recommendations
   - Generates user documentation

6. Agent is ready for use
```

### Workflow 2: Answer Customer Query About Inventory

```
Customer Query: "Do you have brake pads in stock?"

Agent Processing:
1. Interprets query → searches for "brake pads"
2. Queries ProductItem records
3. Checks QuantityOnHand across locations
4. Finds:
   - Seattle Warehouse: 45 units
   - Dallas DC: 12 units (below minimum of 20)
   - Atlanta Hub: 0 units

Agent Response:
"Yes, we have brake pads in stock:
• Seattle Warehouse: 45 units available
• Dallas DC: 12 units (⚠️ below minimum threshold)
• Atlanta Hub: Out of stock

Would you like me to:
1. Create a product request for Dallas DC replenishment?
2. Check alternate products?
3. Provide more details about specific SKUs?"
```

---

## Testing Checklist

- [ ] Skill file created with comprehensive configuration guidance
- [ ] Command file created with interactive wizard workflow
- [ ] CLAUDE.md updated with new skill and command
- [ ] All three agent types documented (Inventory, Asset Service, Sales Agreements)
- [ ] Customer query patterns included
- [ ] Troubleshooting guide comprehensive
- [ ] Prerequisites and requirements clearly stated
- [ ] Best practices documented
- [ ] Tools and permissions mapped
- [ ] Sample workflows provided

---

## Future Enhancements

1. **Multi-Language Support**: When Agentforce supports additional languages
2. **Custom Agent Templates**: Industry-specific templates beyond standard
3. **Advanced Analytics Integration**: Deeper integration with Tableau and CRM Analytics
4. **Automated Agent Optimization**: AI-driven agent performance tuning
5. **Voice-Enabled Agents**: Integration with Agentforce Voice for hands-free inventory queries
6. **Partner Portal Integration**: Enhanced Experience Cloud agent deployment
7. **Predictive Replenishment**: ML-based demand forecasting for smarter restocking

---

## Conclusion

The Agentforce for Manufacturing skill and command provide comprehensive guidance for configuring and deploying AI-powered agents for Manufacturing Cloud use cases. The skill handles configuration, troubleshooting, and best practices, while the interactive command wizard guides users through step-by-step setup. Together, they enable Manufacturing Cloud customers to leverage Einstein Generative AI for intelligent inventory management, proactive asset service, and automated sales agreement workflows.
