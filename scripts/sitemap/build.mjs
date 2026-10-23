import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 정적 내보내기 결과(out/)의 페이지로 out/sitemap.xml 을 만든다.
// 이동용 페이지(noindex)·404·검색 색인 폴더는 뺀다. 이동용 페이지를 만든 뒤에 실행한다.
const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const outDir = path.join(repoRoot, 'out')
const siteUrl = 'https://woowacourse.io'

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return entry.name.startsWith('_') || entry.name === '404' ? [] : walk(entryPath)
      return entry.name === 'index.html' ? [entryPath] : []
    })
  )
  return files.flat()
}

const urls = []
for (const file of await walk(outDir)) {
  const html = await fs.readFile(file, 'utf8')
  if (html.includes('<meta name="robots" content="noindex">')) continue
  const route = path.relative(outDir, path.dirname(file)).split(path.sep).join('/')
  urls.push(route ? `${siteUrl}/${encodeURI(route)}/` : `${siteUrl}/`)
}
urls.sort()

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`
await fs.writeFile(path.join(outDir, 'sitemap.xml'), xml)
console.log(`[sitemap] wrote ${urls.length} urls to out/sitemap.xml`)
