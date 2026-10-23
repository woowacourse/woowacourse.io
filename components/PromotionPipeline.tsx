'use client'

import { useState } from 'react'
import { Mermaid } from './Mermaid'
import styles from './PromotionPipeline.module.css'

type RubricDim = { code: string; name: string; en: string; desc: string }
type Rubric = {
  id: 'quality' | 'promotion'
  name: string
  max: number
  threshold: number
  scale: string
  verdict: string
  dims: RubricDim[]
}

// .claude/log-quality-rubric.md (25점) — 1:1 일치
const QUALITY: Rubric = {
  id: 'quality',
  name: '품질 루브릭',
  max: 25,
  threshold: 16,
  scale: '5차원 × 1~5점',
  verdict: '21~25 A · 16~20 B · 11~15 C · 6~10 D · 5 F',
  dims: [
    { code: 'D1', name: '구조 완성도', en: 'Structure', desc: '대상·배경·설계·결과·교훈·다음 실험 등 필수 섹션을 갖췄는가' },
    { code: 'D2', name: '구체성', en: 'Specificity', desc: '수치 데이터·크루 인용·구체적 타임라인이 있는가' },
    { code: 'D3', name: '전이 가능성', en: 'Transferability', desc: '다른 코치가 이 로그만 읽고 동일 활동을 재현할 수 있는가' },
    { code: 'D4', name: '교훈의 양면성', en: 'Balanced Lessons', desc: '성공과 실패가 균형 있고 다음 행동으로 연결되는가' },
    { code: 'D5', name: '원본 자료 연결', en: 'Source Linkage', desc: '디스커션·슬라이드·크루 결과물 원본이 링크됐는가' },
  ],
}

// .claude/promotion-rubric.md (20점) — 1:1 일치
const PROMOTION: Rubric = {
  id: 'promotion',
  name: '승격 루브릭',
  max: 20,
  threshold: 16,
  scale: '4차원 × 1~5점',
  verdict: '16~20 승격 가능 · 12~15 조건부 · 8~11 보류',
  dims: [
    { code: 'P1', name: '반복 검증', en: 'Replication', desc: '같은 활동이 다른 기수·맥락에서 반복되었는가' },
    { code: 'P2', name: '추출 가능성', en: 'Extractability', desc: '독립적인 도구·패턴·원칙을 뽑아낼 수 있는가' },
    { code: 'P3', name: '교차 연결', en: 'Cross-Reference', desc: '다른 로그·인사이트·교육 모델과 연결되는가' },
    { code: 'P4', name: '실행 영향력', en: 'Impact', desc: '실제 교육 과정에 미치는 영향이 큰가' },
  ],
}

const RUBRICS: Record<'quality' | 'promotion', Rubric> = { quality: QUALITY, promotion: PROMOTION }

// 아래(원재료) → 위(일반화)로 승격되는 흐름. 게이트(루브릭)는 단계 사이의 필터 — 화살표 라벨로 표현.
const PIPELINE = `
flowchart BT
    L["📝 실험 로그"]
    M["🛠️ 검증된 도구 · 패턴"]
    T["📐 커리큘럼 · 철학"]
    L -->|"🔍 품질 16/25 통과"| M
    M -->|"🔍 승격 16/20 통과"| T
    style L fill:#f0f4ff,stroke:#4285f4
    style M fill:#eef3ed,stroke:#2f9e6b
    style T fill:#fff0f0,stroke:#c4554d
`

const GATES: Array<'quality' | 'promotion'> = ['quality', 'promotion']

export function PromotionPipeline() {
  const [open, setOpen] = useState<'quality' | 'promotion' | null>('quality')

  return (
    <div className={styles.root}>
      <Mermaid chart={PIPELINE} />

      <p className={styles.hint}>
        모든 로그가 위로 올라가는 게 아닙니다. 게이트의 점수를 통과한 것만 승격됩니다.
        아래 루브릭을 눌러 실제 채점 기준을 펼쳐 보세요.
      </p>

      <div className={styles.gateButtons} role="tablist" aria-label="채점 루브릭">
        {GATES.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={open === id}
            className={`${styles.gateBtn} ${open === id ? styles.gateBtnOpen : ''}`}
            onClick={() => setOpen(open === id ? null : id)}
          >
            <span className={styles.gateBtnName}>{RUBRICS[id].name}</span>
            <span className={styles.gateBtnMax}>{RUBRICS[id].max}점 만점 · 통과선 {RUBRICS[id].threshold}</span>
            <span className={styles.gateBtnToggle} aria-hidden>{open === id ? '−' : '+'}</span>
          </button>
        ))}
      </div>

      {open && <Scorecard rubric={RUBRICS[open]} />}
    </div>
  )
}

function Scorecard({ rubric }: { rubric: Rubric }) {
  const pct = Math.round((rubric.threshold / rubric.max) * 100)
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <div className={styles.panelName}>{rubric.name}</div>
          <div className={styles.panelScale}>{rubric.scale} · 총점 {rubric.max}점</div>
        </div>
        <div className={styles.thresholdBox}>
          <div className={styles.thresholdLabel}>통과선 {rubric.threshold} / {rubric.max}</div>
          <div className={styles.thresholdBar}>
            <div className={styles.thresholdFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.verdict}>{rubric.verdict}</div>
        </div>
      </div>
      <ul className={styles.dimList}>
        {rubric.dims.map((d) => (
          <li key={d.code} className={styles.dimRow}>
            <span className={styles.dimCode}>{d.code}</span>
            <span className={styles.dimMain}>
              <span className={styles.dimName}>{d.name}<span className={styles.dimEn}>{d.en}</span></span>
              <span className={styles.dimDesc}>{d.desc}</span>
            </span>
            <span className={styles.dimScale}>1–5점</span>
          </li>
        ))}
      </ul>
      <div className={styles.source}>
        이 점수표는 실제 채점 루브릭(<code>.claude/{rubric.id === 'quality' ? 'log-quality' : 'promotion'}-rubric.md</code>)과 동일합니다.
      </div>
    </div>
  )
}
