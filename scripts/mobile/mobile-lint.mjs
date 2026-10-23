#!/usr/bin/env node
// mobile-lint — CSS 모듈/전역 CSS의 모바일 오버플로우 위험을 정적 점검합니다.
//
// 이 저장소는 CSS Modules 기반이라 반응형이 각 .module.css 의 @media 와 고정 width 에
// 흩어져 있습니다. Tailwind breakpoint 유틸이 없으므로 여기서 직접 고신뢰 위험만 잡습니다.
// error 는 "명백한 오버플로우 유발"만(오탐 최소화), 나머지는 warn(사람 판단).
//
// 사용: node scripts/mobile/mobile-lint.mjs [file...]
//   인자 없음 → components/*.module.css + app/globals.css 전체
// 종료코드: error>0 → 1, 아니면 0.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd()

// 주석을 공백으로 치환하되 개행은 보존해 라인 번호를 유지합니다.
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length
}

export function lintCss(content, filename = '<input>') {
  const findings = []
  const src = stripComments(content)
  const hasMedia = /@media/.test(src)
  let sawFixed = false

  // 선언 블록 "selector { body }" 순회. 중첩 @media 는 안쪽 규칙만 매칭되지만
  // 안쪽 선언을 여전히 검사하므로 목적을 충족합니다.
  const blockRe = /([^{}]*)\{([^{}]*)\}/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const selector = m[1].trim().split('\n').pop().trim() || '(unknown)'
    const body = m[2]
    const line = lineOf(content, m.index)
    const hasMaxWidth = /max-width\s*:/.test(body)

    for (const d of body.matchAll(/(?<![\w-])width\s*:\s*(\d+)px/g)) {
      const n = Number(d[1])
      if (n <= 375) continue
      sawFixed = true
      if (!hasMaxWidth) {
        findings.push({
          severity: 'error', rule: 'fixed-width-no-max', selector, line,
          message: `width:${n}px — max-width 없이 고정 폭. 뷰포트 초과 위험. max-width:100% 동반 필요.`,
        })
      }
    }
    for (const d of body.matchAll(/min-width\s*:\s*(\d+)px/g)) {
      const n = Number(d[1])
      if (n <= 360) continue
      sawFixed = true
      // max-width 가드 없음: CSS 에서 max-width 는 min-width 를 무효화하지 못한다
      // (min-width 가 우선). 따라서 폰 폭 초과 min-width 는 max-width 동반 여부와
      // 무관하게 항상 가로 스크롤을 유발하므로 error 로 잡는다.
      findings.push({
        severity: 'error', rule: 'min-width-no-max', selector, line,
        message: `min-width:${n}px — 폰 폭(360px) 초과 최소폭. 가로 스크롤 유발(max-width 로 무효화 안 됨). 값을 낮추거나 제거 필요.`,
      })
    }
    if (/white-space\s*:\s*nowrap/.test(body)) {
      findings.push({
        severity: 'warn', rule: 'nowrap', selector, line,
        message: `white-space:nowrap — 긴 텍스트면 오버플로우. 짧은 라벨에만 쓰는지 확인.`,
      })
    }
    if (/\b100vw\b/.test(body)) {
      findings.push({
        severity: 'warn', rule: 'viewport-width', selector, line,
        message: `100vw — 스크롤바 폭만큼 가로 오버플로우 흔함. width:100% 또는 overflow-x 관리 확인.`,
      })
    }
  }

  if (sawFixed && !hasMedia) {
    findings.push({
      severity: 'warn', rule: 'no-media-fixed-layout', selector: '(file)', line: 1,
      message: `고정 px 레이아웃인데 @media 쿼리가 없음 — 반응형 미고려 신호.`,
    })
  }
  return findings.map((f) => ({ ...f, file: filename }))
}

function listDefaultFiles() {
  const out = []
  const compDir = path.join(ROOT, 'components')
  if (fs.existsSync(compDir)) {
    for (const f of fs.readdirSync(compDir)) {
      if (f.endsWith('.module.css')) out.push(path.join(compDir, f))
    }
  }
  const globals = path.join(ROOT, 'app/globals.css')
  if (fs.existsSync(globals)) out.push(globals)
  return out
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const argv = process.argv.slice(2)
  const files = argv.length ? argv.map((f) => path.resolve(f)) : listDefaultFiles()
  let errors = 0
  let warns = 0
  for (const abs of files) {
    if (!fs.existsSync(abs)) continue
    const findings = lintCss(fs.readFileSync(abs, 'utf8'), path.relative(ROOT, abs))
    for (const f of findings) {
      if (f.severity === 'error') errors++
      else warns++
      console.log(`${f.severity === 'error' ? '✗' : '⚠'} ${f.file}:${f.line} [${f.rule}] ${f.selector} — ${f.message}`)
    }
  }
  console.log(`\n모바일 정적 점검: error ${errors} · warn ${warns} (검사 ${files.length}개 파일)`)
  process.exit(errors > 0 ? 1 : 0)
}
