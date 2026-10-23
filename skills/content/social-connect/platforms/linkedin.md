# LinkedIn

Two separate developer apps, because LinkedIn requires the **Community Management API** to be the only product on its app:

- **§ A: personal profile.** Posts as the person. Self-serve, same day.
- **§ B: company Page.** Posts as the organisation. Needs LinkedIn's approval.

Both need a LinkedIn **company Page** that the person administers, because every developer app must be attached to one.

---

## § A — Personal profile (`linkedin`)

### What you get
Text posts to the person's own feed. No refresh token: the sign-in lasts 60 days, then the person signs in again.

### Before you start
- The person administers a LinkedIn company Page (any small Page works).
- Privacy policy URL; square logo.

### Steps

| # | Who | Step |
|---|---|---|
| 1 | Person | https://www.linkedin.com/developers/apps/new → app name (e.g. `<Brand> Publisher (personal)`), attach the company Page, privacy policy URL, logo |
| 2 | Person | **Settings** tab → **Verify** next to the Page → open the generated link while signed in as the Page admin → approve |
| 3 | Person | **Products** tab → request **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**. Both are granted instantly |
| 4 | Person | **Auth** tab → *Authorized redirect URLs* → add `http://localhost:8743/callback` |
| 5 | Person | Store Client ID and Primary Client Secret (Auth tab): `node cli.mjs set LINKEDIN_CLIENT_ID`, `node cli.mjs set LINKEDIN_CLIENT_SECRET` |
| 6 | Agent | Check the credentials with LinkedIn (below) |
| 7 | Agent + person | `node cli.mjs connect linkedin` → person opens the link and approves → `whoami linkedin` |
| 8 | Agent | Dry run of the first post, show it, `--publish` after a yes. Note the token's expiry date where the person will see it |

### Credentials
`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (person). Saved by `connect`: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_MEMBER_URN`.

**Check with LinkedIn:** send a token request with a made-up authorization code. Good credentials return `invalid_request … authorization code not found`; a bad client ID returns `invalid_client`. Note that LinkedIn checks the code *before* the secret, so a wrong secret can pass this check. The first `connect` is the real test.

### Tokens
Access token 60 days, no refresh token on these products. Run `connect linkedin` again before expiry.

---

## § B — Company Page (`linkedin-page`)

> **Status (October 2026):** code ready and keys stored before approval; the first live post waits on LinkedIn's review. Update this section after it.

### What you get
Text posts as the organisation, from a second app holding only the Community Management API. It starts at the **Development tier** (low call limits, plenty for a few posts a week). **Standard tier** is a later, second request that needs a screen recording of the working app.

### Before you start
- **A business email at the company's own domain**: reviewers check it.
- Company website live; privacy policy URL.
- **Submit once, complete.** A rejected app cannot reapply, so a rejection means creating a new app.

### Steps

| # | Who | Step |
|---|---|---|
| 1 | Person | Create a **new** app (e.g. `<Brand> Page Publisher`), attached to the company Page, with privacy policy URL and logo. Do not add any other product to it |
| 2 | Person | **Settings** → **Verify** the Page (as in § A step 2) |
| 3 | Person | **Products** → **Community Management API** → Request access. Choose the "managing our own Page" use case, and paste the answers below |
| 4 | Person | **Auth** → add redirect `http://localhost:8743/callback` |
| 5 | Person | Store keys now (the CLI can be ready before approval): `set LINKEDIN_PAGE_CLIENT_ID`, `set LINKEDIN_PAGE_CLIENT_SECRET` |
| 6 | — | **Wait for approval** (email from LinkedIn; Products tab shows it granted). Before then, sign-in fails with `invalid_scope_error` |
| 7 | Agent + person | `node cli.mjs connect linkedin-page`, signed in as a **Page admin**. The CLI finds the Page from the admin's roles; if they admin several Pages, set `LINKEDIN_PAGE_ID` (the number in the Page admin URL) first |
| 8 | Agent | Dry run, approval, `--publish` |

### Form answers

**Business email:** `<name>@<company-domain>`  **Website:** `https://<company-domain>`

**Use case:**
> `<Company legal name>` uses this app internally to publish its own content to its own LinkedIn Page (`<linkedin.com/company/…>`). Each article we publish on `<company-domain>` is adapted into a LinkedIn post. A staff member reviews and approves it, and the app then publishes it to our Page. The app is used only by `<Company>` staff, only for our own Page, and is not offered to any other organisation or user. We do not collect, store or share any LinkedIn member data. We read only basic data about our own posts, to confirm publication.

**Permissions:** `w_organization_social` (post as the Page), `r_organization_social` (read our own Page posts). Nothing else.

**Volume:** `<2–4>` posts a week.

### Credentials
`LINKEDIN_PAGE_CLIENT_ID`, `LINKEDIN_PAGE_CLIENT_SECRET` (person). Saved by `connect`: `LINKEDIN_PAGE_ACCESS_TOKEN`, `LINKEDIN_PAGE_URN`.

### Tokens
Access token 60 days; run `connect linkedin-page` again before expiry.

---

## Errors we have hit

| Error | Cause | Fix |
|---|---|---|
| `invalid_scope_error` at sign-in | The product is not granted yet (Page app still in review), or a scope is not on the app | Wait for approval; check the scopes listed on the Auth tab |
| `invalid_client` | Wrong client ID, or the secret from a different app | Copy both values again from that app's Auth tab |
| Redirect error at sign-in | Callback URL not added | Auth tab → add `http://localhost:8743/callback` exactly |
| Approve button "hangs" | Browser on another machine, no tunnel | GUIDE.md § 5 |
| `#hashtags` appear as plain text | The CLI escapes LinkedIn's reserved characters | Expected; tags are not linked |

## Official links
- Share on LinkedIn: https://learn.microsoft.com/linkedin/consumer/integrations/self-serve/share-on-linkedin
- Community Management API: https://learn.microsoft.com/linkedin/marketing/community-management/community-management-overview
- Posts API: https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api
