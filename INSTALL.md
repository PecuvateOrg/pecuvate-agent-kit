# Installing PecuvateAgentKit

**This file is written as literal step-by-step instructions for an AI coding
agent to execute on behalf of a user who just cloned this repo.** If you are
an agent reading this because the user asked you to "follow INSTALL.md" (or
similar), carry out the steps below in order and report what you did at the
end.

---

## Steps

### 1. Install the skills

Copy the *contents* of `skills/mwp/` — that is, each of the 10 skill
subfolders individually (`init-mwp/`, `init-mwp-developer/`,
`init-mwp-automation/`, `init-mwp-cms/`, `init-mwp-content/`, `init-mwp-hub/`,
`init-mwp-tool/`, `audit-mwp/`, `update-mwp/`, `mwp-health/`) — into:

- `~/.claude/skills/` on macOS/Linux
- `%USERPROFILE%\.claude\skills\` on Windows

**Do not copy the `mwp` wrapper folder itself** — only its children. The
result should be `~/.claude/skills/init-mwp/`, `~/.claude/skills/audit-mwp/`,
and so on, sitting directly under `skills/`, not nested inside an `mwp/`
subfolder.

If a folder with a given skill's name already exists at the destination, skip
copying that one skill and note it — do not overwrite silently. Report to the
user which skills (if any) were skipped, so they can decide whether to
overwrite the existing copy by hand.

### 2. Install the spec

Copy the whole `mwp-spec/` folder into:

- `~/.claude/mwp-spec/` on macOS/Linux
- `%USERPROFILE%\.claude\mwp-spec\` on Windows

Every shipped skill reads from this installed path (`~/.claude/mwp-spec/...`),
not from wherever this cloned repo happens to live. The spec must be at this
exact location for the skills to find it.

### 3. Verify

Confirm both of the following exist and are readable before reporting success:

- `~/.claude/skills/init-mwp/SKILL.md`
- `~/.claude/mwp-spec/spec/CONTEXT.md`

If either is missing, re-check steps 1–2 before continuing.

### 4. Reload

Tell the user to restart or reload their Claude Code session so it picks up
the newly installed skills. Skills already loaded into a running session will
not be detected until it restarts.

---

Once installed, `/init-mwp` is the entry point — it asks what the new project
is for and routes to the right scaffolding skill. `/audit-mwp` and
`/mwp-health` work against any existing project, MWP or not.

---

## If your agent isn't Claude Code

Steps 1–4 above are Claude Code's own convention (`~/.claude/skills/`,
`~/.claude/mwp-spec/`) — a different tool won't read from those paths and
won't have an equivalent auto-triggering skill format. You don't need
Claude Code to use this repo, but you do need your agent to do a translation
step instead of a file-copy step:

1. **Don't copy files into `~/.claude/`.** Leave this cloned repo where it
   is, or copy just `mwp-spec/` somewhere stable inside your own project
   (e.g. `docs/mwp-spec/`) — pick one location and keep it fixed.

2. **For each skill you want** (`skills/mwp/<name>/SKILL.md` +
   `GUIDE.md`), read both files and translate them into your tool's own
   instruction format — a Cursor `.cursor/rules/<name>.mdc`, a Windsurf
   `.windsurfrules` entry, a `.github/copilot-instructions.md` section,
   an Aider convention file, or whatever your tool actually reads.
   Preserve, at minimum:
   - the frontmatter `description:` — it's the trigger condition (when
     this should activate)
   - the precondition line about confirming the spec is readable
   - the numbered steps in order
   - any reference to `~/.claude/mwp-spec/...` — rewrite every one of
     these to wherever you actually put `mwp-spec/` in step 1. This is
     the one thing most likely to silently break in translation: a
     skill that still points at `~/.claude/mwp-spec/spec/CONTEXT.md`
     after being moved into a Cursor rule will fail the precondition
     check (correctly) rather than reading the wrong file — if that
     happens, look for a missed path rewrite before assuming the spec
     didn't install.

3. **No auto-triggering?** Some tools don't support conditional
   activation the way Claude Code skills do. In that case, just tell
   your agent directly: "read `skills/mwp/init-mwp/SKILL.md` in this
   repo and follow it" — the file works as a plain instruction set with
   zero translation needed, you just lose the automatic "this fires when
   I say X" behaviour.
