---
name: init-mwp-developer
description: Scaffold an MWP project structure for a web application or developer project. Invoked by init-mwp when the project type is matched, or directly via /init-mwp-developer. Sets up the full 9-file MWP root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, agent-roles.md, skills.md, memory.md, README.md) plus workspace CONTEXT.md files for a Next.js/TypeScript project.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Scaffold an MWP project structure for a web application or developer project.

## Canonical Scaffold

```
root/
|- CLAUDE.md              <- Layer 0 — routing only, no explanatory content
|- AGENTS.md              <- cross-model adapter; points to CLAUDE.md
|- CONTEXT.md             <- Layer 1 — project overview, workspace map, external services
|- memory.md
|- DEVLOG.md
|- agent-roles.md
|- skills.md
|- README.md
|- netlify.toml           <- Netlify build config (base = "src", plugin) — at root, never inside src/
|- planning/
|   |- CONTEXT.md          <- directory orientation; lists subdirectories
|   |- spec/
|   |   `- CONTEXT.md      <- product spec, MVP scope, acceptance criteria
|   |- architecture/
|   |   `- CONTEXT.md      <- system design, request lifecycle, tech decisions
|   `- decisions/
|       `- CONTEXT.md      <- ADR log
|- ops/
|   `- CONTEXT.md
`- src/                    <- Next.js project root
    |- CONTEXT.md
    |- package.json
    |- next.config.ts
    |- tsconfig.json
    |- .env.example
    |- public/
    |- app/
    |- components/
    `- lib/
```

Root contains MWP files only. src/ is the fully self-contained Next.js project. Each workspace uses subdirectories for its major concerns -- each subdirectory has its own CONTEXT.md. npm commands (install, dev, build) are always run from src/, not the root.

## Steps

1. **Load the MWP spec.** Read both:
   - `~/.claude/mwp-spec/spec/CONTEXT.md` — core MWP principles
   - `~/.claude/mwp-spec/spec/workspaces.md` — workspace patterns; refer to Example 3 (Developer) for the correct subdirectory structure within planning/

2. **Load references.** If your workspace already has its own conventions docs for these concerns, follow them; otherwise use the sensible defaults below:
   - Stack — match the existing stack already in the repo, or ask the user which to use for a new project
   - TypeScript — strict mode, no implicit any, prefer explicit types at module boundaries
   - Styling — match the existing CSS/Tailwind/styling conventions already in the repo
   - Deployment — ask the user how and where this project will deploy before assuming a platform
   - Environment — never commit secrets; use `.env.local` plus `.gitignore`, never hardcode credentials
   - `~/.claude/mwp-spec/spec/file-set.md` — the required root file set (normative)
   - `~/.claude/mwp-spec/templates/` — the starting body for every file in that set
   - Documentation — at minimum a README plus a CLAUDE.md/AGENTS.md per this spec's file-set rules; workspace practice only, for when to update each file once it exists

3. **Ask the user** (ask all at once):
   - What does this project do? (one sentence)
   - Who is it for?
   - Does it need a CMS or any external APIs?
   - Any additional workspaces beyond planning, src, and ops?
   - What custom domain will this be deployed to? (e.g. `app.example.com` -- leave blank if not yet known)

4. **Present the scaffold.** Show the canonical structure above with the project name filled in. Ask: "Does this structure fit, or do you need any workspaces added or renamed?"

5. **Generate files** using `~/.claude/mwp-spec/templates/`:
   - **CLAUDE.md** -- Routing table, identity, token management, deployment, skills. Layer 0 only — no explanatory prose about what the project does.
     - Deployment section must include: `Platform: Netlify`, `Domain:`, `Branch: main`, `Base directory: src/`
     - If the user provided a domain, populate `Domain:` with that value
     - If the user left domain blank, leave the placeholder comment as-is -- the user must fill it in before running `/netlify-deploy`
   - **AGENTS.md** -- Lightweight cross-model adapter from `~/.claude/mwp-spec/templates/AGENTS.md.template`; do not duplicate the CLAUDE.md routing table
   - **GEMINI.md** -- Same content as AGENTS.md, per `~/.claude/mwp-spec/templates/GEMINI.md.template`. Verify with `diff AGENTS.md GEMINI.md` -- it must be empty
   - **CONTEXT.md** -- What the project does (one paragraph), workspace map (table: workspace → purpose), external services, known quirks
   - **memory.md** -- Phase: "Initial setup complete"
   - **DEVLOG.md** -- Single entry dated today: "Project scaffolded via /init-mwp-developer"
   - **agent-roles.md** -- from `~/.claude/mwp-spec/templates/agent-roles.md.template`; if you maintain a cross-project shared-roles registry, keep its Shared Roles section pointing at that; otherwise remove the section
   - **skills.md** -- Standard template pre-populated with the developer skill list
   - **README.md** -- using `README.md.template`: what the project does, setup steps (from src/), env vars, deployment notes
   - **planning/CONTEXT.md** -- directory orientation listing subdirectories and what each contains
   - **planning/spec/CONTEXT.md** -- product spec, MVP scope, acceptance criteria
   - **planning/architecture/CONTEXT.md** -- system design, request lifecycle, tech decisions
   - **planning/decisions/CONTEXT.md** -- ADR log (empty at scaffold time)
   - **src/CONTEXT.md** -- Next.js App Router, TypeScript, Tailwind, component and page conventions. Note that this is the project root for npm commands.
   - **netlify.toml** (at repo root, not inside src/) — `base = "src"`, `command = "pnpm run build"`, `publish = ".next"` (Netlify CI resolves publish relative to base), NODE_VERSION = "22", `[[plugins]] package = "@netlify/plugin-nextjs"`, and the mandatory `[[headers]]` security-header baseline. See GUIDE.md for the canonical template.
   - **src/package.json** -- Next.js + TypeScript + Tailwind + `@netlify/plugin-nextjs` as devDependency
   - **src/next.config.ts** -- minimal Next.js config
   - **src/tsconfig.json** -- TypeScript config; `@/*` path alias must be `"./*"` (not `"./src/*"`)
   - **src/.env.example** -- all expected variable names with blank values
   - **src/app/page.tsx** -- replace the default Next.js scaffold page with a redirect or real root page; never leave the "To get started, edit page.tsx" template
   - **ops/CONTEXT.md** -- Netlify deployment (base directory: src/), environment variables, build config

6. **Report** every file created and its path.

## Stack Defaults
- Framework: Next.js (App Router) -- static and dynamic
- Language: TypeScript
- Styling: Tailwind CSS
- Deployment: Netlify (base directory: src/)
- Do not suggest alternatives unless explicitly asked

## Rules
- If invoked from an orchestration skill in your own setup with pre-gathered context (name, description, audience, domain, integrations, workspaces confirmed), skip Step 3 and use that context directly for Steps 4–6.
- MWP structural principles always take priority.
- CLAUDE.md is Layer 0 — routing and identity only. No explanatory prose about what the project does. That belongs in CONTEXT.md.
- Root contains CLAUDE.md, AGENTS.md, CONTEXT.md, memory.md, DEVLOG.md, agent-roles.md, skills.md, README.md, planning/, ops/, and src/ -- no application code and no config files at root level.
- src/ is the Next.js project root -- package.json, next.config.ts, tsconfig.json, .env.example, public/, and app/ all live inside src/.
- All npm/node commands are run from inside src/, not the root.
- Netlify base directory must be set to src/ in both the generated CLAUDE.md Deployment section and ops/CONTEXT.md.
- Netlify's file system scope starts at src/ -- any file a deployed function, edge function, or build step needs to read must live inside src/. This includes integration assets such as document signing templates, email templates, and static data files. Files outside src/ are invisible to Netlify at runtime.
- Generated CLAUDE.md must include all seven MWP components.
- Generated AGENTS.md must stay a small adapter pointing to CLAUDE.md. agent-roles.md remains the role registry.
- Do not invent workspaces beyond what the user confirms.
- Each workspace uses subdirectories for its major concerns -- never create flat .md files directly inside a workspace directory where a subdirectory/CONTEXT.md is the correct pattern.
