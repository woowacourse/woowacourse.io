#!/usr/bin/env node
// codefence-lint.mjs — 코드펜스 '더블 스페이스' 검출.
//
// 무엇을: content/**/*.mdx 의 ``` 코드펜스 안에서, 거의 모든 내용 줄 뒤에 빈 줄이 붙는
//   더블 스페이스 작성 패턴을 검출한다.
//
// 왜: 코드블록 빈 줄은 화면에서 한 줄 높이를 그대로 차지한다(globals.css 의
//   `.nextra-code > span { min-height: 1lh }` — Shiki 빈 줄 소실 보정). 문장마다 빈 줄을
//   끼워 쓰면 line-height 를 아무리 조여도(현재 1.3) 블록 전체가 두 배 행간으로 렌더링되어
//   가독성이 무너진다. 실제 사례: design-discovery-learning 프롬프트 예시(87줄 중 절반이 빈 줄).
//
// 판정: 내용 줄이 8줄 이상인 펜스에서, "바로 다음 줄이 빈 줄인 내용 줄"의 비율이 70% 이상이면
//   더블 스페이스로 본다. 섹션 사이 빈 줄(정상적 마크다운 구획)은 이 비율을 크게 올리지
//   못하므로(통상 50~60%) 오탐하지 않는다.
//
// 출력: file:line(펜스 시작) 으로 위반을 보고. 1건 이상이면 종료코드 1(= lint 실패).
// 고치는 법: 이어지는 문장은 한 단락으로 붙이고, 빈 줄은 섹션(헤더) 사이에만 남긴다.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'

const ROOT = 'content'
const MIN_CONTENT_LINES = 8
const DOUBLE_SPACE_RATIO = 0.7

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
    else if (extname(p) === '.mdx') out.push(p)
  }
  return out
}

/** 파일에서 코드펜스들을 [{ startLine, lines }] 로 추출한다. */
function extractFences(lines) {
  const fences = []
  let current = null
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t.startsWith('```')) {
      if (current) {
        fences.push(current)
        current = null
      } else {
        current = { startLine: i + 1, lines: [] }
      }
      continue
    }
    if (current) current.lines.push(lines[i])
  }
  return fences
}

/** 펜스가 더블 스페이스인지 판정. 위반이면 진단 문자열, 아니면 null. */
function checkFence(fence) {
  const lines = fence.lines
  const isBlank = lines.map((l) => l.trim() === '')
  const contentIdx = lines.map((_, i) => i).filter((i) => !isBlank[i])
  if (contentIdx.length < MIN_CONTENT_LINES) return null

  // 마지막 줄은 "다음 줄"이 없으므로 모수에서 제외
  const withSuccessor = contentIdx.filter((i) => i < lines.length - 1)
  if (withSuccessor.length === 0) return null
  const followedByBlank = withSuccessor.filter((i) => isBlank[i + 1])
  const ratio = followedByBlank.length / withSuccessor.length
  if (ratio < DOUBLE_SPACE_RATIO) return null

  return (
    `내용 ${withSuccessor.length}줄 중 ${followedByBlank.length}줄(${Math.round(ratio * 100)}%)이 ` +
    `빈 줄로 이어짐 — 더블 스페이스. 문장은 단락으로 붙이고 빈 줄은 섹션 사이에만.`
  )
}

const files = walk(ROOT)
let violations = 0
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  for (const fence of extractFences(lines)) {
    const diag = checkFence(fence)
    if (diag) {
      violations++
      console.log(`${relative('.', file)}:${fence.startLine}  ${diag}`)
    }
  }
}

if (violations > 0) {
  console.error(`\n✗ 코드펜스 더블 스페이스 ${violations}건. 위 파일의 빈 줄을 정리하세요.`)
  process.exit(1)
}
console.log('✓ 코드펜스 더블 스페이스 없음')
