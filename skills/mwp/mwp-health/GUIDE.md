# mwp-health — Workspace MWP Structural Compliance Scanner

Checks every project in the workspace against the MWP canonical structure and outputs a PASS/WARN/FAIL compliance table plus a prioritised migration plan.

---

## Overview

**What it does:**
Scans all projects discovered in your workspace's root index file (or a single project in single-project mode), detects the project type, runs the conformance checks, and produces a compliance report with a prioritised migration plan for anything that fails.

**When to use it:**
- When you want to see which projects across the workspace are out of compliance with MWP structure
- Before a major push to standardise the portfolio
- When starting work on a project and wanting a quick structural health baseline
- When called internally by a combined health-check orchestrator skill in your own setup, to contribute the structure layer of a wider health report

**When NOT to use it:**
- To audit MWP file *content quality* (routing table completeness, memory.md accuracy, oversized files) — use `/audit-mwp` for that
- To apply fixes — this skill is read-only; use `/update-mwp` to update MWP docs or the migration steps below for `src/` migrations

---

## Prerequisites

- Your workspace's root index file must be readable (workspace mode)
- The target project directory must exist and be readable
- `~/.claude/mwp-spec/conformance/checklist.md` must be readable — it is the check set

---

## Where the checks live

**This guide does not list the checks.** They are defined once, in
`~/.claude/mwp-spec/conformance/checklist.md`, with their ids, measurement and
severity. Read that file at run time.

This section used to hold a second copy of the check tables, keyed independently. Those
ids collided with the checklist's own ids, which mean entirely different
checks — and both schemes ended up cited in permanent records. Checks now use unique
slugs and are defined in exactly one place. See `checklist.md` →
`no-check-defined-outside-checklist`.

Related definitions owned elsewhere:

| Detail | Owner |
|---|---|
| The 8 required `CLAUDE.md` components, and what each is for | `~/.claude/mwp-spec/spec/layers.md` |
| Which files a project root carries, and their casing | `~/.claude/mwp-spec/spec/file-set.md` |
| Why a directory's orientation file is `CONTEXT.md` | `~/.claude/mwp-spec/spec/naming.md`, *Directory orientation* |
| Deliberate deviations already decided | `~/.claude/mwp-spec/conformance/known-exceptions.md` |

---

## Dual-Mode Usage

### Workspace scan (default)

```
/mwp-health
```

Reads your workspace's root index file, discovers all non-placeholder projects, runs all applicable checks, outputs the full workspace summary table and per-project reports.

### Single-project mode

```
/mwp-health path/to/your/project
```

Runs checks on that directory only. Returns findings in the same format. Used by a combined health-check orchestrator skill in your own setup (if you have one) to include structure checks in its combined health report.

When called by such an orchestrator, label all findings with prefix `X` (structure) so they slot into a combined health report table alongside other prefixed sections (e.g. D for docs, I for integration, S for security, U for UI) if your orchestrator uses that convention.

---

## Integration with Other Skills

### A combined health-check orchestrator (if you build one)

If your setup has an orchestrator skill that runs a full project health sweep, it can call `/mwp-health` in single-project mode alongside `/audit-mwp` and any deploy-security or UI-testing skills you have. The `X`-prefix findings from `/mwp-health` would appear as the Structure section in its combined health report.

To embed `/mwp-health` in such an orchestrator, add a step after its content-audit step:

> **Structure health — mwp-health**
> Invoke `/mwp-health` with the project path. Captures the *Root files and structure*
> and *Web application layout* sections of the conformance checklist.
> Label all findings with prefix `X` (structure).

### audit-mwp

`/audit-mwp` audits MWP file *content*. `/mwp-health` checks *structural presence*. They are complementary — run both for a complete picture. Both read the same checklist; neither defines its own checks.

---

## Migration Steps

### src/ migration (`src-layout`)

When a Web App project has application code at root instead of in `src/`:

1. **Confirm with the user** before touching any files — list what will move.
2. Create `src/` directory at project root.
3. Move these files/folders into `src/`:
   - `package.json` → `src/package.json`
   - `package-lock.json` → `src/package-lock.json`
   - `next.config.ts` (or `.js`) → `src/next.config.ts`
   - `tsconfig.json` → `src/tsconfig.json`
   - `.env.local`, `.env.example` → `src/`
   - `app/` → `src/app/`
   - `components/` → `src/components/`
   - `lib/` → `src/lib/`
   - `public/` → `src/public/`
   - `styles/` → `src/styles/` (if present)
4. Update (or create) `netlify.toml` at root with `base = "src"`.
5. Update `tsconfig.json` path alias: `@/*` must map to `"./*"` (not `"./src/*"`) since tsconfig is now inside `src/`.
6. Verify `src/CONTEXT.md` exists; create if missing.
7. Run `pnpm install` from `src/` to confirm the move is clean.
8. Commit as a single atomic commit: "chore: move Next.js project root into src/ per MWP structure".

### netlify.toml fix (`netlify-base`)

Canonical `netlify.toml` at repo root:

```toml
[build]
  base    = "src"
  command = "pnpm run build"
  publish = ".next"   # Netlify CI resolves publish relative to BASE (local CLI --build differs; deploy via GitHub)

[build.environment]
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

If `netlify.toml` exists inside `src/`, move it to root and update the `base` setting.

### Rogue CLAUDE.md or AGENTS.md in src/ (`no-src-adapters`)

Delete the file from `src/`. The root-level CLAUDE.md and AGENTS.md already cover all work in the project including `src/`-scoped sessions. No replacement file is needed in `src/` — only `src/CONTEXT.md` should exist there.

Check whether the file was generated rather than authored — Next.js scaffolding emits an `src/AGENTS.md` notice, which is how a project can acquire one without anyone writing it deliberately.

### Missing directory CONTEXT.md (`directory-orientation`)

For each flagged directory:
1. Create the directory if it does not exist (`planning/`, `ops/`).
2. Create `CONTEXT.md` inside it:
   - What this directory is for (one sentence)
   - Process steps
   - Inputs and outputs
   - Tools active here
   - Constraints specific to this directory

If the directory already orients via `index.md`, `00-index.md` or `README.md`, rename it to `CONTEXT.md` and update every reference — a second valid name is what the rule exists to prevent. KB vaults are excluded; their Layer 1 file is `index.md` by citation, if your workspace uses a knowledge-base convention that reserves that name.

---

## Debugging / Troubleshooting

| Symptom | Check |
|---------|-------|
| Project shows as Unknown type | No `src/`, `netlify.toml`, `integrations/`, `sanity.config.ts`, `schema/`, `schemaTypes/` or `studio/` found — check folder names match expected conventions. Unknown is not a skip: every section except *Web application layout* still applies |
| `claude-md-sections` reports sections missing despite them being present | Section headings may use non-standard wording — check CLAUDE.md manually against `~/.claude/mwp-spec/spec/layers.md` |
| `netlify-base` FAIL but netlify.toml exists | It may be inside `src/` — check path |
| Every project fails `leaf-file-set` | MWP files may never have been scaffolded — run `/init-mwp` then re-run `/mwp-health` |
| A combined health orchestrator is missing structure findings | It is not yet wired to call mwp-health — add the integration step above |
| `no-src-adapters` FAIL but files seem correct | Check `src/` subdirectory directly — CLAUDE.md or AGENTS.md may have been created by an MCP tool or auto-generated template |
| A check silently absent from the report | It was skipped, not passed. The skill must report skipped checks explicitly — treat a missing row as unverified |
