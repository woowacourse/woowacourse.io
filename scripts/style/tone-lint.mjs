#!/usr/bin/env node
// tone-lint — 큐레이션 교육 문서의 문체(말투)를 점검합니다.
//
// 규칙: 공개 중인 큐레이션 문서(지원·책 탭) 본문 문장은 **합니다체**(~합니다/~습니다/~입니다)로
//       씁니다. 한다체("~한다/~다")·해요체("~해요/~예요")는 지양합니다.
//       단, 코드·인용 발화·도구의 질문 템플릿은 예외이므로, 이 린트는 자동 차단이 아니라
//       사람이 판단하는 온디맨드 리포트입니다.
//
// 사용: node scripts/style/tone-lint.mjs
// 종료코드: 위반 0 → 0, 본문 위반 있음 → 1 (CI/precommit 게이트로도 쓸 수 있습니다)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 점검 범위 (큐레이션 교육 콘텐츠만 — 실험 로그/아카이브/자동생성 제외)
const SCOPE = [
  'content/apply',
  'content/book',
];

function listFiles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const st = fs.statSync(abs);
  if (st.isFile()) return /\.mdx?$/.test(abs) ? [abs] : [];
  return fs.readdirSync(abs).flatMap((e) => listFiles(path.join(rel, e)));
}

// 펜스 코드블록 / 인라인 코드 / frontmatter 제거 (라인 번호 보존 위해 빈 줄 치환)
function maskNonProse(text) {
  const lines = text.split('\n');
  let inFence = false;
  let inFrontmatter = false;
  let inIgnore = false;
  return lines.map((l, i) => {
    // 의도 예외 블록: {/* tone-lint:ignore-start */} ~ {/* tone-lint:ignore-end */}
    if (/tone-lint:ignore-start/.test(l)) { inIgnore = true; return ''; }
    if (/tone-lint:ignore-end/.test(l)) { inIgnore = false; return ''; }
    if (inIgnore) return '';
    if (i === 0 && /^---\s*$/.test(l)) { inFrontmatter = true; return ''; }
    if (inFrontmatter) { if (/^---\s*$/.test(l)) inFrontmatter = false; return ''; }
    if (/^\s*```/.test(l)) { inFence = !inFence; return ''; }
    if (inFence) return '';
    return l
      .replace(/`[^`]*`/g, ' ')           // 인라인 코드
      .replace(/\[[^\]]*\]\([^)]*\)/g, ' ') // 마크다운 링크([제목](url)) — 제목은 다른 문서명이라 제외
      .replace(/https?:\/\/\S+/g, ' ');     // 맨 URL
  });
}

// 문장 끝 구두점(또는 줄 끝). 닫는 마크다운/괄호/따옴표도 허용.
const SENT_END = `[.!?…"'“”‘’．」)\\]*~]`;

// 한 줄에서 비-합니다체(한다체·해요체) 어미를 검출합니다.
function findEndings(line, isHeading) {
  if (isHeading) return [];
  const hits = [];
  // 한다체: 문장 끝 'X다' (단 합니다체 '-니다'는 정답이므로 제외, 조사 '마다/보다' 제외)
  // 문장 끝(구두점/EOL)만 매칭해 '현재보다 약간'·'할 때마다' 같은 조사 오탐을 피합니다.
  const PARTICLE = new Set(['마', '보', '부', '까']); // 마다/보다/부터아님... '~다' 조사·연결 어미 오탐 방지
  for (const m of line.matchAll(new RegExp(`([가-힣])다(?=${SENT_END}|$)`, 'g'))) {
    if (m[1] === '니') continue;       // 합니다/습니다/입니다 = 합니다체(정답)
    if (PARTICLE.has(m[1])) continue;  // 마다(=each)/보다(=than) 등 조사
    hits.push({ kind: '한다체', text: `${m[1]}다` });
  }
  // 해요체: 문장 끝 'X요'
  for (const m of line.matchAll(new RegExp(`([가-힣]{2,}요)(?=${SENT_END}|$)`, 'g'))) {
    if (/(중요|필요|개요|내용|상호|용도|효용|범위|이유|자유|비유|여유|소요|수요|공유|소유|점유|보유|함유|고유|주요)$/.test(m[1])) continue;
    hits.push({ kind: '해요체', text: m[1] });
  }
  return hits;
}

// 인용("...")/블록쿼트(>) 안 — 원문 발화일 수 있어 사람 검토용으로 분리
function looksQuoted(rawLine) {
  return /^\s*>/.test(rawLine) || /["'“‘「][^"'”’」]*["'”’」]/.test(rawLine);
}

const files = SCOPE.flatMap(listFiles);
let violationCount = 0;
let quotedCount = 0;
const report = [];

for (const abs of files) {
  const raw = fs.readFileSync(abs, 'utf8');
  const rawLines = raw.split('\n');
  maskNonProse(raw).forEach((line, idx) => {
    const isHeading = /^\s*#/.test(rawLines[idx]);
    const hits = findEndings(line, isHeading);
    if (!hits.length) return;
    const quoted = looksQuoted(rawLines[idx]);
    for (const h of hits) {
      if (quoted) quotedCount++; else violationCount++;
      report.push({
        file: path.relative(ROOT, abs),
        line: idx + 1,
        kind: h.kind,
        text: h.text,
        quoted,
        snippet: rawLines[idx].trim().slice(0, 90),
      });
    }
  });
}

if (report.length === 0) {
  console.log(`✓ tone-lint: 위반 없음 (${files.length}개 파일, 합니다체 일관 ✓)`);
  process.exit(0);
}

console.log(`tone-lint: ${files.length}개 파일 점검 — 본문 위반 ${violationCount}건, 인용 추정 ${quotedCount}건`);
console.log('규칙: 본문은 합니다체. 아래 한다체/해요체를 합니다체로 고칩니다.\n');

const prose = report.filter((r) => !r.quoted);
const quoted = report.filter((r) => r.quoted);

if (prose.length) {
  console.log('■ 수정 권장 (본문 — 합니다체로):');
  for (const r of prose) console.log(`  ${r.file}:${r.line}  [${r.kind} "${r.text}"]  ${r.snippet}`);
}
if (quoted.length) {
  console.log('\n□ 검토 필요 (인용/블록쿼트 안 — 원문 발화면 유지):');
  for (const r of quoted) console.log(`  ${r.file}:${r.line}  [${r.kind} "${r.text}"]  ${r.snippet}`);
}

process.exit(violationCount > 0 ? 1 : 0);
