import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const publicDir = path.join(repoRoot, 'public')

async function verify() {
  const errors = []
  for (const name of ['llms.txt', 'llms-full.txt']) {
    const p = path.join(publicDir, name)
    try {
      const stat = await fs.stat(p)
      if (stat.size < 100) {
        errors.push(`${name} is suspiciously small (${stat.size} bytes)`)
      }
      const content = await fs.readFile(p, 'utf8')
      if (!content.startsWith('# ')) {
        errors.push(`${name} must start with a markdown H1`)
      }
    } catch (e) {
      errors.push(`${name} missing or unreadable: ${e.message}`)
    }
  }
  if (errors.length) {
    console.error('llms.txt verification failed:')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log('llms.txt verification OK')
}

await verify()
