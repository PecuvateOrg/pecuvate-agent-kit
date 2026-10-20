# content-pipeline — Guide

## 1. The model

```
        ARTICLE on your own site — the full piece, the source of truth
                          │
        ┌─────────────────┴─────────────────┐
   LEAD platforms (written for)       DERIVED platforms (cut from it)
   e.g. LinkedIn · X                  e.g. YouTube · Instagram · TikTok · Medium
```

One article becomes 8–10 pieces. The person writes one of them.

**Why the person's account usually leads:** on LinkedIn, posts from people reach far more of their network than posts from company pages, and ideas travel further with a face attached. Lead with the brand account instead when the brand is better known than the person, or when many people write under one brand.

## 2. Intake questions

1. **Source:** where do full articles live (blog path or subdomain)? Is there a backlog?
2. **Platforms:** which 1–2 platforms lead (written for)? Which are derived (cut from the article)?
3. **Accounts:** does the person's account lead and the brand reshare, or the reverse?
4. **Cadence:** articles per week. One or two is sustainable; it produces a daily stream across platforms.
5. **Video:** will the person record themselves? If not, derived video platforms get text-and-image carousels.
6. **Structure:** do articles fall into stable categories (themes, pillars)? These become blog categories and series.

## 3. Scaffold

```
content/
  01-ideas/            backlog: one file per idea or existing article, tagged by category
  02-articles/         approved articles (also published to the site)
  03-briefs/           recording briefs: talking points + 3 short hooks
  04-packs/            one folder per article: every platform piece + schedule
  05-publish/log.md    what went out, where, when, link
brand/
  voice.md             how the person sounds: sentence length, words they use and avoid, tone
  audience.md          who reads, what they already believe, what they want
  platforms.md         per-platform rules (table in § 6)
  profiles.md          every account: handle, bio by length, link, logo/photo
planning/decisions/    one record per setup choice
```

## 4. Filling the brand files

- **profiles.md first.** List every account, then set one standard: name, bio in the lengths each platform allows (cut a long statement down by removing words, not rewording), photo/logo, link back to the site. Check each live profile against it. Inconsistent bios are the most common gap.
- **voice.md from evidence.** Read the person's best 2–3 published pieces. Propose 5–8 voice rules quoting their own sentences as examples. They correct; you record.
- **Personal bios lead with perspective, not credentials.** Keep proof (results, clients) in posts and pinned/featured items, not the bio.

## 5. Stages — who does what

| Stage | Agent | Person | Why the split |
|---|---|---|---|
| 01 Idea | Picks the next article from the backlog | Swap it if wanted | Choosing from a backlog is mechanical |
| 02 Article | Edits to voice rules; publishes to the site as a draft | **Approves** | Their name is on it |
| 03 Brief | 3–5 min talk outline (points, not a script) + 3 hooks | — | People talk better to points than to scripts |
| 04 Record | — | **Records**, batching the week in one sitting | Only they can be the face |
| 05 Cut | Transcribe, cut long video + Shorts, captions, titles | — | Editing is the laborious part |
| 06 Pack | Every platform piece + schedule, per `brand/platforms.md` | — | One article → 8–10 pieces |
| 07 Approve | One review page per article | **Approves the pack** | The only routine task |
| 08 Publish | Posts via `/social-connect`; person's accounts first, brand reshares | — | Automatic |
| 09 Learn | Weekly: what landed, which feeds stage 01 | Reads | Closes the loop |

Target owner time: 1–2 hours a week, mostly recording.

## 6. What one article becomes (default `brand/platforms.md`)

| Platform | Output |
|---|---|
| Site / blog | Full article |
| LinkedIn | Native post, 150–250 words, link in the first comment; one follow-up later in the week from a different angle |
| X | Thread of 5–8 posts + 2–3 standalone lines from the piece |
| YouTube | Short (30–60 s); long talk for major pieces |
| Instagram / TikTok | The Short; carousel of key points on Instagram |
| Medium | Full copy with the canonical link set to the site |
| Threads | Cross-posted from Instagram |

## 7. Scaling up (posting for many clients)

Posting to your own accounts needs light platform access. Posting for **many** people's accounts is multi-tenant access, with stricter reviews (LinkedIn and TikTok audits, Meta business verification). At that point, either complete each platform's review for your own app or build on an open-source, self-hosted scheduler.
