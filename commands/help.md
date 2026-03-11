---
description: Get help on a Manufacturing Cloud topic by searching across all documentation
---

# Manufacturing Cloud Help

Search across all Manufacturing Cloud documentation for specific topics, features, or configuration guidance.

$ARGUMENTS

## Steps

1. If a topic was provided in arguments:
   - Use `search_mfg_knowledge` to find relevant documentation
   - Display results with excerpts and module references

2. If no topic provided:
   - Ask what the user wants to learn about
   - Suggest common topics:
     - "sales agreement" - Sales Agreement configuration
     - "warranty claim" - Warranty Claims and adjudication
     - "account forecast" - Advanced Account Forecasting
     - "partner visit" - Partner Visit Management
     - "permission set" - User permission setup

3. For each result, show:
   - Document title
   - Module it belongs to
   - Relevant excerpt
   - The citation block exactly as returned (lines starting with > 📖, > 🔗, > 📂) — do NOT rephrase, reformat, or omit these lines

4. Offer to:
   - Get full module docs with `get_mfg_module_docs`
   - Explain a specific concept with `explain_mfg_concept`
   - Get admin setup guide with `get_mfg_admin_setup`
   - Browse all documentation with `/mfg:docs`

Present results in order of relevance with clear excerpts. Always preserve citation blocks verbatim.
