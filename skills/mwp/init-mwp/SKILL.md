---
name: init-mwp
description: Route to the correct MWP initialisation skill based on project type. Use this skill whenever a user wants to set up a new project with MWP structure, scaffold MWP files, or says /init-mwp. Reads the project, asks what it's for, matches to a type, and hands off to the appropriate type-specific init skill. Trigger even if the user just says "initialise this project" or "set up MWP here".
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Route to the correct MWP initialisation skill based on project type.

**Called with context already gathered** (e.g. by an orchestrator skill in your own setup that gathers project details upfront before calling this one)? Skip Steps 1–2 entirely — do not re-read the project or re-ask what it's for. Use the details you were given, match the type (Step 3), confirm briefly, and hand off (Step 5), **forwarding all provided context to the child skill** so it also skips its own question step. This skill is the single owner of the type→skill routing; callers route through it rather than replicating the table.

## Steps

1. **Read the existing project.** Scan what already exists: folder structure, any existing CLAUDE.md, README, or context files.

2. **Ask the user one question:** What is this project for? (plain English description — no need to name a type)

3. **Load the routing table.** Read `~/.claude/mwp-spec/spec/project-types.md` and match the user's description against the project types.

4. **Confirm the match.** Tell the user which type was matched and which skill will run. Example: "This looks like a developer project — I'll use init-mwp-developer. Does that sound right?"

5. **Hand off to the matched skill.** Invoke the appropriate skill:
   - Web app / developer → /init-mwp-developer
   - Automation / workflow → /init-mwp-automation
   - CMS / content backend → /init-mwp-cms
   - Content creator → /init-mwp-content
   - Skill / tool → /init-mwp-tool

## Rules
- Do not generate any files in this skill — that is the type skill's job.
- If MWP files already exist in the project, warn the user before proceeding — do not overwrite without confirmation.
- If the description is ambiguous, offer the two closest matches and ask the user to choose.
- If no type matches, proceed with /init-mwp-developer as the default and note the assumption.
