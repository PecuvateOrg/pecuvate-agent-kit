# init-mwp-tool — Scaffold MWP structure for a skill or developer tool project

Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a Claude Code skill or developer tool project following the MWP framework.

---

## Overview

**What it does:**
Scaffolds the three-workspace structure (spec, skills, templates) and generates all MWP files based on the user's answers about what the tool does, what slash commands it exposes, and what reference documents it works against.

**When to use it:**
- Building a new Claude Code skill
- Building a developer tool or framework
- Any project whose primary output is reusable instructions or scaffolds rather than a user-facing application

**When NOT to use it:**
- Web applications — use `/init-mwp-developer`
- Automation scripts — use `/init-mwp-automation`

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md`
- The MWP templates at `~/.claude/mwp-spec/templates/`
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
├── skills.md              ← root file: this project's own slash-command catalog
├── memory.md
├── README.md
├── spec/
│   └── (reference documents)   ← rules the skill works against — loaded on demand only
├── skills/
│   └── CONTEXT.md              ← what each skill file does, deploy process, conventions
└── templates/
    └── CONTEXT.md              ← what each template is for, how skills use them
```

`spec/` files are reference only — never loaded at session start, only when a specific skill needs them.

Note: root `skills.md` (this project's catalog of its own slash commands, per MWP convention) is distinct from the `skills/` workspace folder (the skill instruction files this tool project produces). Don't conflate the two when generating files.

---

## Workspace Purposes

| Workspace | What goes here |
|---|---|
| `spec/` | Reference documents that define the rules or framework the tool works against |
| `skills/` | Skill instruction files (SKILL.md + GUIDE.md per skill) and their scripts |
| `templates/` | Scaffold content — file templates the skills generate from |

---

## Naming Defaults

| Type | Format |
|---|---|
| Skill files | kebab-case (e.g. `my-skill.md`) |
| Template files | `filename.template` (e.g. `CLAUDE.md.template`) |
| Deploy target | `~/.claude/skills/[skill-name]/` (or your workspace's own skill source directory, if it deploys skills from a central location first) |

---

## CLAUDE.md for Tool Projects

Include the deploy path in the Naming Conventions section so it is always clear where skill files should be registered. Each skill should be focused on one command — no combined logic in a single skill file.

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| Skill not appearing in Claude Code | Check it was deployed to `~/.claude/skills/` (or `%USERPROFILE%\.claude\skills\` on Windows). If your workspace syncs skills from a central source directory, re-run that sync process |
| Template generating wrong output | Check the template file and compare against `templates/CONTEXT.md` |
| Spec being loaded unnecessarily | `spec/` files should only be loaded when a skill explicitly needs them — add Token Management rules |
| README.md / root CONTEXT.md / DEVLOG.md / root skills.md missing | These are required root files per `~/.claude/mwp-spec/spec/file-set.md` — generate them at scaffold time |
