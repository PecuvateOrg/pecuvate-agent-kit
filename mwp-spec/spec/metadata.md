# MWP — Document Metadata

Frontmatter fields, which document types carry which, and why.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## Document Metadata

[principles.md](./principles.md) says outdated documentation is worse than none, because Claude acts on
it with confidence. [layers.md](./layers.md) says the same of memory: staleness produces false
confidence. Both
state the consequence. Neither gives Claude a way to *detect* the condition before
acting.

That gap is structural, not a discipline failure. **A document describing a proposed
change and a document describing current reality are indistinguishable at a glance,
and often indistinguishable after reading in full.** A spec titled "Enquiry Form" may
describe a form that shipped months ago or one that was never built. Nothing in the
file necessarily says which, and Claude has no way to ask.

The cost is not theoretical. A survey of planning documents across several real
projects found dozens of documents using many different status vocabularies —
`proposed, not yet applied`, `applied <date>`, `Ready to build`, `Approved`,
`Accepted`, `Awaiting client review`, `Not started`, and more — with the majority
carrying no status field at all. There was no way to answer "does this describe
something that exists?" by grep, by convention, or by inspection.

### Three fields, three independent axes

These are not one stamp applied uniformly. Each answers a different question, and a
document takes only the fields whose question applies to it.

| Field | Question it answers |
|---|---|
| `status:` | Does the thing this describes exist yet? |
| `visibility:` | Who may read this? |
| `authority:` + `as_of:` | Who owns this fact, and when was it last true? |

**`visibility:`, `authority:` and `as_of:` are best defined by whatever knowledge-base
or wiki framework you run alongside MWP, if you have one — this spec does not
restate their permitted values.** That other spec should be their single definition;
this section governs only which MWP document types carry them. A vocabulary written
down in two places is two vocabularies — the same drift that motivates the "one
definition, cited not copied" rule in [CONTEXT.md](./CONTEXT.md) applies here too.

`status:` is the deliberate exception, and the reason is worth stating so nobody
"harmonises" it later. A knowledge-base's own content-trust vocabulary — if you use
one, e.g. `current | draft | stale` — answers *is this page's content still
trustworthy?* A spec asks a different question: *does the thing this describes exist
yet?* Same field name, different axis, so the values cannot transfer. MWP documents
use the Architectural Decision Record vocabulary instead:

```
status: proposed | accepted | applied <YYYY-MM-DD> | superseded by <path> | deprecated
```

`accepted` means decided but not built; `applied` means built, and carries the date.
ADRs use every value except `applied`. A terminal state — `applied` or `superseded` —
must carry its date or its target, because a terminal state with neither is the exact
shape of the stale cross-reference this section exists to prevent.

### Which documents carry which

The discriminator for `status:` is a single question: **does this document describe a
proposed change to the world, or does it describe the world?** Only the first kind has
a lifecycle worth recording.

| Document type | `status` | `authority` / `as_of` | `visibility` |
|---|:--:|:--:|:--:|
| `planning/specs/` | ✅ | — | ✅ |
| `planning/decisions/` (ADR) | ✅ | — | ✅ |
| Page blueprints, phase plans | ✅ | — | ✅ |
| `CONTEXT.md` (root and workspace) | ❌ | if it quotes live system state | ✅ |
| Reference files, guides | ❌ | if they quote live system state | ✅ |
| Registries | ❌ | ✅ — this is what a registry *is* | ✅ |
| `DEVLOG.md` | ❌ | — | internal by definition |
| `memory.md` | ❌ | ✅ — its content is entirely volatile | internal by definition |

`status:` on a `CONTEXT.md` is noise that rots faster than the file it labels: a
workspace description always describes now, so the field can only ever say `current`
and will be wrong the moment it does not. Adding a field that cannot be false adds
cost and removes nothing.

The ADR vocabulary above is an external convention that predates this framework and
is commonly already in partial use — `Accepted` is a familiar word in most decision
logs. Adopt it rather than substituting local wording.

### Classification is not enforcement

`visibility: internal` records what a document *is*. It does not prevent anyone
reading it.

In a private repository the distinction rarely bites, because the boundary is the
repository itself. In a public repository the field is a label on something already
published, and a consumer that filters on it — a chat widget reading a knowledge
base, for instance — has no equivalent for a file served by a public host to anyone
who asks.

**Where exposure actually matters, the field finds what should move; a physical split
plus `.gitignore` is what stops it coming back.** The two are complementary and
neither substitutes for the other. If your workspace has its own public-repo
collaboration conventions doc, follow it.

### The metadata test

Before adding a field, ask: **can this field ever be false?** A `status:` that can only
say `current` fails the test and should be omitted. An `as_of:` on a document that
quotes a live system passes it — the date is exactly the thing that goes stale, and
recording it is what lets a later reader distrust the content without re-deriving it.

Before trusting a document, ask the inverse: **if this were stale, how would I know?**
Where the answer is "I would not", the document needs a field, not a closer reading.

---
