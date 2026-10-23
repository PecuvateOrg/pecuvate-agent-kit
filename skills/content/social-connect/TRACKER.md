# Social connections — setup tracker

Copy this file into the user's project (e.g. `tools/social/TRACKER.md`) and keep it current. Any agent picking up the work reads this first: it says where each platform stands and **who it is waiting on**. Detail for every step is in `platforms/<platform>.md`.

**Waiting on:** `person` (needs their login, phone or decision) · `platform` (a review or approval) · `agent` (the agent's next move) · `done`

## Shared prerequisites

| Item | Waiting on | Notes |
|---|---|---|
| Privacy policy URL | | |
| Terms of use URL | | |
| 1024 × 1024 logo | | |
| DNS access for TXT records | | |
| Secret store chosen (`AGENT_KIT_SOCIAL_STORE`) | | |
| Browser on another machine? Tunnel command noted | | |

## Platforms

| Platform / target | 1 Account ready | 2 Developer app | 3 Keys stored + checked | 4 Review | 5 Connected | 6 First post | Waiting on | Next step | Token renew by |
|---|---|---|---|---|---|---|---|---|---|
| LinkedIn personal (`linkedin`) | | | | n/a | | | | | 60 days after connect |
| LinkedIn Page (`linkedin-page`) | | | | | | | | | 60 days after connect |
| X (`x`) | | | | n/a (credits bought?) | | | | | automatic |
| YouTube (`youtube`) | | | | optional | | | | | automatic |
| TikTok drafts (`tiktok-<label>`) | | | | | | | | | 365 days |
| TikTok Direct Post | | n/a | n/a | | | | | | — |
| Instagram (`instagram-<label>`) | | | | n/a (testers) | | | | | refreshed on use |

Mark cells with a date (`2026-10-21`) when done, or `—` when not needed.

## Log

Add a dated line when something changes: an approval arrives, a token is renewed, an error is hit and fixed. If the fix is not in the platform playbook yet, add it there too.
