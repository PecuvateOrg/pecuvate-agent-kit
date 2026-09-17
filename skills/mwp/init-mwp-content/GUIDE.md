# init-mwp-content — Scaffold MWP structure for a content creator project

Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a content production workflow following the MWP framework.

---

## Overview

**What it does:**
Scaffolds the three-workspace structure (script-lab, production, distribution) and generates all MWP files based on the user's answers about content type, audience, platforms, and production process.

**When to use it:**
- Video, written, social media, or podcast production workflows
- Any project where the output is content rather than software
- Workflows that span from idea through to published/distributed content

**When NOT to use it:**
- Projects that produce software — use `/init-mwp-developer` or `/init-mwp-automation`
- CMS projects — use `/init-mwp-cms`

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md`
- The MWP templates at `~/.claude/mwp-spec/templates/`
- `~/.claude/mwp-spec/spec/file-set.md` — the required file set, normative and sole definition. Any documentation-practice conventions doc your workspace has no longer defines it; that is workspace practice only
- The user should be able to describe their voice, audience, and production process

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
├── script-lab/
│   └── CONTEXT.md      ← voice, audience, idea-to-draft process, style notes
├── production/
│   └── CONTEXT.md      ← production process, tools, visual and format standards
└── distribution/
    └── CONTEXT.md      ← platforms, posting cadence, per-channel adaptation, analytics
```

---

## Workspace Purposes

| Workspace | What goes here |
|---|---|
| `script-lab/` | Ideas, outlines, drafts — the creative input stage |
| `production/` | Finished scripts, recordings, edits — the production stage |
| `distribution/` | Published records, platform-specific versions, analytics notes |

---

## File Naming Defaults

| Stage | Format |
|---|---|
| Drafts | `topic-name_draft.md` |
| Final scripts | `topic-name_final.md` |
| Published records | `YYYY-MM-platform-topic.md` |

---

## Critical: Voice and Audience

The `script-lab/CONTEXT.md` must capture the user's voice and audience accurately — without this, all content output will be generic. This is the most important file in a content project. Spend time getting it right during setup.

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| Content output feels generic | `script-lab/CONTEXT.md` voice and audience sections are likely too vague — sharpen them |
| Platform-specific content missing | `distribution/CONTEXT.md` should have a section per platform with its adaptation rules |
| Production process unclear | `production/CONTEXT.md` should map the full workflow from script to finished asset |
| README.md / CONTEXT.md / DEVLOG.md / skills.md missing | These are required root files per `~/.claude/mwp-spec/spec/file-set.md` — generate them at scaffold time |
