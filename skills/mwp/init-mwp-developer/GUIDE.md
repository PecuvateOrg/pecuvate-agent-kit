# init-mwp-developer -- Scaffold MWP structure for a web application project

Sets up CLAUDE.md, AGENTS.md, agent-roles.md, memory.md, and workspace CONTEXT.md files for a Next.js/TypeScript project following the MWP framework.

---

## Overview

**What it does:**
Scaffolds the three-workspace structure (planning, src, ops) and generates all MWP files using the project's answers to four setup questions. Output is a complete, ready-to-use project structure.

**When to use it:**
- New Next.js or TypeScript web application
- Any project that will be deployed to Netlify with a custom domain
- When invoked by `/init-mwp` after matching the developer project type

**When NOT to use it:**
- Pure API or automation projects -- use `/init-mwp-automation`
- CMS-only projects -- use `/init-mwp-cms`
- Existing projects that already have MWP files -- use `/audit-mwp` or `/update-mwp`

---

## Prerequisites

- The MWP spec at `~/.claude/mwp-spec/spec/CONTEXT.md`
- The MWP workspaces framework at `~/.claude/mwp-spec/spec/workspaces.md` — read Example 3 (Developer) for the correct subdirectory structure within planning/
- The MWP templates at `~/.claude/mwp-spec/templates/`
- If your workspace has its own stack, TypeScript, styling, deployment, and environment conventions docs, use them; otherwise use the sensible defaults listed in SKILL.md Step 2

---

## Canonical Project Structure

```
root/
|- CLAUDE.md              <- MWP Layer 0 — routing, identity, rules (no explanatory content)
|- AGENTS.md              <- cross-model adapter; points to CLAUDE.md
|- CONTEXT.md             <- MWP Layer 1 — project overview, workspace map, external services
|- memory.md              <- current project state
|- DEVLOG.md              <- session log, decisions, incomplete work
|- agent-roles.md         <- agent roles, capabilities, boundaries
|- skills.md              <- available skills and slash commands
|- netlify.toml           <- Netlify build config (base = "src", plugin, build command)
|- planning/
|   |- CONTEXT.md         <- directory orientation; lists subdirectories and their purpose
|   |- spec/
|   |   `- CONTEXT.md     <- product spec, MVP scope, acceptance criteria
|   |- architecture/
|   |   `- CONTEXT.md     <- system design, request lifecycle, tech decisions
|   `- decisions/
|       `- CONTEXT.md     <- ADR log
|- ops/
|   `- CONTEXT.md         <- Netlify deployment, env vars, build config
`- src/                   <- Next.js project root
    |- CONTEXT.md         <- Next.js conventions, component rules, file placement
    |- package.json
    |- next.config.ts
    |- tsconfig.json
    |- .env.example
    |- public/
    |- app/
    |- components/
    `- lib/
```

Root contains only MWP files plus `netlify.toml`. src/ is the fully self-contained Next.js project -- package.json and all config files live here alongside application code. npm commands (install, dev, build) are always run from src/.

**CLAUDE.md is routing-only (Layer 0).** It must not contain explanatory content about the project. Explanation of what the project does, how workspaces are organised, and what external services it connects to belongs in CONTEXT.md (Layer 1).

Each workspace contains subdirectories for its major concerns. Each subdirectory has its own CONTEXT.md. The planning/ subdirectories shown above are the default for developer projects -- add more (e.g. `data-model/`, `integrations/`) only if the user confirms the project needs them.

---

## Workspace Purposes

| Workspace | What goes here |
|---|---|
| `planning/` | Workspace index + subdirectories: spec/, architecture/, decisions/ (and any project-specific additions) |
| `src/` | Next.js project root -- package.json, next.config.ts, tsconfig.json, .env.example, public/, app/, components/, lib/ |
| `ops/` | Deployment config, environment variable documentation, Netlify setup |

**Key rule:** Nothing that belongs to the Next.js project (config files, node_modules, .env.example) lives at the root. The root is MWP-only.

**Key rule:** Never create flat `.md` files directly inside a workspace directory where a subdirectory/CONTEXT.md is the correct pattern. `planning/SPEC.md` is wrong. `planning/spec/CONTEXT.md` is correct.

---

## Netlify File Visibility Rule

Because `Base directory: src/`, Netlify's file system scope starts at `src/`. Any file that Netlify needs to access during build or at runtime must live inside `src/` -- files outside it are invisible to Netlify.

This applies to more than just application code. Integration asset directories (signing templates, email templates, data files, etc.) are **not scaffolded upfront** -- they are created on demand by the relevant integration skill when that integration is confirmed.

The rule at scaffold time is simply: **if an integration needs files, those files must end up inside `src/`**. The exact directory name is agreed when the integration is wired up, not before.

Each integration skill is responsible for:
1. Confirming the intended directory name with the user
2. Creating the directory inside `src/`
3. Documenting the location in `src/CONTEXT.md`

Do not create asset directories during `init-mwp-developer` scaffolding -- only create them when the integration skill that needs them runs.

---

## Stack Defaults

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Deployment: Netlify (base directory: src/)
- Do not deviate from these defaults unless the user explicitly requests it

---

## Generated Files

| File | Key content |
|---|---|
| `CLAUDE.md` | Routing table, identity, token management, deployment, skills — no explanatory prose |
| `AGENTS.md` | Lightweight cross-model adapter pointing to CLAUDE.md; no duplicated routing table |
| `CONTEXT.md` | What the project does, workspace map, external services, known quirks |
| `memory.md` | Phase: "Initial setup complete" |
| `DEVLOG.md` | Initial entry dated today: "Project scaffolded via /init-mwp-developer" |
| `agent-roles.md` | From `~/.claude/mwp-spec/templates/agent-roles.md.template` |
| `skills.md` | Standard template body, pre-populated with developer skill list |
| `planning/CONTEXT.md` | Workspace index — lists subdirectories and what each contains |
| `planning/spec/CONTEXT.md` | Product spec, MVP scope, acceptance criteria |
| `planning/architecture/CONTEXT.md` | System design, request lifecycle, tech decisions |
| `planning/decisions/CONTEXT.md` | ADR log (empty at scaffold time) |
| `src/CONTEXT.md` | App Router structure, component conventions, import aliases; notes that npm commands run from this directory |
| `netlify.toml` | Repo-root Netlify config — **must be at root, never inside src/**. Contains `base = "src"`, build command, publish dir, `@netlify/plugin-nextjs`. Without this file at root, Netlify won't find any build config and deploys raw source files. |
| `src/package.json` | Next.js + TypeScript + Tailwind + `@netlify/plugin-nextjs` devDependency |
| `src/next.config.ts` | Minimal Next.js config |
| `src/tsconfig.json` | TypeScript config — `@/*` alias must be `"./*"` (not `"./src/*"`). The project root IS src/, so aliases resolve from there. |
| `src/.env.example` | All expected variable names with blank values |
| `src/app/page.tsx` | **Must not be the default Next.js template.** Replace with a redirect to `/dashboard` or the actual root page. The default scaffold page causes the Next.js welcome screen to show at `/`. |
| `ops/CONTEXT.md` | Netlify build settings (base dir: src/), env var list, deploy process |

---

## Generated netlify.toml

Always create this at the **repo root** (not inside src/). This is the file Netlify reads first — if it doesn't exist at root, Netlify finds no build config and deploys raw source files.

```toml
[build]
  base = "src"
  command = "pnpm run build"
  publish = ".next"   # Netlify CI resolves publish relative to BASE (local CLI --build differs; deploy via GitHub)

[build.environment]
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
```

`@netlify/plugin-nextjs` must also be in `src/package.json` devDependencies so it's available during the CI install step.

**Any project using `@netlify/plugin-nextjs` also needs `src/pnpm-workspace.yaml`:**

```yaml
nodeLinker: hoisted
```

Without it the CI build **fails**, not degrades: the plugin's `recreateNodeModuleSymlinks` step races on concurrent symlink creation across pnpm's default isolated store layout and dies with `EEXIST: symlink`. It must live in `pnpm-workspace.yaml` — **pnpm 11 does not read `node-linker` from `.npmrc`**; it silently no-ops there. Confirm it applied by checking `node_modules/.modules.yaml` for `"nodeLinker": "hoisted"`, never by assuming the config file was read.

Hoisting costs only pnpm's phantom-dependency strictness. It still hard-links into the shared store, so cross-project dedup and install speed survive. A plain `next build` with no plugin does **not** need this.

**The `[[headers]]` block is mandatory** — every project ships with the security-header baseline so no site is ever born header-less. The three base headers should block a deploy if missing, if your workspace has a pre-deploy security check. Two adjustments are made per project after scaffold, not at init time:
- **`payment`** — if the project runs Stripe (or Apple/Google Pay) client-side, remove `payment=()` from the Permissions-Policy list, or it will break checkout.
- **`Content-Security-Policy`** — add once the project's external origins are known (analytics, fonts, Stripe), tested against the running site.

If your workspace has its own deployment conventions doc, follow it for the payment-exception rule and CSP building blocks; otherwise ask the user how and where this project deploys before assuming a platform or a CSP policy.

---

## Generated CLAUDE.md — Deployment Section

Always generate the Deployment section with all four fields:

```markdown
## Deployment
- Platform: Netlify
- Domain: <!-- e.g. app.example.com -->
- Branch: main
- Base directory: src/
```

The `Base directory: src/` line is mandatory and must always be present. Netlify needs this to locate the Next.js project root.

---

## Skills for Developer Projects

The following skills are commonly useful in a developer project environment. Wire in whichever ones exist in your own Claude Code setup — the two shipped with this kit (`/audit-mwp`, `/update-mwp`) are always available; the rest are examples of the kind of skill worth adding if your environment has an equivalent, and can be safely omitted from the generated CLAUDE.md if it does not.

**If your environment has an equivalent skill for deployment, UI testing, or brand setup, wire it in; otherwise do the manual equivalent** (deploy by hand, test in a running dev server, add favicons/manifest by hand) **and note that in CONTEXT.md so a future session knows the gap is deliberate.**

| Skill | What it does | Routing row |
|---|---|---|
| a Netlify-deploy skill | Deploy to Netlify and configure a custom domain | ops/ -- Deployment |
| a Netlify+Supabase integration-check skill | Audit Netlify + Supabase integration before going live | ops/ -- Deployment |
| a Playwright-driven UI testing skill | Test UI in a browser | src/ -- UI / component work |
| a brand-assets setup skill | Set up favicons, manifest, and brand assets | ops/ -- Brand setup |
| `/audit-mwp` | Check MWP structure compliance | -- (meta, no workspace row needed) |
| `/update-mwp` | Update MWP files when the project evolves | -- (meta, no workspace row needed) |

**Optional skills -- include in Skills & Tools only if your setup has them, and only add a routing row if the user confirms the project uses that feature:**

| Skill | What it does | When to add a routing row |
|---|---|---|
| an email-sending skill | Wire up transactional email | User mentions email sending, contact forms, notifications |
| an e-signature integration skill | Route to the correct e-signature integration | User mentions document signing, contracts, waivers |

---

## Generated CLAUDE.md -- Routing Table

Produce a routing table with at minimum these rows, using the actual skill names available in your setup (or omitting the Skills column entry where none exists). Add the optional rows only if confirmed by the user during setup questions.

```markdown
| Task | Go to | Read | Skills |
|---|---|---|---|
| Feature spec / architecture | planning/ | CONTEXT.md | -- |
| UI / component work | src/ | CONTEXT.md | (UI testing skill, if you have one) |
| Deployment / going live | ops/ | CONTEXT.md | (deploy + integration-check skills, if you have them) |
| Brand / favicon setup | ops/ | CONTEXT.md | (brand setup skill, if you have one) |
| Email integration | src/ | CONTEXT.md | (email skill) |          <- only if confirmed
| E-signature integration | src/ | CONTEXT.md | (e-signature skill) |         <- only if confirmed
```

---

## Generated CLAUDE.md -- Skills & Tools Section

Generate the list below using whichever of these skills actually exist in the target environment. Optional skills are included regardless -- they are discoverable even if not yet wired into a routing row.

```markdown
## Skills and Tools
- (deploy skill) -- deploy to Netlify and wire up a custom domain
- (integration-check skill) -- audit Netlify + Supabase integration before going live
- (UI testing skill) -- test UI in a browser
- (brand setup skill) -- set up favicons, manifest, and brand assets
- (email skill) -- wire up transactional email
- (e-signature skill) -- route to the correct e-signature integration
- /audit-mwp -- check MWP structure compliance
- /update-mwp -- update MWP files when the project evolves
```

---

## Debugging / Troubleshooting

| Symptom | Check |
|---|---|
| CLAUDE.md contains project description prose | Move it to CONTEXT.md -- CLAUDE.md is Layer 0 routing only |
| AGENTS.md duplicates CLAUDE.md | Replace it with the lightweight adapter template -- duplicated routing drifts |
| DEVLOG.md / agent-roles.md / skills.md missing | These are required standard files -- generate them at scaffold time |
| Domain missing from CLAUDE.md | User did not provide it -- leave the placeholder; fill in before deploying |
| Base directory missing from CLAUDE.md | Always add `Base directory: src/` to the Deployment section -- this is mandatory |
| Netlify can't find Next.js project | Base directory must be set to `src/` in Netlify -- check ops/CONTEXT.md and CLAUDE.md Deployment section. Also verify `netlify.toml` exists at **repo root** (not inside src/) with `base = "src"`. |
| `/` shows Next.js default welcome page | `src/app/page.tsx` was not replaced at scaffold time -- delete it or replace with a redirect to the actual root route |
| `@/components/X` not found at build time | Check `src/tsconfig.json` paths -- `@/*` must be `"./*"` not `"./src/*"`. The latter adds an extra `src/` prefix that doesn't exist when src/ IS the project root. |
| CI build fails, SSR pages return 404 | `@netlify/plugin-nextjs` missing from `src/package.json` devDependencies or missing from `netlify.toml` plugins section -- without it Netlify serves .next as static files only |
| Netlify function can't find a file at runtime | The file lives outside src/ -- move it inside src/ to the directory confirmed when the integration was set up, and update all references |
| npm commands failing | Confirm you are running from inside src/, not the root |
| Wrong workspace structure generated | Confirm the user's answers -- additional workspaces should only be added if the user explicitly asked |
| Flat .md files created instead of subdirectory/CONTEXT.md | This is a structural error. planning/SPEC.md should be planning/spec/CONTEXT.md. Recreate as subdirectories -- both spec files must be read in Step 1 to get the correct structure |
| Spec or template files not found | Check `~/.claude/mwp-spec/` exists — see this repo's INSTALL.md |
| Optional skill row included without confirmation | Remove it -- only add email/esign routing rows if the user confirmed the project uses that feature |
