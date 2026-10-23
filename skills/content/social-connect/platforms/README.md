# Platform playbooks

One file per platform. Each one is the whole route from "no developer account" to "first post live", written so an agent can guide a person through it without researching the platform again.

| Platform | Playbook | CLI target(s) | Review before posting? | Typical time to first post |
|---|---|---|---|---|
| LinkedIn personal profile | [linkedin.md](linkedin.md) § A | `linkedin` | No (self-serve products) | Same day |
| LinkedIn company Page | [linkedin.md](linkedin.md) § B | `linkedin-page` | **Yes**: Community Management API | Days to weeks |
| X | [x.md](x.md) | `x` | No, but **prepaid credits** | Same day |
| YouTube | [youtube.md](youtube.md) | `youtube` | No (unverified app works for your own channel) | Same day |
| TikTok | [tiktok.md](tiktok.md) | `tiktok[-<label>]` | **Yes**, twice: drafts (Upload), then Direct Post | Sandbox same day; production after review |
| Instagram | [instagram.md](instagram.md) | `instagram[-<label>]` | No for your own accounts (Standard Access) | Same day |

Facts were checked in October 2026. Platforms change their rules: when an error contradicts a playbook, check the linked official page, then fix the playbook.

## Every playbook has the same sections

1. **What you get**: what the integration can do, and its limits.
2. **Before you start**: accounts, account types, website pages, emails and domain checks the platform will ask for.
3. **Steps**: numbered, each marked **Person** (needs their login, phone, or a decision) or **Agent** (the agent does it).
4. **Form answers**: fill-in templates for every free-text box we have seen reviewers read. Replace `<…>` placeholders.
5. **Credentials**: the exact key names the CLI reads, and how to check them with the provider before relying on them.
6. **Tokens**: lifetimes and renewal.
7. **Errors we have hit**: error text → cause → fix.
8. **Official links**.

## Shared prerequisites (do these once, before any platform)

| # | Who | Item | Why |
|---|---|---|---|
| 1 | Person | A public **privacy policy** URL and **terms of use** URL on their own domain | LinkedIn, TikTok, YouTube (Google) and Meta all ask for them; TikTok also verifies the domain |
| 2 | Person | A **square logo**, 1024 × 1024 PNG | TikTok requires exactly this size; others accept it |
| 3 | Person | Access to the domain's **DNS** (or someone who has it) | TikTok and Google verify domain ownership with TXT records. The agent can add records if it has DNS access |
| 4 | Agent | Choose the secret store (GUIDE.md § 3) | Every key and token goes there, never into chat |
| 5 | Person + agent | If the person's browser is on another machine, the SSH tunnel (GUIDE.md § 5) | Every sign-in redirects to `localhost` |

Track progress with [../TRACKER.md](../TRACKER.md): copy it into the user's project and tick the stages.
