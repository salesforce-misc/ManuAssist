/**
 * Salesforce authentication and org management
 */
import { SfOrg } from "./cli.js";
export interface SetupStatus {
    cliInstalled: boolean;
    cliVersion?: string;
    hasAuthenticatedOrgs: boolean;
    orgs: SfOrg[];
    defaultOrg?: SfOrg;
    setupComplete: boolean;
    nextStep?: SetupStep;
}
export type SetupStep = "install_cli" | "authenticate_org" | "select_default_org" | "ready";
export interface SetupInstructions {
    step: SetupStep;
    title: string;
    description: string;
    command?: string;
    options?: string[];
}
/**
 * Get the current target org
 */
export declare function getTargetOrg(): string | undefined;
/**
 * Set the current target org.
 * Invalidates the metadata cache for the previous org so stale data
 * is never returned after an org switch.
 */
export declare function setTargetOrg(orgAliasOrUsername: string): void;
/**
 * Clear the current target org
 */
export declare function clearTargetOrg(): void;
/**
 * Check the full setup status
 */
export declare function checkSetupStatus(): Promise<SetupStatus>;
/**
 * Get setup instructions for the current step
 */
export declare function getSetupInstructions(step: SetupStep): SetupInstructions;
/**
 * Format org list for display
 */
export declare function formatOrgList(orgs: SfOrg[]): string;
/**
 * Get the effective target org (session override or default)
 */
export declare function getEffectiveTargetOrg(): Promise<string | undefined>;
/**
 * Validate that we have a usable org connection
 */
export declare function validateOrgConnection(): Promise<{
    valid: boolean;
    targetOrg?: string;
    error?: string;
    availableOrgs?: string[];
    setupInstructions?: SetupInstructions;
}>;
/**
 * Identify if an org has Manufacturing Cloud enabled (heuristic check)
 */
export declare function checkMfgInstalled(targetOrg: string): Promise<{
    installed: boolean;
    indicators: string[];
}>;
//# sourceMappingURL=auth.d.ts.map