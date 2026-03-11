import { z } from "zod";
import { isSfCliInstalled, installSfCli, listOrgs, runSoqlQuery, describeSObject, getRecord, createRecord, updateRecord, deleteRecord, getLoginCommand, openOrg, } from "../salesforce/cli.js";
import { checkSetupStatus, getSetupInstructions, formatOrgList, validateOrgConnection, setTargetOrg, getTargetOrg, } from "../salesforce/auth.js";
export function register(server) {
    server.tool("check_mfg_setup", "Check if Salesforce CLI is installed and orgs are authenticated. Run this first to ensure everything is set up correctly.", {}, async () => {
        const status = await checkSetupStatus();
        let message = "# Manufacturing Cloud Plugin Setup Status\n\n";
        // CLI Status
        message += `## Salesforce CLI\n`;
        message += `- **Installed:** ${status.cliInstalled ? "Yes ✓" : "No ✗"}\n`;
        if (status.cliVersion) {
            message += `- **Version:** ${status.cliVersion}\n`;
        }
        message += "\n";
        // Org Status
        message += `## Authenticated Orgs\n`;
        if (status.hasAuthenticatedOrgs) {
            message += formatOrgList(status.orgs);
            message += "\n\n";
            if (getTargetOrg()) {
                message += `**Current Target Org:** ${getTargetOrg()}\n`;
            }
            else if (status.defaultOrg) {
                message += `**Default Org:** ${status.defaultOrg.alias || status.defaultOrg.username}\n`;
            }
        }
        else {
            message += "No authenticated orgs found.\n";
        }
        message += "\n";
        // Next Steps
        if (status.nextStep && status.nextStep !== "ready") {
            const instructions = getSetupInstructions(status.nextStep);
            message += `## Next Step: ${instructions.title}\n\n`;
            message += `${instructions.description}\n\n`;
            if (instructions.command) {
                message += `\`\`\`bash\n${instructions.command}\n\`\`\`\n\n`;
            }
            if (instructions.options) {
                message += instructions.options.map((opt) => `- ${opt}`).join("\n");
            }
        }
        else {
            message += `## Status: Ready ✓\n\nYou can now use Manufacturing Cloud tools to query and modify your Salesforce org.\n`;
        }
        return {
            content: [{ type: "text", text: message }],
        };
    });
    // Tool: Install Salesforce CLI
    server.tool("install_sf_cli", "Install the Salesforce CLI via npm. Only run this if the CLI is not already installed.", {}, async () => {
        // Check if already installed
        const isInstalled = await isSfCliInstalled();
        if (isInstalled) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Salesforce CLI is already installed. No action needed.",
                    },
                ],
            };
        }
        const result = await installSfCli();
        if (result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Salesforce CLI Installed Successfully ✓\n\n${result.data}\n\nNext step: Authenticate to your org using:\n\`\`\`bash\n${getLoginCommand("my-mfg-org")}\n\`\`\``,
                    },
                ],
            };
        }
        else {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Installation Failed\n\n${result.error}\n\n## Manual Installation Options\n\n1. **npm (requires admin/sudo):**\n   \`\`\`bash\n   sudo npm install -g @salesforce/cli\n   \`\`\`\n\n2. **Download installer:**\n   https://developer.salesforce.com/tools/salesforcecli`,
                    },
                ],
            };
        }
    });
    // Tool: List Authenticated Orgs
    server.tool("list_sf_orgs", "List all authenticated Salesforce orgs", {}, async () => {
        const isInstalled = await isSfCliInstalled();
        if (!isInstalled) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Salesforce CLI is not installed. Run `check_mfg_setup` for installation instructions.",
                    },
                ],
            };
        }
        const result = await listOrgs();
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to list orgs: ${result.error}`,
                    },
                ],
            };
        }
        const allOrgs = [
            ...(result.data?.nonScratchOrgs || []),
            ...(result.data?.scratchOrgs || []),
        ];
        if (allOrgs.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# No Authenticated Orgs\n\nAuthenticate to an org using:\n\`\`\`bash\n${getLoginCommand("my-mfg-org")}\n\`\`\`\n\nFor sandbox:\n\`\`\`bash\nsf org login web --alias my-sandbox --instance-url https://test.salesforce.com\n\`\`\``,
                    },
                ],
            };
        }
        const currentTarget = getTargetOrg();
        let message = `# Authenticated Orgs\n\n${formatOrgList(allOrgs)}\n\n`;
        if (currentTarget) {
            message += `**Current Target:** ${currentTarget}\n\n`;
        }
        message += `Use \`set_target_org\` to select which org to work with.`;
        return {
            content: [{ type: "text", text: message }],
        };
    });
    // Tool: Set Target Org
    server.tool("set_target_org", "Set the target Salesforce org for ALL subsequent operations in this session. Once set, the choice is remembered — do NOT ask the user again or call this tool again unless the user explicitly wants to switch orgs.", {
        org: z
            .string()
            .describe("The org alias or username to use as the target for operations"),
    }, async ({ org }) => {
        // Validate the org exists
        const result = await listOrgs();
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to verify org: ${result.error}`,
                    },
                ],
            };
        }
        const allOrgs = [
            ...(result.data?.nonScratchOrgs || []),
            ...(result.data?.scratchOrgs || []),
        ];
        const matchedOrg = allOrgs.find((o) => o.alias === org || o.username === org);
        if (!matchedOrg) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Org '${org}' not found.\n\nAvailable orgs:\n${formatOrgList(allOrgs)}`,
                    },
                ],
            };
        }
        setTargetOrg(org);
        return {
            content: [
                {
                    type: "text",
                    text: `Target org set to: **${org}** (${matchedOrg.username})\n\nInstance: ${matchedOrg.instanceUrl}\n\nThis org is now remembered for the rest of this session. All subsequent tools will use it automatically — do NOT ask the user to select an org again.`,
                },
            ],
        };
    });
    // Tool: Open Org in Browser
    server.tool("open_org", "Open the target Salesforce org in the default browser. Optionally navigate to a specific page path.", {
        path: z
            .string()
            .optional()
            .describe("Optional Salesforce page path to open (e.g., '/lightning/setup/SetupOneHome/home')"),
    }, async ({ path: pagePath }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = validation.targetOrg;
        if (!effectiveOrg) {
            const instructions = validation.setupInstructions;
            return {
                content: [
                    {
                        type: "text",
                        text: `# Cannot Open Org\n\n${validation.error}\n\n## ${instructions?.title}\n\n${instructions?.description}\n\n${instructions?.command ? `\`\`\`bash\n${instructions.command}\n\`\`\`` : ""}`,
                    },
                ],
            };
        }
        const result = await openOrg(effectiveOrg, pagePath);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to open org: ${result.error}`,
                    },
                ],
            };
        }
        const data = result.data;
        let message = `Opened org in browser.\n\n**Org ID:** ${data.orgId}\n**Username:** ${data.username}\n**URL:** ${data.url}`;
        if (pagePath) {
            message += `\n**Page:** ${pagePath}`;
        }
        return {
            content: [{ type: "text", text: message }],
        };
    });
    // Tool: Run SOQL Query
    server.tool("run_soql", "Execute a SOQL query against the target Salesforce org", {
        query: z.string().describe("The SOQL query to execute"),
        targetOrg: z
            .string()
            .optional()
            .describe("Optional: specific org to query. Uses current target org if not specified."),
    }, async ({ query, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            const instructions = validation.setupInstructions;
            return {
                content: [
                    {
                        type: "text",
                        text: `# Cannot Run Query\n\n${validation.error}\n\n## ${instructions?.title}\n\n${instructions?.description}\n\n${instructions?.command ? `\`\`\`bash\n${instructions.command}\n\`\`\`` : ""}`,
                    },
                ],
            };
        }
        const result = await runSoqlQuery(query, effectiveOrg);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Query Failed\n\n**Error:** ${result.error}\n\n**Query:**\n\`\`\`sql\n${query}\n\`\`\``,
                    },
                ],
            };
        }
        const data = result.data;
        let message = `# Query Results\n\n`;
        message += `**Records returned:** ${data.totalSize}\n\n`;
        if (data.records.length === 0) {
            message += "No records found.";
        }
        else {
            // Format as markdown table if reasonable number of fields
            const records = data.records;
            const fields = Object.keys(records[0]).filter((f) => f !== "attributes");
            if (fields.length <= 8 && records.length <= 50) {
                // Table format
                message += `| ${fields.join(" | ")} |\n`;
                message += `| ${fields.map(() => "---").join(" | ")} |\n`;
                for (const record of records) {
                    const values = fields.map((f) => {
                        const val = record[f];
                        if (val === null || val === undefined)
                            return "";
                        if (typeof val === "object")
                            return JSON.stringify(val);
                        return String(val);
                    });
                    message += `| ${values.join(" | ")} |\n`;
                }
            }
            else {
                // JSON format for complex results
                message += "```json\n";
                message += JSON.stringify(records, null, 2);
                message += "\n```";
            }
        }
        return {
            content: [{ type: "text", text: message }],
        };
    });
    // Tool: Describe SObject
    server.tool("describe_sobject", "Get metadata about a Salesforce object (fields, types, etc.)", {
        objectName: z
            .string()
            .describe("The API name of the object (e.g., Account, Contact, Visit__c)"),
        targetOrg: z
            .string()
            .optional()
            .describe("Optional: specific org to query"),
    }, async ({ objectName, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Cannot describe object: ${validation.error}`,
                    },
                ],
            };
        }
        const result = await describeSObject(objectName, effectiveOrg);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Failed to Describe ${objectName}\n\n${result.error}`,
                    },
                ],
            };
        }
        const data = result.data;
        let message = `# ${data.label} (${data.name})\n\n`;
        message += `## Fields (${data.fields.length})\n\n`;
        message += `| Field | Label | Type | Required | Updateable |\n`;
        message += `| --- | --- | --- | --- | --- |\n`;
        for (const field of data.fields.slice(0, 100)) {
            // Limit to 100 fields for readability
            message += `| ${field.name} | ${field.label} | ${field.type} | ${field.required ? "Yes" : "No"} | ${field.updateable ? "Yes" : "No"} |\n`;
        }
        if (data.fields.length > 100) {
            message += `\n*... and ${data.fields.length - 100} more fields*`;
        }
        return {
            content: [{ type: "text", text: message }],
        };
    });
    // Tool: Get Record
    server.tool("get_record", "Retrieve a specific record by ID from Salesforce", {
        objectName: z.string().describe("The API name of the object"),
        recordId: z.string().describe("The 15 or 18 character record ID"),
        fields: z
            .array(z.string())
            .describe("List of field API names to retrieve"),
        targetOrg: z.string().optional(),
    }, async ({ objectName, recordId, fields, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Cannot get record: ${validation.error}`,
                    },
                ],
            };
        }
        const result = await getRecord(objectName, recordId, fields, effectiveOrg);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Failed to Get Record\n\n${result.error}`,
                    },
                ],
            };
        }
        let message = `# ${objectName} Record\n\n`;
        message += `**ID:** ${recordId}\n\n`;
        message += "| Field | Value |\n| --- | --- |\n";
        for (const [key, value] of Object.entries(result.data)) {
            if (key !== "attributes") {
                message += `| ${key} | ${value ?? "(null)"} |\n`;
            }
        }
        return {
            content: [{ type: "text", text: message }],
        };
    });
    // Tool: Create Record
    server.tool("create_record", "Create a new record in Salesforce", {
        objectName: z.string().describe("The API name of the object"),
        values: z
            .record(z.unknown())
            .describe("Field values as key-value pairs (e.g., {Name: 'Test'})"),
        targetOrg: z.string().optional(),
    }, async ({ objectName, values, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Cannot create record: ${validation.error}`,
                    },
                ],
            };
        }
        const result = await createRecord(objectName, values, effectiveOrg);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Failed to Create ${objectName}\n\n${result.error}`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `# Record Created Successfully ✓\n\n**Object:** ${objectName}\n**ID:** ${result.data.id}\n\nUse \`get_record\` to retrieve the full record.`,
                },
            ],
        };
    });
    // Tool: Update Record
    server.tool("update_record", "Update an existing record in Salesforce", {
        objectName: z.string().describe("The API name of the object"),
        recordId: z.string().describe("The record ID to update"),
        values: z
            .record(z.unknown())
            .describe("Field values to update as key-value pairs"),
        targetOrg: z.string().optional(),
    }, async ({ objectName, recordId, values, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Cannot update record: ${validation.error}`,
                    },
                ],
            };
        }
        const result = await updateRecord(objectName, recordId, values, effectiveOrg);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Failed to Update Record\n\n${result.error}`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `# Record Updated Successfully ✓\n\n**Object:** ${objectName}\n**ID:** ${recordId}\n\n**Updated fields:**\n${Object.entries(values)
                        .map(([k, v]) => `- ${k}: ${v}`)
                        .join("\n")}`,
                },
            ],
        };
    });
    // Tool: Delete Record
    server.tool("delete_record", "Delete a record from Salesforce", {
        objectName: z.string().describe("The API name of the object"),
        recordId: z.string().describe("The record ID to delete"),
        targetOrg: z.string().optional(),
    }, async ({ objectName, recordId, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Cannot delete record: ${validation.error}`,
                    },
                ],
            };
        }
        const result = await deleteRecord(objectName, recordId, effectiveOrg);
        if (!result.success) {
            return {
                content: [
                    {
                        type: "text",
                        text: `# Failed to Delete Record\n\n${result.error}`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `# Record Deleted Successfully ✓\n\n**Object:** ${objectName}\n**ID:** ${recordId}`,
                },
            ],
        };
    });
}
//# sourceMappingURL=salesforce-org.js.map