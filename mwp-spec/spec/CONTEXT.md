# The MWP Standard — Index

**This directory is the only normative source for the Model Workspace Protocol.**
Nothing outside `spec/` defines the standard. A guide, skill, template or project
file that states a rule is either citing this directory or is out of date.

MWP is also published academically as **ICM** (Interpretable Context Methodology).
Same framework, two names — see [../docs/icm-paper.md](../docs/icm-paper.md). There
is no second standard to reconcile.

---

## The standard

| File | Governs | Read when |
|---|---|---|
| [principles.md](./principles.md) | Aims, token awareness, file ceilings, session discipline, content quality | Deciding whether something belongs in a file at all |
| [layers.md](./layers.md) | The context hierarchy and each file type's cost profile | Deciding *which* file something belongs in |
| [session-memory.md](./session-memory.md) | Opt-in shared recording, recall and vault routing | Adopting cross-agent session memory |
| [file-set.md](./file-set.md) | Which files a project carries, hub vs leaf, casing | Scaffolding or auditing a project root |
| [naming.md](./naming.md) | Filenames and identifiers | Creating any new file |
| [metadata.md](./metadata.md) | Frontmatter fields and which documents carry them | Creating or trusting a document |
| [workspaces.md](./workspaces.md) | How the hierarchy is shaped per kind of work | Designing a project's internal structure |
| [project-types.md](./project-types.md) | The project types and skill routing | Choosing how to initialise a project |

Conformance rules live in [../conformance/checklist.md](../conformance/checklist.md).
Deliberate deviations live in [../conformance/known-exceptions.md](../conformance/known-exceptions.md).
The failures that need judgement rather than a check live in
[../conformance/common-mistakes.md](../conformance/common-mistakes.md).

---

## One definition, cited not copied

Every rule has exactly one home. Other files point at it.

This is not stylistic. Duplication of this kind is a known failure mode for
documentation that spans a workspace — a rule copied into two or three places
starts identical and drifts the moment one copy is edited and the others are not.
The fix is a pointer, not a warning:

- A structural rule defined in three separate copies across a workspace — a
  project, a shared guides folder, and the framework spec itself — with all
  three tracked in git and all three divergent, and the workspace's own routing
  table pointing at the *least*-edited one.
- A required file set defined in three places that disagreed on the count. The
  majority was wrong, and every project scaffolded from those instructions
  started incomplete.
- A factual error that survived in five different files for weeks because a
  correction pass only checked three of them and recorded "all corrected".

A pointer is the cure, not the disease. What must never be duplicated is the
*definition*.

### Citing outside this directory

Two fields are commonly defined by an external convention rather than by this
spec:

- `visibility:`, `authority:`, `as_of:` — if you run a knowledge-base or wiki
  framework alongside MWP, define these there and have MWP cite that definition
  rather than restating it.
- `status:` — the Architectural Decision Record vocabulary, an external
  convention that predates this framework.

`status:` is deliberately **not** shared with a knowledge-base's own content-trust
vocabulary (if you have one, e.g. `current | draft | stale`, answering "is this
content trustworthy"). MWP documents answer a different question — "does this
thing exist yet". Same field name, different axis if both exist in your setup —
worth recording in both places so it does not get "harmonised" later.

---

## Changing the standard

1. Change it **here** first. A skill or guide changed ahead of the spec is a fork.
2. Update [../conformance/checklist.md](../conformance/checklist.md) in the same
   change, or the rule is unenforceable and will decay.
3. Sweep for existing violations with plain `grep -rn`. **Not** ripgrep or an
   editor's built-in search tool if it honours `.gitignore` — either can silently
   skip a nested project repo. A sweep that cannot see a project will report it
   compliant.
4. Fix what the sweep returns, not what you listed before running it.

Step 4 is the one that most often fails in practice. Verifying against a list you
wrote yourself confirms only that you fixed your list.
