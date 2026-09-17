# init-mwp-hub — Operational Guide

Detail for scaffolding a parent hub workspace. See `SKILL.md` for the steps.

---

## Overview

**What it does.** Scaffolds the MWP file set for a *parent hub* — a Layer 1
workspace that owns several child project repositories but contains no code.

**When to use it.** The directory contains other projects rather than source
files. A group-level workspace that owns several unrelated product repos (for
example, a fictional "Acme Corp" workspace owning `acme-storefront` and
`acme-mobile` as separate child repos) is the reference shape.

**When not to use it.** Anything that builds, deploys or ships. Those are leaf
projects — route through `/init-mwp` to one of the leaf types.

**Why it exists.** `~/.claude/mwp-spec/spec/project-types.md` originally defined only leaf types
(Web App, Automation, CMS, Content Creator, Skill/Tool). A hub matched none of
them, and the documented fallback — default to `/init-mwp-developer` — actively
harms a hub by scaffolding `src/`, `planning/` and a tech stack it does not
have.

---

## Hub vs leaf: the file sets

| File | Hub | Leaf | Why |
|---|:--:|:--:|---|
| `CLAUDE.md` | ✅ | ✅ | Layer 0 routing |
| `AGENTS.md` | ✅ | ✅ | cross-model adapter |
| `GEMINI.md` | ✅ | ✅ | cross-model adapter |
| `CONTEXT.md` | ✅ | ✅ | Layer 1 |
| `DEVLOG.md` | ✅ | ✅ | decisions |
| `memory.md` | ✅ | ✅ | state |
| `brand-identity.md` | ⬦ | ⬦ | only if a brand is owned |
| `README.md` | ❌ | ✅ | a hub is not published |
| `agent-roles.md` | ❌ | ✅ | roles are per-project |
| `skills.md` | ❌ | ✅ | skills are per-project |

A hub carries **7**; a leaf carries **9**.

---

## Process detail

### Mapping children

A child is any immediate subdirectory containing `.git`. Record the remote's
visibility — `gh repo view <owner>/<repo> --json visibility` — because only
**public** children need `workspace-docs/`.

Children may nest more than one level (e.g. `Acme Freelancer Network/acme-fn`).
Walk to a sensible depth rather than assuming one.

### The .gitignore ordering rule

Write it **before** `git init`, never after. Once a credential file is committed
it is in history, and removing it later requires a rewrite that public forks and
collaborator clones will not follow.

Ignore child repos by directory name with a trailing slash. Do not try to
re-include individual files beneath them — see the gotcha below.

### Verifying the first commit

Between `git init` and the first commit, inspect the staged set:

```
git status --porcelain | head -50
git ls-files --cached | wc -l
```

A hub should stage roughly its own file count. Hundreds of files means a child
repo or `node_modules` leaked past `.gitignore`.

---

## workspace-docs/

### Why it exists

A public child repo tracking its own `DEVLOG.md` and `memory.md` publishes
operational detail: live payment and webhook identifiers, known-but-unremediated
weaknesses, commercial state, and incident history. None of it is a credential,
so no scanner catches it.

The fix is a **split, not a discipline**. Content rules ("do not write X in the
devlog") decay, and the material at risk is ordinary prose no tool can detect.
Put the two categories in two repos instead.

### Layout

```
workspace-docs/
  acme-storefront/       <- child REPO name, kebab, no spaces
    DEVLOG.md
    memory.md
```

One directory per public child. Never merge children into a single log — the
hub's own `DEVLOG.md` stays hub-level and does not grow.

### The three layers

| Layer | Mechanism | Fails if... |
|---|---|---|
| Routing | child `CLAUDE.md` declares the location | an agent does not read it |
| Resolution | your closeout process (if you have one) resolves the path | the process is not updated |
| Enforcement | child `.gitignore` + CI check | — |

Only the third is enforcement. Without it an agent recreates `DEVLOG.md` in the
public repo and the exposure returns silently.

### What it does not fix

Moving a file stops **future** exposure only. Everything already pushed remains
in public history. Rewriting history needs a force-push — which a standard
branch-protection ruleset typically blocks — and breaks every existing clone and
fork. Usually the right call is to accept the historical content and let the
move handle everything from here. Say so explicitly rather than implying the
move undoes the past.

---

## Gotchas

**A parent repo cannot track files inside a nested git repo.** `git add -f`
returns exit 0, prints nothing, and stages nothing. There is no error to notice.
So "leave the docs in place and let the hub track them" is impossible — verify
with `git diff --cached --name-only` rather than trusting the exit code.

**Anchor child-repo ignores with a leading slash.** `child-repo/` matches that
name at *any* depth, so it also excludes `workspace-docs/child-repo/` — the very
place the child's documents go. `git add -A` reports success and stages nothing.
Write `/child-repo/`, and verify by counting staged files. This kind of leading-slash
omission has caused a real hub in production to silently lose its workspace-docs
directory while an unrelated hub with differently-cased naming happened to escape it.

**Test the `.gitignore` layer only after committing the removal.** Gitignore
never applies to a tracked path, so recreating `DEVLOG.md` before the removal is
committed reports *not ignored* even when the rule is correct. Between the move
and the merged PR the public repo has no enforcement at all.

**The routing layer is more than `CLAUDE.md`.** `AGENTS.md` and `GEMINI.md`
typically say "then read `CONTEXT.md`, `memory.md` and `DEVLOG.md`". Leave them
and every non-Claude agent is told to recreate exactly what was just removed.
Grep the whole repo for both filenames — `CONTEXT.md` file trees and ops runbooks
carry them too.

**Git cannot re-include a file under an excluded directory.** `Child/` followed
by `!Child/DEVLOG.md` does not work. Excluding the *contents* (`Child/*`) allows
re-inclusion — but it is moot here, because of the nested-repo rule above.

**A hub is nested inside a workspace root repo, if one exists.** Confirm the
root's `.gitignore` excludes the hub before initialising, or the two repos will
fight over the same files.

**Do not add a required CI check to a hub.** A hub builds nothing, so a required
check that never runs seals the branch permanently.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| First commit stages hundreds of files | `.gitignore` written after `git init` | reset, fix ignore, re-add |
| `git add` on a child file appears to work but stages nothing | nested repo boundary | move the file; it cannot be tracked in place |
| Closeout process recreates `DEVLOG.md` in a public child | Step 5 layer 2 missing | update the process's path resolution |
| Child docs still visible on GitHub after the move | history, not working tree | expected — the move is forward-only |

---

## Related

- `/init-mwp` — router; hands off here when the type is Product Hub
- `/audit-mwp` — checks an existing hub against this structure
- If your workspace has a closeout process, it must resolve devlog paths via the child's `CLAUDE.md`
- If your workspace has its own public-repo-collaboration conventions doc, follow it — it should cover why public children need the split
- If your workspace has its own agent-security conventions doc, follow it for credential handling
- `~/.claude/mwp-spec/spec/layers.md` — workspace vs root CONTEXT.md
