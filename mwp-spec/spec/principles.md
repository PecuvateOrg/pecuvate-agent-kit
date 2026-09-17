# MWP — Principles

Why the framework exists, what it optimises for, and the discipline it requires.
Normative. Part of the MWP standard — see [CONTEXT.md](./CONTEXT.md).

---

## Ultimate Aim

The sole purpose of this structure is **token efficiency without loss of context quality**.

Claude has a finite context window. Every file loaded into a session costs tokens. The structure exists to solve one problem: give Claude precisely the context it needs for the current task, and load nothing else. The right information must always be available; irrelevant information must never be present.

This is not about organisation for its own sake. It is about ensuring that Claude spends its context window doing the work — not piecing together where it is, what the project does, or which rules apply.

---

## Token Awareness

### Context Window

Claude's context window is the total budget for everything in a session — system prompt, injected files, conversation history, tool results, and responses. It is consumed by everything, not just files you deliberately load. Check current model documentation for the exact figure; treat the numbers below as illustrative rather than exact.

### What Eats the Budget

| Source | Approx tokens per session |
|---|---|
| System prompt + global rules | 2,000–3,000 |
| CLAUDE.md + memory file | 1,000–1,500 |
| Workspace context files read | 1,500–2,000 each |
| Conversation history (1 hour) | 10,000–30,000 |
| File reads and tool results | 2,000–5,000 per read |

A typical working session consumes 30,000–50,000 tokens before any real work begins. The context window is not small — but it is not infinite, and files loaded at session start are a fixed cost on every session.

### Realistic File Ceilings

Token cost scales with line count. The conversion is approximate:

- 1 line of prose ≈ 10–15 tokens
- 1 line of a markdown table ≈ 15–20 tokens
- 1 line of a code block ≈ 10–20 tokens

| File type | Line ceiling | Approx tokens | Rationale |
|---|---|---|---|
| CLAUDE.md | 50 lines | ~600–800 | Loaded every session — fixed cost, must be minimal |
| Workspace CONTEXT.md | 100–150 lines | ~1,500–2,000 | Loaded per task — can carry more, still focused |
| Deep reference files | 200–300 lines | ~3,000–4,000 | Loaded only when explicitly needed |
| Archive / historical | No ceiling | — | Never loaded into active sessions |

**The test for any file:** if it is loaded at session start, every line is a recurring cost. If it is loaded only on demand, it has more headroom. Size files accordingly.

### Auto-Compaction

Claude Code automatically compresses conversation history as the context window fills. There is no fixed token threshold — it fires adaptively as the limit approaches. When it does, older tool outputs are cleared and conversation history is summarised. Early session instructions, routing decisions, and file content discussed earlier can be lost or degraded.

**The implication:** auto-compaction cannot be planned around as a safety net. Anything Claude needs to know must live in files — not in conversation history. This is the strongest argument for the MWP structure itself: a well-structured project survives auto-compaction because the context is always reloadable from files, not dependent on what was said earlier in the session.

---

## The Tradeoff Principle

There are no zero-cost files — only deliberate load decisions.

The goal is not minimal tokens. It is the **right token cost for the right information at the right time**. Every file in the system is a tradeoff: what does loading this enable, and does that justify what it costs?

The design question for every file is not "how do I make this cheaper?" It is: **does what this file enables justify what it costs to load it?**

- **Too little context** — Claude routes incorrectly, asks unnecessary questions, produces inaccurate output. Correction cycles cost more tokens than the missing file would have.
- **Too much context** — irrelevant files loaded, window fills faster, session quality degrades. You pay in noise.
- **The right context** — load only what enables accurate work for this task. The cost is real but proportionate.

This principle governs every file sizing and loading decision in the layers below.

---

## Session Discipline

A well-structured project can still burn through its context window inefficiently if the session itself is undisciplined. Session discipline is the set of habits that control how the context window is used during active work — the behavioural layer on top of the file structure.

The framework document covers the structure. The practical instructions that enforce session discipline belong in CLAUDE.md and memory.md, where Claude reads them as executable rules. What follows is a brief account of each discipline area and where its tokenomics reasoning is grounded in this document.

| Discipline | What it means | Covered in |
|---|---|---|
| Load on demand | Do not load reference files until the task requires them | [layers.md](./layers.md) — Reference Files |
| Avoid redundant reads | Do not re-read files already in context from earlier in the session | The Tradeoff Principle, above |
| Pre-close memory update | Update memory.md before closing — stale memory is misinformation | [layers.md](./layers.md) — Memory |
| Pre-close DEVLOG update | Record decisions and outstanding work before closing | [layers.md](./layers.md) — Memory |
| Know when to start fresh | Recognise when a new session with a clean load is more efficient than continuing | Token Awareness, above |

Session discipline is where the tokenomics principles in this document become daily practice. The structure creates the conditions for efficiency. Discipline determines whether those conditions are realised.

---

## Content Quality

The framework optimises how context is delivered to Claude. Content quality determines what that context actually contains. A perfectly structured project with vague, incomplete, or inaccurate files will produce vague, incomplete, or inaccurate work. The structure is the vehicle. The content is the fuel.

**Garbage in, garbage out applies at the file level.** The routing table tells Claude where to look. The content in those files tells Claude what to do. When that content is unclear, Claude fills the gaps with inference. Inference produces back-and-forth. Back-and-forth consumes tokens. The correction cycle costs more than writing the content correctly the first time would have.

### Two Dimensions

**1. Documentation quality**

Every file Claude reads must be precise and complete enough to act on without asking. This means:

- Integration specs must include the exact API behaviour, error formats, and edge cases — not a high-level description of what the API does
- Workspace CONTEXT.md files must describe the actual current process, not the intended future process
- Reference files must reflect the current state of the system — outdated documentation is worse than no documentation because Claude acts on it with confidence

The test: could a competent developer read this file and implement the task correctly on the first attempt, without asking a single clarifying question? If not, the file is not ready to be Claude's context.

**2. Outcome clarity**

The intended result of any task must be defined before work begins. When the outcome is unclear, Claude infers what "done" looks like — and that inference may not match what was intended. The gap only surfaces after work is produced, requiring correction. Each correction cycle re-establishes context that should have been explicit from the start.

Before starting any non-trivial task, the outcome should be answerable in one sentence: "This is done when X." If it cannot be stated that clearly, the task needs more definition before Claude touches any files.

### The Cost of Ambiguity

Ambiguity in content does not stay contained. It propagates through the session:

- An unclear spec produces an incorrect implementation
- Correcting the implementation requires re-reading files already in context
- Each correction adds to conversation history, consuming the context window faster
- By the time the task is correct, the session has burned significantly more tokens than a well-specified task would have required

The framework reduces the structural cost of working with Claude. Content quality reduces the correction cost. Both are required for the system to work efficiently and optimally.

---
