# MWP — The File Set

Which files a project carries, what each is for, and how they are named.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## Why this file exists

Before 2026-09-05 the file set was defined in three places that disagreed. Five
`init-mwp-*` skills scaffolded an "8-file MWP root" that omitted `GEMINI.md`;
`init-mwp-hub/GUIDE.md` stated a leaf carries nine and listed it. A survey of six
live projects on 2026-09-04 found `GEMINI.md` present in **all six**. The skills
were wrong, and every project scaffolded from them started incomplete. (`GEMINI.md` was
dropped from the set on 2026-11-26, once Antigravity read `AGENTS.md` directly.)

This file is now the only definition. A skill, template or guide that lists the
file set is out of date by construction — it should route here instead.

---

## The set

| File | Leaf | Hub | Purpose |
|---|:--:|:--:|---|
| `CLAUDE.md` | ❌ | ❌ | **Must not exist** (2026-11-26). Claude Code reads `AGENTS.md` natively; a `CLAUDE.md` would replace it |
| `NON-NEGOTIABLES.md` | ✅ | ✅ | Project-wide rules and constraints. Named in AGENTS.md's first-read line; delivered to Claude by a hook — see `spec/layers.md` § NON-NEGOTIABLES.md |
| `AGENTS.md` | ✅ | ✅ | **Canonical Layer 0** for every agent (Claude Code, Codex, Antigravity all read it natively) |
| `CONTEXT.md` | ✅ | ✅ | Layer 1 — what this project contains and where to go |
| `DEVLOG.md` | ✅ | ✅ | Session decisions. Public repos: see below |
| `memory.md` | ✅ | ✅ | Session bridge. Public repos: see below |
| `agent-roles.md` | ✅ | ❌ | Role registry — responsibilities and boundaries |
| `skills.md` | ✅ | ❌ | Skills and slash commands available here |
| `README.md` | ✅ | ❌ | Human-facing: starts with `## About`, then setup. A hub is not published |
| `brand-identity.md` | ⬦ | ⬦ | Only when the project or hub owns a brand |

**A leaf carries 10. A hub carries 7, plus `brand-identity.md` where a brand exists.**
`NON-NEGOTIABLES.md` added 2026-09-22 — see the MWP Framework DEVLOG for why rules were split
out of `AGENTS.md`.

`agent-roles.md`, `skills.md` and `README.md` are leaf-only: roles and skills are
per-project, and a hub ships nothing to publish. See
[project-types.md](./project-types.md) for what makes a project a hub.

### README starts with `## About` (added 2026-10-17)

A README serves two readers: a person deciding what the project is, and a developer setting
it up. The person comes first. Every leaf `README.md` opens with an `## About` section, written
in plain English, with exactly three parts:

- `### What it is` — one or two sentences a non-developer understands
- `### What it's for` — the aim, and why it is worth building
- `### How it works` — a short numbered or plain description of the flow

Setup, environment variables and deployment follow it. Tools may read this section as each project's overview, so the heading must be exactly `## About`.

**Public repos:** the About describes the product only. Plans, pricing, business model and
internal detail belong in the private bridge (`memory.md`, or the hub's `workspace-docs/`).

---

## Casing is not cosmetic

`AGENTS.md` is **uppercase**. `agent-roles.md`, `skills.md` and
`memory.md` are **lowercase**.

**Never create lowercase `agents.md`.** On a case-insensitive filesystem — every
Windows and default macOS machine — it is the same file as `AGENTS.md`. The two
have different jobs: `AGENTS.md` carries the shared Layer 0;
`agent-roles.md` is the role registry. Collapsing them loses the registry silently,
because git records whichever casing was committed first and the working tree shows
only one file.

This is live, not hypothetical: on 2026-09-04, two of six public repos in the reference
estate carried lowercase `agents.md` **and had no `agent-roles.md` at all**. Neither
reported an error. The rule had been written down since before those projects existed.

**Conformance must test casing on disk, not existence.** `ls agents.md` succeeds
when `AGENTS.md` is what is present.

---

## Credential sources

**Conditional.** A project that consumes credentials MUST name where they come from,
in its `AGENTS.md`. A project that consumes none carries nothing — this adds no file
and no section to a workspace that has no secrets.

### Why this exists

On 2026-09-21 a session went looking for an access token in a shared environment file,
found it nearly empty, and concluded the token had been lost. It had not: it was in the
credential store and live. The answer existed — spread across a decision log, a registry
and several scripts — but **nothing at any layer said where to look**. That is a routing
failure, and routing is what Layer 0 is for.

### What it says

Layer 0 already answers *"where do I find things"*. A credential source is a thing. The
declaration is a **pointer to the retrieval path**, plus **which entry in that path is
this project's own**:

> **Credentials** — resolved from the credential store; never read from a file. Process:
> `<path to the retrieval guide>`. This project's entry: `<its identifier in the index>`.

Both halves are required, and the second is the one that does the work. A pointer to a
shared guide alone is the same sentence in every project; it proves a line was pasted, not
that anyone can actually retrieve this project's keys.

### What it must never contain

🔴 **A declaration names a retrieval path. It never restates key names or values.** Not
"so the reader knows what to expect", not as a convenience. A standard that encourages
projects to list their key names has made every Layer 0 file an inventory of what to steal
and a second copy to drift out of date.

**A conformance check verifies the pointer exists. It must never probe, read or enumerate
an actual credential** — not to confirm the project "really has" them, for no reason. An
audit that reads secrets in order to check they are documented has become the thing the
control exists to prevent.

### Checking it

Three failure modes, each of which has produced a wrong result in practice:

- **A mention is not a declaration.** Matching on vocabulary scores a project compliant for
  listing a secrets-related tool among the things it governs. Match an assertion about
  *this project's own* credentials.
- **A pointer to the wrong place passes a pointer-existence test.** A project naming a file
  that is no longer the real source is not compliant — it is the original failure with a
  citation. **Score a pointer to a known-stale source as a finding, not a pass.**
- **An environment-variable read is not automatically a credential.** `NODE_ENV`, a port, a
  binary path and a test fixture are not secrets. Without a non-credential exclusion list
  and a rule to skip test files, the check fires on the tooling built to protect secrets.

Introduce the check at warning severity, confirm it fires cleanly on real projects, and
only then promote it to a failure — see
[../conformance/checklist.md](../conformance/checklist.md).


---

## Public repositories

A public repo must not track its own `DEVLOG.md` or `memory.md`. They carry
operational detail, live identifiers, incident history and commercial state — none
of it a credential, so no secret scanner will ever flag it.

Those two files move to the private parent hub under `workspace-docs/<repo-name>/`,
named after the **repository**, not the working directory. The child gitignores both
filenames, and its `AGENTS.md` declares the new location. Every agent reads `AGENTS.md`, so one declaration reaches all of them.

Two properties worth knowing before relying on this:

- **A `.gitignore` rule cannot protect a still-tracked file.** The obvious test —
  recreate `DEVLOG.md`, check it is ignored — reports *not ignored* until the
  removal is committed and merged. Run it after, or it tells you the opposite of
  the truth.
- **The move is forward-only.** Everything already pushed stays in public history.
