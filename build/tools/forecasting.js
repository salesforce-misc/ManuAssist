import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";
export function register(server) {
    // ─────────────────────────────────────────────────────────────────────────
    // check_forecasting_config
    // ─────────────────────────────────────────────────────────────────────────
    server.tool("check_forecasting_config", `Check Manufacturing Cloud Advanced Account Forecasting configuration. Validates AccountForecast records, forecast periods, Data Processing Engine definitions, Account Manager Targets, and Program-Based Business setup.
CORRECT object names: AccountForecast, AccountForecastPeriodMetric, AcctMgrTarget, AcctMgrTargetDstr, MfgProgram, MfgProgramItem.
WRONG names (DO NOT USE): Forecast__c, AccountForecast__c, ManagerTarget__c, MfgForecast__c.`, {
        targetOrg: z.string().optional().describe("Optional: specific org alias. Uses current target org if not set."),
    }, async ({ targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            const instructions = validation.setupInstructions;
            return {
                content: [{
                        type: "text",
                        text: `# Cannot Check Forecasting Configuration\n\n${validation.error}\n\n## ${instructions?.title}\n\n${instructions?.description}`,
                    }],
            };
        }
        let message = "# Advanced Account Forecasting Configuration Report\n\n";
        const issues = [];
        const recommendations = [];
        try {
            // 1. Account Forecasts
            message += "## Account Forecasts\n\n";
            const afQuery = `SELECT COUNT(Id) total FROM AccountForecast`;
            const afResult = await runSoqlQuery(afQuery, effectiveOrg);
            if (afResult.success && afResult.data?.records?.[0]) {
                const total = afResult.data.records[0].total;
                message += `**AccountForecast records:** ${total}\n\n`;
                if (Number(total) === 0) {
                    issues.push("No Account Forecasts found — run the Advanced Account Forecasting Data Processing Engine job to generate forecasts");
                    recommendations.push("Go to Data Processing Engine > Find the Manufacturing AAF DPE definition > Run to generate AccountForecast records");
                }
            }
            // 2. Forecast Period Metrics
            message += "## Forecast Period Metrics\n\n";
            const fpmQuery = `SELECT COUNT(Id) total FROM AccountForecastPeriodMetric`;
            const fpmResult = await runSoqlQuery(fpmQuery, effectiveOrg);
            if (fpmResult.success && fpmResult.data?.records?.[0]) {
                const total = fpmResult.data.records[0].total;
                message += `**AccountForecastPeriodMetric records:** ${total}\n\n`;
                if (Number(total) === 0) {
                    recommendations.push("Period metrics are empty — these are populated by the AAF DPE job and drive the forecast grid UI");
                }
            }
            // 3. Account Manager Targets
            message += "## Account Manager Targets\n\n";
            const amtQuery = `SELECT Status, COUNT(Id) total FROM AcctMgrTarget GROUP BY Status ORDER BY COUNT(Id) DESC`;
            const amtResult = await runSoqlQuery(amtQuery, effectiveOrg);
            if (amtResult.success && amtResult.data?.records?.length) {
                message += `| Status | Count |\n|--------|-------|\n`;
                let grandTotal = 0;
                for (const r of amtResult.data.records) {
                    const rec = r;
                    message += `| ${rec.Status} | ${rec.total} |\n`;
                    grandTotal += Number(rec.total);
                }
                message += `\n**Total Targets:** ${grandTotal}\n\n`;
            }
            else {
                message += "_No Account Manager Targets found._\n\n";
                recommendations.push("Create Account Manager Targets to distribute organizational revenue and quantity goals to your account managers");
            }
            // 4. Target distributions
            message += "## Target Distributions\n\n";
            const dstrQuery = `SELECT COUNT(Id) total FROM AcctMgrTargetDstr`;
            const dstrResult = await runSoqlQuery(dstrQuery, effectiveOrg);
            if (dstrResult.success && dstrResult.data?.records?.[0]) {
                const total = dstrResult.data.records[0].total;
                message += `**AcctMgrTargetDstr records:** ${total}\n\n`;
                if (Number(total) === 0) {
                    recommendations.push("No target distributions found — distribute targets by time period (month/quarter/year) to enable periodic tracking");
                }
            }
            // 5. Program-Based Business (MfgProgram)
            message += "## Program-Based Business\n\n";
            const mfgProgQuery = `SELECT Status, COUNT(Id) total FROM MfgProgram GROUP BY Status ORDER BY COUNT(Id) DESC`;
            const mfgProgResult = await runSoqlQuery(mfgProgQuery, effectiveOrg);
            if (mfgProgResult.success && mfgProgResult.data?.records?.length) {
                message += `| Status | Count |\n|--------|-------|\n`;
                for (const r of mfgProgResult.data.records) {
                    const rec = r;
                    message += `| ${rec.Status} | ${rec.total} |\n`;
                }
                message += "\n";
            }
            else {
                message += "_No Manufacturing Programs found._\n\n";
                recommendations.push("Manufacturing Programs (Program-Based Business) enable suppliers to derive forecasts from customer program data — create programs if you manage production of components for OEM customers");
            }
            // 6. Data Processing Engine definitions
            message += "## Data Processing Engine Definitions\n\n";
            const dpeQuery = `SELECT Id, DeveloperName, Status FROM DataProcessingEngineDefinition WHERE DeveloperName LIKE '%Forecast%' OR DeveloperName LIKE '%Manufacturing%' ORDER BY DeveloperName LIMIT 10`;
            const dpeResult = await runSoqlQuery(dpeQuery, effectiveOrg);
            if (dpeResult.success && dpeResult.data?.records?.length) {
                message += `| DPE Definition | Status |\n|----------------|--------|\n`;
                for (const r of dpeResult.data.records) {
                    const rec = r;
                    message += `| ${rec.DeveloperName} | ${rec.Status ?? "—"} |\n`;
                }
                message += "\n";
            }
            else {
                message += "_No Manufacturing/Forecast DPE definitions found._\n\n";
                issues.push("No Data Processing Engine definitions for forecasting — AAF requires DPE templates to generate forecasts from sales order/agreement data");
                recommendations.push("Install the Manufacturing Cloud DPE templates from Setup > Data Processing Engine or contact Salesforce Support");
            }
            // 7. Permission coverage
            message += "## Forecasting Permission Coverage\n\n";
            const psQuery = `SELECT PermissionSet.Name, COUNT(Id) assigned FROM PermissionSetAssignment WHERE PermissionSet.Name IN ('ManufacturingSalesUser', 'ManufacturingAnalyticsUser', 'ManufacturingServiceUser') GROUP BY PermissionSet.Name`;
            const psResult = await runSoqlQuery(psQuery, effectiveOrg);
            if (psResult.success && psResult.data?.records?.length) {
                message += `| Permission Set | Users Assigned |\n|---------------|---------------|\n`;
                for (const r of psResult.data.records) {
                    const rec = r;
                    message += `| ${rec["PermissionSet.Name"]} | ${rec.assigned} |\n`;
                }
                message += "\n";
            }
            else {
                issues.push("No Manufacturing permission sets assigned — users cannot access forecasting features");
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
                message += "_Advanced Account Forecasting is properly configured._\n";
            }
        }
        catch (err) {
            message += `\n**Error running checks:** ${err instanceof Error ? err.message : String(err)}\n`;
        }
        return { content: [{ type: "text", text: message }] };
    });
    // ─────────────────────────────────────────────────────────────────────────
    // check_account_manager_targets
    // ─────────────────────────────────────────────────────────────────────────
    server.tool("check_account_manager_targets", "Get Account Manager Targets for a specific user or all users. Shows targets, status, and distribution details.", {
        ownerNameOrId: z.string().optional().describe("Filter by account manager name or Salesforce User Id"),
        targetPeriod: z.string().optional().describe("Filter by target period label (e.g., 'Q1 2026', '2026')"),
        targetOrg: z.string().optional(),
    }, async ({ ownerNameOrId, targetPeriod, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
        }
        const whereClauses = [];
        if (ownerNameOrId) {
            const isId = /^[a-zA-Z0-9]{15,18}$/.test(ownerNameOrId);
            if (isId) {
                whereClauses.push(`OwnerId = '${ownerNameOrId}'`);
            }
            else {
                whereClauses.push(`Owner.Name LIKE '%${ownerNameOrId}%'`);
            }
        }
        if (targetPeriod)
            whereClauses.push(`Name LIKE '%${targetPeriod}%'`);
        const whereStr = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
        const query = `SELECT Id, Name, Status, StartDate, EndDate, Owner.Name, TotalTarget, TotalAllocatedTarget FROM AcctMgrTarget ${whereStr} ORDER BY StartDate DESC NULLS LAST LIMIT 20`;
        try {
            const result = await runSoqlQuery(query, effectiveOrg);
            if (!result.success || !result.data?.records?.length) {
                return { content: [{ type: "text", text: `# Account Manager Targets\n\nNo targets found matching your filters.` }] };
            }
            let message = `# Account Manager Targets (${result.data.records.length})\n\n`;
            message += `| Name | Status | Owner | Start | End | Total Target | Allocated |\n|------|--------|-------|-------|-----|--------------|-----------|\n`;
            for (const r of result.data.records) {
                const rec = r;
                const owner = rec.Owner;
                message += `| ${rec.Name} | ${rec.Status} | ${owner?.Name ?? "—"} | ${rec.StartDate ?? "—"} | ${rec.EndDate ?? "—"} | ${rec.TotalTarget ?? 0} | ${rec.TotalAllocatedTarget ?? 0} |\n`;
            }
            return { content: [{ type: "text", text: message }] };
        }
        catch (err) {
            return { content: [{ type: "text", text: `# Error\n\n${err instanceof Error ? err.message : String(err)}` }] };
        }
    });
}
//# sourceMappingURL=forecasting.js.map