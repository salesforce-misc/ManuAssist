---
description: View Manufacturing Cloud release notes by Salesforce release
---

# Release Notes

View Manufacturing Cloud release notes for a specific Salesforce release.

$ARGUMENTS

## Steps

1. If a release was provided in arguments (e.g., "Spring 26", "Winter 26"):
   - Use `get_release_notes` to retrieve the notes for that release
   - Display the full release notes

2. If no release was provided:
   - Use `get_release_notes` without arguments to list available releases
   - Ask the user which release they want to view

3. Present the release notes in a clear format, highlighting:
   - New features
   - Enhancements
   - Bug fixes
   - Deprecations

4. Offer to explain any specific feature or change in more detail.
