export interface CitationInfo {
    label: string;
    category: "Official Help" | "Guide" | "Exercise" | "Troubleshooting";
    url?: string;
}
/**
 * Maps document slugs to citation metadata.
 * Used to attach source attribution to knowledge base responses.
 */
export declare const citationMap: Record<string, CitationInfo>;
export declare const moduleCitationMap: Record<string, CitationInfo>;
/**
 * Look up citation info for a document slug.
 *
 * When moduleName is provided, first checks the module-specific citation map
 * using "module:slug" key format. This avoids collisions where a slug like
 * "sales-agreements" exists in both Official Help.
 *
 * Falls back to the base citationMap for help docs, guides, exercises, etc.
 */
export declare function getCitation(slug: string, moduleName?: string): CitationInfo | undefined;
//# sourceMappingURL=citation-map.d.ts.map