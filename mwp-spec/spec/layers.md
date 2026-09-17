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
| **0** | `CLAUDE.md` | Where am I? What are the rules? | ~800 tokens |
| **1** | `CONTEXT.md` (project root) | Where do I go? What does this project contain? | ~300 tokens |
| **2** | `stages/NN_name/CONTEXT.md` | What do I do at this step? | 200–500 tokens |
| **3** | `_config/`, `references/`, `shared/` | What stable rules and conventions apply? | 500–2k tokens |
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

---

## CLAUDE.md Tokenomics

CLAUDE.md is the only file guaranteed to load on every session. That makes it the highest recurring token cost in the entire system. Every line in it is paid for whether you are working on onboarding, payment, or a dashboard bug fix. This is why its content must be driven by the project's intended outcomes — not by an arbitrary line count.

### Cross-Model Adapters

`CLAUDE.md` remains the canonical MWP Layer 0 file. Existing MWP skills, deployment tools, and audits read it as the source for routing, project-wide rules, deployment metadata, and token-management instructions.

Every MWP project should include uppercase `AGENTS.md` as a lightweight adapter for Codex-style or generic coding agents. It points to `CLAUDE.md`, then `CONTEXT.md`, `memory.md`, and `DEVLOG.md` when present and relevant. Do not duplicate the full routing table unless a tool specifically requires it; duplicated routing drifts.

`agent-roles.md` is different: it is the MWP role registry for agent roles, capabilities, boundaries, inputs/outputs, and handoffs. It is not the cross-model entrypoint. Do not use lowercase `agents.md` for this role because it collides with uppercase `AGENTS.md` on case-insensitive filesystems.

### The Right Question

The question is not "how short can I make this?" It is: **what does this project require CLAUDE.md to contain in order to achieve its intended outcomes?**

Length is a consequence of that answer, not a target. A simple project may need 20 lines. A complex multi-system project with distinct task types, compliance constraints, and multiple external integrations may legitimately need 70–80 lines or more. Capping both at the same number produces either a bloated simple file or an inadequate complex one. Neither serves the ultimate aim.

### How Claude Actually Navigates

Before defining what CLAUDE.md contains, it is worth understanding how Claude actually uses it — because this changes what needs to be in it.

Claude does not navigate a project the way a human does. A human scans a folder tree visually and builds a mental map. Claude does not scan. It reads what it is told to read. When given a task, it matches the task against the routing table and goes directly to the specified workspace. It does not browse. It does not explore.

The analogy is parsing. A parser does not read the entire document to find a variable — it knows the grammar, goes directly to the matching token, and skips everything else. Claude operates the same way. The routing table is the grammar. The workspace CONTEXT.md is the schema for that variable. Token Management tells Claude which sections to skip entirely.

This has one important implication: **Claude does not need a folder structure.** A folder structure is a visual aid for humans. Claude needs to know where to go for a given task — that is the routing table's job. It needs to know what not to load — that is Token Management's job. Workspace internals are described in each workspace CONTEXT.md when Claude enters it. A folder structure adds no meaningful guidance toward the ultimate aim and costs tokens on every session to serve a human need, not Claude's.

A folder structure in CLAUDE.md is a symptom of an incomplete routing table. The correct fix is a more complete routing table — not a folder structure as a fallback.

### What CLAUDE.md Contains

A complete CLAUDE.md has seven components. Each earns its place by serving the routing and orientation function — nothing else.

**1. Identity**
One to two lines. What this project is and what it does. Enough for Claude to confirm it is in the right project — not enough to describe the system in detail.

**2. Self-Reference**
A single sentence stating that this file is the map. This prevents Claude from treating CLAUDE.md as a source of workspace-level detail and sets the expectation that workspace context lives elsewhere.

**3. Routing Table**
The core of the file. Maps every task type to a workspace, the context file to read first, and the tools to load. This is positive routing — where to go. Every row must represent a genuinely distinct task type. Rows that point to the same workspace for similar tasks should be merged. If a file or resource isn't reachable via the routing table, it should either be added or it shouldn't exist.

**4. Cross-Workspace Flows**
Tasks that span multiple workspaces in sequence. The routing table handles single-workspace tasks. This section handles flows where Claude must move across workspaces to complete one piece of work. Without this, Claude has no guidance for multi-workspace tasks and will either guess or ask.

**5. ID & Naming Conventions**
Project-wide conventions only — identifiers, file naming, field naming, environment variable format. Conventions that apply in only one workspace belong in that workspace's CONTEXT.md.

**6. File Placement Rules**
Where new files go. As a project grows, Claude will create files. Without explicit placement rules, files accumulate in wrong locations and the structure degrades. One rule per file type — short, but prevents structural drift.

**7. Token Management**
The most commonly missed section and the most important for tokenomics. This section tells Claude what **not** to load. The routing table is positive routing. Token Management is negative routing — explicit instructions to skip files, folders, or sections that are not relevant to the current task.

Without this section, Claude defaults to reading everything in scope to orient itself. A well-written Token Management section prevents that default and is the direct implementation of the tradeoff principle from section 3.

Example instructions this section might contain:
- Do not read archive files unless explicitly asked
- Do not load reference guides unless the task involves that integration
- Do not read historical files unless working in a workspace that requires them

**8. Skills and Tools Available**
A reference list of what MCPs, skills, and slash commands are wired into this project. Prevents Claude from attempting tasks without the right tools or failing to use tools that are already available.

### What Gets Pushed Out

Importance is not the test. **Scope is the test.**

| Belongs in CLAUDE.md | Push to workspace CONTEXT.md |
|---|---|
| Routing table | Process steps and flows |
| Project identity (1–2 lines) | System descriptions and status |
| Constraints that apply everywhere | Constraints specific to one stage |
| Project-wide naming conventions | Workspace-specific field names |
| Cross-workspace flows | Single-workspace process steps |
| Token Management (what not to load) | Workspace-specific loading rules |
| Folder structure | Removed — routing table replaces it |

### The Reasoning Test

Before adding any line to CLAUDE.md, ask: "If this line weren't here, would Claude make a worse routing decision or violate a project-wide rule?" If the answer is no — the line does not belong here, regardless of how useful or important it feels.

Length is self-regulating when this test is applied consistently. The file will be exactly as long as the project's complexity requires — no more.

---

## CONTEXT.md Tokenomics

There are two distinct types of CONTEXT.md file in this system — root and workspace. They serve different purposes, carry different token costs, and must be held to different standards.

### Workspace CONTEXT.md

This is the room description. When the routing table sends Claude to a workspace, the workspace CONTEXT.md tells it everything it needs to work accurately inside that space — what the workspace is for, what the process looks like, what files live here, what tools to use, and what constraints apply specifically here.

It is a conditional cost. It only loads when Claude enters that workspace. A payment stage CONTEXT.md costs nothing during an onboarding session. This makes it the most token-efficient file type in the system — its cost is always proportionate to its use.

In the parsing analogy: it is the schema for the variable the routing table pointed to. The routing table says "go here." The workspace CONTEXT.md says "here is what this is and how it works."

**What it contains:**
- What this workspace is for — one sentence
- Process steps — what happens here, in order
- Inputs and outputs — what comes in, what leaves
- Tools — which MCPs, skills, or APIs are active here
- Constraints — rules that apply specifically in this workspace

**What it does not contain:**
- Project-wide rules — those are in CLAUDE.md
- Cross-cutting architectural decisions — those are in the root CONTEXT.md
- Content from other workspaces — no cross-contamination

### Root CONTEXT.md

The root CONTEXT.md has no equivalent in the original MWP framework. It exists because some content is too detailed for CLAUDE.md but has no single workspace home — it is genuinely cross-cutting.

Because it loads at session start alongside CLAUDE.md, it carries a fixed cost on every session. This makes it subject to nearly the same standard as CLAUDE.md itself. The bar for inclusion is high.

**A line belongs in the root CONTEXT.md if and only if both of the following are true:**

1. **It cannot live in CLAUDE.md** — it is too detailed for the map. CLAUDE.md routes and constrains. If this content neither routes nor enforces a project-wide rule, it does not belong in CLAUDE.md. But that alone is not enough.

2. **It has no workspace home** — it is genuinely cross-cutting. It applies regardless of which workspace is active. If it only matters in one workspace, it belongs in that workspace's CONTEXT.md regardless of how important it feels.

If both are true — the content belongs here and the file earns its fixed cost.
If either fails — the content belongs in CLAUDE.md or in a workspace CONTEXT.md.

**The root CONTEXT.md is not a dumping ground for important project information. It is a specific container for a specific type of content.** That definition is narrow by design. Every line that doesn't meet both criteria is either misplaced or redundant.

**What typically belongs here:**
- External system inventory — what platforms exist and what each owns
- Architectural decisions that affect all workspaces
- Non-obvious constraints that apply project-wide but are too detailed for CLAUDE.md

**What does not belong here:**
- Folder structure — routing table replaces it
- Process flows — workspace CONTEXT.md handles these
- Status updates — memory.md handles these
- Anything specific to one stage or workspace

---

## Reference File Tokenomics

Reference files are the most token-efficient file type in the system. They carry zero cost unless explicitly needed — no session start load, no fixed recurring cost. When a task requires them, they load. When it does not, they are invisible.

This advantage only holds if two conditions are met: the file loads only when genuinely needed, and when it does load, Claude reads only the relevant part.

### On-Demand Loading

Reference files should never load automatically. They are triggered by task type — the routing table and Token Management section in CLAUDE.md define when they are appropriate. If a reference file is being loaded on every session or every task regardless of relevance, it has effectively become a fixed cost and should be reviewed.

The Token Management section in CLAUDE.md is the primary control mechanism. Explicit instructions such as "do not load an integration's reference guides unless the task involves that integration" prevent reference files from becoming ambient context that loads by default.

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

Memory loads at session start alongside CLAUDE.md. That makes it a fixed cost on every session — paid regardless of what task is ahead. This subjects it to the same standard as CLAUDE.md: every line must earn its recurring cost.

The test for memory content is not "is this important?" It is: **"would Claude need to re-ask or re-derive this at the start of every session if it weren't here?"** If yes — it belongs in memory. If no — it belongs in a file that loads on demand.

### What Belongs in Memory

Memory carries state that is not derivable from reading the current files and not stable enough to belong in a reference file.

**Belongs in memory:**
- Current phase status and what is complete vs outstanding
- Key decisions made that are not documented elsewhere
- Project-specific preferences — how the user works, what to avoid, what has been confirmed
- Pre-close checklist — session discipline that applies every session
- Anything that would otherwise require re-explaining at the start of every session

**Does not belong in memory:**
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
