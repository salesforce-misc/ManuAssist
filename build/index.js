#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getModuleList, getHelpDocList, getGuideList, getExerciseList, getTroubleshootingList, } from "./knowledge-loader.js";
// Import tool modules
import { register as registerKnowledge } from "./tools/knowledge.js";
import { register as registerSalesforceOrg } from "./tools/salesforce-org.js";
import { register as registerConfigChecks } from "./tools/config-checks.js";
import { register as registerSalesAgreements } from "./tools/sales-agreements.js";
import { register as registerPartnerVisits } from "./tools/partner-visits.js";
import { register as registerWarranty } from "./tools/warranty.js";
import { register as registerForecasting } from "./tools/forecasting.js";
import { register as registerResources } from "./tools/resources.js";
import { register as registerDiff } from "./tools/diff.js";
import { register as registerUserManagement } from "./tools/user-management.js";
import { register as registerHealthCheck } from "./tools/health-check.js";
import { register as registerConfigExport } from "./tools/config-export.js";
import { register as registerReleaseNotes } from "./tools/release-notes.js";
import { register as registerApex } from "./tools/apex.js";
import { register as registerBulkOperations } from "./tools/bulk-operations.js";
import { register as registerMetadata } from "./tools/metadata.js";
// Create the MCP server
const server = new McpServer({
    name: "mfg-cloud-mcp-server",
    version: "0.1.0",
});
// Register all tool modules
registerKnowledge(server);
registerSalesforceOrg(server);
registerConfigChecks(server);
registerSalesAgreements(server);
registerPartnerVisits(server);
registerWarranty(server);
registerForecasting(server);
registerResources(server);
registerDiff(server);
registerUserManagement(server);
registerHealthCheck(server);
registerConfigExport(server);
registerReleaseNotes(server);
registerApex(server);
registerBulkOperations(server);
registerMetadata(server);
// ============================================================================
// MAIN
// ============================================================================
async function main() {
    const modules = getModuleList();
    const helpDocs = getHelpDocList();
    const guides = getGuideList();
    const exercises = getExerciseList();
    const troubleshooting = getTroubleshootingList();
    console.error(`Manufacturing Cloud MCP server starting...`);
    console.error(`Knowledge base loaded:`);
    console.error(`  - ${modules.length} modules`);
    console.error(`  - ${helpDocs.length} help documents`);
    console.error(`  - ${guides.length} guides`);
    console.error(`  - ${exercises.length} exercises`);
    console.error(`  - ${troubleshooting.length} troubleshooting docs`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Manufacturing Cloud MCP server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map