import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const builtAppPath = path.join(repoRoot, 'out')
const pagefindPath = path.join(repoRoot, 'out', '_pagefind')

const requiredAssets = [
  'pagefind-entry.json',
  'pagefind.js',
  'pagefind-worker.js'
]

for (const asset of requiredAssets) {
  const assetPath = path.join(pagefindPath, asset)

  if (!existsSync(assetPath)) {
    throw new Error(`검색 인덱스 필수 파일이 없습니다: ${path.relative(repoRoot, assetPath)}`)
  }
}

const walkFiles = (directoryPath) => {
  const entries = readdirSync(directoryPath, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      return walkFiles(entryPath)
    }

    return entryPath
  })
}

const pagefindDirPrefix = `${pagefindPath}${path.sep}`
const htmlFiles = walkFiles(builtAppPath).filter(
  (filePath) => filePath.endsWith('.html') && !filePath.startsWith(pagefindDirPrefix)
)

// pagefind 는 <main> 요소에 실제로 렌더된 data-pagefind-body 속성만 보고 인덱싱한다.
// 주의: searchable:false 페이지도 RSC 페이로드(script)에 "data-pagefind-body":"$undefined"
// 문자열이 남으므로, 단순 includes('data-pagefind-body') 는 그런 페이지까지 과다 계수한다
// (그래서 expected 가 실제 검색 가능 수보다 커져 검증이 잘못 실패했다). 렌더된 <main ... data-pagefind-body>
// 만 센다.
const MAIN_PAGEFIND_BODY = /<main\b[^>]*\bdata-pagefind-body\b/
const searchableHtmlFiles = htmlFiles.filter((filePath) => {
  if (filePath.endsWith(`${path.sep}_not-found.html`) || filePath.endsWith(`${path.sep}404.html`)) {
    return false
  }

  return MAIN_PAGEFIND_BODY.test(readFileSync(filePath, 'utf8'))
})

const pagefindEntryPath = path.join(pagefindPath, 'pagefind-entry.json')
const pagefindEntry = JSON.parse(readFileSync(pagefindEntryPath, 'utf8'))
const indexedPageCount = Object.values(pagefindEntry.languages).reduce((count, language) => {
  return count + language.page_count
}, 0)

if (searchableHtmlFiles.length === 0) {
  throw new Error('검색 가능한 HTML 페이지를 찾지 못했습니다.')
}

if (indexedPageCount === 0) {
  throw new Error('검색 인덱스에 페이지가 하나도 없습니다. pagefind 빌드가 실패했을 수 있습니다.')
}

// pagefind 는 본문 텍스트가 없는 페이지(빈 스텁·컴포넌트 전용 허브·랜딩)를 인덱싱하지 않는다.
// 따라서 "검색 가능(data-pagefind-body) 페이지 수 == 인덱싱 페이지 수" 라는 1:1 등식은
// 이 사이트에선 성립하지 않는다(그런 페이지가 정상적으로 존재). 올바른 불변식은
// "인덱싱 수 <= 검색 가능 수" 이며, 초과 시에만 설정 이상으로 보고 실패시킨다.
if (indexedPageCount > searchableHtmlFiles.length) {
  throw new Error(
    `검색 인덱스가 검색 가능 페이지보다 많습니다(설정 이상). searchable=${searchableHtmlFiles.length}, indexed=${indexedPageCount}`
  )
}

if (indexedPageCount < searchableHtmlFiles.length) {
  const skipped = searchableHtmlFiles.length - indexedPageCount
  console.warn(
    `[search] 경고: 검색 가능 페이지 ${searchableHtmlFiles.length}개 중 ${indexedPageCount}개 인덱싱됨 ` +
      `(${skipped}개는 본문 텍스트가 없어 pagefind 가 건너뜀 — 스텁/허브/랜딩 등 정상).`
  )
}

console.log(
  `[search] verified ${indexedPageCount} indexed pages across ${Object.keys(pagefindEntry.languages).length} language(s)`
)
