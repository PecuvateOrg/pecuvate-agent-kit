// Local secret store for the social CLI. Values are never logged.
//
// Default backend: one JSON file, readable only by you (mode 600), at
//   ~/.config/agent-kit-social/secrets.json   (override with AGENT_KIT_SOCIAL_SECRETS)
// An environment variable with the same name as a key always wins on read,
// so a CI runner or a secrets manager can inject values without the file.
//
// To use a real secrets manager (Vault, 1Password, AWS Secrets Manager...),
// replace getSecret/putSecret below. Nothing else in the CLI needs to change.
import { readFileSync, writeFileSync, mkdirSync, chmodSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const FILE = process.env.AGENT_KIT_SOCIAL_SECRETS ?? join(homedir(), '.config', 'agent-kit-social', 'secrets.json')

function load() {
  return existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {}
}

export async function getSecret(name) {
  const value = process.env[name] ?? load()[name]
  if (typeof value !== 'string' || !value) throw new Error(`${name} is not set (see social-connect GUIDE.md)`)
  return value
}

export async function putSecret(name, value) {
  const all = load()
  all[name] = value
  mkdirSync(dirname(FILE), { recursive: true, mode: 0o700 })
  writeFileSync(FILE, JSON.stringify(all, null, 2), { mode: 0o600 })
  chmodSync(FILE, 0o600)
  // Re-read: never trust the write returning cleanly.
  if (load()[name] !== value) throw new Error(`${name} did not read back after write`)
}
