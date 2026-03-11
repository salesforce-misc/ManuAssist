import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runSoqlQuery } from "../salesforce/cli.js";

export function register(server: McpServer) {
server.tool(
  "diff_orgs",
  "Compare Manufacturing Cloud configuration between two Salesforce orgs. Compares permission set assignments, Sales Agreement record types, Warranty Terms, product catalog, and key record counts to identify configuration drift. Both orgs must be authenticated via SF CLI.",
  {
    sourceOrg: z.string().describe("Alias or username of the first (source) org"),
    targetOrg: z.string().describe("Alias or username of the second (target) org"),
    scope: z.enum(["all", "permissions", "sales-agreements", "warranty", "products"]).optional().describe("What to compare. Defaults to 'all'."),
  },
  async ({ sourceOrg, targetOrg, scope }) => {
    const effectiveScope = scope || "all";

    if (sourceOrg === targetOrg) {
      return {
        content: [{ type: "text", text: `# Cannot Diff Orgs\n\nSource and target org are the same (\`${sourceOrg}\`). Please provide two different orgs.` }],
      };
    }

    const sourceCheck = await runSoqlQuery("SELECT Id FROM Organization LIMIT 1", sourceOrg);
    if (!sourceCheck.success) {
      return {
        content: [{ type: "text", text: `# Cannot Diff Orgs\n\nFailed to connect to source org \`${sourceOrg}\`:\n${sourceCheck.error}` }],
      };
    }
    const targetCheck = await runSoqlQuery("SELECT Id FROM Organization LIMIT 1", targetOrg);
    if (!targetCheck.success) {
      return {
        content: [{ type: "text", text: `# Cannot Diff Orgs\n\nFailed to connect to target org \`${targetOrg}\`:\n${targetCheck.error}` }],
      };
    }

    const fmtVal = (v: unknown): string =>
      v !== null && v !== undefined && String(v) !== "" ? String(v) : "(empty)";

    const sections: string[] = [];
    const summary: Array<{ category: string; matches: number; differences: number; onlyInSource: number; onlyInTarget: number }> = [];

    // ── Permission Set Assignments ──────────────────────────────────────────
    if (effectiveScope === "all" || effectiveScope === "permissions") {
      const mfgPs = [
        "ManufacturingSalesUser", "ManufacturingServiceUser",
        "ManufacturingPartnerCommunityUser", "ManufacturingAnalyticsUser",
        "WarrantyManagementUser", "SalesAgreementsUser", "RebateManagementUser",
      ];
      const psQuery = `SELECT PermissionSet.Name, COUNT(Id) cnt FROM PermissionSetAssignment WHERE PermissionSet.Name IN (${mfgPs.map(p => `'${p}'`).join(",")}) GROUP BY PermissionSet.Name ORDER BY PermissionSet.Name`;

      const [srcPs, tgtPs] = await Promise.all([
        runSoqlQuery(psQuery, sourceOrg),
        runSoqlQuery(psQuery, targetOrg),
      ]);

      let section = "## Permission Set Assignments\n\n";
      let matches = 0; let differences = 0; let onlySource = 0; let onlyTarget = 0;

      if (srcPs.success && tgtPs.success) {
        const srcMap = new Map<string, number>();
        const tgtMap = new Map<string, number>();
        for (const r of (srcPs.data?.records || [])) {
          const rec = r as Record<string, unknown>;
          srcMap.set(rec["PermissionSet.Name"] as string, Number(rec.cnt));
        }
        for (const r of (tgtPs.data?.records || [])) {
          const rec = r as Record<string, unknown>;
          tgtMap.set(rec["PermissionSet.Name"] as string, Number(rec.cnt));
        }

        section += `| Permission Set | ${sourceOrg} | ${targetOrg} | Status |\n`;
        section += `|---------------|-------------|-------------|--------|\n`;

        const allPs = new Set([...srcMap.keys(), ...tgtMap.keys(), ...mfgPs]);
        for (const ps of [...allPs].sort()) {
          const srcCount = srcMap.get(ps) ?? 0;
          const tgtCount = tgtMap.get(ps) ?? 0;
          if (srcCount === tgtCount) {
            matches++;
            section += `| ${ps} | ${srcCount} | ${tgtCount} | ✅ Match |\n`;
          } else if (srcCount > 0 && tgtCount === 0) {
            onlySource++;
            section += `| ${ps} | ${srcCount} | ${tgtCount} | ⚠️ Source only |\n`;
          } else if (srcCount === 0 && tgtCount > 0) {
            onlyTarget++;
            section += `| ${ps} | ${srcCount} | ${tgtCount} | ⚠️ Target only |\n`;
          } else {
            differences++;
            section += `| ${ps} | ${srcCount} | ${tgtCount} | ⚠️ Different counts |\n`;
          }
        }
      } else {
        section += `⚠️ Could not query permission sets: ${srcPs.error || tgtPs.error}\n`;
      }
      sections.push(section);
      summary.push({ category: "Permission Sets", matches, differences, onlyInSource: onlySource, onlyInTarget: onlyTarget });
    }

    // ── Sales Agreement Record Types ────────────────────────────────────────
    if (effectiveScope === "all" || effectiveScope === "sales-agreements") {
      const rtQuery = `SELECT DeveloperName, Name, IsActive FROM RecordType WHERE SobjectType = 'SalesAgreement' ORDER BY DeveloperName`;
      const [srcRt, tgtRt] = await Promise.all([
        runSoqlQuery(rtQuery, sourceOrg),
        runSoqlQuery(rtQuery, targetOrg),
      ]);

      let section = "## Sales Agreement Record Types\n\n";
      let matches = 0; let differences = 0; let onlySource = 0; let onlyTarget = 0;

      if (srcRt.success && tgtRt.success) {
        const srcMap = new Map<string, Record<string, unknown>>();
        const tgtMap = new Map<string, Record<string, unknown>>();
        for (const r of (srcRt.data?.records || [])) { const rec = r as Record<string, unknown>; srcMap.set(rec.DeveloperName as string, rec); }
        for (const r of (tgtRt.data?.records || [])) { const rec = r as Record<string, unknown>; tgtMap.set(rec.DeveloperName as string, rec); }

        section += `| Record Type | ${sourceOrg} Active | ${targetOrg} Active | Status |\n`;
        section += `|-------------|---------------------|---------------------|--------|\n`;

        const allKeys = new Set([...srcMap.keys(), ...tgtMap.keys()]);
        for (const key of [...allKeys].sort()) {
          const src = srcMap.get(key);
          const tgt = tgtMap.get(key);
          if (src && tgt) {
            if (src.IsActive === tgt.IsActive) { matches++; section += `| ${key} | ${fmtVal(src.IsActive)} | ${fmtVal(tgt.IsActive)} | ✅ Match |\n`; }
            else { differences++; section += `| ${key} | ${fmtVal(src.IsActive)} | ${fmtVal(tgt.IsActive)} | ⚠️ Different |\n`; }
          } else if (src && !tgt) { onlySource++; section += `| ${key} | ${fmtVal(src.IsActive)} | — | ⚠️ Source only |\n`; }
          else { onlyTarget++; section += `| ${key} | — | ${fmtVal(tgt!.IsActive)} | ⚠️ Target only |\n`; }
        }
        if (allKeys.size === 0) section += "_No Sales Agreement record types found in either org._\n";
      } else {
        section += `⚠️ Could not query Sales Agreement record types.\n`;
      }
      sections.push(section);
      summary.push({ category: "SA Record Types", matches, differences, onlyInSource: onlySource, onlyInTarget: onlyTarget });
    }

    // ── Warranty Terms ──────────────────────────────────────────────────────
    if (effectiveScope === "all" || effectiveScope === "warranty") {
      const wtQuery = `SELECT Name, IsActive, WarrantyDuration, WarrantyUnit FROM WarrantyTerm ORDER BY Name LIMIT 50`;
      const [srcWt, tgtWt] = await Promise.all([
        runSoqlQuery(wtQuery, sourceOrg),
        runSoqlQuery(wtQuery, targetOrg),
      ]);

      let section = "## Warranty Terms\n\n";
      let matches = 0; let differences = 0; let onlySource = 0; let onlyTarget = 0;

      if (srcWt.success && tgtWt.success) {
        const srcMap = new Map<string, Record<string, unknown>>();
        const tgtMap = new Map<string, Record<string, unknown>>();
        for (const r of (srcWt.data?.records || [])) { const rec = r as Record<string, unknown>; srcMap.set(rec.Name as string, rec); }
        for (const r of (tgtWt.data?.records || [])) { const rec = r as Record<string, unknown>; tgtMap.set(rec.Name as string, rec); }

        section += `| Warranty Term | ${sourceOrg} | ${targetOrg} | Status |\n`;
        section += `|--------------|-------------|-------------|--------|\n`;

        const allKeys = new Set([...srcMap.keys(), ...tgtMap.keys()]);
        for (const key of [...allKeys].sort()) {
          const src = srcMap.get(key);
          const tgt = tgtMap.get(key);
          if (src && tgt) {
            const match = src.IsActive === tgt.IsActive && src.WarrantyDuration === tgt.WarrantyDuration;
            if (match) { matches++; section += `| ${key} | Active:${src.IsActive}, ${src.WarrantyDuration}${src.WarrantyUnit} | Active:${tgt.IsActive}, ${tgt.WarrantyDuration}${tgt.WarrantyUnit} | ✅ Match |\n`; }
            else { differences++; section += `| ${key} | Active:${src.IsActive}, ${src.WarrantyDuration}${src.WarrantyUnit} | Active:${tgt.IsActive}, ${tgt.WarrantyDuration}${tgt.WarrantyUnit} | ⚠️ Different |\n`; }
          } else if (src && !tgt) { onlySource++; section += `| ${key} | Active:${src.IsActive} | — | ⚠️ Source only |\n`; }
          else { onlyTarget++; section += `| ${key} | — | Active:${tgt!.IsActive} | ⚠️ Target only |\n`; }
        }
        if (allKeys.size === 0) section += "_No Warranty Terms found in either org._\n";
      } else {
        section += `ℹ️ Could not query Warranty Terms (may not be configured in one or both orgs).\n`;
      }
      sections.push(section);
      summary.push({ category: "Warranty Terms", matches, differences, onlyInSource: onlySource, onlyInTarget: onlyTarget });
    }

    // ── Product Catalog ─────────────────────────────────────────────────────
    if (effectiveScope === "all" || effectiveScope === "products") {
      const prodQuery = `SELECT COUNT(Id) total FROM Product2 WHERE IsActive = true`;
      const pbQuery = `SELECT Name, IsActive FROM Pricebook2 ORDER BY Name LIMIT 20`;

      const [srcProd, tgtProd, srcPb, tgtPb] = await Promise.all([
        runSoqlQuery(prodQuery, sourceOrg),
        runSoqlQuery(prodQuery, targetOrg),
        runSoqlQuery(pbQuery, sourceOrg),
        runSoqlQuery(pbQuery, targetOrg),
      ]);

      let section = "## Product Catalog\n\n";
      const srcCount = srcProd.success ? Number((srcProd.data?.records?.[0] as Record<string, unknown>)?.total ?? 0) : "Error";
      const tgtCount = tgtProd.success ? Number((tgtProd.data?.records?.[0] as Record<string, unknown>)?.total ?? 0) : "Error";

      section += `| Metric | ${sourceOrg} | ${targetOrg} |\n`;
      section += `|--------|-------------|-------------|\n`;
      section += `| Active Products | ${srcCount} | ${tgtCount} |\n`;

      const srcPbs = srcPb.success ? (srcPb.data?.records || []).map(r => (r as Record<string, unknown>).Name as string) : [];
      const tgtPbs = tgtPb.success ? (tgtPb.data?.records || []).map(r => (r as Record<string, unknown>).Name as string) : [];
      section += `| Price Books | ${srcPbs.length} | ${tgtPbs.length} |\n`;

      const onlyInSrc = srcPbs.filter(p => !tgtPbs.includes(p));
      const onlyInTgt = tgtPbs.filter(p => !srcPbs.includes(p));
      if (onlyInSrc.length > 0) section += `\n**Price Books only in ${sourceOrg}:** ${onlyInSrc.join(", ")}\n`;
      if (onlyInTgt.length > 0) section += `\n**Price Books only in ${targetOrg}:** ${onlyInTgt.join(", ")}\n`;

      sections.push(section);
      summary.push({ category: "Product Catalog", matches: 0, differences: (srcCount !== tgtCount ? 1 : 0) + onlyInSrc.length + onlyInTgt.length, onlyInSource: onlyInSrc.length, onlyInTarget: onlyInTgt.length });
    }

    // ── Build output ────────────────────────────────────────────────────────
    let output = `# Manufacturing Cloud Org Comparison\n\n`;
    output += `**Source:** \`${sourceOrg}\`  **Target:** \`${targetOrg}\`\n\n`;
    output += `## Summary\n\n`;
    output += `| Category | Matches | Differences | Source Only | Target Only |\n`;
    output += `|----------|---------|-------------|-------------|-------------|\n`;
    for (const s of summary) {
      output += `| ${s.category} | ${s.matches} | ${s.differences} | ${s.onlyInSource} | ${s.onlyInTarget} |\n`;
    }
    output += `\n---\n\n`;
    output += sections.join("\n---\n\n");

    return { content: [{ type: "text", text: output }] };
  }
);
}
