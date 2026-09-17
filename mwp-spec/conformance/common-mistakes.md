# MWP — Common Mistakes

The seven ways an MWP project degrades in practice, and the fix for each.
Companion to [checklist.md](./checklist.md): the checklist tests what is
mechanically verifiable, this names the failures that need judgement.

Originally promoted from a vendored copy that had grown independently inside one
project's own docs folder. The framework had no equivalent at the time, so
tombstoning that copy would have destroyed it.

---


The seven mistakes people make most often when setting up the folder architecture, and how to fix each one.

---

## Mistake 1 — CLAUDE.md Too Long

The CLAUDE.md is a routing file. It tells Claude where things are and where to go. It is not a project brief, a style guide, or a brain dump.

When CLAUDE.md gets too long, two things happen: Claude burns tokens reading irrelevant information, and the routing instructions get buried in noise.

**Fix:** CLAUDE.md should fit on one screen — identity, folder structure, routing table, naming conventions. That is it. If it is longer than 40–50 lines, you have context files hiding inside it. Pull them out into the workspace CONTEXT.md files where they only load when needed.

---

## Mistake 2 — No Routing Table

Some people set up the folders and write the context files but never put a routing table in CLAUDE.md. They assume Claude will figure it out. Sometimes it does — but "sometimes" is the problem. Without a routing table, Claude guesses which files to read, reads everything (wasting tokens), or reads the wrong context file entirely.

**Fix:** The routing table does not need to be complicated. Three columns: task, where to go, what to read. One row per type of work. If you have Layer 3 skills, add a fourth column.

| Task | Go to | Read |
|---|---|---|
| Write content | `/script-lab` | `CONTEXT.md` |
| Build something | `/production` | `CONTEXT.md` |
| Publish or schedule | `/distribution` | `CONTEXT.md` |

---

## Mistake 3 — Too Many Workspaces

Eight workspaces for a project that really only has two or three modes of work. The overhead of maintaining the system becomes bigger than the work itself. Context files go stale. Claude spends more time navigating than working.

**Fix:** Start with two or three workspaces. The question to ask: "Do I shift mental modes between these tasks?" Writing and building are different mental modes — two workspaces. Drafting and editing are the same mental mode at different stages — one workspace with a process inside it.

If you are not sure whether something deserves its own workspace, it does not. Keep it as a subfolder inside an existing workspace and split it out later if the work grows.

---

## Mistake 4 — Context Files Describing Claude Instead of the Work

Context files full of behavioral instructions: "Be creative. Be concise. Be professional. Think step by step." Thirty lines on how Claude should behave and two lines on the actual project.

Claude responds to context about the work far more than context about itself. "You are a senior copywriter" gives Claude a role. "The audience is mid-market HR directors who have tried three other tools and are skeptical of AI claims" gives Claude something to actually work with.

**Fix:** Flip the ratio. 80% describing the work — what the project is, who the audience is, what has been done, what good output looks like, what to avoid. 20% or less on behavioral instructions. If your context file reads like a personality quiz, rewrite it. If it reads like a project brief a new team member could pick up and start from, you are in the right place.

---

## Mistake 5 — Never Updating Context Files

The setup works great for two weeks. Then the project evolves — new requirements, new direction, new constraints — but the context files still say what they said on day one. Output starts drifting. Claude is doing exactly what the context tells it to do. The context is just stale.

**Fix:** Treat context files like working notes. When the project changes, edit the context. When a constraint no longer applies, remove it. This takes 30 seconds per edit and is the single highest-leverage habit in the whole system.

Consider adding a `Last updated` line at the top of each context file. When you open a workspace and see "Last updated: six weeks ago," you know to review it before working.

---

## Mistake 6 — Everything in One Flat Folder

The opposite of too many workspaces. Fifty files in one directory, no subfolders. CLAUDE.md tries to route between them using file names alone. Claude reads the whole listing, picks what it thinks is relevant, and often picks wrong.

**Fix:** If you have more than 8–10 files at the same level, you need subfolders. Group by workspace (what kind of work), then by stage or type within the workspace. The folder structure is the architecture — let it do that job.

---

## Mistake 7 — Building the Whole System Before Using It

The most common mistake. An entire weekend building a perfect architecture — six workspaces, detailed context files, skills wired into every workspace, a routing table with twenty rows — without using Claude once during the process. Then you start using it and realize half the decisions do not match how you actually work.

**Fix:** Build the minimum. One CLAUDE.md, one or two workspaces, one CONTEXT.md per workspace. Start working. After a few days you will know what is missing. Add it then. After a week you will know what is wrong. Fix it then.

The best setups were all built incrementally — started simple and grew from real use. Your first version should take 15 minutes. If it took longer, you over-built.

---

## The Pattern Across All Seven

Keep the system small. Keep it focused on the work, not on Claude. Update it as you go. Let the structure grow from use, not from planning.

The moment the folder architecture starts feeling heavy or complicated, something went wrong. Go back to the three layers: **map, rooms, tools**. If each one is doing only its job, the system stays clean.
