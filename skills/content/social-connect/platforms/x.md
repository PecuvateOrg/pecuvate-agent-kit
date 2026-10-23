# X (`x`)

### What you get
Posts and threads on the person's own X account. Pay-per-use API with **prepaid credits**: about $0.015 per post, about $0.20 if the post contains a link (October 2026; check current pricing).

### Before you start
- The X account that will post. The developer account must be created **while signed in as that account**.
- A card, and a decision on how much credit to buy.

### Steps

| # | Who | Step |
|---|---|---|
| 1 | Person | https://developer.x.com/en/portal/petition/essential/basic-info, signed in as the posting account. Paste the use case below |
| 2 | Person | App → **User authentication settings**: permissions **Read and write**; type **Web App, Automated App or Bot**; callback `http://localhost:8743/callback`; website URL |
| 3 | Person | **Keys and tokens** → the **OAuth 2.0** Client ID and Client Secret (not the "API Key and Secret" pair). The secret shows once; regenerate if missed |
| 4 | Person | **Billing → buy credits.** A card alone is not enough |
| 5 | Person | `node cli.mjs set X_CLIENT_ID`, `node cli.mjs set X_CLIENT_SECRET` |
| 6 | Agent | Check with X (below) |
| 7 | Agent + person | `connect x` → approve → `whoami x` **twice** (the second call proves the rotating refresh token was saved) |
| 8 | Agent | Dry run, approval, `--publish`. Threads: one file, posts separated by a line containing only `---` |

### Form answers
**Use case:**
> I will use the X API to publish my own content to my own X account. I review and approve every post before it is published. I will not post on behalf of other users, collect other users' data, send automated replies or DMs, or share X data with third parties. Around `<2–10>` posts per week.

### Credentials
`X_CLIENT_ID`, `X_CLIENT_SECRET` (person). Saved by `connect`: `X_REFRESH_TOKEN`.

**Check with X:** send a token request with a made-up code, once with the real secret and once with a deliberately wrong one. Real secret: HTTP **400** (bad code). Wrong secret: HTTP **401**. Print status codes only.

### Tokens
Access token 2 hours. The refresh token **rotates on every use**: the CLI saves the new one each time. If a save ever fails, run `connect x` again.

### Errors we have hit

| Error | Cause | Fix |
|---|---|---|
| HTTP 402 `credits-depleted` | No purchased credits (a card on file is not credit) | Billing → buy credits |
| HTTP 401 at token refresh | A refresh token was used twice (an old copy) | `connect x` again |
| Thread stops halfway | One post failed; earlier posts stay up | The error names the failed post; post the rest manually or delete and retry |

### Official links
- Developer portal: https://developer.x.com
- OAuth 2.0 PKCE: https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/authorization-code
- Create post: https://docs.x.com/x-api/posts/create-post
