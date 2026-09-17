# Project Types — MWP Skill Routing

Routing config for the MWP skills. Defines what to load and what conventions to apply based on project type.

## Priority Rule

MWP structural principles (see [CONTEXT.md](./CONTEXT.md)) always take precedence. This file governs **content** — what goes inside a valid MWP structure. It never governs structure itself: workspace count, CLAUDE.md length, routing table format, or token management rules are always determined by the MWP spec, not by project type.

---

## Skill Routing Table

`init-mwp` reads this table to match the user's project description and hand off to the correct type skill.

| Type | Match when the user describes... | Skill |
|---|---|---|
| Web App / Developer | website, web app, dashboard, frontend, Next.js, landing page, platform, SaaS | `/init-mwp-developer` |
| Automation / Workflow | automation, integration, workflow, API connection, Make, Zapier, scripts, data pipeline | `/init-mwp-automation` |
| CMS / Content Backend | CMS, Sanity, content management, content backend, editorial, headless CMS | `/init-mwp-cms` |
| Content Creator | content creator, YouTube, blog, newsletter, social media, scripts, publishing, podcast | `/init-mwp-content` |
| Skill / Tool | Claude Code skill, developer tool, utility, scaffold, slash command | `/init-mwp-tool` |
| Product Hub | product hub, parent workspace, a folder that holds other projects, group of related repos, umbrella for several sites | `/init-mwp-hub` |

If the description is ambiguous, offer the two closest matches. If the project contains other project repositories rather than code of its own, it is a Product Hub — match that before considering any leaf type. If nothing fits, default to `/init-mwp-developer` and note the assumption.

## How the Skills Use This File

1. `init-mwp` — reads the routing table above to match project type and hand off to the correct skill
2. `audit-mwp` — reads the type definitions below to know what conventions a project of this type should reflect
3. `update-mwp` — reads the type definitions below to apply the correct conventions when making changes

---

## Type 1 — Web App

**Applies when:** building a website, web application, marketing site, dashboard, or any user-facing frontend — static or dynamic.

**Load these references.** If your workspace already has its own conventions docs for these concerns, follow them; otherwise use the defaults below:
- Stack — match the existing stack already in the repo, or ask the user which to use for a new project
- TypeScript — strict mode, no implicit any, prefer explicit types at module boundaries
- Styling — match the existing CSS/Tailwind/styling conventions already in the repo
- Deployment — ask the user how and where this project will deploy before assuming a platform
- Environment — never commit secrets; use `.env.local` plus `.gitignore`, never hardcode credentials

**Stack defaults:**
- Framework: Next.js (both static and dynamic — App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Deployment: Netlify
- Do not suggest alternatives unless the user explicitly requests them

**Typical workspace pattern:**
- `planning/` — specs, architecture decisions
- `src/` — codebase (components, pages, services)
- `ops/` — deployment config, environment setup

**Key conventions to carry into generated files:**
- Components in PascalCase
- Pages use Next.js App Router conventions
- Environment variables prefixed by context (e.g. NEXT_PUBLIC_ for client-side)
- Separate server and client components explicitly

---

## Type 2 — Automation / Workflow

**Applies when:** building integrations, automations, agent workflows, or systems that connect external services.

**Load these references.** If your workspace already has its own conventions docs for these concerns, follow them; otherwise use the defaults below:
- Agent behaviour — state your plan before non-trivial changes; confirm before destructive or hard-to-reverse actions
- Environment — never commit secrets; use `.env.local` plus `.gitignore`, never hardcode credentials

**Stack defaults:**
- Prefer API-first design — no UI unless explicitly required
- Node.js / TypeScript for scripting
- Document external service dependencies clearly in CONTEXT.md

**Typical workspace pattern:**
- `integrations/` — per-service integration logic and specs
- `workflows/` — orchestration logic connecting services
- `resources/` — API specs, guides, templates

**Key conventions to carry into generated files:**
- Each external service gets its own workspace or subfolder
- API credentials and base URLs in environment variables, named by service
- Every integration documented with its own reference file

---

## Type 3 — CMS / Content

**Applies when:** building or managing a content backend, Sanity studio, or content-driven site.

**Load these references.** If your workspace already has its own conventions docs for these concerns, follow them; otherwise use the defaults below:
- CMS — only applies if a CMS is actually in use for this project; skip otherwise
- Stack (if paired with a frontend) — match the existing stack already in the repo, or ask the user which to use for a new project

**Stack defaults:**
- CMS: Sanity
- Schema files in TypeScript
- Studio configuration co-located with schema

**Typical workspace pattern:**
- `schema/` — content models and field definitions
- `studio/` — Sanity studio configuration
- `queries/` — GROQ queries used by the frontend

**Key conventions to carry into generated files:**
- Schema types named in PascalCase
- Field names in camelCase
- GROQ queries documented with expected return shape

---

## Type 4 — Skill / Tool

**Applies when:** building a Claude Code skill, utility script, or developer tool — not a user-facing product.

**Load these references.**
- `~/.claude/mwp-spec/spec/CONTEXT.md` — if the skill involves MWP structure
- If your workspace has its own agent-behaviour conventions doc, follow it; otherwise: state your plan before non-trivial changes, confirm before destructive or hard-to-reverse actions

**Stack defaults:**
- Skill files: plain instruction markdown, no frontmatter
- Scripts: PowerShell for Windows automation, Node.js for cross-platform
- Deploy target: `~/.claude/skills/[skill-name]/`

**Typical workspace pattern:**
- `skills/` — skill instruction files (source)
- `templates/` — scaffold content the skills generate
- `spec/` — reference documents the skills load

**Key conventions to carry into generated files:**
- Skill filenames: kebab-case.md
- Template filenames: [name].template
- Each skill focused on one command — no combined logic

---

## Type 5 — General

**Applies when:** the project does not match any of the above types.

**Load these references:** none by default — ask the user what reference material is relevant.

**Approach:** follow MWP structural principles only. Ask the user to describe conventions before generating content. Do not assume a tech stack.

---

## Type 6 — Product Hub

**Applies when:** the directory contains other project repositories rather than
code of its own — a parent workspace that owns a group of related projects. A
group-level workspace owning several unrelated product repos (e.g. a fictional
"Acme Corp" workspace owning `acme-storefront` and `acme-mobile` as separate
child repos) is the reference shape.

**Do not route a hub to a leaf type.** The documented fallback
(`/init-mwp-developer`) actively harms a hub: it scaffolds `src/`, `planning/`,
`ops/` and a Next.js stack into a workspace that builds nothing.

**Load these references.** If your workspace has its own conventions docs for these concerns, follow them; otherwise use the defaults below:
- Public-repo collaboration — required when any child repo is public: before publishing, add branch protection, secret scanning, and a CONTRIBUTING.md
- Agent security — never commit secrets; confirm with the user before touching live credentials or production systems (required before `git init`)
- `~/.claude/mwp-spec/spec/layers.md` — workspace vs root CONTEXT.md

**Structural defaults:**
- 7-file root: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `CONTEXT.md`, `DEVLOG.md`, `memory.md`, `brand-identity.md`
- Omits `README.md`, `agent-roles.md`, `skills.md` — leaf-project files; a hub has no roles or skills of its own
- No `src/`, `planning/`, `ops/` or `netlify.toml`
- The hub repository is always **private**

**Typical workspace pattern:**
- `workspace-docs/<child-repo>/` — `DEVLOG.md` and `memory.md` held on behalf of **public** child repos, so operational detail stays private
- `<Child Project>/` — nested repos, gitignored, never tracked by the hub

**Key conventions to carry into generated files:**
- `.gitignore` is written **before** `git init`, covering every child repo and every credential file
- The hub `DEVLOG.md` holds hub-level entries only — child entries live under `workspace-docs/`
- The `workspace-docs` mechanism is documented in the hub's own `CONTEXT.md`, never the root `CONTEXT.md`
- A parent repo cannot track files inside a nested git repo; git refuses silently, so child docs must physically move
