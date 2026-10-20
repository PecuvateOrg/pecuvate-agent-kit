# social-connect — Guide

Direct publishing to **your own** LinkedIn profile and X account. No Buffer, Postiz or other scheduler sits in between.

## 1. Why direct

A hosted scheduler mainly sells *access*: it has been approved by every platform to post on behalf of many people. Posting to **your own** accounts needs far lighter access, so going direct is cheap and keeps you in control. The trade-off: you create a developer app per platform once, and you maintain the connection if a platform changes its API.

| Platform | Access for your own account (checked Oct 2026 — re-verify) |
|---|---|
| LinkedIn personal profile | Self-serve app: "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect" |
| LinkedIn company page | Needs LinkedIn's approval for the Community Management API (weeks). Not covered by this CLI yet |
| X | Pay-per-use API, **prepaid credits**: ~$0.015 per post, ~$0.20 if the post contains a link |
| YouTube | Uploads from an unverified app stay private until Google audits the app |
| TikTok | Private-only until audited; posting to the user's drafts works before that |
| Instagram / Threads | "Instagram API with Instagram Login" — no Facebook Page needed; Business or Creator account required |

## 2. Create the developer apps (user does this, in their browser)

Callback for both: `http://localhost:8743/callback` (change the port with `AGENT_KIT_SOCIAL_PORT`).

**LinkedIn** — https://www.linkedin.com/developers/apps/new
1. Name the app, attach it to a LinkedIn company page the user administers (LinkedIn requires one), add a privacy policy URL and logo.
2. **Settings** tab → **Verify** next to the page → open the generated URL as the page admin.
3. **Products** tab → request **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect** (instant).
4. **Auth** tab → add the callback under *Authorized redirect URLs*. Client ID and Primary Client Secret are on this tab.

**X** — https://developer.x.com/en/portal/petition/essential/basic-info
1. Sign up **as the account that will post**. Use-case text that passes review: *"I will use the X API to publish my own content to my own X account. I review and approve every post before it is published. I will not post on behalf of other users, collect other users' data, send automated replies or DMs, or share X data with third parties. Around two to ten posts per week."*
2. App → **User authentication settings** → Read and write; Web App, Automated App or Bot; the callback; a website URL.
3. **Keys and tokens** → copy the **OAuth 2.0** Client ID and Client Secret (not the "API Key and Secret" pair). The secret shows once; regenerate if missed.
4. **Billing → buy credits.** A card alone is not enough: without credits, posting returns HTTP 402 `credits-depleted`.

## 3. Store credentials — the handover

The user runs these in their own terminal. The **leading space** keeps each line out of shell history (bash/zsh with `HISTCONTROL=ignoreboth` / `setopt HIST_IGNORE_SPACE`). They replace each placeholder; the agent never sees the values.

```bash
 mkdir -p ~/.config/agent-kit-social && chmod 700 ~/.config/agent-kit-social
 node -e 'const f=process.argv[1],fs=require("fs");const s=fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{};Object.assign(s,{LINKEDIN_CLIENT_ID:"<paste>",LINKEDIN_CLIENT_SECRET:"<paste>",X_CLIENT_ID:"<paste>",X_CLIENT_SECRET:"<paste>"});fs.writeFileSync(f,JSON.stringify(s,null,2),{mode:0o600})' ~/.config/agent-kit-social/secrets.json
```

Prefer a real secrets manager? Replace `getSecret`/`putSecret` in `scripts/secrets.mjs`; nothing else changes. Environment variables with the same names also override the file.

## 4. Validate with the provider before use

Send a deliberately invalid authorization code. A good client secret gets past the client check; a bad one is rejected for the client itself.

- **LinkedIn:** good credentials return `invalid_request … authorization code not found`; bad ones return `invalid_client`.
- **X:** compare the real secret with a deliberately wrong one. Good: HTTP **400** (bad code). Bad: HTTP **401**. Only the status code is printed.

## 5. One-time sign-in

`node cli.mjs connect linkedin` (then `x`) prints a link and waits on the callback port. The user opens it, signs in **as the account that should post**, and approves.

**Browser on another machine?** (e.g. the CLI runs on a workstation over SSH.) The callback to `localhost` must reach the CLI. On the browser's machine first run:

```bash
ssh -L 8743:127.0.0.1:8743 <user>@<host-running-the-cli>
```

Without this, the approve button appears to hang and the CLI never receives the code.

## 6. Token lifetimes

| Platform | Lifetime | Renewal |
|---|---|---|
| LinkedIn | Access token 60 days; no refresh token on these products | Run `connect linkedin` again before expiry — put the date somewhere you will see it |
| X | Access token 2 hours; refresh token **rotates on every use** | Automatic: the CLI saves each new refresh token and re-reads it. If the store write fails, run `connect x` again |

## 7. Posting

```bash
node cli.mjs post linkedin post.txt            # dry run: shows text and length
node cli.mjs post linkedin post.txt --publish
node cli.mjs post x thread.txt --publish       # X thread: separate posts with a line containing only ---
```

- LinkedIn commentary escapes its reserved characters, so `#hashtags` post as plain text rather than linked tags.
- A failed post in the middle of an X thread leaves the earlier posts up; the error says which post failed.
