import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";

export function register(server: McpServer) {
  // ─────────────────────────────────────────────────────────────────────────
  // check_partner_visit_config
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "check_partner_visit_config",
    `Check Manufacturing Cloud Partner Visit Management configuration. Queries Visit record types, PartnerVisit records, action plan templates, visit tasks, and permission assignments.
CORRECT object names: Visit, ActionPlan, ActionPlanTemplate, ActionPlanTemplateItem.
WRONG names (DO NOT USE): PartnerVisit__c, Visit__c, VisitTask__c, VisitActionPlan__c.`,
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
            text: `# Cannot Check Partner Visit Configuration\n\n${validation.error}\n\n## ${instructions?.title}\n\n${instructions?.description}`,
          }],
        };
      }

      let message = "# Partner Visit Management Configuration Report\n\n";
      const issues: string[] = [];
      const recommendations: string[] = [];

      try {
        // 1. Visit record types
        message += "## Visit Record Types\n\n";
        const rtQuery = `SELECT Id, Name, DeveloperName, IsActive FROM RecordType WHERE SobjectType = 'Visit' ORDER BY Name`;
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
            issues.push("All Visit record types are inactive — users cannot create partner visits");
          }
        } else {
          message += "_No Visit record types found._\n\n";
          issues.push("No Visit record types configured — required for Partner Visit Management");
          recommendations.push("Create Visit record types in Setup > Object Manager > Visit > Record Types (e.g., 'Partner Visit', 'Distributor Audit')");
        }

        // 2. Visit counts and status breakdown
        message += "## Recent Visits (Status Breakdown)\n\n";
        const visitStatusQuery = `SELECT Status, COUNT(Id) total FROM Visit GROUP BY Status ORDER BY COUNT(Id) DESC LIMIT 10`;
        const visitStatusResult = await runSoqlQuery(visitStatusQuery, effectiveOrg);

        if (visitStatusResult.success && visitStatusResult.data?.records?.length) {
          message += `| Status | Count |\n|--------|-------|\n`;
          for (const r of visitStatusResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.Status} | ${rec.total} |\n`;
          }
          message += "\n";
        } else {
          message += "_No Visit records found yet._\n\n";
          recommendations.push("Create Visit records for partner locations to begin tracking distributor visits");
        }

        // 3. Action Plan Templates
        message += "## Action Plan Templates\n\n";
        const aptQuery = `SELECT Id, Name, IsActive, TargetEntityType FROM ActionPlanTemplate WHERE TargetEntityType = 'Visit' ORDER BY Name`;
        const aptResult = await runSoqlQuery(aptQuery, effectiveOrg);

        if (aptResult.success && aptResult.data?.records?.length) {
          const templates = aptResult.data.records;
          const activeTemplates = templates.filter((r) => (r as Record<string, unknown>).IsActive === true);
          message += `| Template Name | Active |\n|---------------|--------|\n`;
          for (const r of templates) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.Name} | ${rec.IsActive ? "Yes" : "No"} |\n`;
          }
          message += `\n**Total:** ${templates.length} (${activeTemplates.length} active)\n\n`;
          if (activeTemplates.length === 0) {
            recommendations.push("Activate Action Plan Templates so field reps can use standard visit checklists");
          }
        } else {
          message += "_No Action Plan Templates found for Visit object._\n\n";
          recommendations.push("Create Action Plan Templates for partner visits — define standard tasks like 'Review Sales Agreement', 'Check Inventory', 'Train Distributor Staff'");
        }

        // 4. Action Plans (instances)
        message += "## Action Plans (Visit Instances)\n\n";
        const apQuery = `SELECT COUNT(Id) total FROM ActionPlan WHERE TargetId != null`;
        const apResult = await runSoqlQuery(apQuery, effectiveOrg);

        if (apResult.success && apResult.data?.records?.[0]) {
          const total = (apResult.data.records[0] as Record<string, unknown>).total;
          message += `**Action Plan instances:** ${total}\n\n`;
        }

        // 5. Permission sets for Visit Management
        message += "## Visit Management Permission Coverage\n\n";
        const psQuery = `SELECT PermissionSet.Name, COUNT(Id) assigned FROM PermissionSetAssignment WHERE PermissionSet.Name IN ('ManufacturingSalesUser', 'ManufacturingServiceUser', 'ManufacturingPartnerCommunityUser') GROUP BY PermissionSet.Name`;
        const psResult = await runSoqlQuery(psQuery, effectiveOrg);

        if (psResult.success && psResult.data?.records?.length) {
          message += `| Permission Set | Users Assigned |\n|---------------|---------------|\n`;
          for (const r of psResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec["PermissionSet.Name"]} | ${rec.assigned} |\n`;
          }
          message += "\n";
        } else {
          issues.push("Manufacturing permission sets are not assigned — users cannot access Partner Visit Management");
          recommendations.push("Assign ManufacturingSalesUser to account managers who conduct partner visits");
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
        if (issues.length === 0 && recommendations.length === 0) {
          message += "_Partner Visit Management is properly configured._\n";
        }

      } catch (err) {
        message += `\n**Error running checks:** ${err instanceof Error ? err.message : String(err)}\n`;
      }

      return { content: [{ type: "text", text: message }] };
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // list_partner_visits
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "list_partner_visits",
    "List recent partner visits with status, account, and owner. Filter by status or account name.",
    {
      status: z.string().optional().describe("Filter by Status (e.g., 'Planned', 'In Progress', 'Complete')"),
      accountName: z.string().optional().describe("Filter by Account name (partial match)"),
      limit: z.number().optional().default(20).describe("Max records to return (default 20)"),
      targetOrg: z.string().optional(),
    },
    async ({ status, accountName, limit, targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
      }

      const whereClauses: string[] = [];
      if (status) whereClauses.push(`Status = '${status}'`);
      if (accountName) whereClauses.push(`Account.Name LIKE '%${accountName}%'`);
      const whereStr = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const query = `SELECT Id, Name, Status, PlannedVisitStartTime, PlannedVisitEndTime, Account.Name, Owner.Name FROM Visit ${whereStr} ORDER BY PlannedVisitStartTime DESC NULLS LAST LIMIT ${limit ?? 20}`;

      try {
        const result = await runSoqlQuery(query, effectiveOrg);

        if (!result.success || !result.data?.records?.length) {
          return { content: [{ type: "text", text: `# Partner Visits\n\nNo visits found matching your filters.` }] };
        }

        let message = `# Partner Visits (${result.data.records.length} records)\n\n`;
        message += `| Name | Status | Account | Planned Start | Owner |\n|------|--------|---------|--------------|-------|\n`;
        for (const r of result.data.records) {
          const rec = r as Record<string, unknown>;
          const acct = rec.Account as Record<string, unknown> | null;
          const owner = rec.Owner as Record<string, unknown> | null;
          const start = rec.PlannedVisitStartTime
            ? new Date(rec.PlannedVisitStartTime as string).toLocaleDateString()
            : "—";
          message += `| ${rec.Name} | ${rec.Status} | ${acct?.Name ?? "—"} | ${start} | ${owner?.Name ?? "—"} |\n`;
        }

        return { content: [{ type: "text", text: message }] };
      } catch (err) {
        return { content: [{ type: "text", text: `# Error\n\n${err instanceof Error ? err.message : String(err)}` }] };
      }
    }
  );
}
