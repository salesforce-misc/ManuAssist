import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";
export function register(server) {
    server.tool("health_check", "Run a comprehensive Manufacturing Cloud org health check. Validates permission set assignments, Sales Agreement setup, Warranty configuration, Account Manager Targets, Data Processing Engine, product catalog, and general Salesforce setup. Returns a summary with issues and recommendations.", {
        targetOrg: z.string().optional().describe("Optional: specific org alias. Uses current target org if not set."),
    }, async ({ targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return {
                content: [{
                        type: "text",
                        text: `# Cannot Run Health Check\n\n${validation.error}\n\nConnect to a Salesforce org first using \`set_target_org\`.`,
                    }],
            };
        }
        const issues = [];
        const sections = [];
        // ─── 1. Manufacturing Permission Sets ────────────────────────────────
        const criticalPs = ["ManufacturingSalesUser", "ManufacturingServiceUser"];
        const allMfgPs = [...criticalPs, "ManufacturingAnalyticsUser", "WarrantyManagementUser", "SalesAgreementsUser"];
        const psQuery = `SELECT PermissionSet.Name, COUNT(Id) cnt FROM PermissionSetAssignment WHERE PermissionSet.Name IN (${allMfgPs.map((p) => `'${p}'`).join(",")}) GROUP BY PermissionSet.Name`;
        const psResult = await runSoqlQuery(psQuery, effectiveOrg);
        let psSection = "## Manufacturing Permission Sets\n";
        if (psResult.success && psResult.data?.records?.length) {
            const found = psResult.data.records.map((r) => r["PermissionSet.Name"]);
            for (const r of psResult.data.records) {
                const rec = r;
                psSection += `- **${rec["PermissionSet.Name"]}**: ${rec.cnt} users\n`;
            }
            for (const ps of criticalPs) {
                if (!found.includes(ps)) {
                    issues.push({ severity: "error", area: "Permissions", message: `${ps} not assigned to any users`, fix: `Assign ${ps} permission set to the relevant users` });
                }
            }
        }
        else {
            psSection += "- No Manufacturing permission sets assigned\n";
            issues.push({ severity: "error", area: "Permissions", message: "No Manufacturing Cloud permission sets assigned — users cannot access any Manufacturing features", fix: "Assign ManufacturingSalesUser and ManufacturingServiceUser permission sets" });
        }
        sections.push(psSection);
        // ─── 2. Sales Agreements ──────────────────────────────────────────────
        const saQuery = `SELECT COUNT(Id) total FROM SalesAgreement`;
        const saResult = await runSoqlQuery(saQuery, effectiveOrg);
        let saCount = 0;
        if (saResult.success && saResult.data?.records?.[0]) {
            saCount = Number(saResult.data.records[0].total);
        }
        sections.push(`## Sales Agreements\n- Total: ${saCount}`);
        if (saCount === 0) {
            issues.push({ severity: "warning", area: "Sales Agreements", message: "No Sales Agreements configured — the core run-rate business feature is not in use", fix: "Create Sales Agreement record types and start loading agreement data" });
        }
        // ─── 3. Warranty Terms ────────────────────────────────────────────────
        const wtQuery = `SELECT COUNT(Id) total FROM WarrantyTerm WHERE IsActive = true`;
        const wtResult = await runSoqlQuery(wtQuery, effectiveOrg);
        let wtCount = 0;
        if (wtResult.success && wtResult.data?.records?.[0]) {
            wtCount = Number(wtResult.data.records[0].total);
        }
        sections.push(`## Warranty Terms\n- Active Warranty Terms: ${wtCount}`);
        if (wtCount === 0) {
            issues.push({ severity: "warning", area: "Warranty Management", message: "No active Warranty Terms — warranty claims and asset coverage cannot be processed", fix: "Create and activate Warranty Terms in the Warranty Lifecycle Management app" });
        }
        // ─── 4. Account Manager Targets ──────────────────────────────────────
        const amtQuery = `SELECT COUNT(Id) total FROM AcctMgrTarget WHERE Status = 'Active'`;
        const amtResult = await runSoqlQuery(amtQuery, effectiveOrg);
        let amtCount = 0;
        if (amtResult.success && amtResult.data?.records?.[0]) {
            amtCount = Number(amtResult.data.records[0].total);
        }
        sections.push(`## Account Manager Targets\n- Active Targets: ${amtCount}`);
        if (amtCount === 0) {
            issues.push({ severity: "info", area: "Account Manager Targets", message: "No active Account Manager Targets — team performance goals are not set up", fix: "Create Account Manager Targets to distribute revenue and quantity goals to account managers" });
        }
        // ─── 5. Products ──────────────────────────────────────────────────────
        const prodQuery = `SELECT COUNT(Id) total FROM Product2 WHERE IsActive = true`;
        const prodResult = await runSoqlQuery(prodQuery, effectiveOrg);
        let prodCount = 0;
        if (prodResult.success && prodResult.data?.records?.[0]) {
            prodCount = Number(prodResult.data.records[0].total);
        }
        sections.push(`## Products\n- Active Products: ${prodCount}`);
        if (prodCount === 0) {
            issues.push({ severity: "error", area: "Products", message: "No active products — Sales Agreements and Forecasts require products", fix: "Load Product2 records and activate them" });
        }
        // ─── 6. Accounts ─────────────────────────────────────────────────────
        const acctQuery = `SELECT COUNT(Id) total FROM Account WHERE IsDeleted = false`;
        const acctResult = await runSoqlQuery(acctQuery, effectiveOrg);
        let acctCount = 0;
        if (acctResult.success && acctResult.data?.records?.[0]) {
            acctCount = Number(acctResult.data.records[0].total);
        }
        sections.push(`## Accounts\n- Total Accounts: ${acctCount}`);
        if (acctCount === 0) {
            issues.push({ severity: "error", area: "Accounts", message: "No account records — OEM customers, distributors, and dealers must be loaded", fix: "Import Account records for your customers, partners, and distributors" });
        }
        // ─── 7. Forecasts (Advanced Account Forecasting) ──────────────────────
        const afQuery = `SELECT COUNT(Id) total FROM AccountForecast`;
        const afResult = await runSoqlQuery(afQuery, effectiveOrg);
        let afCount = 0;
        if (afResult.success && afResult.data?.records?.[0]) {
            afCount = Number(afResult.data.records[0].total);
        }
        sections.push(`## Advanced Account Forecasting\n- AccountForecast records: ${afCount}`);
        if (afCount === 0) {
            issues.push({ severity: "info", area: "Forecasting", message: "No Account Forecasts generated — run the AAF Data Processing Engine job", fix: "Go to Data Processing Engine > find the AAF definition > Run Now" });
        }
        // ─── 8. Installed Packages ────────────────────────────────────────────
        const pkgQuery = `SELECT NamespacePrefix, SubscriberPackage.Name FROM InstalledSubscriberPackage WHERE NamespacePrefix != null ORDER BY NamespacePrefix LIMIT 10`;
        const pkgResult = await runSoqlQuery(pkgQuery, effectiveOrg);
        let pkgSection = "## Installed Managed Packages\n";
        if (pkgResult.success && pkgResult.data?.records?.length) {
            for (const r of pkgResult.data.records) {
                const rec = r;
                const pkg = rec.SubscriberPackage;
                pkgSection += `- \`${rec.NamespacePrefix}\` — ${pkg?.Name ?? "unknown"}\n`;
            }
        }
        else {
            pkgSection += "- No managed packages installed (Manufacturing Cloud is a core platform product — no package required)\n";
        }
        sections.push(pkgSection);
        // ─── Build report ─────────────────────────────────────────────────────
        const errorCount = issues.filter((i) => i.severity === "error").length;
        const warnCount = issues.filter((i) => i.severity === "warning").length;
        const infoCount = issues.filter((i) => i.severity === "info").length;
        const overallStatus = errorCount > 0 ? "CRITICAL" :
            warnCount > 0 ? "NEEDS ATTENTION" :
                infoCount > 0 ? "MOSTLY READY" :
                    "HEALTHY";
        let report = `# Manufacturing Cloud Org Health Check\n\n`;
        report += `**Overall Status: ${overallStatus}**  |  Errors: ${errorCount}  |  Warnings: ${warnCount}  |  Info: ${infoCount}\n\n`;
        report += `---\n\n`;
        report += sections.join("\n\n") + "\n\n";
        if (issues.length > 0) {
            report += `---\n\n## Issues Found\n\n`;
            for (const issue of issues) {
                const icon = issue.severity === "error" ? "🔴" : issue.severity === "warning" ? "🟡" : "🔵";
                report += `${icon} **[${issue.area}]** ${issue.message}\n`;
                if (issue.fix) {
                    report += `   _Fix: ${issue.fix}_\n`;
                }
                report += "\n";
            }
        }
        else {
            report += `---\n\n**No issues found. Your Manufacturing Cloud org is healthy.**\n`;
        }
        return { content: [{ type: "text", text: report }] };
    });
    // ─────────────────────────────────────────────────────────────────────────
    // get_org_status
    // ─────────────────────────────────────────────────────────────────────────
    server.tool("get_org_status", "Get a quick dashboard view of the connected Manufacturing Cloud org — key record counts, feature activation, and permission set coverage.", {
        targetOrg: z.string().optional(),
    }, async ({ targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
        }
        const queryMap = {
            "Active Users": `SELECT COUNT(Id) total FROM User WHERE IsActive = true`,
            "Accounts": `SELECT COUNT(Id) total FROM Account WHERE IsDeleted = false`,
            "Active Products": `SELECT COUNT(Id) total FROM Product2 WHERE IsActive = true`,
            "Sales Agreements": `SELECT COUNT(Id) total FROM SalesAgreement`,
            "Active Sales Agreements": `SELECT COUNT(Id) total FROM SalesAgreement WHERE Status = 'Active'`,
            "Warranty Claims": `SELECT COUNT(Id) total FROM WarrantyClaim`,
            "Active Warranty Terms": `SELECT COUNT(Id) total FROM WarrantyTerm WHERE IsActive = true`,
            "Account Forecasts": `SELECT COUNT(Id) total FROM AccountForecast`,
            "Account Manager Targets": `SELECT COUNT(Id) total FROM AcctMgrTarget`,
            "Partner Visits": `SELECT COUNT(Id) total FROM Visit`,
            "Assets": `SELECT COUNT(Id) total FROM Asset`,
        };
        let message = `# Manufacturing Cloud Org Dashboard\n\n`;
        message += `**Org:** ${effectiveOrg}\n\n`;
        message += `| Metric | Count |\n|--------|-------|\n`;
        for (const [label, query] of Object.entries(queryMap)) {
            try {
                const result = await runSoqlQuery(query, effectiveOrg);
                if (result.success && result.data?.records?.[0]) {
                    const total = result.data.records[0].total ?? 0;
                    message += `| ${label} | ${total} |\n`;
                }
                else {
                    message += `| ${label} | — |\n`;
                }
            }
            catch {
                message += `| ${label} | (error) |\n`;
            }
        }
        message += "\n_Run `health_check` for a detailed org assessment with issue detection._\n";
        return { content: [{ type: "text", text: message }] };
    });
}
//# sourceMappingURL=health-check.js.map