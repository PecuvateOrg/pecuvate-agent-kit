// Direct publishing to LinkedIn (personal profile and company Page), X, YouTube, TikTok and Instagram.
// Credentials come from secrets.mjs (keychain by default; swap in any secrets manager).
import { createHash } from 'node:crypto'
import { openAsBlob } from 'node:fs'
import { basename } from 'node:path'
import { getSecret, putSecret } from './secrets.mjs'
import { stage, mediaType } from './media-host.mjs'

export const PORT = Number(process.env.AGENT_KIT_SOCIAL_PORT ?? 8743)
export const REDIRECT_URI = `http://localhost:${PORT}/callback`

// ---------- LinkedIn ----------
// No refresh token on these products: access tokens last 60 days, then `connect` again.

// LinkedIn's versioned API wants a recent YYYYMM; two months back is always live.
function linkedinVersion() {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - 2)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// Post commentary is "little text": these characters must be backslash-escaped.
const escapeLittleText = (s) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`)

// Two LinkedIn apps, one shape: the personal app posts as the member (Share on
// LinkedIn + OpenID Connect); the Page app posts as the company Page
// (Community Management API, a separate app because that product must sit alone).
// `prefix` names the Vault keys (`urnKey` the stored author); `author` resolves the URN the post goes out under.
function linkedinApp({ prefix, urnKey, scope, label, author }) {
  const app = {
    async authUrl(state) {
      const p = new URLSearchParams({
        response_type: 'code',
        client_id: await getSecret(`${prefix}_CLIENT_ID`),
        redirect_uri: REDIRECT_URI,
        state,
        scope,
      })
      return `https://www.linkedin.com/oauth/v2/authorization?${p}`
    },

    async exchange(code) {
      const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: await getSecret(`${prefix}_CLIENT_ID`),
          client_secret: await getSecret(`${prefix}_CLIENT_SECRET`),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${data.error} ${data.error_description ?? ''}`)
      const { urn, name } = await author(data.access_token)
      await putSecret(`${prefix}_ACCESS_TOKEN`, data.access_token)
      await putSecret(urnKey, urn)
      return { who: name, expiresInDays: Math.round(data.expires_in / 86400) }
    },

    async whoami(token) {
      return { name: (await author(token ?? (await getSecret(`${prefix}_ACCESS_TOKEN`)))).name }
    },

    async post(text) {
      const res = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: { ...(await linkedinHeaders(await getSecret(`${prefix}_ACCESS_TOKEN`))), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: await getSecret(urnKey),
          commentary: escapeLittleText(text),
          visibility: 'PUBLIC',
          distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        }),
      })
      if (res.status !== 201) throw new Error(`LinkedIn post failed: HTTP ${res.status} ${await res.text()}`)
      const urn = res.headers.get('x-restli-id')
      return { id: urn, url: `https://www.linkedin.com/feed/update/${urn}/` }
    },
  }
  return app
}

const linkedinHeaders = async (token) => ({
  Authorization: `Bearer ${token}`,
  'LinkedIn-Version': linkedinVersion(),
  'X-Restli-Protocol-Version': '2.0.0',
})

async function linkedinGet(url, token, cmd) {
  const res = await fetch(url, { headers: await linkedinHeaders(token) })
  if (!res.ok) throw new Error(`LinkedIn token rejected: HTTP ${res.status} ${await res.text()} (run: connect ${cmd})`)
  return res.json()
}

export const linkedin = linkedinApp({
  prefix: 'LINKEDIN',
  urnKey: 'LINKEDIN_MEMBER_URN',
  scope: 'openid profile w_member_social',
  label: 'member',
  async author(token) {
    const me = await linkedinGet('https://api.linkedin.com/v2/userinfo', token, 'linkedin')
    return { urn: `urn:li:person:${me.sub}`, name: me.name }
  },
})

// The Page is whichever organisation the signed-in admin can post for. If they admin
// more than one, set LINKEDIN_PAGE_ID to the numeric ID of the one to use.
const linkedinPage = linkedinApp({
  prefix: 'LINKEDIN_PAGE',
  urnKey: 'LINKEDIN_PAGE_URN',
  scope: 'w_organization_social r_organization_social',
  label: 'company Page',
  async author(token) {
    const acls = await linkedinGet('https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&state=APPROVED', token, 'linkedin-page')
    const wanted = process.env.LINKEDIN_PAGE_ID
    const orgs = [...new Set(acls.elements.map((e) => e.organization))].filter((o) => !wanted || o.endsWith(`:${wanted}`))
    if (orgs.length !== 1) throw new Error(`expected one Page the member administers, found ${orgs.length}: ${orgs.join(', ')}`)
    const id = orgs[0].split(':').pop()
    const org = await linkedinGet(`https://api.linkedin.com/rest/organizations/${id}`, token, 'linkedin-page')
    return { urn: orgs[0], name: org.localizedName }
  },
})

// ---------- X ----------
// OAuth 2.0 with PKCE, confidential client. Access tokens last 2 hours; the
// refresh token rotates on every use, so the new one is saved straight back.

async function xBasicAuth() {
  const pair = `${await getSecret('X_CLIENT_ID')}:${await getSecret('X_CLIENT_SECRET')}`
  return `Basic ${Buffer.from(pair).toString('base64')}`
}

async function xToken(params) {
  const res = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: { Authorization: await xBasicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`X token request failed: ${data.error} ${data.error_description ?? ''}`)
  await putSecret('X_REFRESH_TOKEN', data.refresh_token)
  return data.access_token
}

export const x = {
  async authUrl(state, codeChallenge) {
    const p = new URLSearchParams({
      response_type: 'code',
      client_id: await getSecret('X_CLIENT_ID'),
      redirect_uri: REDIRECT_URI,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    return `https://x.com/i/oauth2/authorize?${p}`
  },

  async exchange(code, codeVerifier) {
    const token = await xToken({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, code_verifier: codeVerifier })
    const me = await x.whoami(token)
    return { who: `@${me.username}` }
  },

  accessToken: async () => xToken({ grant_type: 'refresh_token', refresh_token: await getSecret('X_REFRESH_TOKEN') }),

  async whoami(token) {
    token ??= await x.accessToken()
    const res = await fetch('https://api.x.com/2/users/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`X token rejected: HTTP ${res.status} (run: connect x)`)
    return (await res.json()).data
  },

  // One string posts a single post; an array posts a thread, each replying to the last.
  async post(parts) {
    const token = await x.accessToken()
    let replyTo
    const ids = []
    for (const text of [parts].flat()) {
      const res = await fetch('https://api.x.com/2/tweets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(replyTo ? { text, reply: { in_reply_to_tweet_id: replyTo } } : { text }),
      })
      if (res.status !== 201) throw new Error(`X post ${ids.length + 1} failed: HTTP ${res.status} ${await res.text()}`)
      replyTo = (await res.json()).data.id
      ids.push(replyTo)
    }
    // /i/status/ resolves without the username, saving a billed users/me read per post.
    return { id: ids[0], url: `https://x.com/i/status/${ids[0]}`, count: ids.length }
  },
}

// ---------- YouTube ----------
// Google OAuth, Desktop client. Use an External app "In production" (unverified is
// fine for your own channel): Testing mode expires sign-ins every 7 days, and an
// Internal app cannot reach a Brand Account channel (403 org_internal). The refresh token is long-lived;
// access tokens last an hour and are minted per run. youtube.readonly is only
// there so whoami can show which channel was chosen at sign-in.

async function googleToken(params) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: await getSecret('YOUTUBE_CLIENT_ID'),
      client_secret: await getSecret('YOUTUBE_CLIENT_SECRET'),
      ...params,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Google token request failed: ${data.error} ${data.error_description ?? ''}`)
  return data
}

export const youtube = {
  async authUrl(state) {
    const p = new URLSearchParams({
      response_type: 'code',
      client_id: await getSecret('YOUTUBE_CLIENT_ID'),
      redirect_uri: REDIRECT_URI,
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      access_type: 'offline',
      prompt: 'consent', // always issue a refresh token, even on reconnect
      state,
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`
  },

  async exchange(code) {
    const data = await googleToken({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI })
    if (!data.refresh_token) throw new Error('Google returned no refresh token: remove the app at myaccount.google.com/permissions and connect again')
    const me = await youtube.whoami(data.access_token)
    await putSecret('YOUTUBE_REFRESH_TOKEN', data.refresh_token)
    return { who: me.name }
  },

  accessToken: async () =>
    (await googleToken({ grant_type: 'refresh_token', refresh_token: await getSecret('YOUTUBE_REFRESH_TOKEN') })).access_token,

  async whoami(token) {
    token ??= await youtube.accessToken()
    const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`YouTube token rejected: HTTP ${res.status} (run: connect youtube)`)
    const ch = (await res.json()).items?.[0]
    if (!ch) throw new Error('This Google account has no YouTube channel: connect again and pick the channel at sign-in')
    return { name: `${ch.snippet.title} (${ch.snippet.customUrl ?? ch.id})` }
  },

  // Resumable upload: one POST for the metadata, one PUT for the bytes. Vertical
  // videos up to 3 minutes are treated as Shorts by YouTube automatically.
  async post({ file, title, description = '', privacy = 'private' }) {
    const token = await youtube.accessToken()
    const video = await openAsBlob(file)
    const start = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': String(video.size),
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify({
        snippet: { title, description, categoryId: '28' }, // 28 = Science & Technology
        status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
      }),
    })
    if (!start.ok) throw new Error(`YouTube upload start failed: HTTP ${start.status} ${await start.text()}`)
    const res = await fetch(start.headers.get('location'), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'video/*' },
      body: video,
    })
    if (!res.ok) throw new Error(`YouTube upload of ${basename(file)} failed: HTTP ${res.status} ${await res.text()}`)
    const data = await res.json()
    // Report what YouTube actually set: an unaudited project may force "private".
    return { id: data.id, url: `https://youtu.be/${data.id}`, privacy: data.status.privacyStatus }
  },
}

// ---------- TikTok ----------
// Login Kit (Desktop) + Content Posting API. Two routes: upload-to-inbox (video.upload),
// where videos land as drafts in the app, and Direct Post (video.publish), which posts
// straight to the profile. Until the app passes review for Direct Post, TikTok forces
// every direct post to SELF_ONLY (private).
// One app, several accounts, so each account keeps its own refresh token. Access tokens
// last a day; refresh tokens a year and may rotate, so the new one is saved back.
// Desktop PKCE wants the SHA-256 challenge hex-encoded, not base64url.

// The unaudited app only accepts sign-ins with its Sandbox keys. Set
// AGENT_KIT_TIKTOK_KEYS=TIKTOK (the production keys) once the app passes review, then
// run connect again: tokens from one app do not work with the other.
const TIKTOK_KEYS = process.env.AGENT_KIT_TIKTOK_KEYS ?? 'TIKTOK_SANDBOX'
const TIKTOK_API = 'https://open.tiktokapis.com/v2'
const TIKTOK_MAX_SINGLE_CHUNK = 64e6
const TIKTOK_CHUNK = 10e6
const TIKTOK_SCOPES = 'user.info.basic,video.upload,video.publish'

async function tiktokCall(path, token, body) {
  const res = await fetch(`${TIKTOK_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json; charset=UTF-8' }) },
    ...(body && { body: JSON.stringify(body) }),
  })
  const data = await res.json()
  if (!res.ok || (data.error?.code && data.error.code !== 'ok')) {
    throw new Error(`TikTok ${path} failed: HTTP ${res.status} ${data.error?.code ?? ''} ${data.error?.message ?? ''}`)
  }
  return data.data
}

function tiktokAccount(slug) {
  const refreshName = `TIKTOK_REFRESH_TOKEN_${slug.toUpperCase()}`

  async function token(params) {
    const res = await fetch(`${TIKTOK_API}/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: await getSecret(`${TIKTOK_KEYS}_CLIENT_KEY`),
        client_secret: await getSecret(`${TIKTOK_KEYS}_CLIENT_SECRET`),
        ...params,
      }),
    })
    const data = await res.json()
    if (!data.access_token) throw new Error(`TikTok token request failed: ${data.error} ${data.error_description ?? ''}`)
    await putSecret(refreshName, data.refresh_token)
    return data.access_token
  }

  const account = {
    async authUrl(state, _challenge, verifier) {
      const p = new URLSearchParams({
        client_key: await getSecret(`${TIKTOK_KEYS}_CLIENT_KEY`),
        response_type: 'code',
        scope: TIKTOK_SCOPES,
        redirect_uri: REDIRECT_URI,
        state,
        code_challenge: createHash('sha256').update(verifier).digest('hex'),
        code_challenge_method: 'S256',
      })
      return `https://www.tiktok.com/v2/auth/authorize/?${p}`
    },

    async exchange(code, verifier) {
      const access = await token({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, code_verifier: verifier })
      return { who: (await account.whoami(access)).name }
    },

    accessToken: async () => token({ grant_type: 'refresh_token', refresh_token: await getSecret(refreshName) }),

    async whoami(access) {
      access ??= await account.accessToken()
      const { user } = await tiktokCall('/user/info/?fields=open_id,display_name', access)
      return { name: user.display_name }
    },

    // What this creator may post right now: nickname, allowed privacy levels, which
    // interactions are switched off, max duration. TikTok requires this before each post.
    async creatorInfo(access) {
      access ??= await account.accessToken()
      return tiktokCall('/post/publish/creator_info/query/', access, {})
    },

    // Without postInfo the video goes to the inbox as a draft; with it, Direct Post.
    // One PUT up to 64 MB, else 10 MB chunks (the last chunk takes the remainder).
    async post({ file, postInfo, access }) {
      access ??= await account.accessToken()
      const video = await openAsBlob(file)
      const size = video.size
      const chunkSize = size <= TIKTOK_MAX_SINGLE_CHUNK ? size : TIKTOK_CHUNK
      const count = Math.floor(size / chunkSize)
      const source_info = { source: 'FILE_UPLOAD', video_size: size, chunk_size: chunkSize, total_chunk_count: count }
      const { publish_id, upload_url } = postInfo
        ? await tiktokCall('/post/publish/video/init/', access, { post_info: postInfo, source_info })
        : await tiktokCall('/post/publish/inbox/video/init/', access, { source_info })
      for (let i = 0; i < count; i++) {
        const start = i * chunkSize
        const end = i === count - 1 ? size : start + chunkSize
        const res = await fetch(upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': 'video/mp4', 'Content-Range': `bytes ${start}-${end - 1}/${size}` },
          body: video.slice(start, end),
        })
        if (!res.ok) throw new Error(`TikTok upload of ${basename(file)} chunk ${i + 1}/${count} failed: HTTP ${res.status} ${await res.text()}`)
      }
      // Direct Post processes asynchronously: poll until it settles (up to ~2 minutes).
      for (let tries = 0; ; tries++) {
        const data = await tiktokCall('/post/publish/status/fetch/', access, { publish_id })
        const done = !postInfo || ['PUBLISH_COMPLETE', 'FAILED'].includes(data.status) || tries >= 24
        if (done) {
          if (data.status === 'FAILED') throw new Error(`TikTok post ${publish_id} failed: ${data.fail_reason}`)
          return { id: publish_id, status: data.status, postIds: data.publicaly_available_post_id ?? [] }
        }
        await new Promise((r) => setTimeout(r, 5000))
      }
    },
  }
  return account
}

// ---------- Instagram ----------
// Instagram API with Instagram Login (no Facebook Page). Professional accounts only;
// your own accounts are app testers, so Standard Access with no review. Media must be
// at a public URL, so each file is staged by media-host.mjs behind a temporary link.
// Tokens last 60 days and are refreshed on use (refresh fails for a token under 24 h
// old, which is still valid, so that failure is ignored).
const IG_GRAPH = 'https://graph.instagram.com'

async function igCall(path, token, params, method = 'GET') {
  const q = new URLSearchParams({ ...params, access_token: token })
  const res = await fetch(`${IG_GRAPH}${path}${method === 'GET' ? `?${q}` : ''}`, method === 'GET' ? {} : { method, body: q })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(`Instagram ${path} failed: HTTP ${res.status} ${data.error?.message ?? ''}`)
  return data
}

function instagramAccount(slug) {
  const tokenName = `INSTAGRAM_TOKEN_${slug.toUpperCase()}`

  const account = {
    async authUrl(state) {
      const p = new URLSearchParams({
        client_id: await getSecret('INSTAGRAM_APP_ID'),
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'instagram_business_basic,instagram_business_content_publish',
        state,
      })
      return `https://www.instagram.com/oauth/authorize?${p}`
    },

    // Short-lived token (1 h) from the code, then swapped for a 60-day one.
    async exchange(code) {
      const res = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: await getSecret('INSTAGRAM_APP_ID'),
          client_secret: await getSecret('INSTAGRAM_APP_SECRET'),
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
          code: code.replace(/#_$/, ''),
        }),
      })
      const short = await res.json()
      if (!short.access_token) throw new Error(`Instagram token exchange failed: ${short.error_message ?? JSON.stringify(short)}`)
      const long = await igCall('/access_token', short.access_token, { grant_type: 'ig_exchange_token', client_secret: await getSecret('INSTAGRAM_APP_SECRET') })
      await putSecret(tokenName, long.access_token)
      return { who: `@${(await account.whoami(long.access_token)).username}`, expiresInDays: Math.round(long.expires_in / 86400) }
    },

    async accessToken() {
      const current = await getSecret(tokenName)
      try {
        const { access_token } = await igCall('/refresh_access_token', current, { grant_type: 'ig_refresh_token' })
        if (access_token !== current) await putSecret(tokenName, access_token)
        return access_token
      } catch {
        return current
      }
    },

    async whoami(token) {
      const me = await igCall('/me', token ?? (await account.accessToken()), { fields: 'user_id,username' })
      return { ...me, name: `@${me.username}` }
    },

    // One .jpg = image post, one .mp4/.mov = Reel, several files = carousel (up to 10).
    async post({ files, caption }) {
      const token = await account.accessToken()
      const { user_id } = await account.whoami(token)
      const staged = await Promise.all(files.map((f) => stage(f)))
      const media = (f, i) => (mediaType(f).startsWith('video') ? { media_type: files.length > 1 ? 'VIDEO' : 'REELS', video_url: staged[i].url } : { image_url: staged[i].url })
      try {
        let container
        if (files.length === 1) {
          container = (await igCall(`/${user_id}/media`, token, { ...media(files[0], 0), caption }, 'POST')).id
          await igReady(container, token)
        } else {
          const children = []
          for (const [i, f] of files.entries()) {
            const { id } = await igCall(`/${user_id}/media`, token, { ...media(f, i), is_carousel_item: 'true' }, 'POST')
            await igReady(id, token)
            children.push(id)
          }
          container = (await igCall(`/${user_id}/media`, token, { media_type: 'CAROUSEL', children: children.join(','), caption }, 'POST')).id
          await igReady(container, token)
        }
        const { id } = await igCall(`/${user_id}/media_publish`, token, { creation_id: container }, 'POST')
        const { permalink } = await igCall(`/${id}`, token, { fields: 'permalink' })
        return { id, url: permalink }
      } finally {
        await Promise.allSettled(staged.map((s) => s.remove()))
      }
    },
  }
  return account
}

// Containers process asynchronously (videos for minutes): poll every 10 s, up to 10 min.
async function igReady(id, token) {
  for (let tries = 0; tries < 60; tries++) {
    const { status_code, status } = await igCall(`/${id}`, token, { fields: 'status_code,status' })
    if (status_code === 'FINISHED') return
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`Instagram container ${id} ${status_code}: ${status ?? ''}`)
    await new Promise((r) => setTimeout(r, 10000))
  }
  throw new Error(`Instagram container ${id} still processing after 10 minutes`)
}

const fixed = { linkedin, 'linkedin-page': linkedinPage, x, youtube }
const multi = { tiktok: tiktokAccount, instagram: instagramAccount }

// TikTok and Instagram take one target per account: `tiktok-<label>`, `instagram-<label>`
// (plain `tiktok` / `instagram` = label "main"). The label only names the stored token.
export function getPlatform(name = '') {
  if (fixed[name]) return fixed[name]
  const m = name.match(/^(tiktok|instagram)(?:-([a-z0-9_]+))?$/)
  return m ? multi[m[1]](m[2] ?? 'main') : undefined
}

export const PLATFORM_NAMES = 'linkedin|linkedin-page|x|youtube|tiktok[-<label>]|instagram[-<label>]'
