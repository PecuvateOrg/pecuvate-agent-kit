#!/usr/bin/env node
// Social CLI — publish directly to LinkedIn (personal profile) and X.
//   node cli.mjs set     <KEY>                 store a credential (hidden prompt)
//   node scripts/social/cli.mjs connect <linkedin|x>   one-time sign-in (browser)
//   node scripts/social/cli.mjs whoami  <linkedin|x>   check the stored connection
//   node scripts/social/cli.mjs post    <linkedin|x> <file> [--publish]
// A post file is plain text. For an X thread, separate posts with a line "---".
// Without --publish, `post` only shows what would be sent.
import { createServer } from 'node:http'
import { randomBytes, createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { platforms, PORT } from './platforms.mjs'
import { putSecret } from './secrets.mjs'

const [cmd, name, file, ...flags] = process.argv.slice(2)
const platform = platforms[name]
if (cmd === 'set' ? !/^[A-Z][A-Z0-9_]*$/.test(name ?? '') : !platform || !['connect', 'whoami', 'post'].includes(cmd)) {
  console.error('Usage: cli.mjs set <KEY> | cli.mjs <connect|whoami|post> <linkedin|x> [file] [--publish]')
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

async function connect() {
  const state = randomBytes(16).toString('hex')
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const url = await platform.authUrl(state, challenge)

  await new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const q = new URL(req.url, 'http://localhost').searchParams
      if (!req.url.startsWith('/callback')) return res.end()
      try {
        if (q.get('state') !== state) throw new Error('state mismatch: start again')
        if (q.get('error')) throw new Error(`${q.get('error')}: ${q.get('error_description') ?? ''}`)
        const result = await platform.exchange(q.get('code'), verifier)
        res.end(`Connected ${name} as ${result.who}. You can close this tab.`)
        console.log(`Connected ${name} as ${result.who}${result.expiresInDays ? ` (token lasts ${result.expiresInDays} days)` : ''}. Tokens saved to your secret store.`)
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

async function post() {
  if (!file) throw new Error('post needs a file')
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
    const value = await promptHidden(`Paste ${name} (hidden), then Enter: `)
    if (!value) throw new Error('nothing entered')
    await putSecret(name, value)
    console.log(`${name} saved (${value.length} characters).`)
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
