---
name: mwp-health
description: Workspace-wide MWP structural compliance scanner — outputs a PASS/WARN/FAIL table per project plus a prioritised migration plan. Use when the user wants to audit MWP compliance across the workspace, check if projects follow the correct structure, see what needs migrating, or says /mwp-health. Can also be invoked by another orchestrator skill in your own setup that passes a project path.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Workspace-wide MWP structural compliance scanner — checks every project for structural correctness and outputs a compliance table plus migration plan.

Reference guide: `GUIDE.md` (same folder as this file)

---

## State Detection

Determine scan mode from the invocation:

- **No argument** → Workspace scan. Read your workspace's root index file — the file at your workspace root that lists all your projects (often called `CONTEXT.md`, sometimes something else). If it isn't obvious which file that is, ask the user for the workspace root and how projects are listed there. Run checks on each project found.
- **Path argument provided** → Single-project mode. Run checks on that directory only. Used when called by another orchestrator skill in your own setup, or by `/audit-mwp`.

---

## Steps

### 1. Discover projects

**Workspace mode:** Read your workspace's root index file (see State Detection above). Extract every project path listed there. Skip entries explicitly marked "not yet started".

**Single-project mode:** Use the provided path directly. Skip discovery.

### 2. Detect project type per project

Type decides which checklist sections apply. Determine it by inspecting what exists:

| Type | Detection signals |
|------|-------------------|
| **Web App** | `src/` directory exists, OR `netlify.toml` present, OR `src/package.json` exists, OR `src/next.config.ts` exists |
| **CMS** | `sanity.config.ts` present, OR a `schema/`, `schemaTypes/` or `studio/` directory exists |
| **Automation/Workflow** | `integrations/` or `workflows/` directory exists; no `src/` |
| **Unknown** | None of the above |

Match CMS on **any** of its signals — an exact-dirname test for `schema/` alone
misses real Sanity projects, which commonly use `schemaTypes/`.

**Unknown is not a skip.** Every section except *Web application layout* still
applies. A framework or tooling project with undocumented subdirectories must not
pass merely because it has no `src/`.

### 3. Run the conformance checks

**The check set lives in `~/.claude/mwp-spec/conformance/checklist.md`. This
skill does not define checks and must not restate them** — no tables, no pass
conditions, no severities. Restating them here is what produces id collisions —
this file once carried its own check tables that collided with the checklist's own ids.

Read, in order:

1. **`~/.claude/mwp-spec/conformance/checklist.md`** — every check, its id, how it is measured, and its
   severity. Read the **How to measure** section before running anything. Several
   obvious measurements return a confident pass from the wrong baseline: a branch
   compared against its own remote rather than `origin/main`; `git check-ignore` on a
   still-tracked path; an admin querying branch rules they personally bypass.
2. **`~/.claude/mwp-spec/conformance/known-exceptions.md`** — an entry there is a settled decision, not a
   finding. Re-raising it every run teaches the reader to skim the output, which is
   how a real finding gets missed.

Load a `spec/` file only when a check needs its detail — start at `~/.claude/mwp-spec/spec/CONTEXT.md`.

Which sections apply:

| Checklist section | Applies to |
|---|---|
| Root files and structure | every project |
| Web application layout | Web App type only |
| Public repositories | projects whose repo is public |
| Metadata | every project |
| Ceilings | every project |
| Duplication | the workspace once, not per project |

### 4. Build compliance report

Report findings by **slug**. A slug says what failed without a lookup; a number does
not, and this kind of numbering collision has happened in practice when two skills
numbered their own checks independently.

For each project:

```
MWP Health: <project-name>
Type: <detected type>
Path: <relative path from your workspace root>

| Check                  | Result | Notes                                   |
|------------------------|--------|-----------------------------------------|
| leaf-file-set          | FAIL   | missing agent-roles.md, skills.md       |
| adapter-casing         | PASS   |                                         |
| directory-orientation  | WARN   | supabase/ has no CONTEXT.md             |
...

Overall: FAIL  (1 FAIL, 1 WARN, 5 PASS)
```

Then a workspace summary, worst-first:

```
Workspace MWP Health Summary — <date>

| Project                                  | Type       | FAILs | WARNs | Overall |
|-------------------------------------------|------------|-------|-------|---------|
| example-project-a                        | Web App    |   2   |   0   | FAIL    |
| example-project-b                        | Web App    |   0   |   1   | WARN    |
...

Total: X projects — Y FAIL, Z WARN, N PASS
```

### 5. Generate migration plan

For each project with findings:

**Priority 1 — FAILs.** State the exact change required. For `src-layout` migrations
refer to the migration steps in GUIDE.md.

**Priority 2 — WARNs.** State the recommended action.

Group by root cause where several projects share one. A single fix applied 12 times
is one plan item, not twelve.

---

## Rules

- Never modify any files — this skill reports and plans only. Use `/update-mwp` to apply doc fixes.
- **Never define a check here.** Cite an id from `checklist.md`. If a needed check does not exist, add it to `checklist.md` first — a check that lives only in a skill is unspecified by that file's own terms.
- **A check you did not run is reported as SKIPPED, with the reason.** Omitting it reads as a pass. If time or scope forces a partial run, say which sections were not executed.
- Skip projects marked "not yet started" in your workspace's root index file.
- Report every finding including minor WARNs — never suppress.
- In single-project mode, run every applicable section — do not skip steps.
- When called from another skill with a path argument, return findings as a labelled block that the calling skill can merge into its own report.
