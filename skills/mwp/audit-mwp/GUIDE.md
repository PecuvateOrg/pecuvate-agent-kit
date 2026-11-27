# audit-mwp — Audit an existing project's MWP structure

Checks a project's AGENTS.md, CONTEXT.md files, memory.md, and agent instruction files against the MWP framework principles and reports what is missing, misplaced, or oversized.

---

## Overview

**What it does:**
Reads the project's MWP files and checks each one against the framework spec. Returns a structured report of issues in three categories: missing, misplaced, and oversized. Does not modify any files.

**When to use it:**
- When onboarding to an existing project and unsure if it's set up correctly
- After adding a new workspace or workspace file and wanting to verify compliance
- Periodically to catch drift between the project structure and the framework rules

**When NOT to use it:**
- To fix MWP issues — the audit only reports; use `/update-mwp` to make changes
- On a brand new project with no MWP files yet — use `/init-mwp` instead

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md` must be readable
- At least one of AGENTS.md, memory.md, agent-roles.md, or a workspace CONTEXT.md must exist

---

## What Gets Checked

### AGENTS.md
The three required parts (`~/.claude/mwp-spec/spec/layers.md` § What AGENTS.md Contains):
1. **Identity and first reads** — one line saying what the project is, then "Read `NON-NEGOTIABLES.md` before doing anything; read `memory.md` at session start."
2. **Task table** — maps each task type to the folder and file to read
3. **Facts** — short facts every task needs (deployment, stack), nothing conditional

Also checked: no `CLAUDE.md` beside it, routing table completeness, rules that belong in `NON-NEGOTIABLES.md`, content that belongs in a workspace CONTEXT.md instead.

### Workspace CONTEXT.md files
Each workspace CONTEXT.md is checked for: a one-line purpose, only the sections that apply, and no status or folder trees (`context-md-purpose-line`, `context-md-no-status`). Also checked for cross-contamination (content that belongs in a different workspace) and the ~100–150 line ceiling.

### memory.md
Checked for: whether it reflects current project state, whether it contains only state that cannot be derived from reading files, absence of architectural detail or API documentation (which belongs in CONTEXT.md or reference files).

### Structure
Reference files in a dedicated folder (not loose at root), archive files excluded from active loading.

### AGENTS.md and agent-roles.md
Checked for naming-role clarity:
- `AGENTS.md` is the canonical Layer 0; a `CLAUDE.md` beside it is a FAIL (`agents-canonical`)
- `agent-roles.md` should be the MWP role registry for agent roles, capabilities, boundaries, inputs/outputs, and handoffs
- duplicated routing tables in `AGENTS.md` are flagged as drift risk
- lowercase `agents.md` is flagged because it collides with `AGENTS.md` on case-insensitive filesystems

---

## Report Format

Issues are reported in three categories:

- **Missing** — components or files that should exist but do not
- **Misplaced** — content in the wrong file or location
- **Oversized** — files exceeding their ceiling, with notes on what to cut

Each issue is flagged by file and section — not just "something's wrong with AGENTS.md" but "the first-read line is missing from AGENTS.md".

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| Spec not found | Verify `~/.claude/mwp-spec/spec/CONTEXT.md` exists — see this repo's INSTALL.md |
| Audit reports everything as missing | AGENTS.md may not follow MWP structure at all — run `/init-mwp` to scaffold from scratch |
| Unsure whether a finding is a real issue | Cross-reference against the spec directly for the definitive answer |
