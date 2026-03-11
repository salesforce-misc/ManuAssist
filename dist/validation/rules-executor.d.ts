/**
 * Validation Rules Executor
 *
 * Executes validation rules against a Salesforce org and returns results.
 */
import { AuditResult } from "./rules-loader.js";
/**
 * Run a full audit with a specific group or all rules
 */
export declare function runAudit(targetOrg: string, options?: {
    group?: string;
    ruleIds?: string[];
    categories?: string[];
    severities?: string[];
}): Promise<AuditResult>;
/**
 * Format audit results as markdown
 */
export declare function formatAuditResults(audit: AuditResult): string;
export { getAllRules, getRulesByGroup, getValidationGroups, getRuleById, findRulesBySymptom, } from "./rules-loader.js";
//# sourceMappingURL=rules-executor.d.ts.map