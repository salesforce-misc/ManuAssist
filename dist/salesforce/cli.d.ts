/**
 * Salesforce CLI wrapper
 * Executes sf commands and handles output parsing
 */
export interface CliResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    rawOutput?: string;
}
export interface SfOrg {
    alias?: string;
    username: string;
    orgId: string;
    instanceUrl: string;
    isDefaultDevHub?: boolean;
    isDefaultUsername?: boolean;
    connectedStatus?: string;
}
export interface SfOrgListResult {
    nonScratchOrgs: SfOrg[];
    scratchOrgs: SfOrg[];
}
export interface SoqlQueryResult {
    totalSize: number;
    done: boolean;
    records: Record<string, unknown>[];
}
export interface SObjectDescribeResult {
    name: string;
    label: string;
    fields: Array<{
        name: string;
        label: string;
        type: string;
        required: boolean;
        updateable: boolean;
        createable: boolean;
    }>;
    childRelationships?: Array<{
        childSObject: string;
        relationshipName: string | null;
        field: string;
    }>;
}
/**
 * Check if Salesforce CLI is installed
 */
export declare function isSfCliInstalled(): Promise<boolean>;
/**
 * Get the installed SF CLI version
 */
export declare function getSfCliVersion(): Promise<CliResult<string>>;
/**
 * Install SF CLI via npm
 * Returns a promise that resolves when installation completes
 */
export declare function installSfCli(): Promise<CliResult<string>>;
/**
 * Execute a Salesforce CLI command with JSON output
 * Uses spawn instead of exec to properly handle special characters in arguments
 */
export declare function execSfCommand<T>(command: string, args?: string[], options?: {
    targetOrg?: string;
    timeout?: number;
}): Promise<CliResult<T>>;
/**
 * List all authenticated orgs
 */
export declare function listOrgs(): Promise<CliResult<SfOrgListResult>>;
/**
 * Get details about a specific org
 */
export declare function getOrgDisplay(targetOrg: string): Promise<CliResult<SfOrg>>;
/**
 * Run a SOQL query
 */
export declare function runSoqlQuery(query: string, targetOrg: string, options?: {
    useToolingApi?: boolean;
}): Promise<CliResult<SoqlQueryResult>>;
/**
 * Run a Tooling API SOQL query
 */
export declare function runToolingQuery(query: string, targetOrg: string): Promise<CliResult<SoqlQueryResult>>;
/**
 * Run a SOQL query with caching. Identical queries within the TTL window
 * return the cached result without hitting the SF CLI.
 */
export declare function cachedSoqlQuery(query: string, targetOrg: string, options?: {
    useToolingApi?: boolean;
    ttlMs?: number;
}): Promise<CliResult<SoqlQueryResult>>;
/**
 * Run a Tooling API query with caching.
 */
export declare function cachedToolingQuery(query: string, targetOrg: string, ttlMs?: number): Promise<CliResult<SoqlQueryResult>>;
/**
 * Describe an SObject with caching. Object schemas rarely change mid-session.
 */
export declare function cachedDescribeSObject(objectName: string, targetOrg: string, ttlMs?: number): Promise<CliResult<SObjectDescribeResult>>;
/**
 * Create a record via Tooling API
 */
export declare function createToolingRecord(objectName: string, data: Record<string, unknown>, targetOrg: string): Promise<CliResult<{
    id: string;
}>>;
/**
 * Update a record via Tooling API (PATCH)
 */
export declare function updateToolingRecord(objectName: string, recordId: string, data: Record<string, unknown>, targetOrg: string): Promise<CliResult<void>>;
/**
 * Delete a record via Tooling API
 */
export declare function deleteToolingRecord(objectName: string, recordId: string, targetOrg: string): Promise<CliResult<void>>;
/**
 * Describe an SObject
 */
export declare function describeSObject(objectName: string, targetOrg: string): Promise<CliResult<SObjectDescribeResult>>;
/**
 * Get a single record by ID
 */
export declare function getRecord(objectName: string, recordId: string, fields: string[], targetOrg: string): Promise<CliResult<Record<string, unknown>>>;
/**
 * Create a record
 */
export declare function createRecord(objectName: string, values: Record<string, unknown>, targetOrg: string): Promise<CliResult<{
    id: string;
}>>;
/**
 * Update a record
 */
export declare function updateRecord(objectName: string, recordId: string, values: Record<string, unknown>, targetOrg: string): Promise<CliResult<{
    id: string;
}>>;
/**
 * Delete a record
 */
export declare function deleteRecord(objectName: string, recordId: string, targetOrg: string): Promise<CliResult<{
    id: string;
}>>;
/**
 * Deploy metadata to an org
 */
export declare function deployMetadata(sourcePath: string, targetOrg: string): Promise<CliResult<unknown>>;
/**
 * Retrieve metadata from an org
 */
export declare function retrieveMetadata(targetPath: string, metadata: string, targetOrg: string): Promise<CliResult<unknown>>;
/**
 * List metadata components of a specific type
 */
export declare function listMetadata(metadataType: string, targetOrg: string): Promise<CliResult<Array<{
    fullName: string;
    type: string;
}>>>;
/**
 * Run anonymous Apex code against an org
 */
export declare function runAnonymousApex(code: string, targetOrg: string): Promise<CliResult<{
    compiled: boolean;
    success: boolean;
    logs: string;
}>>;
/**
 * Open the org login page in browser
 */
export declare function openOrgLogin(alias?: string, instanceUrl?: string): Promise<CliResult<{
    orgId: string;
    username: string;
}>>;
/**
 * Generate the login command string for user to run
 */
export declare function getLoginCommand(alias?: string, instanceUrl?: string): string;
/**
 * Make a REST API request to the target org
 */
export declare function apiRequest<T>(endpoint: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", body: unknown | undefined, targetOrg: string): Promise<CliResult<T>>;
export interface OrgCredentials {
    accessToken: string;
    instanceUrl: string;
}
/**
 * Get access token and instance URL for a target org via `sf org display`
 */
export declare function getOrgCredentials(targetOrg: string): Promise<CliResult<OrgCredentials>>;
export interface ContentVersionUploadResult {
    id: string;
    contentDocumentId: string;
}
/**
 * Upload a binary file as a Salesforce ContentVersion using multipart/form-data.
 * Uses Node 18 native fetch — no external form-data library needed.
 */
export declare function uploadContentVersion(filePath: string, title: string, targetOrg: string, contentType?: string): Promise<CliResult<ContentVersionUploadResult>>;
/**
 * Open the target org in the browser via `sf org open`.
 * Optional `pagePath` parameter to open a specific page (e.g., "/lightning/setup/SetupOneHome/home").
 */
export declare function openOrg(targetOrg: string, pagePath?: string): Promise<CliResult<{
    url: string;
    orgId: string;
    username: string;
}>>;
//# sourceMappingURL=cli.d.ts.map