# TikTok (`tiktok[-<label>]`)

One app can serve several accounts. Each gets its own target, e.g. `tiktok-brand` and `tiktok-founder`; the label only names the stored token.

### What you get
Two ways to post, each needing its own review:

| Mode | Scope | What happens | Before review | After review |
|---|---|---|---|---|
| **Upload** (drafts) | `video.upload` | The video arrives in the TikTok app as an **Inbox notification**; the person opens it, edits and posts | Works with the **Sandbox** keys for Sandbox target users | Works for anyone who signs in |
| **Direct Post** | `video.publish` | Posted straight to the profile | Works **only if the whole account is set to Private** | Public posting allowed |

Start with Upload: it needs less review and suits a human approval step anyway. Add Direct Post later as a second review.

### Before you start
- **Terms of use** and **privacy policy** URLs on the person's domain. TikTok verifies the domain with TXT records.
- A **1024 × 1024** app icon (exactly that size).
- Register as an **Organisation** if it is a company (legal name needed).
- The TikTok accounts' own logins: sign-ins must use the posting account, not the developer-portal login.
- A real **demo video file** (see Errors: a single still image fails).

### Steps — Upload (drafts)

| # | Who | Step |
|---|---|---|
| 1 | Person | https://developers.tiktok.com → **Manage apps → Connect an app**. Category Business/Productivity; website, terms and privacy URLs; icon; description below |
| 2 | Person | Add products: **Login Kit** with platform **Desktop** and redirect `http://localhost:8743/callback` (Web requires an https redirect), and **Content Posting API**. Scopes `user.info.basic` + `video.upload` only: the review checks every scope you ask for |
| 3 | Person + agent | **Verify the URL property** (domain). TikTok gives a TXT value; the agent adds it with DNS access. Content Posting API may ask for a **second** TXT record: keep both |
| 4 | Person | Open the **Sandbox** version of the app (toggle at the top). Add the same products and redirect. Add each posting account under **Target users** |
| 5 | Person | Store the **Sandbox** keys (client key starts `sb`): `set TIKTOK_SANDBOX_CLIENT_KEY`, `set TIKTOK_SANDBOX_CLIENT_SECRET`. Also store the production keys now: `set TIKTOK_CLIENT_KEY`, `set TIKTOK_CLIENT_SECRET` |
| 6 | Agent + person | `connect tiktok-<label>` for each account, signed in as that account. `whoami` |
| 7 | Agent | Upload the demo video: `post tiktok-<label> demo.mp4 --publish` → expect status `SEND_TO_USER_INBOX` |
| 8 | Person | Screen-record the demo: the CLI sign-in and upload, then on the phone: Inbox notification → editor → Post. Join the clips |
| 9 | Person | In the **production** app: submit for review with the demo, description and scope reasons below |
| 10 | Agent | After approval: `export AGENT_KIT_TIKTOK_KEYS=TIKTOK` (production keys) and `connect` each account again. Sandbox tokens do not work with the production app |

### Steps — Direct Post (second review)

> **Status (October 2026):** sign-in with `video.publish`, `creator_info` and the dry run are proven; the live post waits on step 4. Update after the first `PUBLISH_COMPLETE`.

| # | Who | Step |
|---|---|---|
| 1 | Person | Sandbox app → Content Posting API → enable **Direct Post** (`video.publish`) |
| 2 | Agent + person | `connect tiktok-<label>` again: older tokens lack the scope (`scope_not_authorized`) |
| 3 | Agent | Dry run: `post tiktok-<label> video.mp4 --direct --privacy SELF_ONLY --caption caption.txt`. It reads `creator_info` and shows the account, allowed privacy levels and interaction settings |
| 4 | Person | **Set the TikTok account to Private** (app → Settings → Privacy), or use a spare private account added as a Sandbox target user (nothing public is touched) |
| 5 | Agent | Same command with `--publish` → expect `PUBLISH_COMPLETE` |
| 6 | Person | Screen-record steps 3–5 and the post in the app. Switch the account back to Public |
| 7 | Person | Production app → add Direct Post → submit for review with the demo |

**Direct Post rules TikTok checks** (the CLI already follows them): show which account posts; the person picks privacy, with **no default**, from the levels that account allows; comment, duet and stitch can be turned off and are forced off where the account disables them; commercial content is disclosed (`--brand-own` for promoting your own business, `--brand-paid` for a paid partnership, which cannot be private); `--aigc` labels AI-generated content; the consent line about TikTok's music and branded-content policies is shown before posting.

### Form answers
**App description:**
> `<App name>` is `<Company>`'s internal publishing tool. It sends short videos, made from articles we publish on `<domain>`, to our own TikTok accounts (`<@accounts>`). Videos arrive as drafts in the TikTok app, where a staff member reviews and posts them. The tool is used only by `<Company>` staff for these accounts and is not offered to anyone else.

**Scope reasons:**
- `user.info.basic`: confirms which of our accounts is connected.
- `video.upload`: sends our approved video to that account's drafts.
- `video.publish` (Direct Post review only): publishes our approved video to our own account, with privacy and interaction settings chosen by staff for each post.

**Users / volume:** `<n>` (our own accounts); `<2–4>` videos a week per account. Your post-review limit is based on this estimate, so be honest.

### Credentials
`TIKTOK_SANDBOX_CLIENT_KEY/_SECRET`, `TIKTOK_CLIENT_KEY/_SECRET` (person). Saved by `connect`: `TIKTOK_REFRESH_TOKEN_<LABEL>`.

### Tokens
Access token 24 hours, minted per run. Refresh token 365 days and may rotate; the CLI saves it back each time.

### Errors we have hit

| Error | Cause | Fix |
|---|---|---|
| `client_key` at sign-in | Production keys before the app is approved | Use the Sandbox keys (`AGENT_KIT_TIKTOK_KEYS` unset) |
| `non_sandbox_target` | Account is not a Sandbox target user | Sandbox app → Target users → add the account |
| Upload PUT returns HTTP 404 | Video made from a single still image | Use real motion (e.g. a slow zoom); a 10-second clip of a few MB works |
| `spam_risk_too_many_pending_share` | Too many unfinished drafts in the account's Inbox | Discard pending drafts in the app and wait about 24 hours |
| `scope_not_authorized` | Token issued before a scope was added | `connect` again |
| `403 unaudited_client_can_only_post_to_private_accounts` | Direct Post before review, account is public | Set the whole account to Private for the test |
| Status `SEND_TO_USER_INBOX` but nothing in the app | The sign-in belonged to another account | `connect` again in a browser signed in to the right account |
| Review form will not save | No demo video attached | Record the demo first |

### Official links
- Content Posting API: https://developers.tiktok.com/doc/content-posting-api-get-started
- Upload (drafts): https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
- Direct Post: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
- Direct Post UX guidelines: https://developers.tiktok.com/doc/content-sharing-guidelines
- Login Kit for desktop: https://developers.tiktok.com/doc/login-kit-desktop
- Sandbox: https://developers.tiktok.com/doc/add-a-sandbox
