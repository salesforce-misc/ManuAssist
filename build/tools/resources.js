import { z } from "zod";
import { getModuleList, getModuleContent, searchKnowledge, } from "../knowledge-loader.js";
export function register(server) {
    server.resource("mfg://modules", "List of all Manufacturing Cloud modules with documentation", async () => {
        const modules = getModuleList();
        const moduleTable = modules
            .map((m) => `| ${m.title} | ${m.slug} | ${m.fileCount} |`)
            .join("\n");
        return {
            contents: [
                {
                    uri: "mfg://modules",
                    mimeType: "text/markdown",
                    text: `# Manufacturing Cloud Modules

| Module | Slug | Docs |
|--------|------|------|
${moduleTable}

Use the \`get_mfg_module_docs\` tool with a slug to get detailed documentation.`,
                },
            ],
        };
    });
    // Resource: Manufacturing Cloud Overview
    server.resource("mfg://overview", "Overview of Salesforce Manufacturing Cloud", async () => ({
        contents: [
            {
                uri: "mfg://overview",
                mimeType: "text/markdown",
                text: `# Salesforce Manufacturing Cloud

## Overview

Manufacturing Cloud is Salesforce's industry cloud for manufacturing companies. It extends Sales Cloud and Service Cloud with manufacturing-specific capabilities to help account managers, field reps, service teams, and partner networks manage run-rate business, warranties, forecasting, and partner visits.

## Key Modules

### Sales Track
- **Sales Agreements** — Run-rate business agreements with planned vs. actual quantities and revenue
- **Advanced Account Forecasting (AAF)** — DPE-powered account-level forecasting
- **Account Manager Targets** — Set and track targets per account manager
- **Partner Visit Management** — Schedule and track visits to distributors and dealers

### Service Track
- **Warranty Lifecycle Management** — Warranty terms, asset coverage, and claims adjudication
- **Asset Service Management** — Asset tracking and service case management
- **Inventory Management** — Product inventory at field locations

### Cross-Track
- **Manufacturing Programs** — Rebates, incentives, and collaborative programs
- **User Management** — Permission sets for sales, service, and partner users
- **CRM Analytics** — Manufacturing-specific dashboards and reports

## Technical Foundation

- **Standard Platform** — No managed package namespace; uses standard API names
- **OmniStudio** — FlexCards, OmniScripts, DataRaptors, Integration Procedures (web + Experience Cloud)
- **Data Processing Engine (DPE)** — Powers Advanced Account Forecasting
- **Business Rules Engine (BRE)** — Automates warranty claim adjudication
- **MuleSoft Accelerator** — ERP integration for actuals sync

## Getting Help

Use the tools provided:
- \`list_mfg_modules\` - See all available documentation
- \`get_mfg_module_docs\` - Get detailed module documentation
- \`search_mfg_knowledge\` - Search for specific topics
- \`explain_mfg_concept\` - Get explanations of Manufacturing Cloud concepts
- \`get_mfg_admin_setup\` - Get admin configuration guidance`,
            },
        ],
    }));
    // ============================================================================
    // PROMPTS
    // ============================================================================
    // Prompt: Implementation Checklist
    server.prompt("mfg_implementation_checklist", "Generate an implementation checklist for a Manufacturing Cloud module", {
        module: z
            .enum([
            "sales-agreements",
            "advanced-account-forecasting",
            "partner-visit-management",
            "warranty-management",
            "asset-service",
            "inventory-management",
            "user-management",
            "full",
        ])
            .describe("The Manufacturing Cloud module to generate a checklist for"),
    }, async ({ module }) => {
        // Get the module documentation to include context
        const moduleContent = getModuleContent(module);
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Generate a detailed implementation checklist for the Manufacturing Cloud ${module} module.

Here is the available documentation for this module:

${moduleContent || "No specific documentation available."}

Based on this documentation, create a comprehensive checklist including:
1. Prerequisites and dependencies
2. Configuration steps in order
3. Permission set assignments
4. Data requirements
5. Testing requirements
6. Go-live checklist
7. Post-implementation validation

Format as a structured checklist with clear categories and actionable items.`,
                    },
                },
            ],
        };
    });
    // Prompt: Troubleshooting Guide
    server.prompt("mfg_troubleshoot", "Get help troubleshooting a Manufacturing Cloud issue", {
        issue: z.string().describe("Description of the issue or error"),
        module: z
            .string()
            .optional()
            .describe("The module where the issue is occurring"),
    }, async ({ issue, module }) => {
        let moduleContent = "";
        if (module) {
            moduleContent = getModuleContent(module) || "";
        }
        // Also search for relevant content
        const searchResults = searchKnowledge(issue);
        const relevantContent = searchResults
            .slice(0, 3)
            .map((r) => `### ${r.title}\n${r.excerpt}`)
            .join("\n\n");
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Help troubleshoot this Manufacturing Cloud issue:

**Issue:** ${issue}
${module ? `**Module:** ${module}` : ""}

**Relevant Documentation:**
${moduleContent}

**Search Results:**
${relevantContent}

Based on the documentation and common Manufacturing Cloud patterns, please:
1. Identify possible causes of this issue
2. Suggest diagnostic steps
3. Provide resolution steps
4. Mention any related configuration that might need checking`,
                    },
                },
            ],
        };
    });
}
//# sourceMappingURL=resources.js.map