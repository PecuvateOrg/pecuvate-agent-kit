// Temporary public links for media, for platforms that fetch a URL instead of taking
// an upload (Instagram). Two ways to supply media:
//   - an https:// URL you already host: passed through unchanged
//   - a local file: uploaded to a PRIVATE Supabase Storage bucket, handed over as a
//     signed link that expires, and deleted once the post is out (even on failure)
// Supabase settings: SUPABASE_URL (env or secret store), SUPABASE_SERVICE_ROLE_KEY
// (secret store), bucket AGENT_KIT_SOCIAL_BUCKET (default "social-media"; create it
// private, see GUIDE.md). For another host, replace `stage` with the same shape:
// return { url, remove }.
import { openAsBlob } from 'node:fs'
import { basename } from 'node:path'
import { randomBytes } from 'node:crypto'
import { getSecret } from './secrets.mjs'

const BUCKET = process.env.AGENT_KIT_SOCIAL_BUCKET ?? 'social-media'
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.mov': 'video/quicktime' }
const isUrl = (f) => /^https:\/\//.test(f)

async function storage(path, init = {}) {
  const url = await getSecret('SUPABASE_URL')
  const key = await getSecret('SUPABASE_SERVICE_ROLE_KEY')
  const res = await fetch(`${url}/storage/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers } })
  if (!res.ok) throw new Error(`Storage ${init.method ?? 'GET'} ${path} failed: HTTP ${res.status} ${await res.text()}`)
  return res.json()
}

export function mediaType(file) {
  const path = isUrl(file) ? new URL(file).pathname : file
  const type = TYPES[path.slice(path.lastIndexOf('.')).toLowerCase()]
  if (!type) throw new Error(`${basename(path)}: use .jpg, .mp4 or .mov`)
  return type
}

// Return a URL the platform can fetch (valid for `seconds`) plus a function that removes it.
export async function stage(file, seconds = 3600) {
  if (isUrl(file)) return { url: file, remove: async () => {} }
  const name = `${randomBytes(8).toString('hex')}-${basename(file)}`
  await storage(`object/${BUCKET}/${name}`, { method: 'POST', headers: { 'Content-Type': mediaType(file) }, body: await openAsBlob(file) })
  const { signedURL } = await storage(`object/sign/${BUCKET}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: seconds }),
  })
  return {
    url: `${await getSecret('SUPABASE_URL')}/storage/v1${signedURL}`,
    remove: () => storage(`object/${BUCKET}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [name] }) }),
  }
}
