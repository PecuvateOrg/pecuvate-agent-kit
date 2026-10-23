#!/usr/bin/env node
// Social CLI: publish directly to your own accounts.
//   node cli.mjs set     <KEY>                       store a credential (hidden prompt)
//   node cli.mjs connect <platform>   one-time sign-in (browser)
//   node cli.mjs whoami  <platform>   check the stored connection
//   node cli.mjs post    <linkedin|linkedin-page|x> <file> [--publish]
//   node cli.mjs post    youtube <video> --title "..." [--description <file>] [--privacy private|unlisted|public] [--publish]
//   node cli.mjs post    tiktok[-<label>] <video> [--publish]
//   node cli.mjs post    instagram[-<label>] <media.jpg|.mp4> [more media…] [--caption <file>] [--publish]
//   node cli.mjs post    tiktok[-<label>] <video> --direct --privacy <level>
//        [--caption <file>] [--no-comment] [--no-duet] [--no-stitch] [--brand-own|--brand-paid] [--aigc] [--publish]
// Platforms: linkedin, linkedin-page, x, youtube, tiktok[-<label>], instagram[-<label>] (one per account).
// Instagram: one .jpg = image, one .mp4/.mov = Reel, several = carousel (max 10).
// A post file is plain text. For an X thread, separate posts with a line "---".
// YouTube uploads default to private; TikTok uploads land as drafts in the app inbox
// unless --direct, which posts to the profile (privacy has no default, as TikTok requires).
// Without --publish, `post` only shows what would be sent.
import { createServer } from 'node:http'
import { randomBytes, createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { getPlatform, PLATFORM_NAMES, PORT } from './platforms.mjs'
import { putSecret } from './secrets.mjs'
import { mediaType } from './media-host.mjs'

const [cmd, name, file, ...flags] = process.argv.slice(2)
const platform = getPlatform(name)
if (cmd === 'set' ? !/^[A-Z][A-Z0-9_]*$/.test(name ?? '') : !platform || !['connect', 'whoami', 'post'].includes(cmd)) {
  console.error(`Usage: cli.mjs set <KEY> | cli.mjs <connect|whoami|post> <${PLATFORM_NAMES}> [file] [--publish]`)
  process.exit(1)
}

// Hidden prompt: the value is never echoed, logged or placed in shell history.
function promptHidden(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s) }
  return new Promise((resolve) => rl.question(question, (v) => { rl.close(); process.stdout.write('\n'); resolve(v.trim()) }))
}

const X_LIMIT = 280
const LINKEDIN_LIMIT = 3000
const YT_TITLE_LIMIT = 100

const flag = (n) => {
  const i = flags.indexOf(`--${n}`)
  return i >= 0 ? flags[i + 1] : undefined
}

async function connect() {
  const state = randomBytes(16).toString('hex')
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const url = await platform.authUrl(state, challenge, verifier)

  await new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const q = new URL(req.url, 'http://localhost').searchParams
      if (!req.url.startsWith('/callback')) return res.end()
      try {
        if (q.get('state') !== state) throw new Error('state mismatch: start again')
        if (q.get('error')) throw new Error(`${q.get('error')}: ${q.get('error_description') ?? ''}`)
        const result = await platform.exchange(q.get('code'), verifier)
        res.end(`Connected ${name} as ${result.who}. You can close this tab.`)
        console.log(`Connected ${name} as ${result.who}${result.expiresInDays ? ` (token lasts ${result.expiresInDays} days)` : ''}. Tokens saved to the secret store.`)
        resolve()
      } catch (e) {
        res.end(`Failed: ${e.message}`)
        reject(e)
      } finally {
        server.close()
      }
    })
    server.listen(PORT, '127.0.0.1', () => console.log(`Open this link in your browser to connect ${name}:\n\n${url}\n`))
  })
}

async function postVideo() {
  const title = flag('title')
  const privacy = flag('privacy') ?? 'private'
  const descFile = flag('description')
  const description = descFile ? readFileSync(descFile, 'utf8').trim() : ''
  if (!title) throw new Error('youtube needs --title "..."')
  if (title.length > YT_TITLE_LIMIT) throw new Error(`title is over the ${YT_TITLE_LIMIT}-character limit`)
  if (!['private', 'unlisted', 'public'].includes(privacy)) throw new Error('--privacy must be private, unlisted or public')
  const mb = (statSync(file).size / 1e6).toFixed(1)
  console.log(`--- youtube (${privacy}) ${file} ${mb} MB\ntitle (${title.length}/${YT_TITLE_LIMIT}): ${title}\n${description}\n`)
  if (!flags.includes('--publish')) return console.log('Dry run: nothing uploaded. Add --publish to upload.')
  const result = await platform.post({ file, title, description, privacy })
  console.log(`Uploaded: ${result.url} (YouTube set it to: ${result.privacy})`)
}

async function postTiktokDraft() {
  console.log(`--- ${name} (draft to the TikTok inbox) ${file} ${(statSync(file).size / 1e6).toFixed(1)} MB\n`)
  if (!flags.includes('--publish')) return console.log('Dry run: nothing uploaded. Add --publish to upload.')
  const result = await platform.post({ file })
  console.log(`Uploaded: ${result.id} (status ${result.status}). Open the TikTok app inbox to finish and post it.`)
}

const TIKTOK_CAPTION_LIMIT = 2200
const IG_CAPTION_LIMIT = 2200
const IG_CAROUSEL_MAX = 10

async function postInstagram() {
  const captionAt = flags.indexOf('--caption')
  const caption = captionAt >= 0 ? readFileSync(flags[captionAt + 1], 'utf8').trim() : ''
  const files = [file, ...flags.filter((f, i) => !f.startsWith('--') && (captionAt < 0 || i !== captionAt + 1))]
  files.forEach(mediaType)
  if (files.length > IG_CAROUSEL_MAX) throw new Error(`a carousel takes at most ${IG_CAROUSEL_MAX} items`)
  if (caption.length > IG_CAPTION_LIMIT) throw new Error(`caption is over the ${IG_CAPTION_LIMIT}-character limit`)
  const kind = files.length > 1 ? 'carousel' : mediaType(file).startsWith('video') ? 'Reel' : 'image'
  console.log(`--- ${name} (${kind})\n${files.map((f) => `  ${f}${/^https:/.test(f) ? '' : ` ${(statSync(f).size / 1e6).toFixed(1)} MB`}`).join('\n')}\ncaption (${caption.length}/${IG_CAPTION_LIMIT}): ${caption}\n`)
  if (!flags.includes('--publish')) return console.log('Dry run: nothing posted. Add --publish to post.')
  const result = await platform.post({ files, caption })
  console.log(`Posted: ${result.url}`)
}

// Direct Post, following TikTok's UX rules: show who it posts as, privacy chosen
// explicitly from what the creator allows, interactions only where not disabled,
// and the commercial-content disclosure stated.
async function postTiktokDirect() {
  const access = await platform.accessToken()
  const info = await platform.creatorInfo(access)
  const privacy = flag('privacy')
  const captionFile = flag('caption')
  const caption = captionFile ? readFileSync(captionFile, 'utf8').trim() : ''
  const paid = flags.includes('--brand-paid')
  if (!privacy) throw new Error(`--direct needs --privacy, one of: ${info.privacy_level_options.join(', ')}`)
  if (!info.privacy_level_options.includes(privacy)) throw new Error(`@${info.creator_username} cannot post as ${privacy}; allowed: ${info.privacy_level_options.join(', ')}`)
  if (paid && privacy === 'SELF_ONLY') throw new Error('branded content cannot be private (TikTok rule)')
  if (caption.length > TIKTOK_CAPTION_LIMIT) throw new Error(`caption is over the ${TIKTOK_CAPTION_LIMIT}-character limit`)
  const postInfo = {
    title: caption,
    privacy_level: privacy,
    disable_comment: info.comment_disabled || flags.includes('--no-comment'),
    disable_duet: info.duet_disabled || flags.includes('--no-duet'),
    disable_stitch: info.stitch_disabled || flags.includes('--no-stitch'),
    brand_organic_toggle: flags.includes('--brand-own'),
    brand_content_toggle: paid,
    is_aigc: flags.includes('--aigc'),
  }
  const on = (k) => (postInfo[k] ? 'off' : 'on')
  console.log(`--- ${name} DIRECT POST as ${info.creator_nickname} (@${info.creator_username}) ${file} ${(statSync(file).size / 1e6).toFixed(1)} MB
privacy: ${privacy}   comments ${on('disable_comment')}, duet ${on('disable_duet')}, stitch ${on('disable_stitch')}   max ${info.max_video_post_duration_sec}s
disclosure: ${paid ? 'paid partnership' : postInfo.brand_organic_toggle ? 'promotes own business' : 'none'}${postInfo.is_aigc ? ', AI-generated' : ''}
caption (${caption.length}/${TIKTOK_CAPTION_LIMIT}): ${caption}
By posting you agree to TikTok's Music Usage Confirmation${paid ? ' and Branded Content Policy' : ''}.\n`)
  if (!flags.includes('--publish')) return console.log('Dry run: nothing posted. Add --publish to post.')
  const result = await platform.post({ file, postInfo, access })
  console.log(`Posted: ${result.id} (status ${result.status})${result.postIds.length ? ` post id ${result.postIds.join(', ')}` : ''}`)
}

async function post() {
  if (!file) throw new Error('post needs a file')
  if (name === 'youtube') return postVideo()
  if (name.startsWith('instagram')) return postInstagram()
  if (name.startsWith('tiktok')) return flags.includes('--direct') ? postTiktokDirect() : postTiktokDraft()
  const raw = readFileSync(file, 'utf8').trim()
  const parts = name === 'x' ? raw.split(/^---$/m).map((s) => s.trim()).filter(Boolean) : [raw]
  const limit = name === 'x' ? X_LIMIT : LINKEDIN_LIMIT
  parts.forEach((p, i) => {
    console.log(`--- ${name} ${parts.length > 1 ? `${i + 1}/${parts.length} ` : ''}(${p.length}/${limit} chars)\n${p}\n`)
    if (p.length > limit) throw new Error(`part ${i + 1} is over the ${limit}-character limit`)
  })
  if (!flags.includes('--publish')) return console.log('Dry run: nothing posted. Add --publish to post.')
  const result = await platform.post(name === 'x' ? parts : parts[0])
  console.log(`Posted: ${result.url}`)
}

try {
  if (cmd === 'set') {
    const value = await promptHidden(`Paste ${name} (hidden): `)
    if (!value) throw new Error('nothing entered')
    await putSecret(name, value)
    console.log(`${name} saved.`)
  }
  if (cmd === 'connect') await connect()
  if (cmd === 'whoami') {
    const me = await platform.whoami()
    console.log(`${name}: connected as ${me.name ?? `@${me.username}`}`)
  }
  if (cmd === 'post') await post()
} catch (e) {
  console.error(`Error: ${e.message}`)
  process.exit(1)
}
