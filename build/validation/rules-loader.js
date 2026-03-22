/**
 * Validation Rules Loader
 *
 * Loads and parses validation rules from YAML files in the knowledge/validation-rules directory.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parse as parseYaml } from "yaml";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Path to validation rules directory (relative to project root)
const RULES_DIR = join(__dirname, "../../knowledge/validation-rules");
// ============================================================================
// LOADER FUNCTIONS
// ============================================================================
/**
 * Load all validation rule files from the rules directory
 */
export function loadAllRules() {
    const ruleFiles = [];
    if (!existsSync(RULES_DIR)) {
        console.error(`Rules directory not found: ${RULES_DIR}`);
        return ruleFiles;
    }
    const files = readdirSync(RULES_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
    for (const file of files) {
        // Skip schema file
        if (file.startsWith("_"))
            continue;
        try {
            const content = readFileSync(join(RULES_DIR, file), "utf-8");
            const parsed = parseYaml(content);
            ruleFiles.push(parsed);
        }
        catch (error) {
            console.error(`Failed to parse ${file}:`, error);
        }
    }
    return ruleFiles;
}
/**
 * Get all rules flattened into a single array
 */
export function getAllRules() {
    const ruleFiles = loadAllRules();
    return ruleFiles.flatMap((rf) => rf.rules || []);
}
/**
 * Get rules by group name
 */
export function getRulesByGroup(groupName) {
    const ruleFiles = loadAllRules();
    const allRules = getAllRules();
    // Find the group definition
    for (const ruleFile of ruleFiles) {
        if (ruleFile.groups && ruleFile.groups[groupName]) {
            const group = ruleFile.groups[groupName];
            return allRules.filter((r) => group.rules.includes(r.id));
        }
    }
    return [];
}
/**
 * Get available validation groups
 */
export function getValidationGroups() {
    const ruleFiles = loadAllRules();
    const groups = [];
    for (const ruleFile of ruleFiles) {
        if (ruleFile.groups) {
            for (const [id, group] of Object.entries(ruleFile.groups)) {
                groups.push({
                    id,
                    name: group.name,
                    description: group.description,
                    ruleCount: group.rules.length,
                });
            }
        }
    }
    return groups;
}
/**
 * Get a specific rule by ID
 */
export function getRuleById(ruleId) {
    const allRules = getAllRules();
    return allRules.find((r) => r.id === ruleId);
}
/**
 * Find rules that match a symptom (for diagnostic purposes)
 */
export function findRulesBySymptom(symptom) {
    const allRules = getAllRules();
    const lowerSymptom = symptom.toLowerCase();
    return allRules.filter((rule) => rule.symptoms.some((s) => s.toLowerCase().includes(lowerSymptom)));
}
/**
 * Get rules by category
 */
export function getRulesByCategory(category) {
    const allRules = getAllRules();
    return allRules.filter((r) => r.category === category);
}
/**
 * Get rules by severity
 */
export function getRulesBySeverity(severity) {
    const allRules = getAllRules();
    return allRules.filter((r) => r.severity === severity);
}
/**
 * Get rules by tag
 */
export function getRulesByTag(tag) {
    const allRules = getAllRules();
    return allRules.filter((r) => r.tags?.includes(tag));
}
//# sourceMappingURL=rules-loader.js.map