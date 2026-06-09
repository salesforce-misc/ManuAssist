---
name: mfg-agentforce
description: Configure and troubleshoot Agentforce for Manufacturing Cloud including inventory management optimization, sales agreement automation, and replenishment workflows. Use when user asks about Agentforce agents for Manufacturing, AI-powered inventory search, smart replenishment, or automating sales agreements.
---

# Agentforce for Manufacturing Cloud

You are an expert in Agentforce for Manufacturing Cloud implementations. When helping with Agentforce for Manufacturing:

## Your Approach

1. **First, understand the use case**:
   - Inventory management and replenishment
   - Sales agreement automation
   - Customer service queries about products/orders
   
2. **Check Agentforce prerequisites**:
   - Use `run_soql` to verify org has required licenses
   - Check if Einstein Generative AI is enabled
   - Verify Manufacturing Cloud permission sets are assigned
   - Confirm user has access to Agentforce features

3. **Provide configuration guidance** based on the specific agent type:
   - Agent setup in Agentforce Builder
   - Topic and action configuration
   - Data library setup
   - Testing and deployment

## Agentforce for Manufacturing Capabilities (Winter '26)

### 1. Agentforce for Inventory Management

**Purpose**: Simplify product and asset discovery across inventory with AI-powered natural language search

**Key Features**:
- Natural language search for products, vehicles, or parts
- AI-powered inventory data summarization
- Intelligent restock recommendations
- Fast product request creation
- Stock shortage identification
- Optimal source location suggestions
- Automated replenishment workflows

**Configuration Steps**:

1. **Enable Agentforce in Setup**:
   ```
   Setup → Agentforce → Enable Agentforce for Manufacturing
   ```

2. **Assign Permission Sets**:
   - `ManufacturingSalesUser` or `ManufacturingServiceUser`
   - `InventoryAllocationUser` (if using allocation features)
   
3. **Create Agent in Agentforce Builder**:
   - Navigate to Agentforce Studio
   - Select "Inventory Management" template
   - Configure the following topics:
     - **Search Products**: AI-powered product search
     - **Check Stock Levels**: Real-time inventory queries
     - **Recommend Replenishment**: Smart restock suggestions
     - **Create Product Request**: Automate request creation

4. **Configure Data Library**:
   - Add ProductItem object
   - Add SerializedProduct object (if using)
   - Add ProductBatchItem object (if using)
   - Add Location object for warehouse/site data
   - Configure retrieval settings for optimal performance

5. **Set Up Actions**:
   - Link to existing inventory search flows
   - Connect to replenishment APIs
   - Configure product request creation workflow

6. **Test the Agent**:
   - Use Agentforce Testing Center
   - Test with sample queries:
     - "Find hydraulic pumps with low stock"
     - "Which warehouse has the most engine oil?"
     - "Recommend replenishment for ProductX"
   
7. **Deploy to Users**:
   - Add to Manufacturing Console home page
   - Enable in Service Console
   - Configure for Experience Cloud (partner portals)

**Where Available**: Lightning Experience in Automotive Cloud, Communications Cloud, and Manufacturing Cloud where Asset Service Lifecycle Management is enabled

**Language**: English only

**License Requirements**:
- Einstein Generative AI
- Manufacturing Cloud license
- May consume Einstein Requests or Flex Credits

### 2. Agentforce for Asset Service Lifecycle Management

**Purpose**: Enhance proactive customer support by managing service data and maintenance activities

**Key Features**:
- Detailed asset information access
- Comprehensive asset summaries
- Accurate service estimates
- Work order preparation
- Clear customer communications

**Configuration Steps**:

1. **Create Agent with Asset Service Management Template**:
   - In Agentforce Builder, select "Asset Service Management"
   - Customize agent name and description

2. **Configure Agent Topics**:
   - **Asset Service Estimation**: Summarize asset data, create quotes, draft emails
   - **Asset Service Work Order Management**: Retrieve accepted quotes, create work orders, share details
   
3. **Set Up Agent Actions**:
   - Link to Asset object
   - Connect to Work Order creation flows
   - Enable quote generation
   - Configure email templates

4. **Test Agent Scenarios**:
   - "Summarize the asset record and estimate the asset service"
   - "Summarize the asset record and create a quote and work order with the work type of General Service"

5. **Launch Agent**:
   - Launch from Asset record page in Agentforce panel
   - Specify task (e.g., "Summarize the asset record and estimate the asset service")

**Where Available**: Lightning Experience in Automotive Cloud, Communications Cloud, and Manufacturing Cloud where Asset Service Lifecycle Management is enabled

**Language**: English only

### 3. Agentforce for Manufacturing (Sales Agreements)

**Purpose**: Optimize inventory management and simplify bulk update of sales agreements

**Key Features**:
- Bulk sales agreement updates
- Automated agreement validations
- Smart agreement recommendations
- Compliance tracking assistance

**Configuration Steps**:

1. **Enable in Agentforce Settings**:
   - Setup → Agentforce → Create agent using Manufacturing template
   
2. **Configure Topics**:
   - **Sales Agreement Management**: Bulk updates and validations
   - **Agreement Compliance**: Track planned vs. actual quantities
   
3. **Set Up Data Library**:
   - Add SalesAgreement object
   - Add SalesAgreementProduct object
   - Add SalesAgreementProductSchedule object
   
4. **Test Use Cases**:
   - "Update all active sales agreements for AccountX"
   - "Check compliance status for Q1 agreements"
   - "Show me agreements with quantity discrepancies"

## Common Customer Queries

### Query Type 1: Product/Inventory Search

**Customer asks**: "Do you have hydraulic pumps in stock?"

**Agentforce Response Flow**:
1. Agent interprets natural language query
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

### Query Type 2: Service Estimates

**Customer asks**: "How much would it cost to service my vehicle?"

**Agentforce Response Flow**:
1. Agent accesses Asset record
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

### Query Type 3: Replenishment Recommendations

**Customer asks**: "What products need restocking this week?"

**Agentforce Response Flow**:
1. Agent analyzes inventory levels across locations
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

## Troubleshooting Common Issues

### Issue 1: Agent Not Finding Products

**Symptoms**: Agent returns "No products found" for valid queries

**Solutions**:
1. Check Data Library configuration:
   ```sql
   -- Verify ProductItem records exist
   SELECT COUNT() FROM ProductItem WHERE QuantityOnHand > 0
   ```
2. Verify search index is up to date
3. Check agent has access to ProductItem object
4. Review retrieval settings in Data Library

### Issue 2: Agent Responses Are Slow

**Symptoms**: Long wait times for agent to respond

**Solutions**:
1. Optimize Data Library retrieval settings
2. Limit number of objects in data library
3. Use custom retriever for targeted queries
4. Check Einstein Request consumption and limits
5. Review Agentforce Analytics for bottlenecks

### Issue 3: Agent Can't Create Work Orders

**Symptoms**: Agent can summarize but can't create records

**Solutions**:
1. Verify agent has Create permission on WorkOrder object
2. Check Flow or Apex action is properly connected
3. Review required fields on WorkOrder
4. Test action independently in Agentforce Testing Center
5. Check for validation rule failures

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

## Best Practices

### 1. Agent Design
- Start with predefined templates (Inventory Management, Asset Service Management)
- Customize topics based on your specific business processes
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

## Tools to Use

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

## Important Notes

- **Agentforce for Inventory Management uses Einstein Generative AI** and may consume Einstein Requests or Flex Credits or Customer Data Cloud Requests
- **Einstein Generative AI Features** and Data Cloud are provided on a separate infrastructure with different security protections and physical hosting locations than the Services
- **See Salesforce Trust and Compliance Documentation** for details on data handling
- **Agentforce for Manufacturing is available only in English** (Winter '26)
- **Requires Lightning Experience** with Manufacturing Cloud license
- **Asset Service Lifecycle Management must be enabled** for asset-related agents

## Release Information

**Available**: Winter '26 (December 2025)

**Where**: Lightning Experience in Enterprise, Performance, Unlimited, and Developer Editions with:
- Manufacturing Cloud
- Asset Service Lifecycle Management (for asset agents)
- Einstein Generative AI

**Who**: Users with appropriate Manufacturing permission sets and Agentforce access

## Related Resources

- Agentforce Features (monthly release notes)
- Agentforce & Einstein Platform section
- Manufacturing Cloud documentation
- Agentforce Builder guide
- Agentforce Testing Center guide
- Agent Analytics and Optimization guide

## Example Prompts for Claude

When users ask questions like:
- "How do I set up Agentforce for inventory management?"
- "Can Agentforce help with sales agreement updates?"
- "Configure AI for product replenishment"
- "Set up AI agent for customer queries about stock levels"
- "How do I enable smart replenishment in Manufacturing Cloud?"
- "Create an agent for warranty service estimates"

Invoke this skill to provide Manufacturing Cloud-specific Agentforce guidance.
