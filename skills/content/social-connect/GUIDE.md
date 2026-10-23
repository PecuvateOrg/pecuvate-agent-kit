# social-connect — Guide

Direct publishing to **your own** LinkedIn profile and X account. No Buffer, Postiz or other scheduler sits in between.

## 1. Why direct

A hosted scheduler mainly sells *access*: it has been approved by every platform to post on behalf of many people. Posting to **your own** accounts needs far lighter access, so going direct is cheap and keeps you in control. The trade-off: you create a developer app per platform once, and you maintain the connection if a platform changes its API.

| Platform | Access for your own account (checked Oct 2026 — re-verify) |
|---|---|
| LinkedIn personal profile | Self-serve: "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect" |
| LinkedIn company Page | Separate app with the Community Management API; needs LinkedIn's approval |
| X | Pay-per-use API, **prepaid credits**: ~$0.015 per post, ~$0.20 if the post contains a link |
| YouTube | External app "In production", unverified: works for your own channel; an unlisted test upload stayed unlisted |
| TikTok | Drafts to the app Inbox with Sandbox keys before review; Direct Post private-account-only until its own review |
| Instagram | Instagram API with Instagram Login, accounts added as testers (Standard Access, no review); Business or Creator account; media from a public URL |

Posting **for other people's accounts** (clients) is different: each platform treats it as multi-tenant access with stricter review (TikTok and LinkedIn audits, Meta Advanced Access and business verification). Plan for that separately.

## 2. Create the developer apps (person does this, in their browser)

**Follow the playbook for each platform: [platforms/README.md](platforms/README.md).** Each one lists the prerequisites, every step marked person or agent, the form answers reviewers read, how to check the keys, and the errors we have hit. Track progress in [TRACKER.md](TRACKER.md).

Callback for every platform: `http://localhost:8743/callback` (change the port with `AGENT_KIT_SOCIAL_PORT`, and change it in every app).

## 3. Store credentials

**Choose where keys live** with `AGENT_KIT_SOCIAL_STORE` (set it in the shell profile so every run uses the same store):

| Store | Value | For | Notes |
|---|---|---|---|
| Computer keychain | `keychain` (default) | Most people | macOS Keychain, Windows Credential Manager, Linux Secret Service. Encrypted, built in, no sign-up. Linux needs `secret-tool` (package `libsecret-tools`) and a desktop session |
| 1Password | `1password` | People who already use it | Needs the `op` CLI signed in. Vault: `AGENT_KIT_SOCIAL_OP_VAULT` (default `Private`); one item per key, titled `agent-kit-social <KEY>` |
| Local file | `file` | Headless servers with no keychain | `~/.config/agent-kit-social/secrets.json`, owner-only (600). Plain text on disk: the weakest option |

Environment variables with the same names override any store on read. For a team secrets manager, add a backend to `scripts/secrets.mjs` (a `get` and a `put`); nothing else changes.

**Enter each key at a hidden prompt.** The user runs these in their own terminal and pastes each value when asked; nothing is echoed, logged or saved in shell history, and the agent never sees it:

```bash
node cli.mjs set LINKEDIN_CLIENT_ID      # key names for each platform: its playbook, § Credentials
node cli.mjs set LINKEDIN_CLIENT_SECRET
```

Every store receives values on stdin, never as command-line arguments (which other processes can read). Sign-in tokens (§ 5) are saved to the same store automatically.

## 4. Validate with the provider before use

Send a deliberately invalid authorization code and compare the response with a deliberately wrong secret. The per-platform checks are in each playbook under § Credentials. Print status codes and error names only, never values. Some providers check the code before the secret (LinkedIn does), so a pass there proves only the client ID: the first `connect` is the real test.

## 5. One-time sign-in

`node cli.mjs connect <target>` prints a link and waits on the callback port. The user opens it, signs in **as the account that should post**, and approves.

**Browser on another machine?** (e.g. the CLI runs on a workstation over SSH.) The callback to `localhost` must reach the CLI. On the browser's machine first run:

```bash
ssh -L 8743:127.0.0.1:8743 <user>@<host-running-the-cli>
```

Without this, the approve button appears to hang and the CLI never receives the code.

## 6. Token lifetimes

| Platform | Lifetime | Renewal |
|---|---|---|
| LinkedIn (both apps) | Access token 60 days; no refresh token | Run `connect` again before expiry: note the date in TRACKER.md |
| X | Access 2 hours; refresh token **rotates on every use** | Automatic; if a save fails, `connect x` again |
| YouTube | Refresh token long-lived (app "In production") | Revoked if the app is removed from the Google account or unused 6 months |
| TikTok | Access 24 hours; refresh 365 days, may rotate | Automatic within the year; Sandbox → production needs a new `connect` |
| Instagram | 60 days, refreshed on every use | Automatic if used at least every couple of months |

## 7. Posting

Every `post` is a **dry run** unless `--publish` is passed. Show the dry run, get a yes, then publish.

```bash
node cli.mjs post linkedin post.txt [--publish]          # also linkedin-page
node cli.mjs post x thread.txt [--publish]               # thread: posts separated by a line containing only ---
node cli.mjs post youtube video.mp4 --title "…" [--description desc.txt] [--privacy private|unlisted|public] [--publish]
node cli.mjs post tiktok-<label> video.mp4 [--publish]   # draft to the TikTok Inbox
node cli.mjs post tiktok-<label> video.mp4 --direct --privacy <level> [--caption c.txt] [--no-comment] [--no-duet] [--no-stitch] [--brand-own|--brand-paid] [--aigc] [--publish]
node cli.mjs post instagram-<label> a.jpg [b.jpg …|reel.mp4|https://…] [--caption c.txt] [--publish]
```

- LinkedIn escapes its reserved characters, so `#hashtags` post as plain text rather than linked tags.
- A failed post in the middle of an X thread leaves the earlier posts up; the error says which post failed.
- YouTube defaults to `private` and reports the privacy YouTube actually applied.
- TikTok Direct Post has no default privacy, by TikTok's rules: the dry run lists the levels the account allows.
- Instagram media is staged by `scripts/media-host.mjs` and deleted after the post, even on failure.
