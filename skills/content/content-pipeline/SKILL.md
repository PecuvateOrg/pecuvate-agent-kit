---
name: content-pipeline
description: Set up and run a blog-first content pipeline in which one long-form article becomes every platform post, the agent does all the preparation and publishing, and the person only approves and records. Scaffolds the MWP/ICM stage folders and brand files, then runs the weekly cycle. Use when the user wants consistent content across platforms, says /content-pipeline, "set up my content pipeline", "turn this article into posts", or "run this week's content".
---

Reference guide: `GUIDE.md` (same folder). Publishing uses the `social-connect` skill.

## Rules

- **Blog first.** Every piece starts as a full article on the user's own site. Platform posts are cut from it, never written from scratch.
- **The person approves; the agent does the rest.** Nothing publishes without approval of the exact text. The person's routine work is approving and, if they use video, recording.
- **Brand files are the voice.** Never draft a platform piece before `brand/voice.md`, `brand/audience.md` and `brand/platforms.md` are filled in with the user. Drafting from empty brand files produces generic content.
- **Record decisions where they belong:** one decision record per setup choice in `planning/decisions/`.

## Setup (once)

1. **Intake** — ask, one group at a time (GUIDE.md § 2): source channel, lead vs derived platforms, which account leads (person or brand), cadence, video yes/no, backlog of existing writing.
2. **Scaffold** the stage folders and brand files (GUIDE.md § 3). If the project is not yet MWP-structured, run `/init-mwp-content` first.
3. **Fill the brand files with the user** from their existing writing and profiles (GUIDE.md § 4). Read 2–3 of their published pieces before proposing anything.
4. **Write the setup decision record** (`planning/decisions/YYYY-MM-DD-content-pipeline.md`) from the intake answers.
5. **Connect platforms** with `/social-connect`.

## Weekly cycle

Run the stages in GUIDE.md § 5 for each article. Stop at each **approve** stage and wait for the user. After publishing, log what went out to `05-publish/log.md` and, weekly, report what landed (stage 09).
