/**
 * Salesforce CLI wrapper
 * Executes sf commands and handles output parsing
 */
import { exec, spawn } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as os from "os";
import { cacheGet, cacheSet, queryCacheKey, describeCacheKey, } from "../cache.js";
const execAsync = promisify(exec);
/**
 * Check if Salesforce CLI is installed
 */
export async function isSfCliInstalled() {
    try {
        await execAsync("sf --version");
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get the installed SF CLI version
 */
export async function getSfCliVersion() {
    try {
        const { stdout } = await execAsync("sf --version");
        return { success: true, data: stdout.trim() };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
/**
 * Install SF CLI via npm
 * Returns a promise that resolves when installation completes
 */
export async function installSfCli() {
    try {
        // Use spawn for better handling of long-running install
        return new Promise((resolve) => {
            const isWindows = process.platform === "win32";
            const npmCmd = isWindows ? "npm.cmd" : "npm";
            const child = spawn(npmCmd, ["install", "-g", "@salesforce/cli"], {
                stdio: "pipe",
            });
            let stdout = "";
            let stderr = "";
            child.stdout?.on("data", (data) => {
                stdout += data.toString();
            });
            child.stderr?.on("data", (data) => {
                stderr += data.toString();
            });
            child.on("close", (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        data: "Salesforce CLI installed successfully",
                        rawOutput: stdout,
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: `Installation failed (exit code ${code}). ${stderr || stdout}`,
                        rawOutput: stderr || stdout,
                    });
                }
            });
            child.on("error", (err) => {
                resolve({
                    success: false,
                    error: `Failed to start installation: ${err.message}`,
                });
            });
        });
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
/**
 * Execute a Salesforce CLI command with JSON output
 * Uses spawn instead of exec to properly handle special characters in arguments
 */
export async function execSfCommand(command, args = [], options = {}) {
    return new Promise((resolve) => {
        const fullArgs = [command, ...args, "--json"];
        if (options.targetOrg) {
            fullArgs.push("--target-org", options.targetOrg);
        }
        const timeout = options.timeout || 120000; // 2 minute default
        const child = spawn("sf", fullArgs, {
            stdio: "pipe",
            timeout,
        });
        let stdout = "";
        let stderr = "";
        child.stdout?.on("data", (data) => {
            stdout += data.toString();
        });
        child.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        child.on("close", (code) => {
            try {
                const result = JSON.parse(stdout);
                if (result.status === 0 || result.result) {
                    resolve({ success: true, data: result.result, rawOutput: stdout });
                }
                else {
                    resolve({
                        success: false,
                        error: result.message || "Command failed",
                        rawOutput: stdout,
                    });
                }
            }
            catch {
                // If JSON parsing fails, return raw output
                if (code === 0) {
                    resolve({
                        success: false,
                        error: `Failed to parse CLI output: ${stdout}`,
                        rawOutput: stdout,
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: stderr || stdout || `Command exited with code ${code}`,
                        rawOutput: stdout || stderr,
                    });
                }
            }
        });
        child.on("error", (err) => {
            resolve({
                success: false,
                error: err.message || "Unknown error",
            });
        });
    });
}
/**
 * List all authenticated orgs
 */
export async function listOrgs() {
    return execSfCommand("org", ["list"]);
}
/**
 * Get details about a specific org
 */
export async function getOrgDisplay(targetOrg) {
    return execSfCommand("org", ["display"], { targetOrg });
}
/**
 * Run a SOQL query
 */
export async function runSoqlQuery(query, targetOrg, options = {}) {
    const args = ["query", "--query", query];
    if (options.useToolingApi) {
        args.push("--use-tooling-api");
    }
    return execSfCommand("data", args, {
        targetOrg,
    });
}
/**
 * Run a Tooling API SOQL query
 */
export async function runToolingQuery(query, targetOrg) {
    return runSoqlQuery(query, targetOrg, { useToolingApi: true });
}
/**
 * Run a SOQL query with caching. Identical queries within the TTL window
 * return the cached result without hitting the SF CLI.
 */
export async function cachedSoqlQuery(query, targetOrg, options = {}) {
    const isTooling = options.useToolingApi ?? false;
    const key = queryCacheKey(query, isTooling);
    const cached = cacheGet(targetOrg, key);
    if (cached)
        return cached;
    const result = await runSoqlQuery(query, targetOrg, { useToolingApi: isTooling });
    if (result.success) {
        cacheSet(targetOrg, key, result, options.ttlMs);
    }
    return result;
}
/**
 * Run a Tooling API query with caching.
 */
export async function cachedToolingQuery(query, targetOrg, ttlMs) {
    return cachedSoqlQuery(query, targetOrg, { useToolingApi: true, ttlMs });
}
/**
 * Describe an SObject with caching. Object schemas rarely change mid-session.
 */
export async function cachedDescribeSObject(objectName, targetOrg, ttlMs) {
    const key = describeCacheKey(objectName);
    const cached = cacheGet(targetOrg, key);
    if (cached)
        return cached;
    const result = await describeSObject(objectName, targetOrg);
    if (result.success) {
        cacheSet(targetOrg, key, result, ttlMs);
    }
    return result;
}
/**
 * Create a record via Tooling API
 */
export async function createToolingRecord(objectName, data, targetOrg) {
    const endpoint = `/services/data/v66.0/tooling/sobjects/${objectName}`;
    return apiRequest(endpoint, "POST", data, targetOrg);
}
/**
 * Update a record via Tooling API (PATCH)
 */
export async function updateToolingRecord(objectName, recordId, data, targetOrg) {
    const endpoint = `/services/data/v66.0/tooling/sobjects/${objectName}/${recordId}`;
    return apiRequest(endpoint, "PATCH", data, targetOrg);
}
/**
 * Delete a record via Tooling API
 */
export async function deleteToolingRecord(objectName, recordId, targetOrg) {
    const endpoint = `/services/data/v66.0/tooling/sobjects/${objectName}/${recordId}`;
    return apiRequest(endpoint, "DELETE", undefined, targetOrg);
}
/**
 * Describe an SObject
 */
export async function describeSObject(objectName, targetOrg) {
    return execSfCommand("sobject", ["describe", "--sobject", objectName], { targetOrg });
}
/**
 * Get a single record by ID
 */
export async function getRecord(objectName, recordId, fields, targetOrg) {
    return execSfCommand("data", [
        "get",
        "record",
        "--sobject",
        objectName,
        "--record-id",
        recordId,
        "--fields",
        fields.join(","),
    ], { targetOrg });
}
/**
 * Create a record
 */
export async function createRecord(objectName, values, targetOrg) {
    const valuesStr = Object.entries(values)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
    return execSfCommand("data", ["create", "record", "--sobject", objectName, "--values", valuesStr], { targetOrg });
}
/**
 * Update a record
 */
export async function updateRecord(objectName, recordId, values, targetOrg) {
    const valuesStr = Object.entries(values)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
    return execSfCommand("data", [
        "update",
        "record",
        "--sobject",
        objectName,
        "--record-id",
        recordId,
        "--values",
        valuesStr,
    ], { targetOrg });
}
/**
 * Delete a record
 */
export async function deleteRecord(objectName, recordId, targetOrg) {
    return execSfCommand("data", ["delete", "record", "--sobject", objectName, "--record-id", recordId], { targetOrg });
}
/**
 * Deploy metadata to an org
 */
export async function deployMetadata(sourcePath, targetOrg) {
    return execSfCommand("project", ["deploy", "start", "--source-dir", sourcePath], { targetOrg, timeout: 300000 } // 5 minute timeout for deploys
    );
}
/**
 * Retrieve metadata from an org
 */
export async function retrieveMetadata(targetPath, metadata, targetOrg) {
    return execSfCommand("project", ["retrieve", "start", "--metadata", metadata, "--output-dir", targetPath], { targetOrg, timeout: 300000 });
}
/**
 * List metadata components of a specific type
 */
export async function listMetadata(metadataType, targetOrg) {
    return execSfCommand("org", ["list", "metadata", "--metadata-type", metadataType], { targetOrg });
}
/**
 * Run anonymous Apex code against an org
 */
export async function runAnonymousApex(code, targetOrg) {
    // Write code to a temp file since sf apex run requires a file
    const tmpFile = path.join(os.tmpdir(), `apex-${Date.now()}.apex`);
    fs.writeFileSync(tmpFile, code);
    try {
        const result = await execSfCommand("apex", ["run", "--file", tmpFile], { targetOrg, timeout: 120000 });
        return result;
    }
    finally {
        try {
            fs.unlinkSync(tmpFile);
        }
        catch { /* ignore */ }
    }
}
/**
 * Open the org login page in browser
 */
export async function openOrgLogin(alias, instanceUrl) {
    const args = ["login", "web"];
    if (alias) {
        args.push("--alias", alias);
    }
    if (instanceUrl) {
        args.push("--instance-url", instanceUrl);
    }
    return execSfCommand("org", args);
}
/**
 * Generate the login command string for user to run
 */
export function getLoginCommand(alias, instanceUrl) {
    let cmd = "sf org login web";
    if (alias) {
        cmd += ` --alias ${alias}`;
    }
    if (instanceUrl) {
        cmd += ` --instance-url ${instanceUrl}`;
    }
    return cmd;
}
/**
 * Make a REST API request to the target org
 */
export async function apiRequest(endpoint, method, body, targetOrg) {
    return new Promise((resolve) => {
        const args = ["api", "request", "rest", endpoint, "--method", method];
        if (body) {
            args.push("--body", JSON.stringify(body));
        }
        else if (method === "DELETE") {
            // SF CLI bug: DELETE without --body fails with "No 'mode' found in 'body' entry"
            args.push("--body", JSON.stringify({ mode: "raw" }));
        }
        args.push("--target-org", targetOrg);
        const child = spawn("sf", args, {
            stdio: "pipe",
            timeout: 120000,
        });
        let stdout = "";
        let stderr = "";
        child.stdout?.on("data", (data) => {
            stdout += data.toString();
        });
        child.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        child.on("close", (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(stdout);
                    resolve({ success: true, data: result, rawOutput: stdout });
                }
                catch {
                    // Non-JSON response might still be successful (e.g., DELETE returns empty)
                    resolve({ success: true, data: stdout, rawOutput: stdout });
                }
            }
            else {
                let errorMessage = "Unknown error";
                // Try to parse the actual API error from stdout first
                if (stdout.trim()) {
                    try {
                        const errorResult = JSON.parse(stdout);
                        if (Array.isArray(errorResult) && errorResult.length > 0) {
                            errorMessage = errorResult.map((e) => `${e.errorCode || "ERROR"}: ${e.message || "Unknown"}`).join("; ");
                        }
                        else if (errorResult.message) {
                            errorMessage = errorResult.message;
                        }
                        else {
                            errorMessage = stdout.trim();
                        }
                    }
                    catch {
                        errorMessage = stdout.trim();
                    }
                }
                // Fall back to stderr, filtering out SF CLI beta warnings
                if (errorMessage === "Unknown error") {
                    const filteredStderr = stderr
                        .split("\n")
                        .filter((line) => !line.includes("beta") && !line.includes("Warning") && line.trim())
                        .join("\n")
                        .trim();
                    errorMessage = filteredStderr || "Unknown error";
                }
                resolve({
                    success: false,
                    error: errorMessage,
                    rawOutput: stdout || stderr,
                });
            }
        });
        child.on("error", (err) => {
            resolve({
                success: false,
                error: err.message || "Unknown error",
            });
        });
    });
}
/**
 * Get access token and instance URL for a target org via `sf org display`
 */
export async function getOrgCredentials(targetOrg) {
    const result = await execSfCommand("org", ["display"], {
        targetOrg,
    });
    if (!result.success || !result.data) {
        return { success: false, error: result.error || "Failed to get org credentials" };
    }
    const accessToken = result.data.accessToken;
    const instanceUrl = result.data.instanceUrl;
    if (!accessToken || !instanceUrl) {
        return {
            success: false,
            error: "Org credentials missing accessToken or instanceUrl. Re-authenticate with: sf org login web",
        };
    }
    return { success: true, data: { accessToken, instanceUrl } };
}
/**
 * Detect the MIME content type from a file extension.
 */
function detectContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case ".zip":
            return "application/zip";
        case ".pdf":
            return "application/pdf";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        default:
            return "application/octet-stream";
    }
}
/**
 * Upload a binary file as a Salesforce ContentVersion using multipart/form-data.
 * Uses Node 18 native fetch — no external form-data library needed.
 */
export async function uploadContentVersion(filePath, title, targetOrg, contentType) {
    const credsResult = await getOrgCredentials(targetOrg);
    if (!credsResult.success || !credsResult.data) {
        return { success: false, error: credsResult.error || "Failed to get org credentials" };
    }
    const { accessToken, instanceUrl } = credsResult.data;
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const boundary = `----FormBoundary${crypto.randomBytes(16).toString("hex")}`;
    // Build multipart body manually
    const entityJson = JSON.stringify({
        Title: title,
        PathOnClient: fileName,
        Origin: "H",
    });
    const parts = [];
    // Part 1: JSON entity
    parts.push(Buffer.from(`--${boundary}\r\n` +
        `Content-Disposition: form-data; name="entity_content"\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        entityJson +
        `\r\n`));
    // Part 2: Binary file data
    parts.push(Buffer.from(`--${boundary}\r\n` +
        `Content-Disposition: form-data; name="VersionData"; filename="${fileName}"\r\n` +
        `Content-Type: ${contentType || detectContentType(filePath)}\r\n\r\n`));
    parts.push(fileBuffer);
    parts.push(Buffer.from(`\r\n`));
    // Closing boundary
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    const body = Buffer.concat(parts);
    const url = `${instanceUrl}/services/data/v62.0/sobjects/ContentVersion`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
            },
            body,
        });
        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `Upload failed (${response.status}): ${errorText}` };
        }
        const result = (await response.json());
        const contentVersionId = result.id;
        if (!contentVersionId) {
            return { success: false, error: "Upload succeeded but no ContentVersion ID returned" };
        }
        // Query back to get the ContentDocumentId
        const queryResult = await runSoqlQuery(`SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${contentVersionId}' LIMIT 1`, targetOrg);
        let contentDocumentId = "";
        if (queryResult.success && queryResult.data?.records?.length) {
            contentDocumentId = queryResult.data.records[0].ContentDocumentId;
        }
        return {
            success: true,
            data: { id: contentVersionId, contentDocumentId },
        };
    }
    catch (error) {
        return {
            success: false,
            error: `Upload request failed: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * Open the target org in the browser via `sf org open`.
 * Optional `pagePath` parameter to open a specific page (e.g., "/lightning/setup/SetupOneHome/home").
 */
export async function openOrg(targetOrg, pagePath) {
    const args = ["open"];
    if (pagePath) {
        args.push("--path", pagePath);
    }
    return execSfCommand("org", args, { targetOrg });
}
//# sourceMappingURL=cli.js.map