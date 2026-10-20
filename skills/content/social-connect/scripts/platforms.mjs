// Direct publishing to LinkedIn (personal profile) and X.
// Credentials come from secrets.mjs (local file by default; swap in any secrets manager).
import { getSecret, putSecret } from './secrets.mjs'

export const PORT = Number(process.env.AGENT_KIT_SOCIAL_PORT ?? 8743)
export const REDIRECT_URI = `http://localhost:${PORT}/callback`

// ---------- LinkedIn ----------
// Share on LinkedIn + OpenID Connect. No refresh token on these products:
// the access token lasts 60 days, then `connect linkedin` is run again.

// LinkedIn's versioned API wants a recent YYYYMM; two months back is always live.
function linkedinVersion() {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - 2)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// Post commentary is "little text": these characters must be backslash-escaped.
const escapeLittleText = (s) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`)

export const linkedin = {
  async authUrl(state) {
    const p = new URLSearchParams({
      response_type: 'code',
      client_id: await getSecret('LINKEDIN_CLIENT_ID'),
      redirect_uri: REDIRECT_URI,
      state,
      scope: 'openid profile w_member_social',
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
        client_id: await getSecret('LINKEDIN_CLIENT_ID'),
        client_secret: await getSecret('LINKEDIN_CLIENT_SECRET'),
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${data.error} ${data.error_description ?? ''}`)
    const me = await linkedin.whoami(data.access_token)
    await putSecret('LINKEDIN_ACCESS_TOKEN', data.access_token)
    await putSecret('LINKEDIN_MEMBER_URN', `urn:li:person:${me.sub}`)
    return { who: me.name, expiresInDays: Math.round(data.expires_in / 86400) }
  },

  async whoami(token) {
    token ??= await getSecret('LINKEDIN_ACCESS_TOKEN')
    const res = await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`LinkedIn token rejected: HTTP ${res.status} (run: connect linkedin)`)
    return res.json()
  },

  async post(text) {
    const res = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await getSecret('LINKEDIN_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': linkedinVersion(),
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: await getSecret('LINKEDIN_MEMBER_URN'),
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

export const platforms = { linkedin, x }
