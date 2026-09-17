---
name: init-mwp-hub
description: Scaffold an MWP structure for a parent hub workspace — a Layer 1 product hub that contains nested child project repos rather than code of its own. Invoked by init-mwp when the project type is matched, or directly via /init-mwp-hub. Sets up the 7-file hub root (CLAUDE.md, AGENTS.md, GEMINI.md, CONTEXT.md, DEVLOG.md, memory.md, brand-identity.md), a .gitignore covering every nested child repo, and an optional workspace-docs/ directory holding internal docs on behalf of public child repos.
---

**Before doing anything else:** confirm `~/.claude/mwp-spec/spec/CONTEXT.md` is readable. If it is not, stop and tell the user to finish the spec-install step in this repo's INSTALL.md — do not improvise MWP structure from memory.

Reference guide: `GUIDE.md` (same folder as this file)

Scaffold an MWP structure for a parent hub workspace.

A hub is not a project. It contains **no code** — only other repositories. Its
job is to route to its children and hold what is true across all of them.

## Canonical Scaffold

```
hub-root/
|- CLAUDE.md            <- Layer 0 — routing to child projects only
|- AGENTS.md            <- cross-model adapter; points to CLAUDE.md
|- GEMINI.md            <- cross-model adapter; points to CLAUDE.md
|- CONTEXT.md           <- Layer 1 — the room description for this hub
|- DEVLOG.md            <- hub-level decisions only, never child entries
|- memory.md            <- hub-level state
|- brand-identity.md    <- only if the hub owns a brand
|- .gitignore           <- every nested child repo + environment files
|- workspace-docs/      <- optional; see Step 5
|   `- <child-repo>/
|       |- DEVLOG.md
|       `- memory.md
`- <Child Project>/     <- nested repo, gitignored, never tracked here
```

**Deliberately absent** — `README.md`, `agent-roles.md`, `skills.md` (leaf-project
files; a hub has no roles or skills of its own), and `src/`, `planning/`, `ops/`,
`netlify.toml` (a hub builds nothing).

---

## State Detection

Check what already exists at the hub root:

- **Some MWP files present** → extend them. Never clobber an existing
  `CONTEXT.md` or `brand-identity.md`; read first, add the missing sections.
- **Already a git repo** → skip Step 4, but still verify Step 3's `.gitignore`
  covers every child and every credential file.
- **Nothing present** → fresh scaffold. Start at Step 1.

---

## Steps

### 1. Map the children

List every immediate subdirectory. For each, record whether it is a nested git
repo (`ls -d <dir>/.git`) and whether its remote is **public or private** — the
public ones drive Step 5.

### 2. Confirm the hub identity

Confirm with the user: hub name, what it owns, and which children belong to it.
Do not infer a brand — ask whether the hub owns one before creating
`brand-identity.md`.

### 3. Write .gitignore FIRST

Before any `git init`. It must list:

- every nested child repo directory, by name, with a trailing slash
- every credential file at the hub root, including `.bak` and similar variants
- `node_modules/`, build output

**Never open a credential file to check what it holds.** Its presence is enough.
If your workspace has its own agent-security conventions doc, follow it for credential handling.

### 4. Initialise and verify

`git init`, then **inspect what is staged before the first commit**. If any
credential file or child-repo content appears, stop and fix `.gitignore`. Only
then create the remote — **private**, always. A hub holds cross-project state
and never belongs in a public repo.

### 5. Set up workspace-docs/ (only if a child repo is public)

A public child repo must not track its own `DEVLOG.md` or `memory.md` — they
carry operational detail, live identifiers and commercial state. The hub holds
them instead, one directory per child, named after the child's **repo** (kebab,
no spaces).

A parent repo **cannot** track files inside a nested git repo — git refuses
silently, staging nothing and reporting success. The files must physically move.

Three layers, all required:

1. **Routing** — the child's `CLAUDE.md` declares where its docs now live
2. **Resolution** — your closeout process (if you have one) reads that declaration instead of assuming `./DEVLOG.md`
3. **Enforcement** — the child's `.gitignore` lists both files, and its CI fails
   if either reappears

Layers 1 and 2 are instructions and can be missed. Layer 3 cannot.

### 6. Document the mechanism in the hub's CONTEXT.md

A workspace `CONTEXT.md` is the room description: process, inputs and
outputs, tools, and **constraints local to this workspace**. The workspace-docs
mechanism is exactly that.

It does **not** go in the root `CONTEXT.md`, which is reserved for genuinely
cross-cutting content at fixed session cost.

### 7. Register the hub

If your workspace has a root-level `CLAUDE.md` (routing table) and `CONTEXT.md`
(projects table) above this hub, add the hub to both. If your workspace has no
such root files, skip this step — a hub does not require one to function.

---

## Rules

- A hub contains no code — never scaffold `src/`, `planning/`, `ops/` or `netlify.toml`
- Never `git init` before `.gitignore` exists and covers the children and credential files
- Never open a credential file; its presence is all you need
- A hub repo is always **private**
- Never clobber an existing `CONTEXT.md` or `brand-identity.md` — extend it
- The hub `DEVLOG.md` holds hub-level entries only; child entries live in `workspace-docs/<child>/`
- Only create `workspace-docs/` for children whose repo is **public** — a private child keeps its own docs in place
