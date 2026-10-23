---
name: social-connect
description: Connect your own LinkedIn (profile and company Page), X, YouTube, TikTok and Instagram accounts so an agent can publish approved posts directly, with no third-party scheduler. One playbook per platform covers the developer app, platform review, form answers, credential checks, tokens and known errors; a tracker records who each step waits on. Use when the user wants to post to any of these from their machine, says /social-connect, "connect my LinkedIn/X/YouTube/TikTok/Instagram", or "post this to …".
---

Reference guide: `GUIDE.md` (same folder). Per-platform playbooks: `platforms/`. Progress: `TRACKER.md`. Scripts: `scripts/` (Node 20+, no dependencies).

## Rules

- **Never ask for a secret in chat** and never print one. Credentials go into the secret store (`scripts/secrets.mjs`) with `node cli.mjs set <KEY>` (hidden prompt), into the store the user chose (GUIDE.md § 3).
- **Never publish without explicit approval of the exact text.** `post` is a dry run unless `--publish` is passed. Show the dry run, get a yes, then publish.
- **Validate credentials with the provider before relying on them** (GUIDE.md § 4). A stored value proves nothing.
- **Ask where the user's browser runs before the sign-in.** If it is a different machine from the one running the CLI, set up the SSH tunnel in GUIDE.md § 5 first.
- **Read the platform's playbook before each step** (`platforms/<platform>.md`), not the web. It records what we learned the hard way; check the official links only when an error contradicts it, then fix the playbook.
- **Mark who does each step.** Person steps need their login, phone or decision; do everything else yourself.

## Steps

1. **Install:** copy `scripts/` to a stable folder in the user's project (e.g. `tools/social/`), and copy `TRACKER.md` beside it.
2. **Shared prerequisites:** `platforms/README.md` § Shared prerequisites. Record them in the tracker.
3. **Per platform, follow its playbook in order:** developer app → store keys with `node cli.mjs set <KEY>` (store chosen per GUIDE.md § 3) → check them with the provider → review if the platform needs one → `node cli.mjs connect <target>` in the background, give the user the link, wait for "Connected … as …" → `whoami`.
4. **First post:** write the approved text to a file, run `post`, show the dry run, then `--publish` after approval.
5. **Keep the tracker current** after every step: what is done, what it waits on (person / platform / agent), the next step, and each token's renewal date. Report that table to the user at the end of each session.
