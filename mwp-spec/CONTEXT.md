# mwp-spec/ — The MWP Standard (Public Export)

This is a public export of Pecuvate's internal MWP (Model Workspace Protocol)
Framework specification. It is the standard that the skills in `skills/mwp/`
implement. Company-specific examples from the internal version have been
genericized to a placeholder organisation — "Acme Corp" (a parent hub) and
"Acme Widgets" / "Acme Mobile" (its child projects) — wherever the original
used a real internal example.

This directory is meant to be installed at `~/.claude/mwp-spec/` (see this
repo's `INSTALL.md`). Every shipped skill reads from that path, not from this
repo's own location, once installed.

---

## Layout

| Directory | What it is | Read when |
|---|---|---|
| `spec/` | **The normative definition.** The only source of truth for what MWP requires — file sets, naming, layering, tokenomics, metadata. Everything else in this directory, and every skill in this kit, cites `spec/` rather than restating it. | Deciding what MWP requires |
| `conformance/` | What an audit checks, and how. `checklist.md` is the check set `/audit-mwp` and `/mwp-health` read; `known-exceptions.md` is where your team records a deliberate, accepted deviation from spec for a real project (it starts empty — see below); `common-mistakes.md` covers the failures that need judgement rather than a mechanical check. | Running an audit, or reviewing a project by hand |
| `templates/` | Starting shapes for each MWP file — not fill-in-the-blank forms. The `init-mwp-*` skills read these and generate contextually accurate content from them. | Writing or reviewing a file template |
| `docs/` | Theoretical background — the academic paper behind MWP (published under its second name, ICM). Not normative, not loaded at session start. | Understanding why the standard is shaped this way |

**Start at [spec/CONTEXT.md](./spec/CONTEXT.md).** That file is the actual
entry point to the standard's content — it indexes every normative file and
states the "one definition, cited not copied" rule that keeps the standard from
drifting into disagreeing copies of itself.

---

## Recording your own exceptions

`conformance/known-exceptions.md` ships with one fictional worked example (an
"Acme Widgets" repo keeping a lowercase root file for a stated reason) showing
the expected format. Delete that example once your team has a real, specific,
dated exception of its own to record. An audit reads this file before reporting
anything as a violation — an entry here is a settled decision, not a finding.

---

## Keeping this in sync with your own conventions

If your workspace already has its own conventions docs (a stack guide, a
deployment guide, a documentation-practice guide, and so on), the skills in
this kit will use them where they exist and fall back to a sensible generic
default where they don't — see each skill's `SKILL.md` for the specific
defaults. This spec does not require you to adopt any particular set of
workspace-wide guides; it only requires the file set, naming and layering
rules in `spec/` to hold.
