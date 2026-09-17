# PecuvateAgentKit

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
