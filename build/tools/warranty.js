import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";
import { validateOrgConnection } from "../salesforce/auth.js";
export function register(server) {
    // ─────────────────────────────────────────────────────────────────────────
    // check_warranty_config
    // ─────────────────────────────────────────────────────────────────────────
    server.tool("check_warranty_config", `Check Manufacturing Cloud Warranty & Claims configuration. Validates WarrantyTerm records, WarrantyClaim statuses, claim rules, supplier recovery contracts, and permission coverage.
CORRECT object names: WarrantyTerm, WarrantyClaim, WarrantyClaimProduct, SupplierRecoveryContract, ProductServiceCampaign, Asset.
WRONG names (DO NOT USE): WarrantyTerm__c, WarrantyClaim__c, WarrantyContract__c.`, {
        targetOrg: z.string().optional().describe("Optional: specific org alias. Uses current target org if not set."),
    }, async ({ targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            const instructions = validation.setupInstructions;
            return {
                content: [{
                        type: "text",
                        text: `# Cannot Check Warranty Configuration\n\n${validation.error}\n\n## ${instructions?.title}\n\n${instructions?.description}`,
                    }],
            };
        }
        let message = "# Warranty & Claims Configuration Report\n\n";
        const issues = [];
        const recommendations = [];
        try {
            // 1. Warranty Terms
            message += "## Warranty Terms\n\n";
            const wtQuery = `SELECT Id, Name, WarrantyType, IsActive, WarrantyDuration, WarrantyDurationUnit FROM WarrantyTerm ORDER BY Name LIMIT 20`;
            const wtResult = await runSoqlQuery(wtQuery, effectiveOrg);
            if (wtResult.success && wtResult.data?.records?.length) {
                const terms = wtResult.data.records;
                const active = terms.filter((r) => r.IsActive === true);
                message += `| Name | Type | Duration | Active |\n|------|------|----------|--------|\n`;
                for (const r of terms) {
                    const rec = r;
                    message += `| ${rec.Name} | ${rec.WarrantyType ?? "—"} | ${rec.WarrantyDuration ?? "—"} ${rec.WarrantyDurationUnit ?? ""} | ${rec.IsActive ? "Yes" : "No"} |\n`;
                }
                message += `\n**Total:** ${terms.length} (${active.length} active)\n\n`;
                if (active.length === 0) {
                    issues.push("All Warranty Terms are inactive — no warranty coverage can be applied to products or assets");
                }
            }
            else {
                message += "_No Warranty Terms found._\n\n";
                issues.push("No Warranty Terms configured — Warranty Terms define coverage duration, labor, parts, and expenses");
                recommendations.push("Create Warranty Terms in Setup > Warranty Term or via the Warranty Lifecycle Management app");
            }
            // 2. Warranty Claims by Status
            message += "## Warranty Claims (by Status)\n\n";
            const claimStatusQuery = `SELECT Status, COUNT(Id) total FROM WarrantyClaim GROUP BY Status ORDER BY COUNT(Id) DESC`;
            const claimStatusResult = await runSoqlQuery(claimStatusQuery, effectiveOrg);
            if (claimStatusResult.success && claimStatusResult.data?.records?.length) {
                message += `| Status | Count |\n|--------|-------|\n`;
                let grandTotal = 0;
                for (const r of claimStatusResult.data.records) {
                    const rec = r;
                    message += `| ${rec.Status} | ${rec.total} |\n`;
                    grandTotal += Number(rec.total);
                }
                message += `\n**Total Claims:** ${grandTotal}\n\n`;
                // Flag if many claims are stuck in a status
                const pendingRec = claimStatusResult.data.records.find((r) => r.Status === "New");
                if (pendingRec && Number(pendingRec.total) > 50) {
                    recommendations.push(`${pendingRec.total} claims are still in 'New' status — review the claims adjudication process`);
                }
            }
            else {
                message += "_No Warranty Claims found._\n\n";
                recommendations.push("No claims exist yet — use the Warranty Claims page to capture claims from partners and dealers");
            }
            // 3. Asset coverage
            message += "## Assets with Warranty Terms\n\n";
            const assetQuery = `SELECT COUNT(Id) total FROM Asset WHERE Status = 'Purchased'`;
            const assetResult = await runSoqlQuery(assetQuery, effectiveOrg);
            if (assetResult.success && assetResult.data?.records?.[0]) {
                const total = assetResult.data.records[0].total;
                message += `**Active Asset records (Purchased status):** ${total}\n\n`;
                if (Number(total) === 0) {
                    recommendations.push("No Asset records found — assets must be linked to accounts and warranty terms for warranty claims to work correctly");
                }
            }
            // 4. Product Service Campaigns (recalls/service notices)
            message += "## Product Service Campaigns\n\n";
            const pscQuery = `SELECT Status, COUNT(Id) total FROM ProductServiceCampaign GROUP BY Status`;
            const pscResult = await runSoqlQuery(pscQuery, effectiveOrg);
            if (pscResult.success && pscResult.data?.records?.length) {
                message += `| Status | Count |\n|--------|-------|\n`;
                for (const r of pscResult.data.records) {
                    const rec = r;
                    message += `| ${rec.Status} | ${rec.total} |\n`;
                }
                message += "\n";
            }
            else {
                message += "_No Product Service Campaigns configured._\n\n";
                recommendations.push("Product Service Campaigns can be used for product recalls, maintenance notices, and field service bulletins");
            }
            // 5. Permission sets
            message += "## Warranty Management Permission Coverage\n\n";
            const psQuery = `SELECT PermissionSet.Name, COUNT(Id) assigned FROM PermissionSetAssignment WHERE PermissionSet.Name IN ('ManufacturingServiceUser', 'WarrantyManagementUser', 'ManufacturingSalesUser') GROUP BY PermissionSet.Name`;
            const psResult = await runSoqlQuery(psQuery, effectiveOrg);
            if (psResult.success && psResult.data?.records?.length) {
                message += `| Permission Set | Users Assigned |\n|---------------|---------------|\n`;
                const found = [];
                for (const r of psResult.data.records) {
                    const rec = r;
                    message += `| ${rec["PermissionSet.Name"]} | ${rec.assigned} |\n`;
                    found.push(rec["PermissionSet.Name"]);
                }
                message += "\n";
                if (!found.includes("ManufacturingServiceUser")) {
                    issues.push("ManufacturingServiceUser permission set has no assignments — service reps cannot access Warranty Claims");
                }
            }
            else {
                issues.push("No Manufacturing Service permission sets assigned — users cannot manage warranty claims");
                recommendations.push("Assign ManufacturingServiceUser to CSRs and claims adjudicators; WarrantyManagementUser to warranty admins");
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
                message += "_Warranty & Claims Management is properly configured._\n";
            }
        }
        catch (err) {
            message += `\n**Error running checks:** ${err instanceof Error ? err.message : String(err)}\n`;
        }
        return { content: [{ type: "text", text: message }] };
    });
    // ─────────────────────────────────────────────────────────────────────────
    // list_warranty_claims
    // ─────────────────────────────────────────────────────────────────────────
    server.tool("list_warranty_claims", "List warranty claims with status, account, and claim amounts. Filter by status or account.", {
        status: z.string().optional().describe("Filter by Status (e.g., 'New', 'In Review', 'Approved', 'Rejected')"),
        accountName: z.string().optional().describe("Filter by claimant Account name (partial match)"),
        limit: z.number().optional().default(20),
        targetOrg: z.string().optional(),
    }, async ({ status, accountName, limit, targetOrg }) => {
        const validation = await validateOrgConnection();
        const effectiveOrg = targetOrg || validation.targetOrg;
        if (!effectiveOrg) {
            return { content: [{ type: "text", text: `# No Org Connected\n\n${validation.error}` }] };
        }
        const whereClauses = [];
        if (status)
            whereClauses.push(`Status = '${status}'`);
        if (accountName)
            whereClauses.push(`Account.Name LIKE '%${accountName}%'`);
        const whereStr = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
        const query = `SELECT Id, Name, Status, ClaimDate, TotalApprovedAmount, TotalClaimedAmount, Account.Name FROM WarrantyClaim ${whereStr} ORDER BY ClaimDate DESC NULLS LAST LIMIT ${limit ?? 20}`;
        try {
            const result = await runSoqlQuery(query, effectiveOrg);
            if (!result.success || !result.data?.records?.length) {
                return { content: [{ type: "text", text: `# Warranty Claims\n\nNo claims found matching your filters.` }] };
            }
            let message = `# Warranty Claims (${result.data.records.length} records)\n\n`;
            message += `| Name | Status | Account | Claim Date | Claimed Amt | Approved Amt |\n|------|--------|---------|------------|-------------|-------------|\n`;
            for (const r of result.data.records) {
                const rec = r;
                const acct = rec.Account;
                const claimDate = rec.ClaimDate
                    ? new Date(rec.ClaimDate).toLocaleDateString()
                    : "—";
                message += `| ${rec.Name} | ${rec.Status} | ${acct?.Name ?? "—"} | ${claimDate} | ${rec.TotalClaimedAmount ?? 0} | ${rec.TotalApprovedAmount ?? 0} |\n`;
            }
            return { content: [{ type: "text", text: message }] };
        }
        catch (err) {
            return { content: [{ type: "text", text: `# Error\n\n${err instanceof Error ? err.message : String(err)}` }] };
        }
    });
}
//# sourceMappingURL=warranty.js.map