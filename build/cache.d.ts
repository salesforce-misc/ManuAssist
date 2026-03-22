/**
 * In-memory TTL cache for frequently queried Salesforce metadata.
 *
 * Caches are scoped by target org so switching orgs never returns stale data.
 * Entries expire after a configurable TTL (default 120 seconds).
 */
export interface CacheEntry<T = unknown> {
    value: T;
    expiresAt: number;
}
/**
 * Get a cached value. Returns `undefined` on miss or expiry.
 */
export declare function cacheGet<T>(org: string, key: string): T | undefined;
/**
 * Store a value in the cache.
 */
export declare function cacheSet<T>(org: string, key: string, value: T, ttlMs?: number): void;
/**
 * Invalidate all entries for a specific org.
 * Call this when the user switches target orgs.
 */
export declare function cacheInvalidateOrg(org: string): void;
/**
 * Clear the entire cache (useful for testing or hard resets).
 */
export declare function cacheClear(): void;
/**
 * Return current cache size (for diagnostics).
 */
export declare function cacheSize(): number;
/**
 * Build a cache key from a SOQL/Tooling query string.
 * Normalises whitespace so cosmetic differences don't cause misses.
 */
export declare function queryCacheKey(query: string, tooling?: boolean): string;
/**
 * Build a cache key for an sObject describe call.
 */
export declare function describeCacheKey(objectName: string): string;
//# sourceMappingURL=cache.d.ts.map