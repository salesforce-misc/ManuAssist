# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-23

### Added
- **7 knowledge modules**: Sales Agreements, Advanced Account Forecasting, Partner Visit Management, Warranty Management, Rebate Management, Inventory Allocation, Manufacturing Programs — each with `overview.md` and `configuration.md`
- **knowledge/help/** directory with official Manufacturing Cloud admin reference
- **Source citations**: All skills now reference knowledge tools (`get_mfg_module_docs`, `search_mfg_knowledge`) for traceable responses
- **Inventory allocation test cases**: Reference content moved to knowledge base

### Changed
- Renamed MCP server from `claude-for-mfg` to `mfg-cloud-mcp-server`
- `README.md` rewritten to reflect MCP server architecture (not plugin)
- `CONTRIBUTING.md` updated with accurate project structure and setup instructions
- Removed all plugin-specific invocation instructions

### Removed
- `.claude-plugin/` directory (plugin manifest and marketplace listing)
- `commands/setup-plugin.md` — plugin setup command no longer applicable
- `commands/configure-territory.md` — LSC-specific command
- Broken test files referencing non-existent source files and infrastructure
- `skills/feature/` misplaced directory

## [0.2.0] - 2026-03-02

### Added
- Modular architecture: refactored tool registration into 18 focused modules in `src/tools/`
- Health check tools: `health_check` and `get_org_status`
- Config export/import: `export_config` and `import_config`
- Release notes tool: `get_release_notes` with Spring '26 and Winter '26 content
- Anonymous Apex: `run_apex` tool
- Bulk operations: `bulk_create_records` and `bulk_update_records`
- Metadata tools: `deploy_metadata` and `retrieve_metadata`
- CI/CD: GitHub Actions workflows for CI and release

## [0.1.0] - 2026-02-15

### Added
- Initial MCP server with Salesforce org integration
- Knowledge base covering Manufacturing Cloud modules
- Core tool set: SOQL, CRUD, describe, config checks, user management
- Sales Agreement, Warranty, Forecasting, Partner Visit domain tools
- Validation rule engine framework
