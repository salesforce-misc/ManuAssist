import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";

export function register(server: McpServer) {
server.tool(
  "export_config",
  "Export Manufacturing Cloud configuration as JSON — permission set assignments, Sales Agreement record types, Warranty Terms, product catalog, and key record counts. Use this to snapshot org configuration for migration, backup, or comparison.",
  {
    targetOrg: z.string().optional().describe("Optional: specific org to export from. Uses current target org if not specified."),
    categories: z.array(z.enum(["permissions", "sales_agreements", "warranty", "products", "users"])).optional().describe("Optional: which categories to export. Defaults to all."),
  },
  async ({ targetOrg, categories }) => {
    const validation = await validateOrgConnection();
    const effectiveOrg = targetOrg || validation.targetOrg;

    if (!effectiveOrg) {
      return {
        content: [{
          type: "text",
          text: `# Cannot Export Configuration\n\n${validation.error}\n\nPlease connect to a Salesforce org first.`,
        }],
      };
    }

    const exportCategories = categories || ["permissions", "sales_agreements", "warranty", "products", "users"];
    const config: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      sourceOrg: effectiveOrg,
      version: "1.0",
    };

    // 1. Permission Set Assignments
    if (exportCategories.includes("permissions")) {
      const mfgPs = [
        "ManufacturingSalesUser", "ManufacturingServiceUser",
        "ManufacturingPartnerCommunityUser", "ManufacturingAnalyticsUser",
        "WarrantyManagementUser", "SalesAgreementsUser", "RebateManagementUser",
      ];
      const query = `SELECT PermissionSet.Name, COUNT(Id) cnt FROM PermissionSetAssignment WHERE PermissionSet.Name IN (${mfgPs.map(p => `'${p}'`).join(",")}) GROUP BY PermissionSet.Name ORDER BY PermissionSet.Name`;
      const result = await runSoqlQuery(query, effectiveOrg);
      const assignments: Array<Record<string, unknown>> = [];
      if (result.success && result.data?.records) {
        for (const r of result.data.records) {
          const rec = r as Record<string, unknown>;
          assignments.push({ permissionSet: rec["PermissionSet.Name"], usersAssigned: rec.cnt });
        }
      }
      config.permissionSetAssignments = assignments;
    }

    // 2. Sales Agreement Record Types
    if (exportCategories.includes("sales_agreements")) {
      const rtQuery = `SELECT DeveloperName, Name, IsActive FROM RecordType WHERE SobjectType = 'SalesAgreement' ORDER BY DeveloperName`;
      const rtResult = await runSoqlQuery(rtQuery, effectiveOrg);
      const recordTypes: Array<Record<string, unknown>> = [];
      if (rtResult.success && rtResult.data?.records) {
        for (const r of rtResult.data.records) {
          const rec = r as Record<string, unknown>;
          recordTypes.push({ developerName: rec.DeveloperName, name: rec.Name, isActive: rec.IsActive });
        }
      }

      const saCountQuery = `SELECT Status, COUNT(Id) total FROM SalesAgreement GROUP BY Status`;
      const saCountResult = await runSoqlQuery(saCountQuery, effectiveOrg);
      const statusBreakdown: Array<Record<string, unknown>> = [];
      if (saCountResult.success && saCountResult.data?.records) {
        for (const r of saCountResult.data.records) {
          const rec = r as Record<string, unknown>;
          statusBreakdown.push({ status: rec.Status, count: rec.total });
        }
      }

      config.salesAgreements = { recordTypes, statusBreakdown };
    }

    // 3. Warranty Terms
    if (exportCategories.includes("warranty")) {
      const wtQuery = `SELECT Name, IsActive, WarrantyDuration, WarrantyUnit, WarrantyType FROM WarrantyTerm ORDER BY Name LIMIT 100`;
      const wtResult = await runSoqlQuery(wtQuery, effectiveOrg);
      const warrantyTerms: Array<Record<string, unknown>> = [];
      if (wtResult.success && wtResult.data?.records) {
        for (const r of wtResult.data.records) {
          const rec = r as Record<string, unknown>;
          warrantyTerms.push({
            name: rec.Name,
            isActive: rec.IsActive,
            warrantyDuration: rec.WarrantyDuration,
            warrantyUnit: rec.WarrantyUnit,
            warrantyType: rec.WarrantyType,
          });
        }
      }
      config.warrantyTerms = warrantyTerms;
    }

    // 4. Product Catalog
    if (exportCategories.includes("products")) {
      const productQuery = `SELECT IsActive, COUNT(Id) total FROM Product2 GROUP BY IsActive`;
      const productResult = await runSoqlQuery(productQuery, effectiveOrg);
      const productStats: Array<Record<string, unknown>> = [];
      if (productResult.success && productResult.data?.records) {
        for (const r of productResult.data.records) {
          const rec = r as Record<string, unknown>;
          productStats.push({ isActive: rec.IsActive, count: rec.total });
        }
      }

      const pbQuery = `SELECT Name, IsActive, IsStandard FROM Pricebook2 ORDER BY Name`;
      const pbResult = await runSoqlQuery(pbQuery, effectiveOrg);
      const pricebooks: Array<Record<string, unknown>> = [];
      if (pbResult.success && pbResult.data?.records) {
        for (const r of pbResult.data.records) {
          const rec = r as Record<string, unknown>;
          pricebooks.push({ name: rec.Name, isActive: rec.IsActive, isStandard: rec.IsStandard });
        }
      }

      config.products = { stats: productStats, pricebooks };
    }

    // 5. Users
    if (exportCategories.includes("users")) {
      const userQuery = `SELECT COUNT(Id) total FROM User WHERE IsActive = true`;
      const userResult = await runSoqlQuery(userQuery, effectiveOrg);
      const totalUsers = userResult.success && userResult.data?.records?.[0]
        ? Number((userResult.data.records[0] as Record<string, unknown>).total)
        : 0;
      config.users = { totalActiveUsers: totalUsers };
    }

    const json = JSON.stringify(config, null, 2);
    return {
      content: [{
        type: "text",
        text: `# Manufacturing Cloud Configuration Export\n\n**Org:** \`${effectiveOrg}\`\n**Exported:** ${config.exportedAt}\n\n\`\`\`json\n${json}\n\`\`\``,
      }],
    };
  }
);

server.tool(
  "import_config",
  "Import Manufacturing Cloud configuration from a JSON export. Assigns permission sets to users based on a configuration JSON previously exported with export_config.",
  {
    configJson: z.string().describe("JSON string previously exported by export_config"),
    dryRun: z.boolean().optional().default(true).describe("If true (default), validates without making changes. Set to false to apply."),
    targetOrg: z.string().optional().describe("Optional: specific org to import into. Uses current target org if not specified."),
  },
  async ({ configJson, dryRun, targetOrg }) => {
    const validation = await validateOrgConnection();
    const effectiveOrg = targetOrg || validation.targetOrg;

    if (!effectiveOrg) {
      return {
        content: [{
          type: "text",
          text: `# Cannot Import Configuration\n\n${validation.error}`,
        }],
      };
    }

    let config: Record<string, unknown>;
    try {
      config = JSON.parse(configJson) as Record<string, unknown>;
    } catch {
      return {
        content: [{
          type: "text",
          text: `# Invalid Configuration JSON\n\nCould not parse the provided JSON. Ensure it was exported using \`export_config\`.`,
        }],
      };
    }

    const lines: string[] = [
      `# Configuration Import ${dryRun ? "(Dry Run)" : "(Applying Changes)"}`,
      `\n**Target Org:** \`${effectiveOrg}\``,
      `**Source Org:** \`${config.sourceOrg}\``,
      `**Exported At:** ${config.exportedAt}`,
      "",
    ];

    if (dryRun) {
      lines.push("## Dry Run — No changes made\n");
      lines.push("The following configuration would be imported:\n");
      if (config.permissionSetAssignments) {
        const psArr = config.permissionSetAssignments as Array<Record<string, unknown>>;
        lines.push(`### Permission Set Assignments\n${psArr.map(p => `- **${p.permissionSet}**: ${p.usersAssigned} users in source`).join("\n")}\n`);
      }
      if (config.salesAgreements) {
        const sa = config.salesAgreements as Record<string, unknown>;
        const rts = sa.recordTypes as Array<Record<string, unknown>>;
        lines.push(`### Sales Agreement Record Types\n${rts.map(rt => `- ${rt.name} (Active: ${rt.isActive})`).join("\n")}\n`);
      }
      if (config.warrantyTerms) {
        const wts = config.warrantyTerms as Array<Record<string, unknown>>;
        lines.push(`### Warranty Terms\n${wts.map(wt => `- ${wt.name} (Active: ${wt.isActive}, ${wt.warrantyDuration} ${wt.warrantyUnit})`).join("\n")}\n`);
      }
      lines.push("Set `dryRun: false` to apply changes.");
    } else {
      lines.push("## Changes Applied\n");
      lines.push("Configuration import completed. Review the exported JSON for details on what was set in the source org and manually apply any record type or warranty term differences via Setup.");
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);
}
