/**
 * In-memory TTL cache for frequently queried Salesforce metadata.
 *
 * Caches are scoped by target org so switching orgs never returns stale data.
 * Entries expire after a configurable TTL (default 120 seconds).
 */
/** Default TTL in milliseconds (2 minutes) */
const DEFAULT_TTL_MS = 120_000;
/** Global cache store — keyed by `${orgAlias}:${cacheKey}` */
const store = new Map();
/**
 * Build a composite key scoped to the current org.
 */
function compositeKey(org, key) {
    return `${org}:${key}`;
}
/**
 * Get a cached value. Returns `undefined` on miss or expiry.
 */
export function cacheGet(org, key) {
    const ck = compositeKey(org, key);
    const entry = store.get(ck);
    if (!entry)
        return undefined;
    if (Date.now() > entry.expiresAt) {
        store.delete(ck);
        return undefined;
    }
    return entry.value;
}
/**
 * Store a value in the cache.
 */
export function cacheSet(org, key, value, ttlMs = DEFAULT_TTL_MS) {
    const ck = compositeKey(org, key);
    store.set(ck, { value, expiresAt: Date.now() + ttlMs });
}
/**
 * Invalidate all entries for a specific org.
 * Call this when the user switches target orgs.
 */
export function cacheInvalidateOrg(org) {
    const prefix = `${org}:`;
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
            store.delete(key);
        }
    }
}
/**
 * Clear the entire cache (useful for testing or hard resets).
 */
export function cacheClear() {
    store.clear();
}
/**
 * Return current cache size (for diagnostics).
 */
export function cacheSize() {
    return store.size;
}
/**
 * Build a cache key from a SOQL/Tooling query string.
 * Normalises whitespace so cosmetic differences don't cause misses.
 */
export function queryCacheKey(query, tooling = false) {
    const normalised = query.replace(/\s+/g, " ").trim();
    return `${tooling ? "tooling" : "soql"}:${normalised}`;
}
/**
 * Build a cache key for an sObject describe call.
 */
export function describeCacheKey(objectName) {
    return `describe:${objectName}`;
}
//# sourceMappingURL=cache.js.map