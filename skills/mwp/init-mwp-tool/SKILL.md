---
name: init-mwp-tool
description: Scaffold an MWP project structure for a Claude Code skill or developer tool project. Invoked by init-mwp when the project type is matched, or directly via /init-mwp-tool. Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a skill or tool project.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Scaffold an MWP project structure for a Claude Code skill or developer tool project.

## Canonical Scaffold

```
root/
├── CLAUDE.md
├── AGENTS.md
├── CONTEXT.md
├── DEVLOG.md
├── agent-roles.md
├── skills.md
├── memory.md
├── README.md
├── spec/
│   └── (reference documents)
├── skills/
│   └── CONTEXT.md
└── templates/
    └── CONTEXT.md
```

Root contains MWP files only. Reference documents in spec/, skill instruction files in skills/, scaffold content in templates/.

> Note: this project's own root `skills.md` (project catalog of slash commands) is distinct from the `skills/` workspace folder (the skill instruction files this tool project produces) — don't conflate the two.

## Steps

1. **Load the MWP spec.** Read `~/.claude/mwp-spec/spec/CONTEXT.md`. This governs all structural decisions.

2. **Load references.** If your workspace has its own agent-behaviour conventions doc, follow it (default: state your plan before non-trivial changes; confirm before destructive or hard-to-reverse actions); otherwise use that default directly.
   - `~/.claude/mwp-spec/spec/file-set.md` — the required root file set (normative)
   - `~/.claude/mwp-spec/templates/` — the starting body for every file in that set
   - Documentation — at minimum a README plus a CLAUDE.md/AGENTS.md per this spec's file-set rules; workspace practice only, for when to update each file once it exists

3. **Ask the user** (ask all at once):
   - What does this tool or skill do? (one sentence)
   - What slash commands will it expose? (e.g. /init-mwp, /audit-mwp)
   - Are there any reference documents that define the rules this skill works against?
   - Any additional workspaces needed?

4. **Present the scaffold.** Show the canonical structure above. Ask: "Does this structure fit, or do you need any workspaces adjusted?"

5. **Generate files** using `~/.claude/mwp-spec/templates/`:
   - **CLAUDE.md** — Identity, Self-Reference, Routing Table, Cross-Workspace Flows, Naming Conventions, File Placement, Token Management. Include deployment path in Naming Conventions.
   - **AGENTS.md** — Lightweight cross-model adapter pointing to CLAUDE.md
   - **GEMINI.md** — Same content as AGENTS.md, per `~/.claude/mwp-spec/templates/GEMINI.md.template`. Verify with `diff AGENTS.md GEMINI.md` — it must be empty
   - **CONTEXT.md** — what this tool/skill project does, workspace map, known quirks
   - **DEVLOG.md** — single entry dated today: "Project scaffolded via /init-mwp-tool"
   - **agent-roles.md** — Agent roles, capabilities, boundaries, inputs/outputs, and handoffs
   - **skills.md** (root) — from `~/.claude/mwp-spec/templates/skills.md.template`, catalogs this project's own slash commands; empty until skills are added
   - **README.md** — using `README.md.template`: what the tool does, setup steps, env vars, deployment notes
   - **skills/CONTEXT.md** — what each skill file does, the deploy process, skill file conventions
   - **templates/CONTEXT.md** — what each template is for, how skills use them, design principles
   - **memory.md** — current phase: "Initial setup complete"

6. **Report** every file created and its path.

## Naming Defaults
- Skill files: kebab-case.md (e.g. my-skill.md)
- Template files: filename.template (e.g. CLAUDE.md.template)
- Deploy target: `~/.claude/skills/[skill-name]/` (or your workspace's own skill source directory, if it deploys skills from a central location first)

## Rules
- If invoked from an orchestration skill in your own setup with pre-gathered context (tool description, slash commands, reference docs, workspaces confirmed), skip Step 3 and use that context directly for Steps 4–6.
- MWP structural principles always take priority.
- Root contains only CLAUDE.md, AGENTS.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, and README.md.
- Generated CLAUDE.md must include all seven MWP components.
- Generated AGENTS.md must stay a small adapter pointing to CLAUDE.md.
- Generated agent-roles.md must use the role-registry template.
- Each skill file must be focused on one command — no combined logic.
- spec/ files are reference only — loaded on demand, never at session start.
