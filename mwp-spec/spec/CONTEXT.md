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
| [file-set.md](./file-set.md) | Which files a project carries, hub vs leaf, casing, **declaring a credential source** | Scaffolding or auditing a project root |
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

This is not stylistic. Duplication here has failed three times and been measured:

- `folder-architecture.md` existed in **three** copies — a project, a shared guides folder,
  and this directory — 78 identical lines, all three tracked, all three divergent, with
  the workspace routing table pointing at the *least* edited one.
- The file set was defined in three places that disagreed on whether it was 8 files or
  9. The majority was wrong, and every project scaffolded from those skills started
  incomplete.
- A factual error survived in **five** files for 25 days because the correction pass
  enumerated three of them and recorded "all three corrected".

A pointer is the cure, not the disease. What must never be duplicated is the
*definition*.

### Citing outside this directory

Two fields are defined elsewhere on purpose:

- `visibility:`, `authority:`, `as_of:` — your knowledge-base framework's spec, if you run
  one (see `metadata.md`). MWP cites them; it does not define them.
- `status:` — the Architectural Decision Record vocabulary, an external convention.

`status:` is deliberately **not** shared with the KB spec, which uses
`current | draft | stale` to answer "is this content trustworthy". MWP documents
answer "does this thing exist yet". Same field name, different axis — recorded in
both specs so it does not get "harmonised" later.

---

## Changing the standard

1. Change it **here** first. A skill or guide changed ahead of the spec is a fork.
2. Update [../conformance/checklist.md](../conformance/checklist.md) in the same
   change, or the rule is unenforceable and will decay.
3. Sweep for existing violations with plain `grep -rn`. **Not** ripgrep or the Grep
   tool — both honour `.gitignore` and silently skip every nested project repo in
   this workspace. A sweep that cannot see a project will report it compliant.
4. Fix what the sweep returns, not what you listed before running it.

Step 4 is the one that has failed. Verifying against a list you wrote yourself
confirms only that you fixed your list.
