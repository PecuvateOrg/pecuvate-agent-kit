# init-mwp-automation — Scaffold MWP structure for an automation or workflow project

Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a Node.js automation, integration, or workflow project following the MWP framework.

---

## Overview

**What it does:**
Scaffolds the three-workspace structure (src, integrations, workflows) and generates all MWP files based on the user's answers about what the automation does, what it connects to, and what triggers it.

**When to use it:**
- Scheduled tasks or cron jobs
- Webhook-triggered workflows
- Multi-service integrations (e.g. accounting software → Notion, scheduling tool → database)
- API orchestration scripts with no user-facing UI

**When NOT to use it:**
- Projects with a web UI — use `/init-mwp-developer`
- CMS-only projects — use `/init-mwp-cms`

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md`
- The MWP templates at `~/.claude/mwp-spec/templates/`
- `~/.claude/mwp-spec/spec/file-set.md` — the required file set, normative and sole definition. Any conventions doc your workspace has for documentation practice no longer defines it; that is workspace practice only

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
├── src/
│   └── CONTEXT.md      ← core orchestration logic, entry points, utilities
├── integrations/
│   └── CONTEXT.md      ← one subfolder per external service
└── workflows/
    └── CONTEXT.md      ← workflow definitions, trigger logic, sequence docs
```

Each external service gets its own subfolder inside `integrations/` — no shared service files.

---

## Workspace Purposes

| Workspace | What goes here |
|---|---|
| `src/` | Core logic — orchestration, shared utilities, data transformation |
| `integrations/` | One subfolder per external service; credentials via env vars; reference file per integration |
| `workflows/` | Workflow definitions and trigger logic; one file per workflow |

---

## Stack Defaults

- Language: Node.js / TypeScript
- Design: API-first — no UI unless explicitly required
- Credentials: environment variables, named by service (`SERVICENAME_API_KEY`)
- Each integration: documented with its own reference file in `integrations/`

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| Services bleeding into each other | Each external service must have its own subfolder in `integrations/` — no shared files |
| Credentials hardcoded | All credentials belong in env vars — flag and move them immediately |
| Workflow order unclear | Each workflow file in `workflows/` should document its trigger and full sequence |
| README.md / CONTEXT.md / DEVLOG.md / skills.md missing | These are required root files per `~/.claude/mwp-spec/spec/file-set.md` — generate them at scaffold time |
