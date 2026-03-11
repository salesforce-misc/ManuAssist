import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";

export function register(server: McpServer) {
  // ─────────────────────────────────────────────────────────────────────────
  // check_mfg_user_config
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "check_mfg_user_config",
    `Check Manufacturing Cloud user configuration. Validates package licenses, permission set assignments, profiles, roles, and territory-user associations.
Key permission sets: ManufacturingSalesUser, ManufacturingServiceUser, ManufacturingPartnerCommunityUser, ManufacturingAnalyticsUser, WarrantyManagementUser, SalesAgreementsUser, RebateManagementUser.`,
    {
      targetOrg: z.string().optional(),
    },
    async ({ targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        return {
          content: [{
            type: "text",
            text: `# Cannot Check User Configuration\n\n${validation.error}`,
          }],
        };
      }

      let message = "# Manufacturing Cloud User Configuration Report\n\n";
      const issues: string[] = [];
      const recommendations: string[] = [];

      try {
        // 1. Active users
        message += "## Active Users\n\n";
        const userQuery = `SELECT COUNT(Id) total FROM User WHERE IsActive = true`;
        const userResult = await runSoqlQuery(userQuery, effectiveOrg);
        if (userResult.success && userResult.data?.records?.[0]) {
          const total = (userResult.data.records[0] as Record<string, unknown>).total;
          message += `**Active users:** ${total}\n\n`;
        }

        // 2. Manufacturing permission set assignments
        message += "## Manufacturing Permission Set Assignments\n\n";
        const mfgPermSets = [
          "ManufacturingSalesUser",
          "ManufacturingServiceUser",
          "ManufacturingPartnerCommunityUser",
          "ManufacturingAnalyticsUser",
          "WarrantyManagementUser",
          "SalesAgreementsUser",
          "RebateManagementUser",
        ];
        const psQuery = `SELECT PermissionSet.Name, COUNT(Id) assigned FROM PermissionSetAssignment WHERE PermissionSet.Name IN (${mfgPermSets.map((p) => `'${p}'`).join(",")}) GROUP BY PermissionSet.Name ORDER BY COUNT(Id) DESC`;
        const psResult = await runSoqlQuery(psQuery, effectiveOrg);

        if (psResult.success && psResult.data?.records?.length) {
          const found = psResult.data.records.map((r) => (r as Record<string, unknown>)["PermissionSet.Name"] as string);
          message += `| Permission Set | Users Assigned |\n|---------------|---------------|\n`;
          for (const r of psResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec["PermissionSet.Name"]} | ${rec.assigned} |\n`;
          }
          message += "\n";

          // Check for critical unassigned permission sets
          const criticalSets = ["ManufacturingSalesUser", "ManufacturingServiceUser"];
          for (const ps of criticalSets) {
            if (!found.includes(ps)) {
              issues.push(`${ps} permission set has no assignments — required for Manufacturing Cloud access`);
            }
          }
        } else {
          issues.push("No Manufacturing permission sets are assigned to any users");
          recommendations.push("Assign ManufacturingSalesUser to account managers; ManufacturingServiceUser to CSRs and warranty admins");
        }

        // 3. Profiles
        message += "## Profiles in Use\n\n";
        const profileQuery = `SELECT Profile.Name, COUNT(Id) userCount FROM User WHERE IsActive = true GROUP BY Profile.Name ORDER BY COUNT(Id) DESC LIMIT 10`;
        const profileResult = await runSoqlQuery(profileQuery, effectiveOrg);

        if (profileResult.success && profileResult.data?.records?.length) {
          message += `| Profile | Active Users |\n|---------|-------------|\n`;
          for (const r of profileResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec["Profile.Name"]} | ${rec.userCount} |\n`;
          }
          message += "\n";
        }

        // 4. Users without Manufacturing permission sets (potential gap)
        message += "## Users Without Manufacturing Permission Sets\n\n";
        const noMfgQuery = `SELECT COUNT(Id) total FROM User WHERE IsActive = true AND Id NOT IN (SELECT AssigneeId FROM PermissionSetAssignment WHERE PermissionSet.Name IN (${mfgPermSets.map((p) => `'${p}'`).join(",")}))`;
        const noMfgResult = await runSoqlQuery(noMfgQuery, effectiveOrg);

        if (noMfgResult.success && noMfgResult.data?.records?.[0]) {
          const total = (noMfgResult.data.records[0] as Record<string, unknown>).total;
          message += `**Active users with no Manufacturing permission sets:** ${total}\n\n`;
          if (Number(total) > 0) {
            recommendations.push(`${total} active users have no Manufacturing Cloud permission sets — review and assign appropriate permission sets`);
          }
        }

        // 5. Roles
        message += "## Role Hierarchy\n\n";
        const roleQuery = `SELECT Id, Name, DeveloperName FROM UserRole ORDER BY Name LIMIT 15`;
        const roleResult = await runSoqlQuery(roleQuery, effectiveOrg);

        if (roleResult.success && roleResult.data?.records?.length) {
          const roles = roleResult.data.records;
          message += `**${roles.length} roles defined** (showing up to 15)\n\n`;
          message += roles.map((r) => `- ${(r as Record<string, unknown>).Name}`).join("\n") + "\n\n";
        } else {
          recommendations.push("No role hierarchy defined — roles are needed for CRM Analytics visibility and territory-based access");
        }

        // ─── Summary ───────────────────────────────────────────────────────
        const overallStatus = issues.length === 0 ? "READY" : issues.length <= 2 ? "NEEDS ATTENTION" : "NOT CONFIGURED";
        message += `## Summary\n\n**Overall Status: ${overallStatus}**\n\n`;

        if (issues.length > 0) {
          message += `### Issues Found\n${issues.map((i, n) => `${n + 1}. ${i}`).join("\n")}\n\n`;
        }
        if (recommendations.length > 0) {
          message += `### Recommendations\n${recommendations.map((r, n) => `${n + 1}. ${r}`).join("\n")}\n`;
        }

      } catch (err) {
        message += `\n**Error:** ${err instanceof Error ? err.message : String(err)}\n`;
      }

      return { content: [{ type: "text", text: message }] };
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // check_product_portfolio_config
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "check_product_portfolio_config",
    `Check Manufacturing Cloud Product Portfolio / Product Catalog Management configuration.
Validates Product2, ProductCatalog, ProductCategory, and price book setup.
CORRECT object names: Product2, ProductCatalog, ProductCategory, PricebookEntry, Pricebook2.
WRONG names (DO NOT USE): Product__c, ProductCatalog__c, ProductCategory__c.`,
    {
      targetOrg: z.string().optional(),
    },
    async ({ targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
      }

      let message = "# Product Portfolio Configuration Report\n\n";
      const issues: string[] = [];
      const recommendations: string[] = [];

      try {
        // 1. Products
        message += "## Products\n\n";
        const productQuery = `SELECT IsActive, COUNT(Id) total FROM Product2 GROUP BY IsActive ORDER BY COUNT(Id) DESC`;
        const productResult = await runSoqlQuery(productQuery, effectiveOrg);

        if (productResult.success && productResult.data?.records?.length) {
          message += `| Active | Count |\n|--------|-------|\n`;
          let grandTotal = 0;
          for (const r of productResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.IsActive ? "Yes" : "No"} | ${rec.total} |\n`;
            grandTotal += Number(rec.total);
          }
          message += `\n**Total Products:** ${grandTotal}\n\n`;
          if (grandTotal === 0) {
            issues.push("No Product2 records found — products must exist before you can create Sales Agreements or Forecasts");
          }
        } else {
          issues.push("No products configured");
          recommendations.push("Load Product2 records via Data Import Wizard or use Product Catalog Management to build your product hierarchy");
        }

        // 2. Product Catalogs
        message += "## Product Catalogs\n\n";
        const catalogQuery = `SELECT Id, Name, IsActive FROM ProductCatalog ORDER BY Name LIMIT 10`;
        const catalogResult = await runSoqlQuery(catalogQuery, effectiveOrg);

        if (catalogResult.success && catalogResult.data?.records?.length) {
          message += `| Catalog | Active |\n|---------|--------|\n`;
          for (const r of catalogResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.Name} | ${rec.IsActive ? "Yes" : "No"} |\n`;
          }
          message += "\n";
        } else {
          message += "_No Product Catalogs found._\n\n";
          recommendations.push("Create Product Catalogs to organize products for partners and distributors in Experience Cloud sites");
        }

        // 3. Price Books
        message += "## Price Books\n\n";
        const pbQuery = `SELECT Id, Name, IsActive, IsStandard FROM Pricebook2 ORDER BY IsStandard DESC, Name LIMIT 10`;
        const pbResult = await runSoqlQuery(pbQuery, effectiveOrg);

        if (pbResult.success && pbResult.data?.records?.length) {
          message += `| Price Book | Active | Standard |\n|-----------|--------|----------|\n`;
          for (const r of pbResult.data.records) {
            const rec = r as Record<string, unknown>;
            message += `| ${rec.Name} | ${rec.IsActive ? "Yes" : "No"} | ${rec.IsStandard ? "Yes" : "No"} |\n`;
          }
          message += "\n";

          const activeStandard = pbResult.data.records.find(
            (r) => (r as Record<string, unknown>).IsStandard === true && (r as Record<string, unknown>).IsActive === true
          );
          if (!activeStandard) {
            issues.push("Standard Price Book is inactive — Sales Agreements require an active price book");
          }
        } else {
          issues.push("No Price Books found — required for Sales Agreements and product pricing");
        }

        // ─── Summary ───────────────────────────────────────────────────────
        const overallStatus = issues.length === 0 ? "READY" : issues.length <= 2 ? "NEEDS ATTENTION" : "NOT CONFIGURED";
        message += `## Summary\n\n**Overall Status: ${overallStatus}**\n\n`;

        if (issues.length > 0) {
          message += `### Issues Found\n${issues.map((i, n) => `${n + 1}. ${i}`).join("\n")}\n\n`;
        }
        if (recommendations.length > 0) {
          message += `### Recommendations\n${recommendations.map((r, n) => `${n + 1}. ${r}`).join("\n")}\n`;
        }
        if (issues.length === 0 && recommendations.length === 0) {
          message += "_Product Portfolio is properly configured._\n";
        }

      } catch (err) {
        message += `\n**Error:** ${err instanceof Error ? err.message : String(err)}\n`;
      }

      return { content: [{ type: "text", text: message }] };
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // check_mfg_account_config
  // ─────────────────────────────────────────────────────────────────────────
  server.tool(
    "check_mfg_account_config",
    "Check Account configuration for Manufacturing Cloud — account record types, relationship center setup, and partner/distributor account presence.",
    {
      targetOrg: z.string().optional(),
    },
    async ({ targetOrg }) => {
      const validation = await validateOrgConnection();
      const effectiveOrg = targetOrg || validation.targetOrg;

      if (!effectiveOrg) {
        return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
      }

      let message = "# Account Configuration Report\n\n";
      const issues: string[] = [];
      const recommendations: string[] = [];

      try {
        // Account record types
        message += "## Account Record Types\n\n";
        const rtQuery = `SELECT Id, Name, DeveloperName, IsActive FROM RecordType WHERE SobjectType = 'Account' ORDER BY Name`;
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
        } else {
          recommendations.push("Consider creating Account record types to differentiate OEM customers, distributors, dealers, and suppliers");
        }

        // Account counts
        message += "## Account Overview\n\n";
        const acctQuery = `SELECT COUNT(Id) total FROM Account WHERE IsDeleted = false`;
        const acctResult = await runSoqlQuery(acctQuery, effectiveOrg);
        if (acctResult.success && acctResult.data?.records?.[0]) {
          const total = (acctResult.data.records[0] as Record<string, unknown>).total;
          message += `**Total Account records:** ${total}\n\n`;
          if (Number(total) === 0) {
            issues.push("No Account records found — accounts (OEMs, distributors, dealers) are required for Sales Agreements and Partner Visits");
          }
        }

        // ─── Summary ───────────────────────────────────────────────────────
        const overallStatus = issues.length === 0 ? "READY" : "NEEDS ATTENTION";
        message += `## Summary\n\n**Overall Status: ${overallStatus}**\n\n`;
        if (issues.length > 0) {
          message += `### Issues Found\n${issues.map((i, n) => `${n + 1}. ${i}`).join("\n")}\n\n`;
        }
        if (recommendations.length > 0) {
          message += `### Recommendations\n${recommendations.map((r, n) => `${n + 1}. ${r}`).join("\n")}\n`;
        }

      } catch (err) {
        message += `\n**Error:** ${err instanceof Error ? err.message : String(err)}\n`;
      }

      return { content: [{ type: "text", text: message }] };
    }
  );
}
