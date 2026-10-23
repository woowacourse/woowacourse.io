#!/usr/bin/env node
// ai-style-lint.mjs — /문장점검 의 엔진.
//
// 무엇을: 사용자-노출 본문에서 'AI 티 나는' 문장부호를 검출한다. 현재 규칙:
//   • em-dash(— U+2014) — 문장/절 사이 부연에 쓰는 대표적 AI 글쓰기 흔적.
//     이 repo 본문은 — 를 쓰지 않는다(쉼표·마침표·괄호로 대체). 코드 주석의 —는 무관.
//
// 범위: content/**/*.{mdx,ts} (발행 본문·데이터 문자열) + components/**/*.tsx (JSX 텍스트·문자열 props).
//   - .mdx : frontmatter·코드펜스(```)·인라인코드(`)를 제외한 본문만 검사.
//   - .ts/.tsx : 라인 주석(//)·블록 주석(/* */)·JSDoc(* )을 제외한 코드/문자열/JSX 텍스트만 검사.
//
// 출력: file:line 으로 위반을 보고. 1건 이상이면 종료코드 1(= lint 실패).
// 확장: AI 흔적 규칙을 추가하려면 아래 RULES 에 한 줄 추가. 범위는 ROOTS.
//
// 주의: 이 스크립트는 사람이 유지보수한다(자동 수정 안 함 — em-dash 제거는 문맥상 쉼표/마침표/삭제가
//       달라 사람·에이전트가 판단). 발화 인용(따옴표 안 실제 크루 말)에 — 가 있으면 그건 그대로 둔다.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'

const ROOTS = ['content', 'components']
const EXTS = new Set(['.mdx', '.ts', '.tsx'])
const EM = '—' // —

/** 검출 규칙. char = 찾을 문자, label = 보고 라벨, hint = 고치는 법. */
const RULES = [{ char: EM, label: 'em-dash(—)', hint: '쉼표·마침표·괄호로 대체하거나 제거 (문장 사이 부연 = AI 흔적)' }]

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (EXTS.has(extname(p))) out.push(p)
  }
  return out
}

/** .mdx 본문에서 검사 대상 텍스트만 남긴다(frontmatter·코드펜스·인라인코드 제거). */
function mdxBodyLines(lines) {
  let inFence = false
  let inFront = false
  return lines.map((raw, i) => {
    const t = raw.trim()
    if (i === 0 && t === '---') {
      inFront = true
      return ''
    }
    if (inFront) {
      if (t === '---') inFront = false
      return ''
    }
    if (t.startsWith('```')) {
      inFence = !inFence
      return ''
    }
    if (inFence) return ''
    if (t.startsWith('>')) return '' // 블록쿼트(인용)는 verbatim — 검사 제외
    // 인용 안 —는 예외(발화 인용 verbatim). 따옴표 구간·JSX주석·인라인코드를 지운 뒤 검사.
    return raw
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // JSX 주석 {/* */}
      .replace(/`[^`]*`/g, '') // 인라인 코드
      .replace(/"[^"]*"/g, '') // 큰따옴표 인용
      .replace(/'[^']*'/g, '') // 작은따옴표 인용
  })
}

/** .ts/.tsx 에서 주석을 제거한 코드/문자열/JSX 텍스트만 남긴다. */
function codeNonCommentLines(lines) {
  let inBlock = false
  return lines.map((raw) => {
    let line = raw
    if (inBlock) {
      const end = line.indexOf('*/')
      if (end === -1) return ''
      line = line.slice(end + 2)
      inBlock = false
    }
    line = line.replace(/\/\*[^]*?\*\//g, '') // 한 줄 내 블록 주석
    const open = line.indexOf('/*')
    if (open !== -1) {
      line = line.slice(0, open)
      inBlock = true
    }
    const lc = line.indexOf('//')
    if (lc !== -1) line = line.slice(0, lc) // 라인 주석
    if (line.trim().startsWith('*')) return '' // JSDoc 본문 줄
    return line
  })
}

const files = ROOTS.flatMap((r) => walk(r))
let total = 0
const report = []

for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n')
  const scan = f.endsWith('.mdx') ? mdxBodyLines(lines) : codeNonCommentLines(lines)
  const hits = []
  scan.forEach((text, i) => {
    for (const rule of RULES) {
      if (text.includes(rule.char)) hits.push({ line: i + 1, rule: rule.label, raw: lines[i].trim() })
    }
  })
  if (hits.length) {
    report.push({ f: relative(process.cwd(), f), hits })
    total += hits.length
  }
}

if (total === 0) {
  console.log('✓ /문장점검 통과 — 본문에 AI 흔적 문장부호 없음.')
  process.exit(0)
}

console.log(`✖ /문장점검 — 본문에서 AI 흔적 ${total}건 발견 (코드 주석 제외):\n`)
for (const { f, hits } of report) {
  console.log(`  ${f}`)
  for (const h of hits) console.log(`    ${h.line}  [${h.rule}]  ${h.raw.slice(0, 90)}`)
}
console.log('\n고치는 법:')
for (const rule of RULES) console.log(`  • ${rule.label}: ${rule.hint}`)
console.log('  • 따옴표 안 실제 발화 인용(크루·코치 말)에 들어간 경우는 그대로 둔다.')
process.exit(1)
