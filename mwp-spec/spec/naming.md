# MWP — Naming Conventions

Filenames and identifiers across every MWP project.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## Root files

Fixed by [file-set.md](./file-set.md), including casing. Not a project's choice.

## Directories

Lowercase kebab-case: `planning/`, `ops/`, `src/`, `workspace-docs/`.

A `workspace-docs/<name>/` directory is named after the **repository**, not the
working directory. In the reference estate, four of six child repos have a directory name that differs
from their repo name; naming by directory would have made the mapping unguessable.

## Directory orientation

A directory's orientation file — what this directory holds, and where to go next —
is `CONTEXT.md`. There is no second valid name. Not `index.md`, not `00-index.md`,
not `README.md`.

This is a naming rule, not a content rule. A file that orients a directory perfectly
well under another name is still misnamed. One name means a reader never has to guess
which file to open, and a check can test for it without maintaining a list of accepted
alternatives — that list is where the drift starts.

`README.md` is not an alternative. It is a root file fixed by
[file-set.md](./file-set.md), addressed to a human arriving at a repository. It sits
alongside `CONTEXT.md` and never substitutes for it.

**`index` is reserved for catalogues.** A `*-index.md` enumerates items —
`skills/skills-index.md` lists every skill. Enumerating is not orienting: such a file
sits *beside* that directory's `CONTEXT.md`, never instead of it, and must not be
renamed to `CONTEXT.md` on the strength of the rule above.

**KB vaults are outside this rule, by citation.** An Obsidian vault's Layer 1 file is
`index.md`. The KB spec §5 places it in "the MWP `CONTEXT.md` slot" and keeps the
different name deliberately: the vault's answer to "what is here" is a catalog of
atomic pages, and the file doubles as the Obsidian graph's home note. The name is
load-bearing there — `[[index]]` wikilinks resolve to it and the tool treats it as the
entry point. MWP cites that decision rather than overriding it, on the same footing as
the fields listed under "Citing outside this directory" in [CONTEXT.md](./CONTEXT.md).

## Documents

| Kind | Pattern | Example |
|---|---|---|
| Spec | `feature-name_spec.md` | `patron-enquiry-form_spec.md` |
| Decision record | `YYYY-MM-DD-decision-title.md` | `2026-05-19-tech-stack.md` |
| Directory orientation | `CONTEXT.md` | one per directory — see *Directory orientation* above |
| Runbook | `verb-the-noun.md` | `add-a-tier.md` |

Never create a flat `.md` inside a workspace directory where a subdirectory with its
own `CONTEXT.md` is the pattern. `planning/SPEC.md` is wrong; `planning/spec/CONTEXT.md`
is correct.

## Code

Language and framework conventions win — they are external standards with more
users than this one. Where a project has no external convention to follow:

| Kind | Pattern |
|---|---|
| Components | `PascalCase.tsx` |
| Route folders | `kebab-case/` |
| Tests | `feature-name.test.ts` |
| Everything else | `kebab-case` |

---

## The naming test

**Can two different files collide under this name on a case-insensitive filesystem?**
If yes, the convention is unsafe regardless of how it reads. Every machine in this
estate is case-insensitive; a rule that only holds on Linux does not hold.
