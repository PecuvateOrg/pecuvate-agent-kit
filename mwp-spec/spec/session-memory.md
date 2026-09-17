# MWP — Shared Session Memory

Normative opt-in protocol. A project adopts it by adding a **Shared Memory**
section to its Layer 0 file, naming this spec, its session bridge, and its durable
knowledge destinations. Unmapped projects retain their existing memory procedure.

## Ownership and routing

- Project `memory.md` (or its declared private `workspace-docs` location) is the
  shared session bridge. All agents read and update the same file.
- Durable knowledge belongs in an existing authoritative guide, decision record,
  or the acting entity's vault. Record explicit named destinations in Layer 0;
  a parent directory or model-generated guess is not an ownership decision.
- If you run a knowledge-base framework alongside MWP, vault recording should
  follow that framework's own session-learning convention. Keep organisation and
  personal knowledge separate. Shared engineering lessons belong in their owning
  framework/guide unless a technical vault is explicitly mapped.
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
This is a pilot budget, not a measured optimum. Never remove necessary information
solely to meet it. Persistent decisions should link to their authoritative record.

## Read and write cycle

1. At entry, read Layer 0 and the bridge. Follow only recall links relevant to the
   task. Do not load complete vaults, history, or every private-memory index.
2. At a meaningful checkpoint (confirmed decision, verified fix, correction or
   handoff), compare the learning with its existing authoritative page. Record only
   what changes a future decision; routine tool output is not durable knowledge.
3. Capture evidence and update the authoritative page using the destination's
   conventions. Distinguish user decisions, verified observations and hypotheses;
   hypotheses never silently become policy. For mixed evidence, label each claim.
4. Reconcile contradicted claims and inbound recall links in the same pass. Preserve
   provenance and explain supersession; a newer timestamp alone does not win.
5. Update the bridge with the resulting link and current state. Record the activity
   in DEVLOG; vault edits also need the vault's index and append-only log, if your
   knowledge base uses that convention.
6. Closeout checks for missed captures and outstanding contradictions. It does not
   duplicate the knowledge in tool-private memory. A no-change session needs no
   new knowledge page or invented learning.

Re-read a destination immediately before editing. Apply targeted edits; if another
writer changed the same claim, reconcile using evidence or leave the conflict
pending. Never overwrite the whole page from an earlier snapshot.

## Automation boundary

This protocol authorises in-session maintenance within the user's task scope; it
does not install a scheduler or guarantee agents execute instructions. Background
capture is governed separately by whatever staging restriction your knowledge-base
framework defines, if you have one. Publishing, external consumers and filesystem
permissions retain their own controls.

## Adoption gate

Pilot one project before migrating its private memory or enabling other projects.
Record structural checks and a fresh-session recall trial separately. The trial
asks each supported agent to find the same decision, its source, an unresolved
item, and the correct write destination; then verify one agent's update is recalled
by the other. Record actual loaded context when available, otherwise word counts
as a proxy. Do not report cross-agent recall as passed from file checks alone.
