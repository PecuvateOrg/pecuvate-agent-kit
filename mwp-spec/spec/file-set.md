# MWP — The File Set

Which files a project carries, what each is for, and how they are named.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## Why this file exists

Before this file was written, the file set was defined in three places that
disagreed. Several `init-mwp-*` skills scaffolded an "8-file MWP root" that
omitted `GEMINI.md`, while another skill's guide stated a leaf carries nine and
listed it. A survey of live projects found `GEMINI.md` present in every one that
had been scaffolded correctly by hand. The skills were wrong, and every project
scaffolded from them started incomplete.

This file is now the only definition. A skill, template or guide that lists the
file set is out of date by construction — it should route here instead.

---

## The set

| File | Leaf | Hub | Purpose |
|---|:--:|:--:|---|
| `CLAUDE.md` | ✅ | ✅ | Layer 0 — identity and routing |
| `AGENTS.md` | ✅ | ✅ | Cross-model adapter — points at `CLAUDE.md`, never duplicates it |
| `GEMINI.md` | ✅ | ✅ | Cross-model adapter — same content as `AGENTS.md` |
| `CONTEXT.md` | ✅ | ✅ | Layer 1 — what this project contains and where to go |
| `DEVLOG.md` | ✅ | ✅ | Session decisions. Public repos: see below |
| `memory.md` | ✅ | ✅ | Session bridge. Public repos: see below |
| `agent-roles.md` | ✅ | ❌ | Role registry — responsibilities and boundaries |
| `skills.md` | ✅ | ❌ | Skills and slash commands available here |
| `README.md` | ✅ | ❌ | Human-facing setup. A hub is not published |
| `brand-identity.md` | ⬦ | ⬦ | Only when the project or hub owns a brand |

**A leaf carries 9. A hub carries 6, plus `brand-identity.md` where a brand exists.**

`agent-roles.md`, `skills.md` and `README.md` are leaf-only: roles and skills are
per-project, and a hub ships nothing to publish. See
[project-types.md](./project-types.md) for what makes a project a hub.

---

## Casing is not cosmetic

`AGENTS.md` and `GEMINI.md` are **uppercase**. `agent-roles.md`, `skills.md` and
`memory.md` are **lowercase**.

**Never create lowercase `agents.md`.** On a case-insensitive filesystem — every
Windows and default macOS machine — it is the same file as `AGENTS.md`. The two
have different jobs: `AGENTS.md` is a cross-model adapter pointing at `CLAUDE.md`;
`agent-roles.md` is the role registry. Collapsing them loses the registry silently,
because git records whichever casing was committed first and the working tree shows
only one file.

This is a real, observed failure, not a hypothetical: on a live audit of six public
repos, two carried lowercase `agents.md` **and had no `agent-roles.md` at all**.
Neither reported an error. The rule had been written down before either project
existed.

**Conformance must test casing on disk, not existence.** `ls agents.md` succeeds
when `AGENTS.md` is what is present.

---

## Public repositories

A public repo must not track its own `DEVLOG.md` or `memory.md`. They carry
operational detail, live identifiers, incident history and commercial state — none
of it a credential, so no secret scanner will ever flag it.

Those two files move to a private parent hub under `workspace-docs/<repo-name>/`,
named after the **repository**, not the working directory. The child gitignores both
filenames, and its `CLAUDE.md`, `AGENTS.md` and `GEMINI.md` all declare the new
location — a routing rule stated only in `CLAUDE.md` leaves every non-Claude agent
pointed at the removed files.

Two properties worth knowing before relying on this:

- **A `.gitignore` rule cannot protect a still-tracked file.** The obvious test —
  recreate `DEVLOG.md`, check it is ignored — reports *not ignored* until the
  removal is committed and merged. Run it after, or it tells you the opposite of
  the truth.
- **The move is forward-only.** Everything already pushed stays in public history.

If your workspace has its own public-repo-collaboration conventions doc, follow
its full procedure; otherwise, before publishing a repo, at minimum add branch
protection, secret scanning, and a `CONTRIBUTING.md`.
