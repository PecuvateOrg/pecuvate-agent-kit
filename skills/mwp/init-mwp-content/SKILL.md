---
name: init-mwp-content
description: Scaffold an MWP project structure for a content creator project. Invoked by init-mwp when the project type is matched, or directly via /init-mwp-content. Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a content production workflow.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Scaffold an MWP project structure for a content creator project.

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
├── script-lab/
│   └── CONTEXT.md
├── production/
│   └── CONTEXT.md
└── distribution/
    └── CONTEXT.md
```

Root contains MWP files only. Ideas and drafts in script-lab/, content production in production/, publishing and analytics in distribution/.

## Steps

1. **Load the MWP spec.** Read `~/.claude/mwp-spec/spec/CONTEXT.md`. This governs all structural decisions.

2. **Load references.**
   - `~/.claude/mwp-spec/spec/file-set.md` — the required root file set (normative)
   - `~/.claude/mwp-spec/templates/` — the starting body for every file in that set
   - If your workspace has its own documentation-practice conventions doc, use it for when to update each file once it exists — workspace practice only

3. **Ask the user** (ask all at once):
   - What type of content does this project produce? (video, written, social, podcast, etc.)
   - Who is the audience?
   - What platforms does content go out on?
   - What does the production process look like — from idea to published?
   - Any additional workspaces needed?

4. **Present the scaffold.** Show the canonical structure above. Ask: "Does this structure fit, or do you need any workspaces adjusted?"

5. **Generate files** using `~/.claude/mwp-spec/templates/`:
   - **CLAUDE.md** — Identity, Self-Reference, Routing Table, Cross-Workspace Flows, Naming Conventions, File Placement, Token Management
   - **AGENTS.md** — Lightweight cross-model adapter pointing to CLAUDE.md
   - **GEMINI.md** — Same content as AGENTS.md, per `~/.claude/mwp-spec/templates/GEMINI.md.template`. Verify with `diff AGENTS.md GEMINI.md` — it must be empty
   - **CONTEXT.md** — what the content project produces, workspace map, audience, known quirks
   - **DEVLOG.md** — single entry dated today: "Project scaffolded via /init-mwp-content"
   - **agent-roles.md** — Agent roles, capabilities, boundaries, inputs/outputs, and handoffs
   - **skills.md** — from `~/.claude/mwp-spec/templates/skills.md.template`, empty of project-specific content until skills are added
   - **README.md** — using `README.md.template`: what the project produces, setup steps, env vars, deployment notes
   - **script-lab/CONTEXT.md** — voice, audience, content type, process from idea to finished draft, style notes
   - **production/CONTEXT.md** — production process, tools, visual and format standards
   - **distribution/CONTEXT.md** — platforms, posting cadence, per-channel adaptation rules, analytics tracking
   - **memory.md** — current phase: "Initial setup complete"

6. **Report** every file created and its path.

## Naming

Defined in `~/.claude/mwp-spec/spec/naming.md` and the Content Creator example
in `~/.claude/mwp-spec/spec/workspaces.md`. Do not restate them here — this file held its own copy, and
the same duplication put the workspace-shapes document in three divergent places.

## Rules
- If invoked from an orchestration skill in your own setup with pre-gathered context (content type, audience, platforms, production process, workspaces confirmed), skip Step 3 and use that context directly for Steps 4–6.
- MWP structural principles always take priority.
- Root contains only CLAUDE.md, AGENTS.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, and README.md.
- Generated CLAUDE.md must include all seven MWP components.
- Generated AGENTS.md must stay a small adapter pointing to CLAUDE.md.
- Generated agent-roles.md must use the role-registry template.
- script-lab/CONTEXT.md must describe the user's voice and audience — without this, content output will be generic.
