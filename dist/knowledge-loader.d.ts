export interface ModuleDoc {
    slug: string;
    title: string;
    content: string;
    files: string[];
}
export interface DocFile {
    slug: string;
    title: string;
    content: string;
    source: "help" | "exercises" | "guides" | "troubleshooting";
}
export interface KnowledgeBase {
    modules: Map<string, ModuleDoc>;
    allContent: string;
}
export interface SearchResult {
    module: string;
    title: string;
    excerpt: string;
    source?: string;
    sourceFile?: string;
}
/**
 * Load the entire knowledge base
 */
export declare function loadKnowledgeBase(): KnowledgeBase;
/**
 * Get list of available modules
 */
export declare function getModuleList(): {
    slug: string;
    title: string;
    fileCount: number;
}[];
/**
 * Get content for a specific module
 */
export declare function getModuleContent(moduleSlug: string): string | null;
/**
 * Search knowledge base for a term (searches all sources)
 */
export declare function searchKnowledge(query: string): SearchResult[];
/**
 * Get list of help documentation files
 */
export declare function getHelpDocList(): {
    slug: string;
    title: string;
}[];
/**
 * Get content of a specific help document
 */
export declare function getHelpDocContent(slug: string): string | null;
/**
 * Get list of exercise files
 */
export declare function getExerciseList(): {
    slug: string;
    title: string;
}[];
/**
 * Get content of a specific exercise
 */
export declare function getExerciseContent(slug: string): string | null;
/**
 * Get list of guide files
 */
export declare function getGuideList(): {
    slug: string;
    title: string;
}[];
/**
 * Get content of a specific guide
 */
export declare function getGuideContent(slug: string): string | null;
/**
 * Get list of troubleshooting files
 */
export declare function getTroubleshootingList(): {
    slug: string;
    title: string;
}[];
/**
 * Get content of a specific troubleshooting document
 */
export declare function getTroubleshootingContent(slug: string): string | null;
/**
 * Get the common issues document (convenience function)
 */
export declare function getCommonIssues(): string | null;
/**
 * Format a citation block for a knowledge base response.
 *
 * Returns a fenced citation block that Claude should preserve verbatim.
 * Includes both source label and a link (URL or local file path).
 *
 * @param sourceFile - slug of the originating file (e.g. "account-management")
 * @param moduleName - optional module/directory name for PM Enablement context
 * @returns a formatted citation block
 */
export declare function formatCitation(sourceFile: string, moduleName?: string): string;
//# sourceMappingURL=knowledge-loader.d.ts.map