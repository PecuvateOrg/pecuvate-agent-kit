// Secret store for the social CLI. Values are never logged and never passed
// as command-line arguments (other processes can read those); every backend
// receives the value on stdin.
//
// Choose a backend with AGENT_KIT_SOCIAL_STORE:
//   keychain  (default) the computer's own encrypted store:
//             macOS Keychain (`security`), Linux Secret Service (`secret-tool`),
//             Windows Credential Manager (PowerShell PasswordVault)
//   1password the 1Password CLI (`op`), signed in; vault from AGENT_KIT_SOCIAL_OP_VAULT (default "Private")
//   file      ~/.config/agent-kit-social/secrets.json, owner-only (mode 600). For headless servers
//             without a keychain; plain text on disk, so prefer the others.
// An environment variable with the same name as a key always wins on read,
// so a CI runner or another secrets manager can inject values directly.
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, chmodSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const SERVICE = 'agent-kit-social'
const STORE = process.env.AGENT_KIT_SOCIAL_STORE ?? 'keychain'

// Run a command with the secret (if any) on stdin. Returns stdout, or null if the command failed.
function run(cmd, args, input = '', env = {}) {
  const r = spawnSync(cmd, args, { input, encoding: 'utf8', env: { ...process.env, ...env } })
  if (r.error?.code === 'ENOENT') throw new Error(`${cmd} not found: install it or set AGENT_KIT_SOCIAL_STORE (see GUIDE.md)`)
  return r.status === 0 ? r.stdout : null
}

const keychain = {
  darwin: {
    // `security -i` reads commands from stdin, keeping the value out of the process list.
    get: (name) => run('security', ['find-generic-password', '-s', SERVICE, '-a', name, '-w'])?.replace(/\n$/, ''),
    put: (name, value) =>
      run('security', ['-i'], `add-generic-password -U -s ${SERVICE} -a ${name} -w "${value.replace(/["\\]/g, '\\$&')}"\n`) !== null,
  },
  linux: {
    get: (name) => run('secret-tool', ['lookup', 'service', SERVICE, 'account', name]),
    put: (name, value) => run('secret-tool', ['store', `--label=${SERVICE} ${name}`, 'service', SERVICE, 'account', name], value) !== null,
  },
  win32: {
    get: (name) =>
      run('powershell', ['-NoProfile', '-Command',
        `$null=[Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime];` +
        `$c=(New-Object Windows.Security.Credentials.PasswordVault).Retrieve('${SERVICE}',$env:AKS_NAME);$c.RetrievePassword();[Console]::Out.Write($c.Password)`],
      '', { AKS_NAME: name }),
    put: (name, value) =>
      run('powershell', ['-NoProfile', '-Command',
        `$null=[Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime];` +
        `$v=New-Object Windows.Security.Credentials.PasswordVault;` +
        `try{$v.Remove($v.Retrieve('${SERVICE}',$env:AKS_NAME))}catch{};` +
        `$v.Add((New-Object Windows.Security.Credentials.PasswordCredential('${SERVICE}',$env:AKS_NAME,[Console]::In.ReadToEnd())))`],
      value, { AKS_NAME: name }) !== null,
  },
}[process.platform]

const OP_VAULT = process.env.AGENT_KIT_SOCIAL_OP_VAULT ?? 'Private'
const onePassword = {
  // One Password item per key, titled "agent-kit-social <KEY>".
  get: (name) => run('op', ['read', `op://${OP_VAULT}/${SERVICE} ${name}/password`])?.replace(/\n$/, ''),
  put: (name, value) => {
    run('op', ['item', 'delete', `${SERVICE} ${name}`, '--vault', OP_VAULT]) // replace if present
    const template = JSON.stringify({
      title: `${SERVICE} ${name}`,
      category: 'PASSWORD',
      fields: [{ id: 'password', type: 'CONCEALED', purpose: 'PASSWORD', value }],
    })
    return run('op', ['item', 'create', '--vault', OP_VAULT, '-'], template) !== null
  },
}

const FILE = process.env.AGENT_KIT_SOCIAL_SECRETS ?? join(homedir(), '.config', 'agent-kit-social', 'secrets.json')
const loadFile = () => (existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {})
const file = {
  get: (name) => loadFile()[name],
  put: (name, value) => {
    const all = { ...loadFile(), [name]: value }
    mkdirSync(dirname(FILE), { recursive: true, mode: 0o700 })
    writeFileSync(FILE, JSON.stringify(all, null, 2), { mode: 0o600 })
    chmodSync(FILE, 0o600)
    return true
  },
}

const backend = { keychain, '1password': onePassword, file }[STORE]
if (!backend) throw new Error(`AGENT_KIT_SOCIAL_STORE=${STORE}: no such backend on ${process.platform} (use keychain, 1password or file)`)

export async function getSecret(name) {
  const value = process.env[name] ?? backend.get(name)
  if (typeof value !== 'string' || !value) throw new Error(`${name} is not set: run \`node cli.mjs set ${name}\``)
  return value
}

export async function putSecret(name, value) {
  if (!backend.put(name, value)) throw new Error(`could not save ${name} to the ${STORE} store`)
  // Re-read: never trust the write returning cleanly.
  if (backend.get(name) !== value) throw new Error(`${name} did not read back after write`)
}
