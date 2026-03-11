import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";

export function register(server: McpServer) {
  // ─────────────────────────────────────────────────────────────────────────
  // check_sales_agreement_config
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "check_sales_agreement_config",
    `Check Manufacturing Cloud Sales Agreement configuration. Queries SalesAgreement records, products, schedules, account associations, status distribution, and activation settings.
CORRECT object names: SalesAgreement, SalesAgreementProduct, SalesAgreementProductSchedule, Account.
WRONG names (DO NOT USE): SalesAgreement__c, SalesContract__c, RunRateBusiness__c.`,
    {
      targetOrg: z.string().optional().describe("Optional: specific org alias. Uses current target org if not set."),
    },
    async ({ targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        const instructions = validation.setupInstructions;
        return {
          content: [{
            type: "text",
            text: `# Cannot Check Sales Agreement Configuration\n\n${validation.error}\n\n## ${instructions?.title}\n\n${instructions?.description}\n\n${instructions?.command ? `\`\`\`bash\n${instructions.command}\n\`\`\`` : ""}`,
          }],
        };
      }

      let message = "# Sales Agreement Configuration Report\n\n";
      const issues: string[] = [];
      const recommendations: string[] = [];

      try {
        // 1. Total Sales Agreement count and status breakdown
        message += "## Sales Agreement Overview\n\n";
        const statusQuery = `SELECT Status, COUNT(Id) total FROM SalesAgreement GROUP BY Status ORDER BY COUNT(Id) DESC`;
        const statusResult = await runSoqlQuery(statusQuery, effectiveOrg);

        if (statusResult.success && statusResult.data?.records?.length) {
          message += `| Status | Count |\n|--------|-------|\n`;
          let total = 0;
          for (const r of statusResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.Status} | ${rec.total} |\n`;
            total += Number(rec.total);
          }
          message += `\n**Total Sales Agreements:** ${total}\n\n`;
          if (total === 0) {
            issues.push("No Sales Agreements found — load or create agreements to begin run-rate business tracking");
          }
        } else {
          message += "_No Sales Agreements found._\n\n";
          issues.push("No Sales Agreements configured. Sales Agreements are the foundation of Manufacturing Cloud for Sales.");
          recommendations.push("Create Sales Agreement record types in Setup > Object Manager > Sales Agreement > Record Types");
        }

        // 2. Sales Agreement record types
        message += "## Sales Agreement Record Types\n\n";
        const rtQuery = `SELECT Id, Name, DeveloperName, IsActive FROM RecordType WHERE SobjectType = 'SalesAgreement' ORDER BY Name`;
        const rtResult = await runSoqlQuery(rtQuery, effectiveOrg);

        if (rtResult.success && rtResult.data?.records?.length) {
          const recs = rtResult.data.records;
          const active = recs.filter((r) => (r as Record<string, unknown>).IsActive === true);
          message += `| Name | Developer Name | Active |\n|------|----------------|--------|\n`;
          for (const r of recs) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.Name} | ${rec.DeveloperName} | ${rec.IsActive ? "Yes" : "No"} |\n`;
          }
          message += `\n**Total:** ${recs.length} (${active.length} active)\n\n`;
          if (active.length === 0) {
            issues.push("All Sales Agreement record types are inactive — users cannot create agreements");
          }
        } else {
          message += "_No record types found._\n\n";
          issues.push("No Sales Agreement record types configured");
          recommendations.push("Go to Setup > Object Manager > Sales Agreement > Record Types to create record types");
        }

        // 3. Products associated with Sales Agreements
        message += "## Sales Agreement Products\n\n";
        const prodQuery = `SELECT COUNT(Id) total FROM SalesAgreementProduct`;
        const prodResult = await runSoqlQuery(prodQuery, effectiveOrg);

        if (prodResult.success && prodResult.data?.records?.[0]) {
          const total = (prodResult.data.records[0] as Record<string, unknown>).total;
          message += `**SalesAgreementProduct records:** ${total}\n\n`;
          if (Number(total) === 0) {
            recommendations.push("Add products to Sales Agreements so you can track planned vs. actual quantities by product");
          }
        }

        // 4. Product schedules (planned vs. actual tracking)
        message += "## Product Schedules\n\n";
        const scheduleQuery = `SELECT COUNT(Id) total FROM SalesAgreementProductSchedule`;
        const scheduleResult = await runSoqlQuery(scheduleQuery, effectiveOrg);

        if (scheduleResult.success && scheduleResult.data?.records?.[0]) {
          const total = (scheduleResult.data.records[0] as Record<string, unknown>).total;
          message += `**SalesAgreementProductSchedule records:** ${total}\n\n`;
          if (Number(total) === 0) {
            recommendations.push("Product schedules are missing — schedules define planned quantities/revenue by period (month/quarter/year)");
          }
        }

        // 5. Recent agreements (last 5 for sample view)
        message += "## Recent Sales Agreements (Latest 5)\n\n";
        const recentQuery = `SELECT Id, Name, Status, StartDate, EndDate, AccountId, Account.Name FROM SalesAgreement ORDER BY CreatedDate DESC LIMIT 5`;
        const recentResult = await runSoqlQuery(recentQuery, effectiveOrg);

        if (recentResult.success && recentResult.data?.records?.length) {
          message += `| Name | Status | Account | Start | End |\n|------|--------|---------|-------|-----|\n`;
          for (const r of recentResult.data.records) {
            const rec = r as Record<string, unknown>;
            const acct = rec.Account as Record<string, unknown> | null;
            message += `| ${rec.Name} | ${rec.Status} | ${acct?.Name ?? "—"} | ${rec.StartDate ?? "—"} | ${rec.EndDate ?? "—"} |\n`;
          }
          message += "\n";
        } else {
          message += "_No Sales Agreements to display._\n\n";
        }

        // 6. Permission set check for Sales Agreements
        message += "## Manufacturing Permission Set Coverage\n\n";
        const psQuery = `SELECT PermissionSet.Name, COUNT(Id) assigned FROM PermissionSetAssignment WHERE PermissionSet.Name IN ('ManufacturingSalesUser', 'SalesAgreementsUser', 'ManufacturingServiceUser') GROUP BY PermissionSet.Name`;
        const psResult = await runSoqlQuery(psQuery, effectiveOrg);

        if (psResult.success && psResult.data?.records?.length) {
          message += `| Permission Set | Users Assigned |\n|---------------|---------------|\n`;
          const found: string[] = [];
          for (const r of psResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec["PermissionSet.Name"]} | ${rec.assigned} |\n`;
            found.push(rec["PermissionSet.Name"] as string);
          }
          message += "\n";
          if (!found.includes("ManufacturingSalesUser")) {
            issues.push("ManufacturingSalesUser permission set has no assignments — users need this to access Sales Agreements");
          }
        } else {
          issues.push("No Manufacturing permission sets assigned. Users cannot access Sales Agreements.");
          recommendations.push("Assign ManufacturingSalesUser permission set to account managers and sales reps");
        }

        // ─── Summary ───────────────────────────────────────────────────────
        const status = issues.length === 0 ? "READY" : issues.length <= 2 ? "NEEDS ATTENTION" : "NOT CONFIGURED";
        message += `## Summary\n\n**Overall Status: ${status}**\n\n`;

        if (issues.length > 0) {
          message += `### Issues Found\n${issues.map((i, n) => `${n + 1}. ${i}`).join("\n")}\n\n`;
        }
        if (recommendations.length > 0) {
          message += `### Recommendations\n${recommendations.map((r, n) => `${n + 1}. ${r}`).join("\n")}\n`;
        }
        if (issues.length === 0) {
          message += "_No issues found. Sales Agreements are configured correctly._\n";
        }

      } catch (err) {
        message += `\n**Error running checks:** ${err instanceof Error ? err.message : String(err)}\n`;
      }

      return { content: [{ type: "text", text: message }] };
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // get_sales_agreement_details
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "get_sales_agreement_details",
    "Get full details of a Sales Agreement including products and schedules. Provide a Sales Agreement name or Id.",
    {
      nameOrId: z.string().describe("Sales Agreement Name or Salesforce Id"),
      targetOrg: z.string().optional(),
    },
    async ({ nameOrId, targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
      }

      const isId = /^[a-zA-Z0-9]{15,18}$/.test(nameOrId);
      const whereClause = isId ? `Id = '${nameOrId}'` : `Name LIKE '%${nameOrId}%'`;

      let message = `# Sales Agreement Details: ${nameOrId}\n\n`;

      try {
        const saQuery = `SELECT Id, Name, Status, StartDate, EndDate, Description, AccountId, Account.Name, OwnerId, Owner.Name, CurrencyIsoCode FROM SalesAgreement WHERE ${whereClause} LIMIT 5`;
        const saResult = await runSoqlQuery(saQuery, effectiveOrg);

        if (!saResult.success || !saResult.data?.records?.length) {
          return { content: [{ type: "text", text: `${message}No Sales Agreement found matching: **${nameOrId}**\n` }] };
        }

        for (const r of saResult.data.records) {
          const sa = r as Record<string, unknown>;
          const acct = sa.Account as Record<string, unknown> | null;
          const owner = sa.Owner as Record<string, unknown> | null;

          message += `## ${sa.Name}\n\n`;
          message += `| Field | Value |\n|-------|-------|\n`;
          message += `| ID | \`${sa.Id}\` |\n`;
          message += `| Status | ${sa.Status} |\n`;
          message += `| Account | ${acct?.Name ?? sa.AccountId ?? "—"} |\n`;
          message += `| Owner | ${owner?.Name ?? sa.OwnerId ?? "—"} |\n`;
          message += `| Start Date | ${sa.StartDate ?? "—"} |\n`;
          message += `| End Date | ${sa.EndDate ?? "—"} |\n`;
          message += `| Currency | ${sa.CurrencyIsoCode ?? "—"} |\n`;
          message += `| Description | ${sa.Description ?? "—"} |\n\n`;

          // Products on this agreement
          const prodQuery = `SELECT Id, Name, Product2.Name, PlannedQuantity, ActualQuantity, PlannedRevenue, ActualRevenue FROM SalesAgreementProduct WHERE SalesAgreementId = '${sa.Id}' LIMIT 20`;
          const prodResult = await runSoqlQuery(prodQuery, effectiveOrg);

          message += `### Products\n\n`;
          if (prodResult.success && prodResult.data?.records?.length) {
            message += `| Product | Planned Qty | Actual Qty | Planned Rev | Actual Rev |\n|---------|-------------|------------|-------------|------------|\n`;
            for (const p of prodResult.data.records) {
              const prod = p as Record<string, unknown>;
              const product2 = prod.Product2 as Record<string, unknown> | null;
              message += `| ${product2?.Name ?? prod.Name} | ${prod.PlannedQuantity ?? 0} | ${prod.ActualQuantity ?? 0} | ${prod.PlannedRevenue ?? 0} | ${prod.ActualRevenue ?? 0} |\n`;
            }
            message += "\n";
          } else {
            message += "_No products linked to this agreement._\n\n";
          }
        }
      } catch (err) {
        message += `\n**Error:** ${err instanceof Error ? err.message : String(err)}\n`;
      }

      return { content: [{ type: "text", text: message }] };
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // activate_sales_agreement
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "activate_sales_agreement",
    "Activate a Sales Agreement by updating its Status to 'Active'. Requires the Sales Agreement Id.",
    {
      salesAgreementId: z.string().describe("Salesforce Id of the Sales Agreement to activate"),
      targetOrg: z.string().optional(),
    },
    async ({ salesAgreementId, targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
      }

      try {
        const { updateRecord } = await import("../salesforce/cli.js");
        const result = await updateRecord("SalesAgreement", salesAgreementId, { Status: "Active" }, effectiveOrg);

        if (result.success) {
          return {
            content: [{ type: "text", text: `# Sales Agreement Activated\n\nSales Agreement \`${salesAgreementId}\` has been set to **Active**.\n\nNote: After activation, planned product quantities and schedules will be tracked against actuals from orders and contracts.` }],
          };
        } else {
          return {
            content: [{ type: "text", text: `# Activation Failed\n\n${result.error}\n\nMake sure the Sales Agreement exists and you have edit access.` }],
          };
        }
      } catch (err) {
        return { content: [{ type: "text", text: `# Error\n\n${err instanceof Error ? err.message : String(err)}` }] };
      }
    }
  );
}
