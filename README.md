# PecuvateAgentKit

## About

### What it is
A public collection of Claude Code skills that Pecuvate built and uses itself, made generic so anyone can use them. The first family is MWP — the Model Workspace Protocol.

### What it's for
To share working tools, not theory: skills proven on real projects, without the internal names and paths they were first written against.

### How it works
Each family of skills installs into your own Claude Code setup and works standalone. See *Installing* below.

A growing public collection of Pecuvate's Claude Code skills. **MWP is the
first family shipped.**

PecuvateAgentKit exists so skills built and used internally at Pecuvate can be
shared with anyone running Claude Code, without dragging along the internal
paths, company names, and workspace-specific assumptions those skills were
originally written against. Each family in this repo has been genericized so
it works standalone in your own environment.

---

## What's in this repo

```
skills/mwp/     10 skills implementing the Model Workspace Protocol (MWP) —
                a structure for organising a project's files so an AI coding
                agent loads only the context a given task actually needs.

skills/content/ 2 skills for a blog-first content pipeline: one article becomes
                every platform post, the agent prepares and publishes, the
                person only approves (and records, if they use video).

mwp-spec/       The standard those skills implement: the normative spec,
                the conformance checklist an audit runs against, and the
                file templates the scaffolding skills generate from.
```

The ten MWP skills:

| Skill | What it does |
|---|---|
| `/init-mwp` | Routes a new project to the right type-specific init skill |
| `/init-mwp-developer` | Scaffolds a web app / developer project (Next.js, TypeScript, Netlify) |
| `/init-mwp-automation` | Scaffolds an automation / workflow / integration project |
| `/init-mwp-cms` | Scaffolds a CMS / content backend project (Sanity) |
| `/init-mwp-content` | Scaffolds a content creator project (video, written, social) |
| `/init-mwp-hub` | Scaffolds a parent hub workspace that owns other project repos |
| `/init-mwp-tool` | Scaffolds a Claude Code skill or developer tool project |
| `/audit-mwp` | Audits an existing project's MWP structure and content quality |
| `/update-mwp` | Updates MWP files when a project's structure changes |
| `/mwp-health` | Workspace-wide MWP compliance scanner — PASS/WARN/FAIL plus a migration plan |

### The content family: Content Creator Kit

A tool for content creators to manage their content **locally, with an AI
agent, using the ICM / MWP folder model**. One long-form piece becomes every
platform post: the creator writes and approves, and the agent prepares,
adapts and publishes. Publishing goes straight to the creator's own LinkedIn,
X, YouTube, TikTok and Instagram accounts, with no scheduling service in between. Built and proven on
Pecuvate's own publishing before being shared here.


| Skill | What it does |
|---|---|
| `/content-pipeline` | Sets up and runs a blog-first pipeline: stage folders, brand files, who does what, the weekly cycle |
| `/social-connect` | Connects your own LinkedIn (profile + company Page), X, YouTube, TikTok and Instagram for direct posting — no scheduler service. One playbook per platform (app setup, reviews, form answers, known errors), a setup tracker, and a dry-run-first post command |

For what MWP actually is and why it's structured this way, read
[`mwp-spec/CONTEXT.md`](./mwp-spec/CONTEXT.md) — that's the entry point into
the standard itself.

---

## Installing

1. Clone this repo.
2. Ask your AI coding agent (Claude Code, or any agent that can follow written
   instructions and move files) to follow [`INSTALL.md`](./INSTALL.md).

No manual file copying is required — `INSTALL.md` is written as literal
step-by-step instructions for an agent to execute on your behalf.

**Not using Claude Code?** You don't need it — see
["If your agent isn't Claude Code"](./INSTALL.md#if-your-agent-isnt-claude-code)
in `INSTALL.md` for how any AI coding agent can translate these skills into
its own native format.

---

## License

MIT. See [LICENSE](./LICENSE).

---

## Contributing

Contributions are welcome. Fork the repo, create a branch, and open a pull
request against `main`. If you're proposing a change to the MWP spec itself
(anything under `mwp-spec/spec/`), explain the problem the current wording
causes in practice — the spec favours one clearly-stated rule per concept over
convenience, so a change needs to earn its place the same way the existing
rules did.
