# conformance/

How the standard in `spec/` is checked.

**These files do not define rules.** A rule stated here and not in `spec/` is out of
date. When a spec rule changes, the matching check here changes in the same commit —
an unenforced rule decays.

| File | Contents | Read when |
|---|---|---|
| `checklist.md` | Every rule `/audit-mwp` and `/mwp-health` must test, and the baseline each is measured against | Running or writing an audit |
| `known-exceptions.md` | Deliberate deviations, already decided | Before reporting anything as a violation — an entry here is a settled decision, not a finding |
| `common-mistakes.md` | Failures that need judgement rather than a check | Reviewing a project by hand |

Read `checklist.md`'s **How to measure** section before running any check. Several
obvious measurements return a confident pass from the wrong baseline — a branch
compared against its own remote, `git check-ignore` on a still-tracked path, an admin
querying branch rules they personally bypass.
