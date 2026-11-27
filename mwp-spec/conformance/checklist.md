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
  `S1`. Nothing detects it — you find out by reading both documents side by side. On
  2026-09-09 this had already happened: `known-exceptions.md` cited `S1`/`S2` meaning
  *file set* and *adapter casing* from this file, while `DEVLOG.md` cited `M8`/`M10`
  meaning *AGENTS.md sections* and *README present* from the `mwp-health` skill. Both
  records are permanent and they disagree about what the letters mean.
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
without saying what it compared against has proved nothing. Three failures on
2026-09-05, all returning a confident pass:

| Check | Wrong baseline | What it reported | Truth |
|---|---|---|---|
| Uncommitted work | `@{u}..HEAD` — branch vs *its own* remote | "nothing outstanding" | 8 commits unmerged in 6 open PRs |
| Branch protection | `rules/branches/{b}` — evaluated *as the caller* | "no protection" | PR required; the caller simply bypassed it |
| Content diff | `grep '^[+-][^+-]'` | "line-endings only" | a real content change, hidden because a markdown bullet begins with `-` |

Rules for this file:
- Compare against `origin/<default-branch>`, never `@{u}`.
- **Branch protection is the UNION of two independent layers.** Classic protection
  (`branches/{b}/protection`) and rulesets (`rulesets`) are separate systems that
  neither know about nor override each other; GitHub enforces a rule present in
  *either*. So the real protection is both lists merged. Query **both**, always,
  and report the union — never one layer's answer as the whole answer.
  `rules/branches/{b}` is not a substitute: it is evaluated *as the caller* and
  returns an empty list to an admin who merely bypasses the rules.

  This one is not theoretical and the earlier wording here did not prevent it. On
  2026-09-05 the same one-layer error was made **three times in one session**, the
  third while this file was open:

  | Read | Missed | Reported |
  |---|---|---|
  | `rulesets` only | classic protection | "repo is unprotected" — it was protected |
  | `rules/branches/` as admin | that it hides bypassed rules | "no protection" — PR was required |
  | classic `required_status_checks` | the ruleset's | "CI required on 0 of 7" — it was 1 of 7 |

  A rule stated as "query X and Y" was read past while doing exactly that. Stating
  the *shape of the answer* — a union — is what makes the omission visible.
- Search with plain `grep -rn`. Ripgrep and the Grep tool honour `.gitignore` and
  skip every nested project repo here.

---

## Root files and structure

Layer 0 is `AGENTS.md`. Inspect it for the first-read line, memory routing, credential
declaration and any public-repo relocation. A `AGENTS.md` in the same folder is a FAIL
(`agents-canonical`).

| id | Check | Measured by | Severity |
|---|---|---|---|
| `leaf-file-set` | All 10 leaf files present (7 for a hub) | `ls` each name from `spec/file-set.md`. Report **which** are missing, not just that the set is incomplete | FAIL |
| `adapter-casing` | `AGENTS.md` is uppercase on disk | `git ls-files` exact-case match — **not** `ls`, which succeeds on either | FAIL |
| `agents-canonical` | `AGENTS.md` holds Layer 0 and no `CLAUDE.md` exists beside it | `test ! -e CLAUDE.md` (a `CLAUDE.md` would replace `AGENTS.md` for Claude Code) | FAIL |
| `no-gemini-adapter` | No `GEMINI.md` (unless the project ships to outside Gemini CLI users) | absence | WARN |
| `agents-size` | `AGENTS.md` under 24,000 bytes | `wc -c` — Antigravity truncates above it | FAIL |
| `no-lowercase-agents` | No lowercase `agents.md` | `git ls-files \| grep -x 'agents.md'` | FAIL |
| `agent-roles-distinct` | `agent-roles.md` present and distinct from `AGENTS.md` | both tracked, different content | FAIL |
| `readme-about` | Leaf `README.md` opens with `## About` carrying *What it is*, *What it's for*, *How it works* | `grep -n '^## About' README.md`, then the three `###` headings inside it. See `spec/file-set.md`, *README starts with `## About`* | WARN |
| `org-tier-not-looser` | No page sets a `tier:` looser than its workspace | compare page frontmatter to workspace tier | FAIL |
| `hub-file-set` | Hub has no `README.md` / `agent-roles.md` / `skills.md` | absence | WARN |
| `claude-md-sections` | Canonical Layer 0 has the three parts | Identity line + the plain first-read line, a task → file table, Facts. FAIL also on boilerplate: a Self-Reference paragraph, a generic Token Management list, a skills table, or the "When the user greets you" block | FAIL if no table or no identity; WARN on any boilerplate block |
| `non-negotiables-sections` | `NON-NEGOTIABLES.md` carries both components | Rules, Naming Conventions. Judge by content, not headings | WARN |
| `skills-md-populated` | `skills.md` holds real entries | at least one `` | `/ `` table row | FAIL if none; WARN if `What belongs here` / `Why this matters` boilerplate survives. Skip if `leaf-file-set` already reported it absent |
| `directory-orientation` | Every meaningful directory's orientation file is `CONTEXT.md` | `ls <dir>/CONTEXT.md`. A directory that orients via `index.md`, `00-index.md` or `README.md` instead **fails** — see `spec/naming.md`, *Directory orientation* | WARN |

**`directory-orientation` — what counts as meaningful.** Every immediate subdirectory
except: build, dependency and output directories (`node_modules`, `.next`, `dist`,
`build`, `out`, `coverage`, any dotfolder); pure asset directories (`public`,
`assets`, `static`, `images`); and KB vaults, whose Layer 1 file is `index.md` by
citation (KB spec §5) — detect a vault by `.obsidian/`, or by an `index.md` +
`sources/` pair. The parent directory holding the vaults still needs its own
`CONTEXT.md`.

There is **no exemption for single-file directories**. An exemption is a second rule,
and the cost it saves is five lines.

A `*-index.md` catalogue sitting beside a `CONTEXT.md` is correct and does not fail —
enumerating is not orienting.

## Credential sources

Defined in `spec/file-set.md`, *Credential sources*. **Conditional** — a project that
consumes no credentials is not in scope and passes by not applying.

| id | Check | Measured by | Severity |
|---|---|---|---|
| `credential-source-declared` | A project that consumes credentials names its retrieval path in `AGENTS.md` | `AGENTS.md` asserts where this project's credentials come from **and** which entry in the index is its own. A pointer to the shared guide alone is **WARN** — it proves a line was pasted, not that this project's keys can be found | WARN |
| `credential-source-resolves` | The declared path exists | `ls` the pointed-to file. A pointer that does not resolve is the original failure with a citation | WARN |
| `credential-source-not-stale` | The declaration does not point at a known-superseded source | match against the estate's stale-source list (see below). A **partly** correct declaration — naming a live source *and* a dead one — fails this, and is the case a pointer-existence test cannot catch | WARN |
| `no-key-names-in-layer-0` | `AGENTS.md` does not enumerate key names or values | a declaration names a path, never an inventory. Match `SCREAMING_SNAKE` identifiers ending `_KEY`/`_SECRET`/`_TOKEN`/`_PASSWORD`/`_DSN` | WARN |

🔴 **These checks read orientation files only. They MUST NOT open, probe or enumerate
any `.env*` file or credential store** — not to confirm a project "really has"
credentials, for no reason. Consumption is inferred from source code and from the
*existence* of an env file, never its contents. An audit that reads secrets to verify
they are documented has become what the control exists to prevent.

**Determining "consumes credentials".** A credential-bearing environment read in the
project's own code (`process.env.X`, `import.meta.env.X`, `Deno.env.get`), or a live
`.env*` on disk. Three exclusions, each of which produced a false positive on
2026-09-21:

- 🔴 **A credential file need not be named `.env*`.** Found 2026-09-21: one project
  read a `service_role_key` from a `scan-config.json` — gitignored, with a
  committed `.example` sibling. A detector looking only for `.env*` misses this whole
  class. Treat a **gitignored `*config*.json`/`*secret*.json` that has a committed
  `.example` twin** as a consumption signal. Detect by **filename and gitignore status
  only — never by opening the file.**
- **Prune nested child projects.** Without it a hub inherits every child's signal and
  scores as a consumer on code it does not own.
- **Exclude non-credential variables** — `NODE_ENV`, `CI`, `PORT`, `npm_*`, binary
  paths such as `PW_EXECUTABLE_PATH`. These are configuration, not secrets.
- **Skip test files.** The first cut flagged the secret guard's own test file
  on a fixture string — firing on the secrets tooling's own test suite.

**Promotion to FAIL.** These ship at WARN. Measured 2026-09-21: **15 of 27 projects
consume credentials, 3 declare, 12 are silent** — so this fired on 12 real projects in the reference estate.
Promote to FAIL only after the backfill, and only after confirming the WARN pass
returned no false positives. **Precedent:** the `skills-health` "referenced scripts
exist" check returned 9 hits on its first cut, **6 of them wrong** — a check that is
two-thirds noise trains everyone to ignore it, including when it is right.

**`no-key-names-in-layer-0` ships at WARN, and it was measured before shipping.** It
fired on **one** project in the reference estate, whose Layer 0 file
enumerates five key names including `SUPABASE_SERVICE_ROLE_KEY` and
`POSTHOG_PERSONAL_API_KEY`. Key *names*, not values — nothing is disclosed — but it is
the inventory pattern the spec forbids, and it is a second copy that will drift. It
would have shipped as a FAIL against a project that had no warning, which is why the
check was run before it was rated rather than after.

⚠️ **Known scope limit.** This check is scoped to MWP projects, so it cannot reach a
credential-consuming project that never adopted MWP. On 2026-09-21 that project had
7 mapped credentials and no `CONTEXT.md`, making it invisible here. Such projects need
`leaf-file-set` first.

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
| `relocation-declared` | `AGENTS.md` declares the location | grep it for `workspace-docs`; every agent reads `AGENTS.md`, so all see the one declaration | FAIL |
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

## Shared session memory (every project with a `memory.md`)

Defined by `spec/session-memory.md` (default since 2026-10-05); no change to the required root file set.

| id | Check | Measured by | Severity |
|---|---|---|---|
| `shared-memory-adopted` | A project with a `memory.md` declares a `## Shared Memory` section in its Layer 0 (public repo: once the opt-in PR merges) — absent means not yet migrated | grep Layer 0 | WARN |
| `shared-memory-routing` | Where declared, Layer 0 names protocol, bridge and durable destinations | Resolve each declared path | FAIL |
| `shared-memory-provenance` | Durable learning distinguishes evidence from hypothesis | Read changed claims and cited sources | FAIL |
| `shared-memory-bridge-budget` | Bridge stays within its word budget and carries authority/as_of | Count words; inspect frontmatter | WARN |
| `shared-memory-single-authority` | Conflicting legacy claims are reconciled or explicitly pending | Compare relevant legacy entries and canonical pages | FAIL |
| `shared-memory-recall-trial` | A pilot of a change to the protocol records structural checks and fresh-session recall separately (not required per adopting project) | Inspect recorded agent trials and evidence | WARN |

## File ceilings

| id | Check | Measured by | Severity |
|---|---|---|---|
| `claude-md-reasoning-test` | Every line in canonical Layer 0 serves routing — nothing else (the Reasoning Test, `spec/layers.md`) | manual, at review time | WARN |
| `non-negotiables-exists` | `NON-NEGOTIABLES.md` exists for every project carrying `AGENTS.md` | `ls` | FAIL |
| `non-negotiables-forced-open` | `AGENTS.md` names `NON-NEGOTIABLES.md` as a first read | grep the line under the identity for "Read `NON-NEGOTIABLES.md`" | FAIL |
| `non-negotiables-reasoning-test` | Every rule in `NON-NEGOTIABLES.md` is genuinely project-wide, not workspace-specific content that drifted in | manual, at review time | WARN |
| `context-md-ceiling` | Workspace `CONTEXT.md` ≤ 150 lines | `wc -l` | WARN |
| `context-md-no-status` | A CONTEXT.md holds no status or next-steps section and no folder tree | grep `^## .*(status\|current state\|next)` and `[├└]──` | WARN |
| `context-md-purpose-line` | A CONTEXT.md opens (after its title) with one sentence saying what the folder is for | first non-blank line after the `#` title is prose, not a heading or table | WARN |
| `reference-ceiling` | Reference file ≤ 300 lines | `wc -l` | WARN |
| `devlog-budget` | `DEVLOG.md` ≤ 2,500 words; older one-line entries moved to `DEVLOG-archive.md` (`spec/session-memory.md` § History budget) | `wc -w` | WARN |

`context-md-ceiling` and `reference-ceiling` are numeric budgets, not limits — a breach is a
WARN, not a FAIL. Record a deliberate breach in `known-exceptions.md` so the next audit does not
re-raise it. `claude-md-reasoning-test` replaces the old `claude-md-ceiling` (`CLAUDE.md` ≤ 50
lines) and is **not** numeric: `spec/principles.md` bounds AGENTS.md by function instead of line
count, because it is the only file guaranteed to load every session. Measured 2026-09-22 against
every `AGENTS.md` in the estate before the replacement: the old check failed 27 of 33 files.

`non-negotiables-exists` and `non-negotiables-forced-open` are FAIL, not WARN, because a
`NON-NEGOTIABLES.md` that exists but isn't pointed to from `AGENTS.md` is silently inert — it
becomes ordinary on-demand Layer 3 material, exactly the failure mode `spec/layers.md` §
NON-NEGOTIABLES.md exists to prevent.

## Capability register

| id | Check | Measured by | Severity |
|---|---|---|---|
| `capability-register-reachable` | If the workspace keeps a capability register (`agent-behaviour.md` §4, "Handing a task to the user"), an auto-loaded instruction file points to it | grep the workspace root `AGENTS.md` (and the machine's global config) for the register's path | WARN |
| `capability-register-evidence` | Every agent-✅ or user-❌ row in the register carries evidence (what proved it, and when) | manual, at review time — a row with an empty evidence cell fails | WARN |

## Project-layer delivery

| id | Check | Measured by | Severity |
|---|---|---|---|
| `project-layer-delivered` | Where sessions launch from a parent directory, the harness delivers each project's `AGENTS.md` chain on the first tool call of *any* kind that touches the project — not only file-tool reads (`spec/layers.md` § "Consequence: a project file below the launch point is lowest-reliability") | from the launch directory, touch a project only through a shell command; the project's `AGENTS.md` must arrive in that turn | WARN |

## Duplication

| id | Check | Measured by | Severity |
|---|---|---|---|
| `no-rule-outside-spec` | No file outside `spec/` states a rule `spec/` owns | manual, at review time | WARN |
| `no-duplicate-spec-file` | No second copy of a spec file anywhere in the workspace | plain `grep -rln` on a distinctive line from each spec file | FAIL |
| `no-check-defined-outside-checklist` | No skill, guide or template defines its own check table or check ids | grep skill `SKILL.md` / `GUIDE.md` for check tables. A skill cites ids from this file; it never restates a pass condition or severity | FAIL |

`no-duplicate-spec-file` is the check that would have caught `folder-architecture.md`
living in three places. Run it with plain grep, per **How to measure**.

`no-check-defined-outside-checklist` is the one that would have caught the id
collision described under **Identifiers**. `mwp-health` carried its own `M1–M10` /
`S1–S8` / `D1` tables in both `SKILL.md` and `GUIDE.md`, with a note telling the
reader that "the checklist wins" — an instruction to reconcile by hand is not a
control. The tables were removed 2026-09-09.
