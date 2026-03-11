import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getModuleList,
  getModuleContent,
  searchKnowledge,
  getHelpDocList,
  getHelpDocContent,
  getExerciseList,
  getExerciseContent,
  getGuideList,
  getGuideContent,
  getTroubleshootingList,
  getTroubleshootingContent,
  formatCitation,
} from "../knowledge-loader.js";

export function register(server: McpServer) {
  server.tool(
  "list_mfg_modules",
  "List all available Manufacturing Cloud modules with documentation",
  {},
  async () => {
    const modules = getModuleList();

    if (modules.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No modules found in the knowledge base. Please run the documentation processing script.",
          },
        ],
      };
    }

    const moduleList = modules
      .map((m) => `- **${m.title}** (${m.fileCount} docs) - \`${m.slug}\``)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `# Available Manufacturing Cloud Modules\n\n${moduleList}\n\nUse \`get_mfg_module_docs\` with a module slug to get detailed documentation.`,
        },
      ],
    };
  }
);

// Tool: Get Module Documentation
  server.tool(
  "get_mfg_module_docs",
  "Get detailed documentation for a specific Manufacturing Cloud module",
  {
    module: z
      .string()
      .describe(
        "The module slug (e.g., 'account-management', 'sample-management', 'visit-management')"
      ),
  },
  async ({ module }) => {
    const content = getModuleContent(module);

    if (!content) {
      const modules = getModuleList();
      const availableModules = modules.map((m) => m.slug).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Module '${module}' not found.\n\nAvailable modules: ${availableModules}`,
          },
        ],
      };
    }

    const citation = formatCitation(module, module);
    return {
      content: [
        {
          type: "text",
          text: content + citation,
        },
      ],
    };
  }
);

// Tool: Search Manufacturing Cloud Knowledge Base
  server.tool(
  "search_mfg_knowledge",
  "Search the Manufacturing Cloud knowledge base for specific topics or terms",
  {
    query: z
      .string()
      .describe(
        "The search term or phrase to look for (e.g., 'sales agreement', 'warranty claim', 'account forecast')"
      ),
    maxResults: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 10)"),
  },
  async ({ query, maxResults = 10 }) => {
    const results = searchKnowledge(query).slice(0, maxResults);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No results found for '${query}'.\n\nTry different search terms or use \`list_mfg_modules\` to see available documentation.`,
          },
        ],
      };
    }

    const formattedResults = results
      .map((r, i) => {
        const citation = r.sourceFile
          ? formatCitation(r.sourceFile, r.source === "modules" ? r.module : undefined)
          : "";
        return `### ${i + 1}. ${r.title}\n**Module:** ${r.module}\n\n${r.excerpt}${citation}`;
      })
      .join("\n\n---\n\n");

    return {
      content: [
        {
          type: "text",
          text: `# Search Results for '${query}'\n\nFound ${results.length} result(s):\n\n${formattedResults}`,
        },
      ],
    };
  }
);

// Tool: Explain Manufacturing Cloud Concept
  server.tool(
  "explain_mfg_concept",
  "Get an explanation of a Manufacturing Cloud concept, feature, or component",
  {
    concept: z
      .string()
      .describe(
        "The concept to explain (e.g., 'Sales Agreement', 'Account Forecast', 'DPE', 'Warranty Claim', 'Partner Visit')"
      ),
  },
  async ({ concept }) => {
    // Search for the concept across all modules
    const results = searchKnowledge(concept);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No documentation found for '${concept}'.\n\nThis concept may not be covered in the current knowledge base, or try a different term.`,
          },
        ],
      };
    }

    // Get the full content from the most relevant module
    const topResult = results[0];
    const moduleContent = getModuleContent(topResult.module);
    const citation = topResult.sourceFile
      ? formatCitation(topResult.sourceFile, topResult.source === "modules" ? topResult.module : undefined)
      : formatCitation(topResult.module, topResult.module);

    return {
      content: [
        {
          type: "text",
          text: `# ${concept}\n\n**Found in module:** ${topResult.module}\n\n---\n\n${moduleContent}${citation}`,
        },
      ],
    };
  }
);

// Tool: Get Admin Setup Guide
  server.tool(
  "get_mfg_admin_setup",
  "Get admin setup and configuration guidance for a Manufacturing Cloud feature",
  {
    feature: z
      .string()
      .describe(
        "The feature to get admin setup for (e.g., 'sales-agreements', 'warranty-management', 'partner-visits', 'advanced-account-forecasting')"
      ),
  },
  async ({ feature }) => {
    // Try to find admin-related documentation
    const adminResults = searchKnowledge(`${feature} admin`);
    const configResults = searchKnowledge(`${feature} configuration`);
    const setupResults = searchKnowledge(`${feature} setup`);

    const allResults = [...adminResults, ...configResults, ...setupResults];

    if (allResults.length === 0) {
      const moduleContent = getModuleContent(feature);
      if (moduleContent) {
        return {
          content: [
            {
              type: "text",
              text: `# Admin Setup: ${feature}\n\n${moduleContent}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `No admin setup documentation found for '${feature}'.\n\nUse \`list_mfg_modules\` to see available modules.`,
          },
        ],
      };
    }

    // Dedupe by module
    const uniqueModules = [...new Set(allResults.map((r) => r.module))];
    let combinedContent = `# Admin Setup Guide: ${feature}\n\n`;

    for (const moduleSlug of uniqueModules.slice(0, 3)) {
      const content = getModuleContent(moduleSlug);
      if (content) {
        const citation = formatCitation(moduleSlug, moduleSlug);
        combinedContent += `\n\n---\n\n${content}${citation}`;
      }
    }

    return {
      content: [
        {
          type: "text",
          text: combinedContent,
        },
      ],
    };
  }
);

// ============================================================================
// HELP DOCUMENTATION TOOLS
// ============================================================================

// Tool: List Help Documents
  server.tool(
  "list_mfg_help_docs",
  "List all official Salesforce help documentation for Manufacturing Cloud",
  {},
  async () => {
    const helpDocs = getHelpDocList();
    const exercises = getExerciseList();
    const guides = getGuideList();
    const troubleshooting = getTroubleshootingList();

    let message = "# Available Manufacturing Cloud Documentation\n\n";

    if (helpDocs.length > 0) {
      message += "## Official Help Documentation\n\n";
      message += helpDocs.map((d) => `- **${d.title}** (\`${d.slug}\`)`).join("\n");
      message += "\n\n";
    }

    if (guides.length > 0) {
      message += "## Guides\n\n";
      message += guides.map((d) => `- **${d.title}** (\`${d.slug}\`)`).join("\n");
      message += "\n\n";
    }

    if (exercises.length > 0) {
      message += "## Hands-on Exercises\n\n";
      message += exercises.map((d) => `- **${d.title}** (\`${d.slug}\`)`).join("\n");
      message += "\n\n";
    }

    if (troubleshooting.length > 0) {
      message += "## Troubleshooting\n\n";
      message += troubleshooting.map((d) => `- **${d.title}** (\`${d.slug}\`)`).join("\n");
      message += "\n\n";
    }

    const total = helpDocs.length + exercises.length + guides.length + troubleshooting.length;
    if (total === 0) {
      message = "No documentation found. Please run the documentation processing scripts.";
    } else {
      message += `\nUse \`get_mfg_help_doc\`, \`get_mfg_guide\`, or \`get_mfg_troubleshooting\` with a slug to get the full content.`;
    }

    return {
      content: [{ type: "text", text: message }],
    };
  }
);

// Tool: Get Help Document
  server.tool(
  "get_mfg_help_doc",
  "Get official Salesforce help documentation for a specific Manufacturing Cloud topic",
  {
    slug: z
      .string()
      .describe(
        "The document slug (e.g., 'account-management', 'sample-management', 'activity-plans')"
      ),
  },
  async ({ slug }) => {
    const content = getHelpDocContent(slug);

    if (!content) {
      const available = getHelpDocList();
      const slugList = available.map((d) => d.slug).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Help document '${slug}' not found.\n\nAvailable documents: ${slugList || "none"}`,
          },
        ],
      };
    }

    const citation = formatCitation(slug);
    return {
      content: [{ type: "text", text: content + citation }],
    };
  }
);

// Tool: Get Guide
  server.tool(
  "get_mfg_guide",
  "Get Manufacturing Cloud guide documentation (developer guide, admin guide, etc.)",
  {
    slug: z
      .string()
      .describe("The guide slug (e.g., 'dev-guide', 'mobile-setup')"),
  },
  async ({ slug }) => {
    const content = getGuideContent(slug);

    if (!content) {
      const available = getGuideList();
      const slugList = available.map((d) => `${d.slug} (${d.title})`).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Guide '${slug}' not found.\n\nAvailable guides: ${slugList || "none"}`,
          },
        ],
      };
    }

    const citation = formatCitation(slug);
    return {
      content: [{ type: "text", text: content + citation }],
    };
  }
);

// Tool: Get Troubleshooting Documentation
  server.tool(
  "get_mfg_troubleshooting",
  "Get Manufacturing Cloud troubleshooting documentation including common issues and their resolutions",
  {
    topic: z
      .string()
      .optional()
      .describe(
        "Optional: specific troubleshooting topic slug. Defaults to common-issues."
      ),
  },
  async ({ topic }) => {
    const slug = topic || "common-issues";
    const content = getTroubleshootingContent(slug);

    if (!content) {
      const available = getTroubleshootingList();
      const slugList = available.map((d) => d.slug).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Troubleshooting document '${slug}' not found.\n\nAvailable documents: ${slugList || "none"}`,
          },
        ],
      };
    }

    const citation = formatCitation(slug);
    return {
      content: [{ type: "text", text: content + citation }],
    };
  }
);

// Tool: Get Exercise Content
  server.tool(
  "get_mfg_exercise",
  "Get hands-on exercise documentation for Manufacturing Cloud training",
  {
    slug: z
      .string()
      .describe(
        "The exercise slug (e.g., 'manufacturing-cloud-partner-enablement-hands-on-exercises-day-1-foundations')"
      ),
  },
  async ({ slug }) => {
    const content = getExerciseContent(slug);

    if (!content) {
      const available = getExerciseList();
      const slugList = available.map((d) => `${d.slug}`).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Exercise '${slug}' not found.\n\nAvailable exercises: ${slugList || "none"}`,
          },
        ],
      };
    }

    const citation = formatCitation(slug);
    return {
      content: [{ type: "text", text: content + citation }],
    };
  }
);
}

