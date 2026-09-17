# update-mwp — Update MWP structure files when a project changes

Updates CLAUDE.md, workspace CONTEXT.md files, AGENTS.md, agent-roles.md, and memory.md to reflect changes to the project — new workspaces, renamed workspaces, changed tools, updated naming conventions. AGENTS.md is kept as a lightweight adapter to CLAUDE.md rather than duplicating routing.

---

## Overview

**What it does:**
Makes targeted, minimal updates to MWP files in response to a described project change. Reads before editing, loads the spec only when structural decisions are involved, and reports every file changed.

**When to use it:**
- A new workspace has been added to the project
- A workspace has been renamed or removed
- The project's tech stack or tools have changed
- A new external system has been integrated
- Naming conventions have been updated
- A cross-workspace flow has been added or changed

**When NOT to use it:**
- To check whether MWP files are correct — use `/audit-mwp` instead
- To do a full setup from scratch — use `/init-mwp` instead
- To make general edits to project docs unrelated to MWP structure

---

## Prerequisites

- Existing MWP files (CLAUDE.md, AGENTS.md, agent-roles.md, memory.md, workspace CONTEXT.md files)
- A clear description of what has changed — the skill asks for this before acting

---

## What Gets Updated Per Change Type

| Change | Files updated |
|---|---|
| New workspace added | Create `[workspace]/CONTEXT.md`, add row to routing table in CLAUDE.md, add Token Management rule if needed |
| Workspace renamed | Update all references in CLAUDE.md (routing table, cross-workspace flows), rename CONTEXT.md |
| Workspace removed | Remove from CLAUDE.md routing table, remove Token Management rule |
| Tool or integration changed | Update relevant workspace CONTEXT.md and Skills column in routing table |
| Naming convention changed | Update CLAUDE.md Naming Conventions section |
| Cross-workspace flow changed | Update CLAUDE.md Cross-Workspace Flows section |

memory.md is always updated at the end to reflect the current project state.

`AGENTS.md` is required as the cross-model adapter, not the canonical routing file. It should point to `CLAUDE.md`. `agent-roles.md` is the MWP role registry and should only change when agent roles, boundaries, or handoffs change. Do not use lowercase `agents.md`; it collides with `AGENTS.md` on case-insensitive filesystems.

---

## Process

### 1. Ask what changed
Do not assume. The user describes the change in plain English.

### 2. Read before editing
Load every file that will be modified before touching it. Never edit blind.

### 3. Load the spec if needed
Only when the change involves structural decisions — e.g. whether a new workspace warrants a CONTEXT.md or just a subfolder.

### 4. Make minimal changes
Only update what the change requires. Do not reorganise, rewrite, or improve surrounding content.

### 5. Flag structural problems
If the change implies an underlying structural issue (e.g. a workspace that should be split into two), flag it but do not act without confirmation.

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| Routing table out of sync after update | Check all workspace names in CLAUDE.md match actual folder names |
| AGENTS.md drifted from CLAUDE.md | Replace AGENTS.md with the adapter pattern; do not maintain a second routing table |
| memory.md still reflects old state | Confirm the final update step ran — memory.md should always be the last file touched |
| Spec not found | Verify `~/.claude/mwp-spec/spec/CONTEXT.md` exists — see this repo's INSTALL.md |
