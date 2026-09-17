# MWP — Workspace Shapes

How the three-layer folder architecture changes shape for different kinds of work.
The layers stay the same. The names, context files, and routing all change.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## The Principle

The layers do not change. The labels do. Your CLAUDE.md still sits at the top and routes everything. Each workspace still has its own context file. Skills still plug in where needed. But what each workspace is called, what the context files say, and what skills are wired in will look completely different depending on what you actually do.

---

## Example 1 — Content Creator

```
my-content-project/
├── CLAUDE.md
├── script-lab/
│   ├── CONTEXT.md
│   ├── ideas/
│   ├── drafts/
│   └── final/
├── production/
│   ├── CONTEXT.md
│   ├── briefs/
│   ├── specs/
│   └── output/
└── distribution/
    ├── CONTEXT.md
    ├── platforms/
    ├── scheduling/
    └── analytics/
```

**Script Lab** — Where thinking happens. Ideas go in, drafts come out. CONTEXT.md describes your voice, audience, content type, and process from idea to finished script. If you have a style guide or recurring topics, they go here.

**Production** — Where content gets built. Shot lists, thumbnails, description templates, specs. CONTEXT.md describes your production process, tools, and visual standards.

**Distribution** — Where finished content goes out. Platform-specific formatting, scheduling, repurposing. CONTEXT.md describes your platforms, posting cadence, and per-channel adaptation rules.

```markdown
# My Content Project

I create [TYPE OF CONTENT] for [AUDIENCE].

## Routing
| Task | Go to | Read |
|---|---|---|
| Write or brainstorm | /script-lab | CONTEXT.md |
| Build or produce | /production | CONTEXT.md |
| Publish or repurpose | /distribution | CONTEXT.md |

## Naming Conventions
- Drafts: topic-name_draft.md
- Final scripts: topic-name_final.md
- Published: YYYY-MM-platform-topic.md
```

---

## Example 2 — Freelancer / Consultant

```
my-consulting-practice/
├── CLAUDE.md
├── client-alpha/
│   ├── CONTEXT.md
│   ├── intake/
│   ├── deliverables/
│   └── communications/
├── client-beta/
│   ├── CONTEXT.md
│   └── ...
├── templates/
│   ├── CONTEXT.md
│   ├── proposals/
│   ├── reports/
│   └── frameworks/
└── business-dev/
    ├── CONTEXT.md
    ├── pipeline/
    ├── outreach/
    └── case-studies/
```

**Client workspaces** — One folder per client with its own CONTEXT.md. That file describes who the client is, the engagement phase, deliverables, and client-specific rules (tone, terminology, things to avoid). When you say "let's work on Alpha," Claude reads Alpha's context and nothing from Beta. No bleed.

**Templates** — Reusable frameworks. CONTEXT.md describes what each template is for and how to use it. Pull into the client folder and customise for each engagement.

**Business Dev** — Pipeline, outreach, case studies. CONTEXT.md describes your ideal client, services, and positioning.

**The key for freelancers:** when you onboard a new client, copy the folder structure, write a new CONTEXT.md, and add one line to the routing table. That is it.

```markdown
# My Consulting Practice

I am a [TYPE] consultant working with [TYPES OF CLIENTS].

## Routing
| Task | Go to | Read |
|---|---|---|
| Client work for Alpha | /client-alpha | CONTEXT.md |
| Client work for Beta | /client-beta | CONTEXT.md |
| Build a new proposal | /templates | CONTEXT.md, then client folder |
| Outreach or pipeline | /business-dev | CONTEXT.md |

## Rules
- Never reference one client's information in another client's workspace
- Proposals always start from /templates and get customised in the client folder
```

---

## Example 3 — Developer

```
my-app/
├── CLAUDE.md
├── planning/
│   ├── CONTEXT.md
│   ├── specs/
│   ├── architecture/
│   └── decisions/
├── src/
│   ├── CONTEXT.md
│   ├── components/
│   ├── services/
│   └── tests/
├── docs/
│   ├── CONTEXT.md
│   ├── api/
│   └── guides/
└── ops/
    ├── CONTEXT.md
    ├── deploy/
    ├── monitoring/
    └── scripts/
```

**Planning** — Specs, architecture decisions, design docs. CONTEXT.md describes the app, tech stack, current priorities, and architectural principles.

**Src** — The codebase. CONTEXT.md describes code structure, naming conventions, patterns to use and avoid, testing requirements, and standard libraries.

**Docs** — API documentation, guides, changelogs. CONTEXT.md describes documentation standards, audience per doc type, and how docs relate to the code.

**Ops** — Deployment, monitoring, operational scripts. CONTEXT.md describes infrastructure, deploy process, and runbook conventions.

```markdown
# My App

[APP NAME] — [One sentence description]

## Tech Stack
- Frontend: [framework]
- Backend: [language/framework]
- Database: [type]
- Deploy: [platform]

## Routing
| Task | Go to | Read | Skills |
|---|---|---|---|
| Spec a feature | /planning | CONTEXT.md | — |
| Write code | /src | CONTEXT.md | testing-skill |
| Write docs | /docs | CONTEXT.md | doc-authoring-skill |
| Deploy or debug | /ops | CONTEXT.md | — |

## Naming Conventions
- Specs: feature-name_spec.md
- Components: PascalCase
- Tests: feature-name.test.ts
- Decision records: YYYY-MM-DD-decision-title.md
```

Note the Skills column in the routing table. Wire skills into specific workspaces so they only load when relevant — the planning workspace does not need a testing skill, the src workspace does.

---

## How to Build Yours

**Step 1 — List your workspaces.** Think about 2–4 major areas of your work. What modes do you shift between? If you find yourself wishing Claude would forget what it was just doing and focus on something else entirely, that is a workspace boundary.

**Step 2 — Write a CONTEXT.md for each one.** Describe what happens in this workspace, the process, what files live here, and what good work looks like. Keep it under a page. Add more later.

**Step 3 — Write your CLAUDE.md.** List the workspaces, build the routing table, add naming conventions.

**Step 4 — Start working.** Point Claude at the folder, give it a task, see what happens. Adjust context files based on what Claude gets right and what it gets wrong. The first version will not be perfect. It will be better than no structure at all, and it will improve every time you edit a context file.

---

## The Key Principle

Context files are living documents. Edit them as projects change, as you learn what Claude needs to know, as you figure out what to cut. The people who get the most out of this system treat context files like working notes, not finished documents.
