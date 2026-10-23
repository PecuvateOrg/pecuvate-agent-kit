# YouTube (`youtube`)

### What you get
Video uploads (Shorts and long videos) to a channel, as private, unlisted or public. Videos up to 3 minutes in vertical format are treated as Shorts automatically. Quota: 10,000 units a day by default; an upload costs about 1,600, so roughly 6 uploads a day.

### Before you start
- **Which Google account owns the channel?** If the channel is a **Brand Account** (a channel with its own name, managed by people), the app must be **External**: an Internal (Workspace-only) app fails with `403 org_internal` when the Brand channel is chosen.
- Privacy policy and terms URLs on a domain verified in Google Search Console (a `google-site-verification` TXT record).

### Decisions that save time

| Choice | Pick | Why |
|---|---|---|
| Audience | **External** | Works for Brand Accounts and personal channels |
| Publishing status | **In production** (unverified) | Testing mode expires sign-ins every **7 days**. In production but unverified works for up to 100 users; the cost is a "Google hasn't verified this app" warning at sign-in (Advanced → continue) |
| App logo | **None** | Adding a logo forces Google brand verification |
| Client type | **Desktop app** | Allows the `localhost` callback |
| OAuth verification | Optional, later | Only removes the warning. Needs a demo video of sign-in plus upload |
| YouTube API audit | Usually **not needed** | Some guides say uploads from unaudited projects are locked to private. In our test (Oct 2026) an unlisted upload stayed unlisted. **Test before applying.** The audit form is for extra quota |

### Steps

| # | Who | Step |
|---|---|---|
| 1 | Person | https://console.cloud.google.com → new project (e.g. `<Brand> Publisher`) → enable **YouTube Data API v3** |
| 2 | Person | Confirm the domain is verified in Search Console (agent can add the TXT record with DNS access) |
| 3 | Person | **Google Auth Platform → Branding:** app name, support email (Google only offers the signed-in account), developer contact email, home/privacy/terms URLs, authorised domain. **No logo** |
| 4 | Person | **Audience:** External → **Publish app** (In production) |
| 5 | Person | **Clients → Create client → Desktop app.** `node cli.mjs set YOUTUBE_CLIENT_ID`, `set YOUTUBE_CLIENT_SECRET` |
| 6 | Agent + person | `connect youtube` → sign in → **pick the channel** (Brand channels are listed separately) → past the unverified warning → approve. `whoami youtube` shows the channel |
| 7 | Agent | Test upload as `--privacy unlisted`; check what YouTube reports back. If it says `private`, the project is locked and needs the audit |
| 8 | Person | Delete the test video |

### Form answers (only if you apply for OAuth verification)
**Scope justification (`youtube.upload`):**
> `<Company>` uses this app internally to upload its own videos to its own YouTube channel (`<youtube.com/@handle>`). Each video is a short version of an article we publish on `<domain>`. A staff member reviews and approves each video, and the app then uploads it. The app is used only by `<Company>` staff and only for this channel. It requests only the upload scope, and reads, stores or shares no YouTube user data.

`youtube.readonly` is also requested so `whoami` can show which channel was chosen. Drop it if a reviewer objects; only `whoami` stops working.

### Credentials
`YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` (person). Saved by `connect`: `YOUTUBE_REFRESH_TOKEN`.

### Tokens
Refresh token does not expire on a schedule (in production). It is revoked if the person removes the app from their Google account or the token goes unused for 6 months.

### Errors we have hit

| Error | Cause | Fix |
|---|---|---|
| `403 org_internal` | Internal app + Brand Account channel | Audience → External |
| Sign-in stops working after a week | App left in Testing | Audience → Publish app |
| "This Google account has no YouTube channel" | Signed in but picked the personal identity, not the channel | `connect youtube` again and pick the channel |
| Upload reported `private` although `public` was asked | Unaudited project lock | Apply for the YouTube API audit |

### Official links
- videos.insert: https://developers.google.com/youtube/v3/docs/videos/insert
- Resumable uploads: https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol
- OAuth for desktop apps: https://developers.google.com/identity/protocols/oauth2/native-app
- Audit and quota extension: https://support.google.com/youtube/contact/yt_api_form
