# MWP — Shared Session Memory

**Scope.** This file owns *where captured knowledge lives and how it is written*: the session
bridge, destination ownership, the adoption gate. **How an agent behaves generally — provenance,
verification, where a RULE belongs — is owned by [`agent-behaviour.md`](./agent-behaviour.md) and
is not restated here.** The two differ by subject: that file routes **rules**, this one routes
**captured knowledge**.

**Normative for every MWP project that keeps a `memory.md`** — default since 2026-10-05,
after a one-project pilot (see *Pilot record* below). A project declares it by adding a
**Shared Memory** section to its Layer 0 file, naming this spec, its session bridge, and its
durable knowledge destinations. A project not yet migrated is non-conformant, not exempt: its
`memory.md` is held to the budget below and migrated by the method in *Migrating a project*.

## Ownership and routing

- Project `memory.md` (or its declared private `workspace-docs` location) is the
  shared session bridge. All agents read and update the same file.
- Durable knowledge belongs in an existing authoritative guide, decision record,
  or the acting entity's vault. Record explicit named destinations in Layer 0;
  a parent directory or model-generated guess is not an ownership decision.
- Knowledge-base recording follows that KB's own rules.
  Keep organisation and personal knowledge separate. Shared engineering lessons
  belong in their owning framework/guide unless a technical vault is explicitly mapped.
- Tool-private memory is a compatibility pointer for adopted projects, not a second
  authority. During migration, inspect relevant old entries and reconcile conflicts
  against evidence. Do not bulk-import, delete or rewrite private memory implicitly.
- A missing/unavailable destination is a pending capture in the session bridge,
  with the intended destination and reason. Never silently substitute another vault.

## Session bridge

Use `authority` and `as_of` per [metadata.md](./metadata.md). Keep current state,
blockers, next actions and named recall links. Each unresolved historical claim
keeps its original date and is labelled unverified; refreshing the file does not
verify every claim. Detailed history lives in DEVLOG or a labelled historical copy.

Budget: at most 1,000 words for the bridge, excluding linked files; warn above this.
Sections are **replaced** when state changes, never appended to as dated blocks — appending is
how the pilot file reached 204KB. Never remove necessary information solely to meet the
budget: move it to its destination instead. Persistent decisions link to their record.

### Standard destinations

When a project has no better-owned home for a class of knowledge, use these, beside the bridge
(in the private `workspace-docs` location for a public repo):

| Class | Destination | Read |
|---|---|---|
| Current state, blockers, next actions | `memory.md` (the bridge) | every session |
| What happened, when | `DEVLOG.md` → `DEVLOG-archive.md` | recent entries at start; archive on search |
| Settled decisions, owner preferences | `decisions.md`, or ADRs in `planning/decisions/` | on demand |
| Traps, lessons, "do not" rules | `gotchas.md`, or a code comment at the site | before touching that area |
| Repeatable procedures | a skill or runbook | when invoked |
| How it is built | `planning/architecture/` | on demand |

## History budget

`DEVLOG.md` is read at session start too, so it is bounded the same way: **at most 2,500
words**, warn above this. Closeout keeps the newest four entries in full and compresses older
ones to one line; when the file is still over budget, move the oldest one-line entries to
`DEVLOG-archive.md` (append-only, never read at start). If the four full entries alone exceed
the budget, they are too verbose — tighten them; the detail belongs in the PR, commit or
destination file they cite. Measured in the pilot: a cold-start Codex read a 4,160-word DEVLOG
in full, more than the bridge and decisions combined.

## Migrating a project

1. Move the existing `memory.md` **verbatim** to `archive/memory-history-to-<date>.md` with a
   header labelling it historical. Nothing is lost and the step is reversible.
2. Write a fresh bridge within budget, with `authority`/`as_of`. Verify each current-state claim
   against the live system; anything unverifiable keeps its original date and is labelled.
3. Lift decisions and durable lessons from the archive into their destinations, each line dated
   so it can be traced back. Finished work stays in the archive or DEVLOG.
4. Add the Layer 0 **Shared Memory** section (paths only — via PR for a public repo).
5. Record the migration in the project DEVLOG with before/after word counts.

## Read and write cycle

> ⚠️ **Open: this section is a procedure, not a rule.** Six ordered steps that must run every
> time. By `agent-behaviour.md` §1 "Routing a new finding", procedures belong in an invoked
> skill, where they load in full at the moment of use, rather than in a spec that relies on
> being remembered. Unresolved — decide when the memory work is next picked up.

1. At entry, read Layer 0 and the bridge. Follow only recall links relevant to the
   task. Do not load complete vaults, history, or every private-memory index.
2. At a meaningful checkpoint (confirmed decision, verified fix, correction or
   handoff), compare the learning with its existing authoritative page. Record only
   what changes a future decision; routine tool output is not durable knowledge.
3. Capture evidence and update the authoritative page using the destination's
   conventions. Label provenance per [`agent-behaviour.md`](./agent-behaviour.md) §2 — it owns
   that rule. For mixed evidence label each claim separately; a hypothesis never
   silently becomes policy.
4. Reconcile contradicted claims and inbound recall links in the same pass. Preserve
   provenance and explain supersession; a newer timestamp alone does not win.
5. Update the bridge with the resulting link and current state. Record the activity
   in DEVLOG; vault edits also need the vault's index and append-only log.
6. Closeout checks for missed captures and outstanding contradictions. It does not
   duplicate the knowledge in tool-private memory. A no-change session needs no
   new knowledge page or invented learning.

Re-read a destination immediately before editing. Apply targeted edits; if another
writer changed the same claim, reconcile using evidence or leave the conflict
pending. Never overwrite the whole page from an earlier snapshot.

## Automation boundary

This protocol authorises in-session maintenance within the user's task scope; it
does not install a scheduler or guarantee agents execute instructions. Background
capture is governed separately by the KB spec's staging restriction. Publishing,
external consumers and filesystem permissions retain their own controls.

## Pilot record

Piloted on one production project 2026-10-02 → 10-05: bridge 204KB
(~32k words) → ~600 words; fresh-session recall passed for a Claude subagent (4/4) and Codex
CLI (5/5, including recall of a bridge update written by a Claude session). Gemini untested.
Evidence: that project's DEVLOG, 2026-10-03 and 2026-10-05.

## Adoption gate (for changes to this protocol)

Pilot one project before changing this protocol estate-wide.
Record structural checks and a fresh-session recall trial separately. The trial
asks each supported agent to find the same decision, its source, an unresolved
item, and the correct write destination; then verify one agent's update is recalled
by the other. Record actual loaded context when available, otherwise word counts
as a proxy. Do not report cross-agent recall as passed from file checks alone.
