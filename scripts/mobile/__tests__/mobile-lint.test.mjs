import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lintCss } from '../mobile-lint.mjs'

const rules = (findings) => findings.map((f) => f.rule)

test('max-width 없는 큰 고정 width 는 error', () => {
  const f = lintCss('.card { width: 900px; padding: 1rem; }', 'x.module.css')
  assert.ok(rules(f).includes('fixed-width-no-max'))
  assert.equal(f.find((x) => x.rule === 'fixed-width-no-max').severity, 'error')
})

test('max-width 동반 고정 width 는 통과', () => {
  const f = lintCss('.card { width: 900px; max-width: 100%; }', 'x.module.css')
  assert.ok(!rules(f).includes('fixed-width-no-max'))
})

test('작은 고정 width(≤375) 는 통과 (아이콘 등)', () => {
  const f = lintCss('.icon { width: 24px; height: 24px; }', 'x.module.css')
  assert.equal(f.length, 0)
})

test('폰 폭 초과 min-width 는 error', () => {
  const f = lintCss('.wrap { min-width: 700px; }', 'x.module.css')
  assert.ok(rules(f).includes('min-width-no-max'))
})

test('min-width 는 max-width 가 있어도 error (max-width 로 무효화 안 됨)', () => {
  const f = lintCss('.wrap { min-width: 700px; max-width: 100%; }', 'x.module.css')
  assert.ok(rules(f).includes('min-width-no-max'))
})

test('white-space:nowrap 는 warn', () => {
  const f = lintCss('.chip { white-space: nowrap; }', 'x.module.css')
  const hit = f.find((x) => x.rule === 'nowrap')
  assert.ok(hit && hit.severity === 'warn')
})

test('100vw 는 warn', () => {
  const f = lintCss('.full { width: 100vw; }', 'x.module.css')
  assert.ok(rules(f).includes('viewport-width'))
})

test('@media 안의 고정 width 는 반응형이므로 no-media 를 유발하지 않는다', () => {
  const css = '.a { color: red; }\n@media (max-width: 640px) { .a { width: 500px; max-width: 100%; } }'
  const f = lintCss(css, 'x.module.css')
  assert.ok(!rules(f).includes('no-media-fixed-layout'))
})

test('@media 없는 고정 px 레이아웃은 no-media warn', () => {
  const f = lintCss('.a { width: 800px; max-width: 100%; }', 'x.module.css')
  assert.ok(rules(f).includes('no-media-fixed-layout'))
})

test('주석 안의 위험 패턴은 무시한다', () => {
  const f = lintCss('/* width: 900px 예시 */\n.a { padding: 1rem; }', 'x.module.css')
  assert.equal(f.length, 0)
})
