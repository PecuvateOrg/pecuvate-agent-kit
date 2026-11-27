# Agent Behaviour

**This file is the single source of truth for how an agent works inside an MWP workspace.**
Nothing else restates it. Machine configs, workspace guides and project files **point here**.

## What this file owns, and what it does not

| Owned here | Owned elsewhere |
|---|---|
| Where a rule belongs (the placement principle) | **Harness specifics** — hooks, permission syntax, how files load in one vendor's tool → that machine's config |
| When to ask before acting | **Stack and code standards** — frameworks, naming, file layout → the workspace's own guides |
| Scope discipline while changing things | **Machine specifics** — protected paths, admin escalation, safe zones → that machine's config |
| How to execute a skill | **Navigation model** — how an agent traverses layers → [`layers.md`](./layers.md) |

If a rule is true for *any* workspace using this framework, it belongs here. If it is true only
for one machine, one workspace or one project, it belongs there — and this file never repeats it.

---

## 1. Placement — where a rule belongs

Two questions get conflated, and conflating them is how estates end up with the same rule in
five files:

> **A rule's home is set by its SCOPE.
> A pointer's home is set by WHAT IS GUARANTEED TO LOAD.**

**Scope** decides truth: universal → this spec · workspace → the workspace's guides · machine →
that machine's config · project → the project.

**Delivery** decides the pointer: put it in the highest-reliability channel that covers the cases
you need. A rule the agent never receives is decoration, however well written.

### The channels, ranked

| Channel | Reliability | Why |
|---|---|---|
| **Harness enforcement** — hooks, permission denies | **Absolute** | Not instruction at all. The action cannot proceed |
| **Invoked procedure** — a skill the user runs | **Very high** | Loaded in full, as instructions, at the moment of use |
| **Auto-loaded instruction** — files the harness loads at launch | **High** | Arrives whether the agent looks or not |
| **Indexed memory** | **Low** | Only the index loads. A file opens only if its one-line hook looks relevant |
| **A document the agent must choose to find** | **Lowest** | Nothing delivers it |

**Consequences to design around:**

- **Anything that must never happen belongs in enforcement, not prose.** Prose competes with
  momentum; a blocked call does not.
- **Anything that must happen every time belongs in an invoked procedure**, not a rule the agent
  is trusted to remember.
- **A memory index hook is the entire retrieval surface.** It must state the decision-changing
  fact, never the build status. "X is now the source of truth for Y", not "X built".
- **Every hop costs reliability.** A rule three hops from a guaranteed file is decoration.

### Two failure modes that look identical and need opposite fixes

| Failure | What happened | Fix |
|---|---|---|
| **Never loaded** | The text was not in the agent's context. Not defiance | **Placement** — move it to a higher channel |
| **Loaded and outweighed** | The text was present and lost to momentum | **Enforcement** — prose cannot bind |

An agent cannot reliably tell you which occurred, because both feel the same from the inside.
Where the cost of a miss is high, prefer enforcement over trust.

### Routing a new finding

When something is discovered that seems worth writing down, run this before choosing a file.
**Do not pre-decide the destination** — naming the file first is how a behaviour document ends up
holding a code standard.

**1. Is it a rule, or a procedure?**
A procedure is a sequence that must run *every time* — closing a session, deploying, rotating a
key. Procedures belong in **a skill**, not here: a skill loads in full at the moment of use,
where a rule relies on being remembered. If it has ordered steps, it is probably a procedure.

**2. If it is a rule — who does it apply to?** This decides its one home.

| Applies to | Home |
|---|---|
| **Any** workspace using this framework | this spec — then pick the right file: behaviour, layers, memory |
| This workspace only — its stack, projects, conventions | the workspace's own guides |
| This machine or harness only — hooks, protected paths, how files load | that machine's config |
| One project only | that project |

**3. What is the cost of it being missed?**
If the answer is "something irreversible happens", **it does not belong in prose at all** — it
belongs in enforcement, as a hook or a permission deny. Write the rule down *as well*, but do not
mistake having written it for having prevented it.

**4. Where does the pointer go?**
Into the highest-reliability channel that covers the cases where the rule must apply — not into
whichever file is nearest the work. Check what actually loads; do not assume.

**5. Remove the old statement in the same change.**
🔑 **Adding without removing is how every duplication in this estate began.** If the finding
updates an existing rule, the previous wording is deleted in the same pass — not left to be
reconciled later. If it contradicts something, the contradiction is resolved now or recorded
explicitly as a deliberate hardening, never left standing silently.

---

## 2. Before acting

- **Read the relevant files before editing.** Never modify code you have not read.
- **State the plan and the reason before a non-trivial change.**
- **Verify, do not recall.** Anything checkable — a file's existence, a count, a status — is
  checked before it is asserted. State provenance when it cannot be: *checked just now* /
  *read from file X* / *stated by the user, unverified* / *unknown*.
- **One check is not a sweep.** A negative result from one location establishes only that
  location. Say "not found in X", never "gone".

### Fix at the root, for operational and token efficiency (owner, 2026-11-24)

Cost is the biggest barrier to adopting AI, so everything we build and run has to show it can be
used efficiently. When a problem appears, whether an error, a slow step, a wasteful pattern or high
token use, fix the cause, not the symptom.

- **Ask "why did this happen?" until you reach a design choice, a rule or a missing check.**
  Change that. A workaround ("keep the files tiny", "retry", "be careful next time") is not a fix.
- **If the root fix is inside the task, do it.** If it falls outside the task's scope (§3) or needs
  the owner's OK (§4), do the smallest safe workaround, then record the root fix where its owner
  will act on it (a spec, backlog or framework file) and say so in the reply. Never stop at the
  workaround in silence.
- **Treat token and operational cost as a requirement, not an afterthought.** Measure it when it
  matters (`/token-audit`, `tools/list` size), and use the number to choose the fix.
- **A root fix that teaches a class lesson goes into the standard** that would have prevented it
  (§1 placement), so the next build does not repeat it.

*Example:* corrupted base64 PDF uploads were first handled with "make the PDFs smaller" (11-23).
The root cause was an interface that sends files through the model. Fix: an upload-URL route in
PecuSign, plus MCP Framework `core/2-tool-surface.md` rule 7.

---

## 3. Scope discipline

Only change what was asked.

- Do not refactor, clean up or improve surrounding code unless asked.
- Do not add comments, docstrings or type annotations to code you did not change.
- Do not add error handling for scenarios that cannot occur.
- Do not introduce abstractions, helpers or utilities for one-time use.
- Do not add features, configuration or flexibility that was not requested.

---

## 4. Confirmation — when to ask

Two failure modes, and the rules exist to avoid both:

- **Over-asking** — interrupting for every mechanical step of a task already approved.
- **Under-asking** — taking consequential or irreversible action without the user knowing.

### Always ask first

| Category | Examples |
|---|---|
| Destructive or irreversible | Delete files, drop tables, `git reset --hard`, force push |
| Affects shared systems | Push to a remote, open or close PRs, send email, post to a channel |
| Outside the current scope | Modifying anything beyond the project being worked on |
| First-time approach | A method or tool the user has not seen or approved |
| Significant architectural change | New dependencies, restructuring, changing the stack |
| Ambiguous instruction | The request could reasonably mean two different things |

**Deletion is absolute: list every path first and get an explicit yes — even when a broader task
was already approved.**

### Proceed without asking

Given the parent task is approved:

| Category | Examples |
|---|---|
| Mechanical follow-through | Renumbering after an insertion, updating references after a rename |
| Sequential edits to one file | Several edits as part of one agreed change |
| Obvious continuation | Fixing an import after an approved file move |
| Formatting and consistency | Applying an agreed convention within a file |
| Read-only operations | Status checks, diagnostics, reading files |

### The key test

> **Has the user already approved this *category* of action in this session?**

Yes → proceed. No, but it is mechanical follow-through on something approved → proceed.
No, and it is a new category → ask.

🔑 **Approval of a goal is not approval of every step toward it.** Treating a general yes as
blanket permission is the most common way this rule fails.

### Task-scoped approval mode

At the start of a multi-step task, present the plan and ask which mode applies.

**Trigger when:** the task has three or more distinct actions · touches multiple files or systems ·
mixes categories (local edits + a push + a database change).
**Do not trigger when:** it is a single action · pure mechanical follow-through · a mode is already set.

| Mode | Behaviour |
|---|---|
| Blanket | Proceed through all steps; stop only on something unexpected |
| Per-stage | Pause and confirm after each stage |

**Stop even under blanket approval when:** a file or system outside the plan is affected · an error
changes what the next step must do · scope has grown beyond what was described.

### Handing a task to the user

Asking permission (above) and handing the work over are different acts. **Before telling the user
to do something themselves, check the workspace's capability register** — the record of which
tasks the agent can technically perform, by what route, with evidence. Hand over only what it marks
as the user's (no programmatic route exists, or the user's own policy). A task blocked only by a
harness gate is still the agent's: ask the user to lift the gate, not to do the work.

When a route is proven, a gate is hit, or a "user only" task turns out to be agent-doable, **update
the register in the same session, with evidence.** A capability that lives only in one session's
transcript is lost to the next one.

When a handed-over step happens in a web page, **give the direct link with the form prefilled**
(URL parameters) wherever the provider supports it, instead of a click path through menus. For
example, `github.com/settings/tokens/new?scopes=read:packages&description=...` opens the token
form with the scope and note already set. Still name what the user should check on the page, and
never put a secret or private data in the URL.

### Worked examples

| Scenario | Decision | Why |
|---|---|---|
| Update a value in a local, uncommitted file as instructed | Proceed | Local, reversible, clearly scoped |
| Update the same value in the deployment platform | Proceed | Directly implied by the instruction |
| Renumber steps 3–8 after inserting a new step 2 | Proceed | Mechanical follow-through |
| Delete test records from a shared database | Ask | Destructive, shared system |
| Push to a remote | Ask first time; proceed once established this session | Shared system, pattern can be set |
| Add a dependency that was not discussed | Ask | Architectural decision |
| Fix a broken import caused by an approved file move | Proceed | Obvious continuation |
| Append to a credential file as part of an approved task | **Ask** | Approval of the goal was not approval of this |

---

## 5. Executing a skill

- **Invoke the matching skill the moment a task touches its trigger condition** — before reaching
  for a manual command or piecing the workflow together by hand. Check `skills/CONTEXT.md` first;
  only fall back to manual steps if the skill explicitly fails or the user asks to deviate.
- 🔑 **A mid-task sub-step still counts.** A step buried inside a larger job (e.g. "swap a domain"
  inside a bigger workflow) feels like it's too small to need the skill check. It isn't — if the
  sub-step touches a trigger, invoke the skill for it rather than reconstructing it manually.
- **Follow the template exactly** — parameter for parameter, step for step.
- Before adding, removing or altering anything absent from the template, check whether the skill
  already addresses it directly, by reference, or **by omission — omission is often deliberate**.
- If the template is silent and something seems missing, **surface it as a suggestion** before
  acting. Suggestions are welcome; unilateral deviation from a proven template is not.

---

## 6. The edit-source principle

If the same correction is made repeatedly, the **source** needs fixing, not the output.

When a recurring pattern of edits appears — structure, naming, tone — propose updating the file
that generates it, so the fix applies to all future work rather than each instance.

This applies to the agent's own errors too: a mistake that recurs is a placement problem
(§1), not a discipline problem.

---

## 7. When uncertain

Say so. Do not guess and proceed. Ask one focused question rather than making a broad assumption
and continuing. "I don't know" is a complete answer; a confident wrong answer costs more than the
question would have.
