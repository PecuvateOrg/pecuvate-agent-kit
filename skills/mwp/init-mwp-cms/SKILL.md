---
name: init-mwp-cms
description: Scaffold an MWP project structure for a CMS or content backend project. Invoked by init-mwp when the project type is matched, or directly via /init-mwp-cms. Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a Sanity CMS project.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Scaffold an MWP project structure for a CMS or content backend project.

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
├── schema/
│   └── CONTEXT.md
├── studio/
│   └── CONTEXT.md
└── queries/
    └── CONTEXT.md
```

Root contains MWP files only. Content models in schema/, Sanity studio config in studio/, GROQ queries in queries/.

## Steps

1. **Load the MWP spec.** Read `~/.claude/mwp-spec/spec/CONTEXT.md`. This governs all structural decisions.

2. **Load references.** If your workspace already has its own conventions docs for these concerns, follow them; otherwise use the sensible defaults below:
   - CMS — only applies if a CMS is actually in use for this project; skip otherwise. Sanity is the default CMS assumed below
   - Stack (if paired with a frontend) — match the existing stack already in the repo, or ask the user which to use for a new project
   - `~/.claude/mwp-spec/spec/file-set.md` — the required root file set (normative)
   - `~/.claude/mwp-spec/templates/` — the starting body for every file in that set
   - Documentation — at minimum a README plus a CLAUDE.md/AGENTS.md per this spec's file-set rules; workspace practice only, for when to update each file once it exists

3. **Ask the user** (ask all at once):
   - What content types does this CMS manage? (list them)
   - Is this paired with a frontend project? If so, which one?
   - Are there any editorial workflows or role-based access requirements?
   - Any additional workspaces needed?

4. **Present the scaffold.** Show the canonical structure above. Ask: "Does this structure fit, or do you need any workspaces adjusted?"

5. **Generate files** using `~/.claude/mwp-spec/templates/`:
   - **CLAUDE.md** — Identity, Self-Reference, Routing Table, Cross-Workspace Flows, Naming Conventions, File Placement, Token Management
   - **AGENTS.md** — Lightweight cross-model adapter pointing to CLAUDE.md
   - **GEMINI.md** — Same content as AGENTS.md, per `~/.claude/mwp-spec/templates/GEMINI.md.template`. Verify with `diff AGENTS.md GEMINI.md` — it must be empty
   - **CONTEXT.md** — what the CMS manages, workspace map, paired frontend (if any), known quirks
   - **DEVLOG.md** — single entry dated today: "Project scaffolded via /init-mwp-cms"
   - **agent-roles.md** — Agent roles, capabilities, boundaries, inputs/outputs, and handoffs
   - **skills.md** — from `~/.claude/mwp-spec/templates/skills.md.template`, empty of project-specific content until skills are added
   - **README.md** — using `README.md.template`: what the CMS manages, setup steps, env vars, deployment notes
   - **schema/CONTEXT.md** — content model definitions, field naming conventions, schema type relationships
   - **studio/CONTEXT.md** — Sanity studio configuration, desk structure, custom input components
   - **queries/CONTEXT.md** — GROQ queries, expected return shapes, query naming conventions
   - **memory.md** — current phase: "Initial setup complete"

6. **Report** every file created and its path.

## Stack Defaults
- CMS: Sanity
- Schema files: TypeScript
- Schema type names: PascalCase
- Field names: camelCase
- GROQ queries: documented with expected return shape

## Rules
- If invoked from an orchestration skill in your own setup with pre-gathered context (content types, frontend pairing, access requirements, workspaces confirmed), skip Step 3 and use that context directly for Steps 4–5.
- MWP structural principles always take priority.
- Root contains only CLAUDE.md, AGENTS.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, and README.md.
- Generated CLAUDE.md must include all seven MWP components.
- Generated AGENTS.md must stay a small adapter pointing to CLAUDE.md.
- Generated agent-roles.md must use the role-registry template.
- If paired with a frontend, note the relationship in Cross-Workspace Flows in CLAUDE.md.
