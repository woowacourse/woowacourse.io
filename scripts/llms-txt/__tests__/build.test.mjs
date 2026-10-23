import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLlmsTxt } from '../build.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureRoot = path.join(__dirname, 'fixtures', 'content')

test('llms.txt 출력은 사이트 제목 H1 으로 시작한다', async () => {
  const { llmsTxt } = await buildLlmsTxt({
    contentDir: fixtureRoot,
    siteUrl: 'https://example.com',
  })
  assert.match(llmsTxt, /^# 우아한테크코스 공식문서/)
})

test('llms.txt 는 각 페이지를 마크다운 링크 + summary 로 나열한다', async () => {
  const { llmsTxt } = await buildLlmsTxt({
    contentDir: fixtureRoot,
    siteUrl: 'https://example.com',
  })
  assert.match(
    llmsTxt,
    /- \[Bar 페이지\]\(https:\/\/example\.com\/foo\/bar\): 테스트용 페이지입니다\./,
  )
})

test('llms-full.txt 는 모든 페이지 본문을 평탄화한다', async () => {
  const { llmsFullTxt } = await buildLlmsTxt({
    contentDir: fixtureRoot,
    siteUrl: 'https://example.com',
  })
  assert.match(llmsFullTxt, /# Bar 페이지/)
  assert.match(llmsFullTxt, /본문 내용\./)
})

test('llms-full.txt 는 frontmatter 를 제거한다', async () => {
  const { llmsFullTxt } = await buildLlmsTxt({
    contentDir: fixtureRoot,
    siteUrl: 'https://example.com',
  })
  // frontmatter 의 시그니처 필드들이 출력에 남아 있으면 안 된다.
  assert.doesNotMatch(llmsFullTxt, /last_verified:/)
  assert.doesNotMatch(llmsFullTxt, /^id: bar$/m)
  assert.doesNotMatch(llmsFullTxt, /^summary: 테스트용/m)
})
