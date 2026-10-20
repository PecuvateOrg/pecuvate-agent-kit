---
name: social-connect
description: Connect your own LinkedIn (personal profile) and X accounts so an agent can publish approved posts directly, with no third-party scheduler. Walks through creating each developer app, storing credentials safely, the one-time browser sign-in, and a dry-run-first post command. Use when the user wants to post to LinkedIn or X from their machine, says /social-connect, "connect my LinkedIn", "connect X", or "post this to LinkedIn/X".
---

Reference guide: `GUIDE.md` (same folder). Scripts: `scripts/` (Node 20+, no dependencies).

## Rules

- **Never ask for a secret in chat** and never print one. Credentials go into the secret store (`scripts/secrets.mjs`) with `node cli.mjs set <KEY>` (hidden prompt), into the store the user chose (GUIDE.md § 3).
- **Never publish without explicit approval of the exact text.** `post` is a dry run unless `--publish` is passed. Show the dry run, get a yes, then publish.
- **Validate credentials with the provider before relying on them** (GUIDE.md § 4). A stored value proves nothing.
- **Ask where the user's browser runs before the sign-in.** If it is a different machine from the one running the CLI, set up the SSH tunnel in GUIDE.md § 5 first.

## Steps

1. **Install:** copy `scripts/` to a stable folder in the user's project (e.g. `tools/social/`).
2. **Developer apps:** guide the user through GUIDE.md § 2 for each platform they want. They do this in their own browser, logged in as themselves.
3. **Store credentials:** ask which store the user wants (keychain by default, 1Password, or file for headless servers), then have them run `node cli.mjs set <KEY>` for each key (GUIDE.md § 3). Then run the provider probe in § 4.
4. **Sign in once per platform:** run `node cli.mjs connect <linkedin|x>` in the background, give the user the printed link, wait for "Connected … as …". Confirm with `node cli.mjs whoami <platform>`. For X, run `whoami` twice: the second call proves the rotating refresh token was saved.
5. **First post:** write the approved text to a file, run `node cli.mjs post <platform> <file>`, show the dry run, then `--publish` after approval.
6. **Report** each platform's connected account and token lifetime (GUIDE.md § 6).
