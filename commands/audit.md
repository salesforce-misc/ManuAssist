---
description: Audit Manufacturing Cloud configuration to identify misconfigurations
arguments: "[group]"
---

# Manufacturing Cloud Configuration Audit

Run a configuration audit against the connected Salesforce org to identify issues.

## Arguments

- `group` (optional): The validation group to run. If not specified, runs a full audit.

## Available Groups

| Group | Description |
|-------|-------------|
| `sales-agreement-check` | Validate Sales Agreement configuration |
| `warranty-check` | Validate Warranty and Claims setup |
| `forecasting-check` | Validate AAF and DPE configuration |
| `user-config-check` | Validate user permission set assignments |
| `full-audit` | Comprehensive check of all Manufacturing Cloud configuration |

## Instructions

1. First, check if the org is connected by calling `check_mfg_setup`
2. If an org is connected, run the audit using `health_check` tool
3. If a group argument was provided (e.g., `/mfg:audit sales-agreement-check`), use that group
4. Otherwise, default to `full-audit`
5. Present the audit results clearly, highlighting any errors or warnings
6. For each failed check, explain the issue and provide the resolution steps

## Example Usage

User: `/mfg:audit`
→ Run full audit

User: `/mfg:audit sales-agreement-check`
→ Run only Sales Agreement checks

User: `/mfg:audit warranty-check`
→ Run warranty validation checks

## Output Format

The audit report should include:
1. Summary (total checks, passed, failed, errors, warnings)
2. Overall status (PASSED, PASSED WITH WARNINGS, or FAILED)
3. Details of any failed checks with resolution steps
4. List of passed checks (collapsed/summarized)
