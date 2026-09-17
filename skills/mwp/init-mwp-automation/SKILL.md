---
name: init-mwp-automation
description: Scaffold an MWP project structure for an automation, workflow, or integration project. Invoked by init-mwp when the project type is matched, or directly via /init-mwp-automation. Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a Node.js automation project.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Scaffold an MWP project structure for an automation, workflow, or integration project.

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
├── src/
│   └── CONTEXT.md
├── integrations/
│   └── CONTEXT.md
└── workflows/
    └── CONTEXT.md
```

Root contains MWP files only. Core logic lives in src/. Each external service gets its own subfolder inside integrations/.

## Steps

1. **Load the MWP spec.** Read `~/.claude/mwp-spec/spec/CONTEXT.md`. This governs all structural decisions.

2. **Load references.** If your workspace already has its own conventions docs for these concerns, follow them; otherwise use the sensible defaults below:
   - Agent behaviour — state your plan before non-trivial changes; confirm before destructive or hard-to-reverse actions
   - Environment — never commit secrets; use `.env.local` plus `.gitignore`, never hardcode credentials
   - `~/.claude/mwp-spec/spec/file-set.md` — the required root file set (normative)
   - `~/.claude/mwp-spec/templates/` — the starting body for every file in that set
   - Documentation — at minimum a README plus a CLAUDE.md/AGENTS.md per this spec's file-set rules; workspace practice only, for when to update each file once it exists

3. **Ask the user** (ask all at once):
   - What does this automation do? (one sentence)
   - What external services does it connect? (list them)
   - What triggers the workflow — a schedule, a webhook, a user action?
   - What is the output or end result?
   - Any additional workspaces needed?

4. **Present the scaffold.** Show the canonical structure above. Ask: "Does this structure fit, or do you need any workspaces adjusted?"

5. **Generate files** using `~/.claude/mwp-spec/templates/`:
   - **CLAUDE.md** — Identity, Self-Reference, Routing Table, Cross-Workspace Flows, Naming Conventions, File Placement, Token Management
   - **AGENTS.md** — Lightweight cross-model adapter pointing to CLAUDE.md
   - **GEMINI.md** — Same content as AGENTS.md, per `~/.claude/mwp-spec/templates/GEMINI.md.template`. Verify with `diff AGENTS.md GEMINI.md` — it must be empty
   - **CONTEXT.md** — what the automation does, workspace map, external services, known quirks
   - **DEVLOG.md** — single entry dated today: "Project scaffolded via /init-mwp-automation"
   - **agent-roles.md** — Agent roles, capabilities, boundaries, inputs/outputs, and handoffs
   - **skills.md** — from `~/.claude/mwp-spec/templates/skills.md.template`, empty of project-specific content until skills are added
   - **README.md** — using `README.md.template`: what the automation does, setup steps, env vars, deployment notes
   - **src/CONTEXT.md** — core orchestration logic, entry points, shared utilities
   - **integrations/CONTEXT.md** — one subfolder per external service, API credentials via env vars, reference file per integration
   - **workflows/CONTEXT.md** — workflow definitions, trigger logic, sequence documentation
   - **memory.md** — current phase: "Initial setup complete"

6. **Report** every file created and its path.

## Stack Defaults
- Language: Node.js / TypeScript
- Design: API-first — no UI unless explicitly required
- Each external service: credentials in environment variables, named by service (e.g. SERVICENAME_API_KEY)
- Document each integration with its own reference file in integrations/

## Rules
- If invoked from an orchestration skill in your own setup with pre-gathered context (name, description, triggers, integrations, workspaces confirmed), skip Step 3 and use that context directly for Steps 4–6.
- MWP structural principles always take priority.
- Root contains only CLAUDE.md, AGENTS.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, and README.md.
- Each external service gets its own subfolder inside integrations/ — no bleed between services.
- Generated CLAUDE.md must include all seven MWP components.
- Generated AGENTS.md must stay a small adapter pointing to CLAUDE.md.
- Generated agent-roles.md must use the role-registry template.
