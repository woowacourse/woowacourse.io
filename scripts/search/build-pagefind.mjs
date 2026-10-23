import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
// 정적 내보내기 결과(out/)를 색인해 out/_pagefind 에 둔다. GitHub Pages 가 out/ 을 그대로 올린다
const sitePath = path.join(repoRoot, 'out')
const outputPath = path.join(repoRoot, 'out', '_pagefind')
const pagefindBinPath = path.join(repoRoot, 'node_modules', 'pagefind', 'lib', 'runner', 'bin.cjs')

rmSync(outputPath, { recursive: true, force: true })

const result = spawnSync(
  process.execPath,
  [pagefindBinPath, '--site', sitePath, '--output-path', outputPath],
  {
    cwd: repoRoot,
    stdio: 'inherit'
  }
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
