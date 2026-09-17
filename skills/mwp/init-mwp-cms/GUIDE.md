# init-mwp-cms — Scaffold MWP structure for a CMS or content backend project

Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a Sanity CMS project following the MWP framework.

---

## Overview

**What it does:**
Scaffolds the three-workspace structure (schema, studio, queries) and generates all MWP files based on the user's answers about content types, frontend pairing, and editorial workflow requirements.

**When to use it:**
- New Sanity CMS project
- Content backend that will be queried by a frontend project
- Any project where the primary concern is content modelling and GROQ queries

**When NOT to use it:**
- Projects with a web UI as the primary output — use `/init-mwp-developer`
- Automation projects — use `/init-mwp-automation`

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md`
- The MWP templates at `~/.claude/mwp-spec/templates/`
- If your workspace has its own CMS conventions doc, use it — otherwise the Stack Defaults below apply
- `~/.claude/mwp-spec/spec/file-set.md` — the required file set, normative and sole definition. Any documentation-practice conventions doc your workspace has no longer defines it; that is workspace practice only

---

## Canonical Project Structure

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
│   └── CONTEXT.md      ← content model definitions, field naming, type relationships
├── studio/
│   └── CONTEXT.md      ← Sanity studio config, desk structure, custom inputs
└── queries/
    └── CONTEXT.md      ← GROQ queries, return shapes, naming conventions
```

---

## Workspace Purposes

| Workspace | What goes here |
|---|---|
| `schema/` | TypeScript schema files — one per content type; naming and field conventions |
| `studio/` | Sanity Studio configuration — desk structure, custom input components |
| `queries/` | GROQ queries — each documented with expected return shape |

---

## Stack Defaults

- CMS: Sanity
- Schema files: TypeScript
- Schema type names: PascalCase
- Field names: camelCase
- GROQ queries: always documented with their expected return shape

---

## Pairing with a Frontend

If the CMS is paired with a frontend project, note the relationship in the `## Cross-Workspace Flows` section of CLAUDE.md. The frontend project's ops/CONTEXT.md should reference the Sanity project ID and dataset name.

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| GROQ queries returning unexpected shapes | Check `queries/CONTEXT.md` — each query should document its expected return |
| Schema type naming inconsistent | PascalCase for types, camelCase for fields — enforced in `schema/CONTEXT.md` |
| Frontend can't find content | Confirm project ID and dataset name are correct in the frontend env vars |
| README.md / CONTEXT.md / DEVLOG.md / skills.md missing | These are required root files per `~/.claude/mwp-spec/spec/file-set.md` — generate them at scaffold time |
