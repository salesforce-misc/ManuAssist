/**
 * Maps document slugs to citation metadata.
 * Used to attach source attribution to knowledge base responses.
 */
export const citationMap = {
    // ── Official Help Documentation ──────────────────────────────────────
    "manufacturing-cloud-admin": {
        label: "Manufacturing Cloud Administration",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_manufacturing_cloud.htm",
    },
    "sales-agreements": {
        label: "Sales Agreements",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_sales_agreements.htm",
    },
    "advanced-account-forecasting": {
        label: "Advanced Account Forecasting",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_advanced_account_forecasting.htm",
    },
    "partner-visit-management": {
        label: "Partner Visit Management",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_partner_visit_management.htm",
    },
    "warranty-lifecycle-management": {
        label: "Warranty Lifecycle Management",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_warranty_lifecycle_management.htm",
    },
    "account-manager-targets": {
        label: "Account Manager Targets",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_account_manager_targets.htm",
    },
    "rebate-management": {
        label: "Rebate Management",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_rebate_management.htm",
    },
    "manufacturing-service-console": {
        label: "Manufacturing Service Console",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_service_console.htm",
    },
    "asset-service-management": {
        label: "Asset & Service Management",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_asset_service_management.htm",
    },
    "inventory-management": {
        label: "Inventory Management",
        category: "Official Help",
        url: "https://help.salesforce.com/s/articleView?id=ind.mfg_inventory_management.htm",
    },
    // ── Guides ────────────────────────────────────────────────────────────
    "dev-guide": {
        label: "Manufacturing Cloud Developer Guide",
        category: "Guide",
        url: "https://developer.salesforce.com/docs/atlas.en-us.mfg_dev_guide.meta/mfg_dev_guide/",
    },
    "admin-guide": {
        label: "Manufacturing Cloud Admin Guide",
        category: "Guide",
        url: "https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/manufacturing_admin.pdf",
    },
    // ── Exercises ─────────────────────────────────────────────────────────
    "manufacturing-cloud-partner-enablement-hands-on-exercises-day-1-foundations": {
        label: "Partner Enablement Hands-On Exercises — Day 1 Foundations",
        category: "Exercise",
    },
    "manufacturing-cloud-partner-enablement-hands-on-exercises-day-2-sales-track": {
        label: "Partner Enablement Hands-On Exercises — Day 2 Sales Track",
        category: "Exercise",
    },
    // ── Troubleshooting ───────────────────────────────────────────────────
    "common-issues": {
        label: "Common Issues and Troubleshooting",
        category: "Troubleshooting",
    },
};
// ── PM Enablement Modules ─────────────────────────────────────────────
// Keyed by "module:slug" to avoid collisions with Official Help docs
// that share the same base slug (e.g. "sales-agreements").
export const moduleCitationMap = {
    // ── Sales Agreements ─────────────────────────────────────────────────
    "sales-agreements:sales-agreements": {
        label: "Sales Agreements",
        category: "PM Enablement",
    },
    "sales-agreements:sales-agreements-configuration-guide": {
        label: "Sales Agreements Configuration Guide",
        category: "PM Enablement",
    },
    "sales-agreements:sales-agreements-demo-transcript": {
        label: "Sales Agreements Demo Transcript",
        category: "PM Enablement",
    },
    // ── Advanced Account Forecasting ──────────────────────────────────────
    "advanced-account-forecasting:advanced-account-forecasting": {
        label: "Advanced Account Forecasting",
        category: "PM Enablement",
    },
    "advanced-account-forecasting:aaf-configuration-guide": {
        label: "AAF Configuration Guide",
        category: "PM Enablement",
    },
    "advanced-account-forecasting:aaf-demo-transcript": {
        label: "AAF Demo Transcript",
        category: "PM Enablement",
    },
    "advanced-account-forecasting:dpe-templates-guide": {
        label: "DPE Templates Guide",
        category: "PM Enablement",
    },
    // ── Partner Visit Management ──────────────────────────────────────────
    "partner-visit-management:partner-visit-management": {
        label: "Partner Visit Management",
        category: "PM Enablement",
    },
    "partner-visit-management:partner-visit-configuration-guide": {
        label: "Partner Visit Configuration Guide",
        category: "PM Enablement",
    },
    "partner-visit-management:action-plans-guide": {
        label: "Action Plans Guide",
        category: "PM Enablement",
    },
    // ── Warranty Lifecycle Management ─────────────────────────────────────
    "warranty-management:warranty-management": {
        label: "Warranty Lifecycle Management",
        category: "PM Enablement",
    },
    "warranty-management:warranty-configuration-guide": {
        label: "Warranty Configuration Guide",
        category: "PM Enablement",
    },
    "warranty-management:warranty-claims-guide": {
        label: "Warranty Claims & Adjudication Guide",
        category: "PM Enablement",
    },
    // ── User Management ───────────────────────────────────────────────────
    "user-management:user-management": {
        label: "User Management",
        category: "PM Enablement",
    },
    "user-management:user-management-setup-guide": {
        label: "User Management Setup Guide",
        category: "PM Enablement",
    },
    "user-management:permission-sets-guide": {
        label: "Manufacturing Cloud Permission Sets Guide",
        category: "PM Enablement",
    },
    // ── Data Model ────────────────────────────────────────────────────────
    "data-model:data-model": {
        label: "Manufacturing Cloud Data Model",
        category: "PM Enablement",
    },
    "data-model:object-reference": {
        label: "Manufacturing Cloud Object Reference",
        category: "PM Enablement",
    },
    // ── Product Portfolio ─────────────────────────────────────────────────
    "product-portfolio:product-portfolio": {
        label: "Product Portfolio Management",
        category: "PM Enablement",
    },
    "product-portfolio:product-configuration-guide": {
        label: "Product Configuration Guide",
        category: "PM Enablement",
    },
    // ── Account Management ────────────────────────────────────────────────
    "account-management:account-management": {
        label: "Account Management",
        category: "PM Enablement",
    },
    "account-management:account-configuration-guide": {
        label: "Account Configuration Guide",
        category: "PM Enablement",
    },
    // ── Agentforce for Manufacturing ──────────────────────────────────────
    "agentforce:agentforce": {
        label: "Agentforce for Manufacturing Cloud",
        category: "PM Enablement",
    },
    "agentforce:agentforce-winter-26-enablement": {
        label: "Agentforce for Manufacturing Cloud Winter '26 Enablement",
        category: "PM Enablement",
    },
    // ── Rebate Management ─────────────────────────────────────────────────
    "rebate-management:rebate-management": {
        label: "Rebate Management",
        category: "PM Enablement",
    },
    "rebate-management:rebate-configuration-guide": {
        label: "Rebate Configuration Guide",
        category: "PM Enablement",
    },
    // ── Inventory Management ──────────────────────────────────────────────
    "inventory-management:inventory-management": {
        label: "Inventory Management",
        category: "PM Enablement",
    },
    "inventory-management:inventory-configuration-guide": {
        label: "Inventory Configuration Guide",
        category: "PM Enablement",
    },
};
/**
 * Look up citation info for a document slug.
 *
 * When moduleName is provided, first checks the module-specific citation map
 * using "module:slug" key format. This avoids collisions where a slug like
 * "sales-agreements" exists in both Official Help and PM Enablement.
 *
 * Falls back to the base citationMap for help docs, guides, exercises, etc.
 */
export function getCitation(slug, moduleName) {
    if (moduleName) {
        const moduleKey = `${moduleName}:${slug}`;
        const moduleInfo = moduleCitationMap[moduleKey];
        if (moduleInfo)
            return moduleInfo;
    }
    return citationMap[slug];
}
//# sourceMappingURL=citation-map.js.map