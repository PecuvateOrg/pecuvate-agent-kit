# MWP — Layers and File Tokenomics

The context hierarchy, and the cost profile of each file type in it.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## The Five-Layer Context Hierarchy

Folder structure replaces framework-level orchestration. Context is delivered in
layers; each layer answers one question. Claude reads them in order and loads only
what the current task requires. No agent reads everything.

| Layer | File / Location | Question it answers | Approx. size |
|---|---|---|---|
| **0** | `AGENTS.md` | Where am I? What are the rules? | ~800 tokens |
| **1** | `CONTEXT.md` (project root) | Where do I go? What does this project contain? | ~300 tokens |
| **2** | `stages/NN_name/CONTEXT.md` | What do I do at this step? | 200–500 tokens |
| **3** | `config/`, `references/`, `shared/` | What stable rules and conventions apply? | 500–2k tokens |
| **4** | `output/`, working files | What am I working with right now? | varies |

### Layer 3 vs Layer 4

The distinction is whether the content changes between runs.

| | Layer 3: Reference | Layer 4: Working |
|---|---|---|
| **Changes between runs?** | No | Yes |
| **Examples** | `voice.md`, `design-system.md`, `conventions.md` | Drafts, research output, build artifacts |
| **Model should** | Internalise as constraints | Process as input |
| **Configured during** | Project setup, once | Each session or run |
| **Analogy** | The recipe | The ingredients |

### Stage contracts

Projects with a multi-step workflow — pipelines, content production, CRM processes —
add Layer 2. Each stage is a numbered directory holding its own contract:

```text
stages/
  01_research/
    CONTEXT.md         Layer 2: what this step is and what "done" means
    references/        Layer 3: stable rules that apply only in this stage
```

A stage's `CONTEXT.md` costs nothing until Claude enters that stage. This makes it
the most token-efficient file type in the system: its cost is always proportionate
to its use.

Not every project has stages. Add Layer 2 only where work genuinely moves through
ordered steps — a project without a pipeline gains nothing but indirection.

### Load Timing

The table above says Claude "reads them in order" — but layers do not all reach the agent the
same way. Two channels, not one:

- **Auto-loaded**: the launch directory's own `AGENTS.md` and every ancestor directory's
  `AGENTS.md` are injected automatically at session start, without the agent choosing to read
  them.
- **Read-triggered**: everything else — including a `AGENTS.md` that lives *below* the launch
  directory — loads only when the agent reads a file there. A mid-session `cd` does **not**
  inject that directory's `AGENTS.md`; nothing does, until the agent reads something inside it.

**Observed in session, 2026-09-22:** launched at `~/`, two Bash calls returned nothing extra.
The turn that read a spec file two directories below the
launch point carried system-reminders injecting **both** the workspace root's and that
framework folder's Layer 0 file in the same turn: the ancestor chain of the file
just read, not the launch directory's chain. This confirms the read-triggered half directly,
rather than from vendor docs.

**Not yet tested: whether starting a session *inside* a project injects that project's own
`AGENTS.md` at launch.** Inferred yes from the mechanism above (discovery runs cwd-upward at
startup) — but inferred, not observed. Do not upgrade this to confirmed until a session has
actually been started inside a project and turn one checked.

#### Consequence: a project file below the launch point is lowest-reliability

Apply the reliability ranking in [agent-behaviour.md](./agent-behaviour.md) to the two channels.
A workspace launched from a parent directory (the normal case: one session, many projects) puts
every project's `AGENTS.md` on the **read-triggered** channel. "Read-triggered" means triggered
by one specific file-read tool, not by whatever the agent touches: shell commands, searches and
directory changes deliver nothing. An agent that orients through the shell — which agents do
by default, and which some harness modes actively encourage — therefore never receives the
project layer at all. In ranking terms, the project `AGENTS.md` has dropped from
*auto-loaded instruction* to *a document the agent must choose to find*.

**Observed 2026-10-05:** a full session worked inside one project through shell commands only.
No project or hub `AGENTS.md` arrived; the agent missed the project's routing, a hub "read
before touching" pointer and a public-repo file-placement rule. The first file-tool read in that
project delivered both files in the same turn.

**Rule:** the structure is not at fault and must not be duplicated upward to compensate. Close
the gap at the harness, where MWP places delivery guarantees: a harness that cannot guarantee
read-triggered loading for every tool needs a hook (or equivalent) that delivers a project's
`AGENTS.md` chain the first time *any* tool call touches that project, once per session, skipping
files already auto-loaded at launch. How that is done is machine config, not spec; this
workspace's implementation is recorded in its own config.

---

## AGENTS.md Tokenomics

**AGENTS.md is routing — nothing else.** The published paper is explicit about this: its own
Layer 0 / Layer 3 diagram labels Layer 0 *"Where am I? — Structural (routing)"* and Layer 3
*"What rules apply? — Content (factory)."* Rules are Layer 3 material, not Layer 0. An earlier
version of this section merged the two — "routing and project-wide non-negotiables" — which was
drift from the paper, not a deliberate choice, and is corrected here (2026-09-22). Project-wide
non-negotiables live in their own file, `NON-NEGOTIABLES.md`, described immediately below.

AGENTS.md is the only file guaranteed to load on every session. That makes it the highest recurring token cost in the entire system. Every line in it is paid for whether you are working on onboarding, payment, or a dashboard bug fix. This is why its content must be driven by the project's intended outcomes — not by an arbitrary line count.

### NON-NEGOTIABLES.md

Ordinary Layer 3 reference material loads on demand — never automatically, only when a task
needs it (see Reference File Tokenomics, further down). A project-wide non-negotiable cannot
work that way: a rule like "never commit secrets" has to reach Claude even on a task that looks
nothing like secrets handling, and an on-demand file only loads when Claude already suspects
it's relevant. That is precisely the situation a non-negotiable exists to cover — the one where
nothing about the current task would prompt Claude to go looking.

The fix is not to let Layer 0 carry rules again — it is to force Layer 3's rules file open every
time, from Layer 0. `NON-NEGOTIABLES.md` sits at the project root, next to `AGENTS.md` — not
inside a `references/` folder, which would put it back on the on-demand path this exists to
avoid. `AGENTS.md`'s "Read `NON-NEGOTIABLES.md`" line (part 1, below), backed by the context-loader hook, is the one routing instruction
that forces it open: *"read `NON-NEGOTIABLES.md` before doing anything."* That instruction is
itself routing, not a rule — Layer 0's job is telling Claude where to find things, and this is
telling Claude where the rules live — so it does not reintroduce rules into Layer 0's content.

**Belongs in `NON-NEGOTIABLES.md`:**
- Project-wide constraints — true regardless of what task is underway
- ID & Naming Conventions — moved here from AGENTS.md; see component 5's replacement, below
- Anything currently written as "Non-Negotiables," "Constraints," or "Shared Constraints"
  inside a project's `AGENTS.md` — that content relocates here, it does not stay

**Does not belong here:** anything conditional on task type. A rule that only applies "when
working on payments" is workspace-specific and belongs in that workspace's `CONTEXT.md`, exactly
as before — moving non-negotiables into their own file does not relax that boundary.

### Cross-Model Adapters

**`AGENTS.md` is the canonical Layer 0 in every project** (since 2026-11-26). It holds the
routing and the required first reads. **There is no `CLAUDE.md`** (since 2026-11-26): Claude Code
reads `AGENTS.md` itself when a folder has no `CLAUDE.md`, from the launch folder, every parent and
across nested repos (tested 2026-11-26, Claude Code 2.1.325). A `CLAUDE.md` beside it would replace
it, not add to it. Don't use `@` imports for anything that must load: Claude Code honours `@` only
in the launch folder's own file. `NON-NEGOTIABLES.md` stays a separate file; Claude Code never
loads it, so a Claude Code hook (SessionStart plus PostToolUse) should deliver every
`NON-NEGOTIABLES.md` on the chain at session start and when work enters a project. Other tools
follow the plain "Read `NON-NEGOTIABLES.md` before doing anything" line. There is
no `GEMINI.md`: Antigravity reads `AGENTS.md` directly at each folder up to the repository root
and combines every rule file it finds, so a `GEMINI.md` would only add the same rules twice.
Keep a `GEMINI.md` only in material shipped to outside users who may run the Gemini CLI.

Antigravity stops at the repository root, and Claude Code doesn't load files above a nested
launch. So each project's `AGENTS.md` names the workspace `NON-NEGOTIABLES.md` explicitly, in a
one-line note under its title. Antigravity truncates a rule file over 24,000 bytes, so keep
`AGENTS.md` well under that: move long reference tables into an index file it routes to.

For an `AGENTS.md`-first workspace, the root router explicitly directs the agent to
the owning project's entry file before project work. Verify from both the workspace
root and the project root. A shell handoff should surface the canonical file and its
required rules before any bulk output.

A project that still has a `CLAUDE.md` is unmigrated. Move anything it holds that
`AGENTS.md` lacks into `AGENTS.md`, then delete `AGENTS.md`. Audit and tooling read
`AGENTS.md` for routing and metadata.

`agent-roles.md` is different: it is the MWP role registry for agent roles, capabilities, boundaries, inputs/outputs, and handoffs. It is not the cross-model entrypoint. Do not use lowercase `agents.md` for this role because it collides with uppercase `AGENTS.md` on case-insensitive filesystems.

### The Right Question

The question is not "how short can I make this?" It is: **what does this project require AGENTS.md to contain in order to achieve its intended outcomes?**

Length is a consequence of that answer, not a target. A simple project may need 20 lines. A complex multi-system project with distinct task types, compliance constraints, and multiple external integrations may legitimately need 70–80 lines or more. Capping both at the same number produces either a bloated simple file or an inadequate complex one. Neither serves the ultimate aim.

### How Claude Actually Navigates

Before defining what AGENTS.md contains, it is worth understanding how Claude actually uses it — because this changes what needs to be in it.

Claude does not navigate a project the way a human does. A human scans a folder tree visually and builds a mental map. Claude does not scan. It reads what it is told to read. When given a task, it matches the task against the routing table and goes directly to the specified workspace. It does not browse. It does not explore.

The analogy is parsing. A parser does not read the entire document to find a variable — it knows the grammar, goes directly to the matching token, and skips everything else. Claude operates the same way. The routing table is the grammar. The workspace CONTEXT.md is the schema for that variable. Token Management tells Claude which sections to skip entirely.

This has one important implication: **Claude does not need a folder structure.** A folder structure is a visual aid for humans. Claude needs to know where to go for a given task — that is the routing table's job. It needs to know what not to load — that is Token Management's job. Workspace internals are described in each workspace CONTEXT.md when Claude enters it. A folder structure adds no meaningful guidance toward the ultimate aim and costs tokens on every session to serve a human need, not Claude's.

A folder structure in AGENTS.md is a symptom of an incomplete routing table. The correct fix is a more complete routing table — not a folder structure as a fallback.

### What AGENTS.md Contains

Three parts, in this order. Every line must change what the agent does; anything the spec,
the parent files or the tool already says is left out. (Changed 2026-11-26 from seven
components — Self-Reference, Token Management, Skills and Session Start blocks were the same
text in 30+ files and the skill tables went stale.)

**1. Identity and first reads**
One line saying what the project is. Then one plain line: "Read `NON-NEGOTIABLES.md` before doing
anything; read `memory.md` at session start." (drop the part for a file the project lacks). No
`@` imports: they load only from the launch folder's file. Where a hook delivers
`NON-NEGOTIABLES.md` anyway, the line serves every other tool. Do not restate parent rules: every
tool loads the parent folders' `AGENTS.md`.

**2. Where things go**
One table, task → file to read first. It also covers where new files go (a "new X" row) and
cross-project flows (a row naming the other project). Merge rows that point to the same file.
If a file is not reachable from this table, add it or delete it. Only add a "do not load" line
for a real heavy or misleading folder in this project (an archive, a vendored tree).

**3. Facts**
Short bullets an agent would otherwise get wrong: how it deploys (and if a push deploys),
the hosting and database it uses, and pointers to `gotchas.md` / `decisions.md`. No skill
tables — the tool lists skills itself; name a skill only inside the row it belongs to.

### What Gets Pushed Out

Importance is not the test. **Scope is the test.**

| Belongs in AGENTS.md | Belongs in NON-NEGOTIABLES.md | Push to workspace CONTEXT.md |
|---|---|---|
| Routing table | — | Process steps and flows |
| Project identity (1–2 lines) | — | System descriptions and status |
| — | Constraints that apply everywhere | Constraints specific to one stage |
| — | Project-wide naming conventions | Workspace-specific field names |
| Cross-project rows in the table | — | Single-workspace process steps |
| File placement rules (conditional on file creation) | — | Workspace-specific placement rules |
| Folder structure | Folder structure | Removed — routing table replaces it, everywhere |

### The Reasoning Test

Before adding any line to AGENTS.md, ask: "If this line weren't here, would Claude make a worse routing decision or violate a project-wide rule?" If the answer is no — the line does not belong here, regardless of how useful or important it feels.

Length is self-regulating when this test is applied consistently. The file will be exactly as long as the project's complexity requires — no more.

---

## CONTEXT.md Tokenomics

There are two distinct types of CONTEXT.md file in this system — root and workspace. They serve different purposes, carry different token costs, and must be held to different standards.

### Workspace CONTEXT.md

The room description. When the routing table sends the agent to a folder, its CONTEXT.md says how
to work accurately there. It loads only when a task enters the folder, so its cost is always in
proportion to its use. (Changed 2026-11-26: the fixed Process / Inputs and Outputs / Tools /
Constraints sections are no longer required.)

**Shape:**
- **First line:** what this folder is for, in one sentence.
- **Then only the sections that apply.** Common ones: a task → file table for the folder's own
  files, the process in order, what comes in and goes out, the rules that apply only here. A
  section with nothing real to say is left out, not filled.
- **Feature folders** (one product feature per folder, e.g. `src/features/<name>/`) use: routing
  table, plug-in points (where the feature is wired into the host), rules, and how to switch it
  off or remove it.

**What it does not contain:**
- Rules for the whole project: `NON-NEGOTIABLES.md`
- Status or next steps: `memory.md` (and `tasks.md` for open work)
- A folder tree: the task table replaces it
- Another folder's content: link to that folder's CONTEXT.md instead

### Project-root CONTEXT.md

Too detailed for `AGENTS.md`, but true across the whole project. Nothing loads it automatically:
`AGENTS.md` routes to it, and most sessions in the project read it early, so treat it as nearly a
fixed cost.

**A line belongs here only if both are true:**
1. **It is not routing or a project-wide rule.** Routing is `AGENTS.md`; rules are
   `NON-NEGOTIABLES.md`.
2. **It has no single folder home.** If it matters in one folder, it goes in that folder's
   CONTEXT.md.

**Typically here:** the external systems and what each owns; architecture that every folder
depends on; for a hub, the inventory of its children (one line each). **Not here:** folder trees,
process flows, status, history (`DEVLOG.md`), and anything already in `AGENTS.md`.

---

## Reference File Tokenomics

Reference files are the most token-efficient file type in the system. They carry zero cost unless explicitly needed — no session start load, no fixed recurring cost. When a task requires them, they load. When it does not, they are invisible.

This advantage only holds if two conditions are met: the file loads only when genuinely needed, and when it does load, Claude reads only the relevant part.

### On-Demand Loading

Reference files should never load automatically. They are triggered by task type — the routing table and Token Management section in AGENTS.md define when they are appropriate. If a reference file is being loaded on every session or every task regardless of relevance, it has effectively become a fixed cost and should be reviewed.

The Token Management section in AGENTS.md is the primary control mechanism. Explicit instructions such as "do not load BoldSign reference guides unless the task involves the BoldSign integration" prevent reference files from becoming ambient context that loads by default.

### Internal Structure as the Token Efficiency Mechanism

The size of a reference file matters less than how it is structured. A 300-line API reference with clear, descriptive headers costs far less in practice than an unstructured document of the same length — because Claude can navigate directly to the relevant section rather than processing the entire file.

**Principles for structuring reference files:**
- One topic per file — narrow scope means Claude loads only what the task requires
- Clear headers that describe content precisely — Claude uses these to locate relevant sections
- Current content first, historical context last — Claude reads from the top; bury what it rarely needs
- No mixed concerns — an integration guide and an API reference are two files, not one

A poorly structured reference file forces Claude to read more than it needs. A well-structured one makes the irrelevant invisible.

### Active vs Archive

Not all reference files carry the same cost profile. The distinction matters:

**Active reference files** — loaded regularly during a specific phase of work. An integration spec during active development. An API reference during debugging. These are on-demand but frequent. Keep them lean, well-structured, and current.

**Archive files** — historical records, superseded approaches, completed phase documentation. These should never load during active sessions. They must be explicitly excluded in the Token Management section and ideally stored in a clearly named archive folder so the exclusion rule is unambiguous.

The risk with archive files is drift — content that was once active reference material becomes historical but stays in the same location. When this happens, Token Management rules become the last line of defence. The cleaner solution is to move superseded content to an archive folder at the point it becomes historical, not later.

### The Reference File Test

Before creating a reference file, ask: "Will Claude need to load this in full, or does it need one section of it at a time?" If the answer is one section at a time — split it into smaller, focused files. One file per concern loads only what is needed. One large file loads everything to find one thing.

---

## Memory Tokenomics

For projects adopting shared session memory, [session-memory.md](./session-memory.md)
governs recording and recall. Its checkpoint capture and authoritative links replace
the legacy closeout-only and undocumented-decision practices below. Other projects
retain the legacy procedure until explicitly adopted.

Memory serves one purpose: carrying state across the gap between sessions. It is the bridge between what was known at the end of the last session and what Claude needs to know at the start of the next one. Everything else — process flows, architectural decisions, reference material — belongs in files that can be read when needed. Memory is not a knowledge store. It is a session bridge.

### The Fixed Cost Problem

Memory loads at session start alongside AGENTS.md. That makes it a fixed cost on every session — paid regardless of what task is ahead. This subjects it to the same standard as AGENTS.md: every line must earn its recurring cost.

The test for memory content is not "is this important?" It is: **"would Claude need to re-ask or re-derive this at the start of every session if it weren't here?"** If yes — it belongs in memory. If no — it belongs in a file that loads on demand.

### What Belongs in Memory

Memory carries state that is not derivable from reading the current files and not stable enough to belong in a reference file.

**Belongs in memory** (the session bridge — [session-memory.md](./session-memory.md) owns its shape and 1,000-word budget):
- Current state — what is live, in progress, blocked
- Next actions and who owns them
- Open or unverified items, each with its original date
- Links to where everything else lives

**Does not belong in memory:**
- Settled decisions and owner preferences — `decisions.md` or ADRs
- Lessons, traps, "do not" rules — `gotchas.md` or a code comment
- Finished work and session history — `DEVLOG.md`
- Pre-close discipline — the `/closeout` skill, where it runs every time
- Architectural details — reference files handle these
- Process flows — workspace CONTEXT.md handles these
- API documentation or integration specs — reference files
- Anything derivable from reading the current codebase or git history

### The Staleness Problem

Memory has a failure mode unique among all file types: **staleness produces false confidence.**

A stale routing table sends Claude to the wrong workspace — the error is visible immediately. A stale reference file gives outdated information — Claude may act on it but the mismatch surfaces quickly. Stale memory is more dangerous: Claude reads it at session start, treats it as current truth, and acts on it with confidence throughout the session. "Phase 1 is complete" in memory means Claude will not rebuild Phase 1 work — even if Phase 1 was revised last session and memory was not updated.

This makes update discipline more critical for memory than for any other file type. Memory that is not updated at session close is not neutral — it is misinformation.

**The fix:** treat memory updates as a mandatory pre-close task, not optional housekeeping. Every session that changes project state must update memory before closing. This is a discipline rule, not a technical constraint — and it must be enforced by habit.

### Memory vs Conversation History

Conversation history is not memory. It exists within the current session only and is subject to auto-compaction as the context window fills. Relying on conversation history to carry context forward is the most common source of lost state in long sessions.

If something needs to survive the end of a session — write it to memory. If it only needs to survive the current task — conversation history is sufficient. The distinction is session boundary: anything that must cross it belongs in a file.

---
