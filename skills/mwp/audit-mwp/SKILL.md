---
name: audit-mwp
description: Audit an existing project's MWP structure against the framework principles. Use whenever a user wants to check if their project follows MWP correctly, review their CLAUDE.md, AGENTS.md, agent-roles.md, CONTEXT.md, or memory.md files for compliance, or says /audit-mwp. Trigger even if the user says "is this set up right?" or "check my MWP files".
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Audit an existing project's MWP structure against the framework principles.

## Steps

1. **Read the following files** if they exist:
   - CLAUDE.md
   - AGENTS.md
   - agent-roles.md
   - memory.md
   - CONTEXT.md in each workspace folder

2. **Load the conformance checklist** from
   `~/.claude/mwp-spec/conformance/checklist.md`. It is the single
   source of what to test and, critically, **how to measure each check** — several
   obvious measurements return a confident pass from the wrong baseline. Follow its
   "How to measure" section exactly; do not substitute a check that looks equivalent.

   Then load `~/.claude/mwp-spec/conformance/known-exceptions.md`.
   **A violation listed there is a settled decision, not a finding.** Reporting it
   anyway trains the reader to skim, which is how a real finding gets missed.

   Load a `spec/` file only when a check needs its detail — start at `~/.claude/mwp-spec/spec/CONTEXT.md`.

3. **Run the checklist's checks.** Every mechanical check — file presence, casing,
   the 8 `CLAUDE.md` components, ceilings, metadata, public-repo controls — is defined
   in `checklist.md` with its id, measurement and severity.

   **Do not restate them here.** This skill cites ids; it does not define checks. A
   check that lives in a skill is unspecified by the checklist's own terms, and two
   skills numbering their own checks is what produced an id collision this
   framework had to unpick. See `no-check-defined-outside-checklist`.

   Report findings by slug, e.g. `leaf-file-set`, `adapter-casing`, `claude-md-ceiling`.

4. **Then apply judgement.** The checklist covers what can be measured. This skill's
   distinct value is the part that cannot be — read
   `~/.claude/mwp-spec/conformance/common-mistakes.md`, then assess:

   **CLAUDE.md** — Is the routing table *complete*: does every task type someone
   actually performs have a row, and does every row point somewhere that exists? Does
   the file contain anything that belongs in a directory `CONTEXT.md` instead?

   **Directory CONTEXT.md files** — Does each describe purpose, process,
   inputs/outputs, tools and constraints? Is each scoped to its own directory, with no
   content that belongs to a sibling?

   **memory.md** — Does it reflect current project state, or has it gone stale? Does
   it hold only what *cannot* be derived by reading the files — no architecture, no
   process flows, no API documentation?

   **Structure** — Are reference files in a dedicated directory rather than loose at
   root? Are archive and historical files excluded from active loading?

   **AGENTS.md / agent-roles.md** — Is `AGENTS.md` a lightweight adapter pointing at
   `CLAUDE.md`, or has it accumulated duplicated routing? Where `agent-roles.md`
   exists, is it confined to roles, capabilities, boundaries, inputs/outputs and
   handoffs?

   A judgement finding is reported as such, not dressed as a check id.

5. **Report findings** in three categories:
   - Missing — components or files that should exist but do not
   - Misplaced — content in the wrong file or location
   - Oversized — files exceeding their ceiling with notes on what to cut

## Rules
- Do not modify any files during an audit — report only.
- Flag issues by file and section, not just generally.
- **Never define a check here.** Cite an id from `checklist.md`. If a needed check does not exist, add it there first.
- A check you did not run is reported as SKIPPED with the reason. Omitting it reads as a pass.
