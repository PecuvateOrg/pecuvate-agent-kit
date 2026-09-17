# init-mwp — Route a new project to the correct MWP initialisation skill

Reads the project, asks the user what it's for, matches to a project type, and hands off to the appropriate type-specific init skill.

---

## Overview

**What it does:**
Acts as the entry point for all MWP project setup. Rather than setting up files directly, it determines which type-specific skill should run and hands off to it. This keeps the routing logic in one place and the type-specific logic in each sub-skill.

**When to use it:**
Whenever a new project needs MWP structure set up from scratch. Use `/init-mwp` rather than going directly to a type skill unless you already know the type.

**When NOT to use it:**
- If the project type is already known — call the type skill directly (e.g. `/init-mwp-developer`)
- If MWP files already exist — use `/audit-mwp` to check them or `/update-mwp` to update them

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md` must be readable
- The project directory must exist
- The user should be able to describe what the project does in plain English

---

## Project Types

| Type | Skill | When to use |
|---|---|---|
| Web app / developer | `/init-mwp-developer` | Next.js, TypeScript, deployed to Netlify |
| Automation / workflow | `/init-mwp-automation` | Node.js integrations, scheduled tasks, API orchestration |
| CMS / content backend | `/init-mwp-cms` | Sanity, content models, GROQ queries |
| Content creator | `/init-mwp-content` | Video, written, social — production to distribution |
| Skill / tool | `/init-mwp-tool` | Claude Code skills, developer tools, frameworks |

If the description is ambiguous, offer the two closest matches and ask the user to choose. Default to `/init-mwp-developer` if nothing matches and note the assumption.

---

## Process

### 1. Scan the project
Read what already exists — folder structure, any CLAUDE.md, README, or context files. Do not overwrite existing MWP files without warning.

### 2. Ask one question
What is this project for? (Plain English — no need to name a type.)

### 3. Match and confirm
Read the project types from the spec, match the description, and tell the user which skill will run. Wait for confirmation.

### 4. Hand off
Invoke the matched skill. Do not generate any files in this skill — that is the type skill's job.

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| Wrong type matched | The description was too vague — prompt the user for more detail |
| Type skill fails to find the spec | Check `~/.claude/mwp-spec/spec/CONTEXT.md` exists |
| Existing files overwritten | init-mwp should detect existing files and warn — do not proceed without confirmation |
