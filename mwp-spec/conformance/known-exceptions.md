# MWP — Known Exceptions

Deliberate deviations from the standard. Each has a reason and a date.

**An audit must read this before reporting a violation.** Without it, every audit
re-raises the same settled decisions, and the noise trains people to skim the
output — which is how a real finding gets missed. This file is the difference
between a checker that is trusted and one that is ignored.

An entry here is not permission to drift. It is a decision, recorded, that can be
revisited. An undated entry, or one with no reason, is not an exception — it is a
violation someone silenced.

**This file starts empty in a fresh project.** Entries get added only when your
team deliberately accepts a real, specific deviation from spec for a real project.
The example below shows the expected format — delete it once you have real entries.

---

## Format

```
### <path> — <rule id>
**Since:** YYYY-MM-DD
**Reason:** why the standard does not fit here
**Revisit:** the condition under which this should be reconsidered
```

---

## Example (delete once you have real entries)

### `acme-storefront/` — `adapter-casing` (root Layer 0 file casing)
**Since:** 2026-01-15
**Reason:** This project's Layer 0 file is lowercase `claude.md`. It is tracked that
way and the repo is public with external collaborators; renaming changes a path
outsiders may already reference. Casing of `claude.md` does not carry the
`AGENTS.md` / `agent-roles.md` collision risk that `adapter-casing` exists to
prevent, since no second file competes for the name.
**Revisit:** if the repo is ever renamed or its history rewritten for another reason.
