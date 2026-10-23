import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 옮긴 주소(redirects.ts)마다 out/{source}/index.html 이동용 페이지를 만든다.
// GitHub Pages 는 서버 리다이렉트를 지원하지 않아서 meta refresh + location.replace 로 넘긴다.
// TS 모듈은 Node 22 의 타입 제거 기능으로 바로 불러온다.
const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const outDir = path.join(repoRoot, 'out')

const { default: notices } = await import(path.join(repoRoot, 'content', 'notices.ts'))
const { buildRedirects } = await import(path.join(repoRoot, 'redirects.ts'))

const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const stubHtml = (destination) => {
  const href = escapeHtml(destination)
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>우아한테크코스</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${href}">
<meta http-equiv="refresh" content="0; url=${href}">
<script>location.replace(${JSON.stringify(destination)} + location.search + location.hash)</script>
</head>
<body>
<p>주소가 바뀌었습니다. <a href="${href}">새 페이지로 이동</a></p>
</body>
</html>
`
}

let written = 0
for (const { source, destination } of buildRedirects(notices)) {
  const target = path.join(outDir, source, 'index.html')
  // 실제 페이지를 덮어쓰지 않는다(다시 실행할 때 남아 있는 이동용 페이지는 덮어써도 된다)
  const existing = await fs.readFile(target, 'utf8').catch(() => null)
  if (existing !== null && !existing.includes('<meta name="robots" content="noindex">')) {
    throw new Error(`이동용 페이지가 실제 페이지와 겹칩니다: ${source}`)
  }
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, stubHtml(destination.endsWith('/') ? destination : `${destination}/`))
  written += 1
}

console.log(`[redirects] wrote ${written} redirect pages to out/`)
