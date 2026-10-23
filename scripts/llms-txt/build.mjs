import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/

function parseMdx(raw) {
  const match = raw.match(FRONTMATTER_RE)
  const frontmatter = {}
  let body = raw
  if (match) {
    body = raw.slice(match[0].length)
    for (const line of match[1].split('\n')) {
      const kv = line.match(/^([a-z_]+):\s*(.*)$/i)
      if (kv) frontmatter[kv[1]] = kv[2].trim()
    }
  }
  const h1Match = body.match(/^#\s+(.+)$/m)
  const title = h1Match ? h1Match[1].trim() : null
  return { frontmatter, body, title }
}

async function walkMdx(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkMdx(full, base)))
    } else if (entry.name.endsWith('.mdx')) {
      files.push({
        absPath: full,
        relPath: path.relative(base, full),
      })
    }
  }
  return files
}

function pathToUrl(relPath, siteUrl) {
  const normalized = relPath.split(path.sep).join('/')
  const noExt = normalized.replace(/\.mdx$/, '')
  const slug = noExt.endsWith('/index') ? noExt.slice(0, -'/index'.length) : noExt
  return `${siteUrl.replace(/\/$/, '')}/${slug}`.replace(/\/$/, '')
}

export async function buildLlmsTxt({ contentDir, siteUrl }) {
  const files = await walkMdx(contentDir)
  const pages = []
  let siteTitle = '우아한테크코스 공식문서'
  let siteIntro = ''

  for (const f of files) {
    const raw = await fs.readFile(f.absPath, 'utf8')
    const { frontmatter, body, title } = parseMdx(raw)
    if (f.relPath === 'index.mdx') {
      if (title) siteTitle = title
      const paragraphs = body.replace(/^#\s+.+\n/, '').trim().split('\n\n')
      siteIntro = paragraphs[0] ?? ''
      continue
    }
    pages.push({
      url: pathToUrl(f.relPath, siteUrl),
      title: title ?? f.relPath,
      summary: frontmatter.summary ?? '',
      body,
    })
  }

  pages.sort((a, b) => a.url.localeCompare(b.url))

  const llmsTxt = [
    `# ${siteTitle}`,
    '',
    siteIntro || '우아한테크코스의 교육 철학·디자인 패턴·커리큘럼·실험 로그.',
    '',
    '## Pages',
    '',
    ...pages.map(
      (p) => `- [${p.title}](${p.url})${p.summary ? `: ${p.summary}` : ''}`,
    ),
    '',
  ].join('\n')

  const llmsFullTxt = [
    `# ${siteTitle} — Full Contents`,
    '',
    ...pages.flatMap((p) => [
      `<!-- source: ${p.url} -->`,
      '',
      p.body.trim(),
      '',
      '---',
      '',
    ]),
  ].join('\n')

  return { llmsTxt, llmsFullTxt }
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(here, '..', '..')
  const contentDir = path.join(repoRoot, 'content')
  const outDir = path.join(repoRoot, 'public')
  const siteUrl = process.env.SITE_URL ?? 'https://woowacourse.io'
  const { llmsTxt, llmsFullTxt } = await buildLlmsTxt({ contentDir, siteUrl })
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'llms.txt'), llmsTxt)
  await fs.writeFile(path.join(outDir, 'llms-full.txt'), llmsFullTxt)
  console.log(
    `Wrote public/llms.txt (${llmsTxt.length} bytes) and public/llms-full.txt (${llmsFullTxt.length} bytes)`,
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}
