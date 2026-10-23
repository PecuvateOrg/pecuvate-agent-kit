# Instagram (`instagram[-<label>]`)

One app can serve several accounts, e.g. `instagram-brand` and `instagram-founder`.

> **Status (October 2026):** the code and the media staging are tested; the first live sign-in and post are not yet done. Errors below are the ones the docs warn about, not ones we have hit. Update this file after the first live run.

### What you get
Image posts, Reels and carousels on the person's own Instagram accounts, through **Instagram API with Instagram Login** (no Facebook Page needed). In the CLI, one `.jpg` makes an image post, one `.mp4`/`.mov` makes a Reel, and several files make a carousel (up to 10). Limit about 100 API posts per 24 hours per account.

**Media must be at a public URL** when the post is made: this route has no file upload. Either pass `https://` links you already host, or let the CLI stage local files (`scripts/media-host.mjs`: private Supabase Storage bucket, a link that expires after an hour, deleted after posting).

### Before you start
- Each account must be a **professional account** (Business or Creator): Instagram → Settings → Account type and tools. Switching is free and reversible.
- Privacy policy and terms URLs.
- For local files: a Supabase project with a **private** bucket (default name `social-media`), or your own host (replace `stage` in `media-host.mjs`).

### No review needed for your own accounts
**Standard Access** covers accounts that have a role on the app (added as **Instagram testers**). Advanced Access, which needs App Review and business verification, is only for posting to accounts that are not yours.

### Steps

| # | Who | Step |
|---|---|---|
| 1 | Person | Confirm each account is Business or Creator; switch if not |
| 2 | Person | https://developers.facebook.com → **Create app** → use case **"Manage messaging & content on Instagram"**. App name, contact email, privacy and terms URLs |
| 3 | Person | **Instagram → API setup with Instagram login** → add each account as an **Instagram tester**. Then accept each invite in the account: Instagram → Settings → Website permissions → Apps and websites → Tester invites |
| 4 | Person | **Business login settings** → OAuth redirect `http://localhost:8743/callback` |
| 5 | Person | Store the **Instagram** app ID and secret (shown under API setup with Instagram login; not the Facebook app ID): `set INSTAGRAM_APP_ID`, `set INSTAGRAM_APP_SECRET` |
| 6 | Agent | Media host: create the private bucket and store `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (person runs `set`), or decide to pass hosted URLs |
| 7 | Agent + person | `connect instagram-<label>` for each account, signed in as that account. `whoami` |
| 8 | Agent | Dry run, approval, `--publish` with `--caption caption.txt` |

### Credentials
`INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` (person); `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` if staging locally. Saved by `connect`: `INSTAGRAM_TOKEN_<LABEL>`.

### Tokens
The sign-in gives a 1-hour token, which the CLI swaps for a **60-day** token. That token is refreshed on every use (Instagram refuses refreshes of tokens under 24 hours old, which the CLI ignores), so an account posting at least every couple of months never needs to sign in again.

### Errors to expect

| Error | Cause | Fix |
|---|---|---|
| Sign-in refuses the account | Not a tester, or the invite was not accepted | Step 3 |
| Account cannot be selected | Personal account | Switch to Business or Creator |
| Container `ERROR` | Media URL not reachable, or format wrong (images must be JPEG) | Check the link opens in a private browser window; convert to `.jpg` |
| Storage upload `413` | File over the project's upload size limit (50 MB on Supabase free plan) | Raise the limit, or host the file elsewhere and pass its URL |
| Publishing blocked | Account's linked Page requires Page Publishing Authorization | Complete it in Meta Business settings |

### Official links
- Content publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing
- Instagram API with Instagram Login: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
- Business login and tokens: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
