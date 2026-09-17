# MWP — Conformance Checklist

Every rule `/audit-mwp` and `/mwp-health` must test, and how each is measured.
This is the single source those skills read. A check they perform that is not here
is unspecified; a rule here they do not perform is unenforced.

**A skill must not define a check.** It cites an id from this file and supplies only
orchestration — discovery, ordering, output format. See `no-check-defined-outside-checklist`.

---

## Identifiers

Check ids are **kebab-case slugs, unique across this whole file**. They are not
sequential numbers, and this is deliberate.

Sequential ids per category (`S1`, `M1`, `P1`) fail in two ways that cost real repair:

- **They collide silently.** Two authors numbering "structure checks" both start at
  `S1`. Nothing detects it — you find out by reading both documents side by side. In
  a real instance of this, a known-exceptions log cited `S1`/`S2` meaning
  *file set* and *adapter casing* from this file, while a session log cited two other
  ids meaning *CLAUDE.md sections* and *README present* from a different skill's own
  numbering. Both records are permanent and they disagree about what the letters mean.
- **They rot on insertion.** Adding a check means appending it out of order or
  renumbering every reference to it. A slug is inserted anywhere at no cost.

A slug also survives being read out of context: `orientation-filename` in a report
says what failed. `S6` requires a lookup, and looks up wrong if the reader has the
other scheme in mind.

Renaming a slug is a breaking change — grep the workspace and `known-exceptions.md`
before doing it.

---

## How to measure

**State the baseline, or the result is unfalsifiable.** A check that returns green
without saying what it compared against has proved nothing. Three real failures,
all returning a confident pass:

| Check | Wrong baseline | What it reported | Truth |
|---|---|---|---|
| Uncommitted work | `@{u}..HEAD` — branch vs *its own* remote | "nothing outstanding" | several commits unmerged in open PRs |
| Branch protection | `rules/branches/{b}` — evaluated *as the caller* | "no protection" | PR required; the caller simply bypassed it |
| Content diff | `grep '^[+-][^+-]'` | "line-endings only" | a real content change, hidden because a markdown bullet begins with `-` |

Rules for this file:
- Compare against `origin/<default-branch>`, never `@{u}`.
- **Branch protection is the UNION of two independent layers.** Classic protection
  (`branches/{b}/protection`) and rulesets (`rulesets`) are separate systems that
  neither know about nor override each other; most hosts enforce a rule present in
  *either*. So the real protection is both lists merged. Query **both**, always,
  and report the union — never one layer's answer as the whole answer.
  `rules/branches/{b}` is not a substitute: it is evaluated *as the caller* and
  returns an empty list to an admin who merely bypasses the rules.

  This one is not theoretical and the earlier wording here did not prevent it. The
  same one-layer error has been made multiple times in a single session, once while
  this exact file was open:

  | Read | Missed | Reported |
  |---|---|---|
  | `rulesets` only | classic protection | "repo is unprotected" — it was protected |
  | `rules/branches/` as admin | that it hides bypassed rules | "no protection" — PR was required |
  | classic `required_status_checks` | the ruleset's | "CI required on 0 of 7" — it was 1 of 7 |

  A rule stated as "query X and Y" was read past while doing exactly that. Stating
  the *shape of the answer* — a union — is what makes the omission visible.
- Search with plain `grep -rn`. A tool that honours `.gitignore` by default will
  skip every nested project repo here — verify your search tool's behaviour before
  trusting a clean result.

---

## Root files and structure

| id | Check | Measured by | Severity |
|---|---|---|---|
| `leaf-file-set` | All 9 leaf files present (6 for a hub) | `ls` each name from `spec/file-set.md`. Report **which** are missing, not just that the set is incomplete | FAIL |
| `adapter-casing` | `AGENTS.md` / `GEMINI.md` are uppercase on disk | `git ls-files` exact-case match — **not** `ls`, which succeeds on either | FAIL |
| `no-lowercase-agents` | No lowercase `agents.md` | `git ls-files \| grep -x 'agents.md'` | FAIL |
| `agent-roles-distinct` | `agent-roles.md` present and distinct from `AGENTS.md` | both tracked, different content | FAIL |
| `hub-file-set` | Hub has no `README.md` / `agent-roles.md` / `skills.md` | absence | WARN |
| `claude-md-sections` | `CLAUDE.md` carries all 8 components | Identity, Self-Reference, Routing Table, Cross-Workspace Flows, Naming Conventions, File Placement Rules, Token Management, Skills and Tools Available. Judge by **content**, not headings — a generic "Rules" heading does not satisfy three of them | FAIL if 3+ missing or no `CLAUDE.md`; WARN if 1–2 |
| `skills-md-populated` | `skills.md` holds real entries | at least one `` | `/ `` table row | FAIL if none; WARN if `What belongs here` / `Why this matters` boilerplate survives. Skip if `leaf-file-set` already reported it absent |
| `directory-orientation` | Every meaningful directory's orientation file is `CONTEXT.md` | `ls <dir>/CONTEXT.md`. A directory that orients via `index.md`, `00-index.md` or `README.md` instead **fails** — see `spec/naming.md`, *Directory orientation* | WARN |

**`directory-orientation` — what counts as meaningful.** Every immediate subdirectory
except: build, dependency and output directories (`node_modules`, `.next`, `dist`,
`build`, `out`, `coverage`, any dotfolder); pure asset directories (`public`,
`assets`, `static`, `images`); and KB vaults, whose Layer 1 file is `index.md` by
citation if you run a knowledge-base framework — detect a vault by `.obsidian/`, or
by an `index.md` + `sources/` pair. The parent directory holding the vaults still
needs its own `CONTEXT.md`.

There is **no exemption for single-file directories**. An exemption is a second rule,
and the cost it saves is five lines.

A `*-index.md` catalogue sitting beside a `CONTEXT.md` is correct and does not fail —
enumerating is not orienting.

## Web application layout

Applies only where the project is a web application (`src/` present, or `netlify.toml`,
or `src/package.json`). Skip entirely for other types — a root `package.json` is
correct in an automation project.

| id | Check | Measured by | Severity |
|---|---|---|---|
| `src-layout` | `src/` exists and holds `package.json` | directory present; no `package.json` at root | FAIL |
| `netlify-base` | `netlify.toml` at root declares `base = "src"` | file at root, not inside `src/`; contains `base = "src"` | FAIL — WARN if no `netlify.toml` exists anywhere, which means the project is not yet deployed |
| `no-src-adapters` | No `CLAUDE.md` or `AGENTS.md` inside `src/` | absence | FAIL — either would load in `src/`-scoped sessions and override root routing |

`src/`, `planning/` and `ops/` are covered by `directory-orientation`, not by separate
checks. They are instances of the general rule, not exceptions to it.

## Public repositories

| id | Check | Measured by | Severity |
|---|---|---|---|
| `public-docs-untracked` | `DEVLOG.md` / `memory.md` not tracked | `git ls-files` | FAIL |
| `public-docs-ignored` | Both gitignored | `git check-ignore --no-index` — plain `check-ignore` reports *not ignored* for a still-tracked path | FAIL |
| `workspace-docs-present` | Hub holds `workspace-docs/<repo>/` for this child | path exists, named by **repo** not directory | FAIL |
| `relocation-declared` | `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` **all** declare the location | grep each for `workspace-docs`. One file declaring it is not enough — an agent entering via either adapter finds nothing | FAIL |
| `gitignore-anchored` | Hub `.gitignore` child patterns are anchored (`/child/`) | unanchored matches at any depth and silently swallows `workspace-docs/<same-name>/` | FAIL |
| `no-stale-relocation-refs` | No in-repo reference to the moved files | `grep -rn 'DEVLOG\.md\|memory\.md'` excluding corrective warnings | WARN |

## Metadata

| id | Check | Measured by | Severity |
|---|---|---|---|
| `status-present` | Specs, ADRs and blueprints carry `status:` | frontmatter present | WARN |
| `status-vocabulary` | `status:` uses the ADR vocabulary | value in the permitted set | FAIL |
| `status-terminal-detail` | Terminal states carry a date or target | `applied` has a date; `superseded by` has a path | FAIL |
| `no-status-on-orientation` | No `status:` on `CONTEXT.md`, guides or registries | absence — it can only say `current`, so it cannot be false | WARN |
| `registry-authority` | Registries carry `authority:` + `as_of:` | frontmatter present | WARN |

## Shared session memory (opted-in projects only)

Defined by `spec/session-memory.md`; no change to the required root file set.

| id | Check | Measured by | Severity |
|---|---|---|---|
| `shared-memory-routing` | Layer 0 names protocol, bridge and durable destinations | Resolve each declared path | FAIL |
| `shared-memory-provenance` | Durable learning distinguishes evidence from hypothesis | Read changed claims and cited sources | FAIL |
| `shared-memory-bridge-budget` | Bridge stays within its word budget and carries authority/as_of | Count words; inspect frontmatter | WARN |
| `shared-memory-single-authority` | Conflicting legacy claims are reconciled or explicitly pending | Compare relevant legacy entries and canonical pages | FAIL |
| `shared-memory-recall-trial` | Adoption report separates structural checks from fresh-session recall | Inspect recorded agent trials and evidence | WARN |

## File ceilings

| id | Check | Measured by | Severity |
|---|---|---|---|
| `claude-md-ceiling` | `CLAUDE.md` ≤ 50 lines | `wc -l` | WARN |
| `context-md-ceiling` | Workspace `CONTEXT.md` ≤ 150 lines | `wc -l` | WARN |
| `reference-ceiling` | Reference file ≤ 300 lines | `wc -l` | WARN |

A ceiling breach is a WARN, not a FAIL — `spec/principles.md` sets them as budgets,
not limits. Record a deliberate breach in `known-exceptions.md` so the next audit
does not re-raise it.

## Duplication

| id | Check | Measured by | Severity |
|---|---|---|---|
| `no-rule-outside-spec` | No file outside `spec/` states a rule `spec/` owns | manual, at review time | WARN |
| `no-duplicate-spec-file` | No second copy of a spec file anywhere in the workspace | plain `grep -rln` on a distinctive line from each spec file | FAIL |
| `no-check-defined-outside-checklist` | No skill, guide or template defines its own check table or check ids | grep skill `SKILL.md` / `GUIDE.md` for check tables. A skill cites ids from this file; it never restates a pass condition or severity | FAIL |

`no-duplicate-spec-file` is the check that would catch a structural rule file
living in more than one place at once. Run it with plain grep, per **How to measure**.

`no-check-defined-outside-checklist` is the one that would catch an id
collision like the one described under **Identifiers** — a skill carrying its own
check tables in both `SKILL.md` and `GUIDE.md`, with a note telling the reader that
"the checklist wins," is not a control; an instruction to reconcile by hand never is.
