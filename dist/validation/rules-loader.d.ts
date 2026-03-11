/**
 * Validation Rules Loader
 *
 * Loads and parses validation rules from YAML files in the knowledge/validation-rules directory.
 */
export type CheckType = "soql" | "soql_count" | "tooling_soql" | "tooling_soql_count" | "metadata" | "api" | "cli" | "composite";
export type Severity = "error" | "warning" | "info";
export type Category = "mobile-login" | "metadata-cache" | "sync" | "permissions" | "configuration" | "territory" | "deployment";
export interface RuleCheck {
    type: CheckType;
    query?: string;
    object?: string;
    endpoint?: string;
    command?: string;
    checks?: RuleCheck[];
    expect: string;
    error_detail_query?: string;
}
export interface RuleResolution {
    steps: string[];
    ui_path?: string;
    documentation?: string;
    auto_fix?: {
        available: boolean;
        type?: "soql_update" | "api_call" | "cli_command" | "apex";
        action?: string;
        requires_confirmation?: boolean;
    };
}
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    category: Category;
    severity: Severity;
    check: RuleCheck;
    symptoms: string[];
    resolution: RuleResolution;
    issue_ref?: string;
    prerequisites?: string[];
    tags?: string[];
}
export interface ValidationGroup {
    name: string;
    description: string;
    rules: string[];
}
export interface ValidationRuleFile {
    schema_version: string;
    category_name: string;
    description: string;
    rules: ValidationRule[];
    groups: Record<string, ValidationGroup>;
}
export interface CheckResult {
    rule: ValidationRule;
    passed: boolean;
    message: string;
    details?: unknown;
    error?: string;
}
export interface AuditResult {
    timestamp: string;
    group?: string;
    targetOrg: string;
    summary: {
        total: number;
        passed: number;
        failed: number;
        errors: number;
        warnings: number;
        skipped: number;
    };
    results: CheckResult[];
}
/**
 * Load all validation rule files from the rules directory
 */
export declare function loadAllRules(): ValidationRuleFile[];
/**
 * Get all rules flattened into a single array
 */
export declare function getAllRules(): ValidationRule[];
/**
 * Get rules by group name
 */
export declare function getRulesByGroup(groupName: string): ValidationRule[];
/**
 * Get available validation groups
 */
export declare function getValidationGroups(): Array<{
    id: string;
    name: string;
    description: string;
    ruleCount: number;
}>;
/**
 * Get a specific rule by ID
 */
export declare function getRuleById(ruleId: string): ValidationRule | undefined;
/**
 * Find rules that match a symptom (for diagnostic purposes)
 */
export declare function findRulesBySymptom(symptom: string): ValidationRule[];
/**
 * Get rules by category
 */
export declare function getRulesByCategory(category: Category): ValidationRule[];
/**
 * Get rules by severity
 */
export declare function getRulesBySeverity(severity: Severity): ValidationRule[];
/**
 * Get rules by tag
 */
export declare function getRulesByTag(tag: string): ValidationRule[];
//# sourceMappingURL=rules-loader.d.ts.map