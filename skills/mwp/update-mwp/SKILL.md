---
name: update-mwp
description: Update MWP structure files when a project changes. Use whenever a workspace is added, removed, or renamed, tools or integrations have changed, naming conventions are updated, or the user says /update-mwp. Trigger even if the user says "update my project docs" or "I've added a new section".
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Update MWP structure files when a project changes.

## Steps

1. **Ask the user what has changed.** Do not assume. Common triggers:
   - A new workspace has been added
   - A workspace has been renamed or removed
   - The project's tech stack or tools have changed
   - A new external system has been integrated
   - Naming conventions have been updated
   - A cross-workspace flow has been added or changed

2. **Read the current versions** of the affected files before editing anything.

3. **Load spec/CONTEXT.md** from `~/.claude/mwp-spec/spec/CONTEXT.md` if the change involves structural decisions.

4. **Update only the files that need changing.** For each change:
   - New workspace → create [workspace]/CONTEXT.md, add a row to the routing table in CLAUDE.md, add a Token Management rule if needed
   - Removed workspace → remove the folder reference from CLAUDE.md routing table, remove associated Token Management rules
   - Changed tools or integrations → update the relevant workspace CONTEXT.md and the Skills column in the routing table
   - Changed naming conventions → update CLAUDE.md Naming Conventions section
   - Changed cross-workspace flow → update CLAUDE.md Cross-Workspace Flows section

5. **Update memory.md** to reflect the change and current project state.

6. **Ensure AGENTS.md exists as an adapter.** It should point to CLAUDE.md; do not mirror routing changes into it unless the user explicitly asks.

7. **Report what was changed** — list every file modified and what changed in it.

## Rules
- Read every file before editing it.
- Do not reorganise or rewrite files beyond what the reported change requires.
- If the change implies a structural problem (e.g. a workspace that should be split), flag it but do not act on it without confirmation.
- Do not use lowercase agents.md. Use AGENTS.md for cross-model routing and agent-roles.md for role definitions.
