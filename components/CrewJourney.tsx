import type { CSSProperties } from 'react'
import styles from './CrewJourney.module.css'
import { crewCount } from '../content/crew-voices'

/**
 * CrewJourney — "우테코를 넘어 소프트웨어 생태계로"
 * 행성이를 중심에 두고, 크루들이 일하는 회사들이 토성 고리처럼 궤도를 돈다.
 * 데스크톱은 궤도, 모바일(<=680px)은 칩 목록으로 폴백한다.
 * 숫자·회사 목록은 아래 상수만 고치면 갱신된다.
 */
const COMPANIES = [
  '우아한형제들',
  '카카오',
  '토스',
  '야놀자',
  '신한은행',
  '네이버',
  '마이리얼트립',
  '삼성전자',
  '그렙',
  '쿠팡',
  '라인',
  '핵클',
  '두나무',
  '한국신용데이터',
  'CJ 올리브영',
  '당근',
  '딜리버리히어로즈 (베를린)',
  '탈라밧 (두바이)'
]

// 해외 회사(모바일 목록에서 국내와 나눠 보여 준다)
const ABROAD = new Set(['딜리버리히어로즈 (베를린)', '탈라밧 (두바이)'])
const GROUPS = [
  { label: '국내', names: COMPANIES.filter((n) => !ABROAD.has(n)) },
  { label: '해외', names: COMPANIES.filter((n) => ABROAD.has(n)) }
]

// 궤도 좌표 — 결정적 계산(12시 방향부터 시계방향으로 균등 배치)
// RX/RY는 링 타원(.ring inset 6% 5%)과 정확히 일치 → 각 pill 중심이 링 선 위에 놓인다.
// 타원을 세로로 더 둥글게(RY↑) 키워, 위쪽에 몰린 긴 라벨 두 개(딜리버리·탈라밧)의 겹침을 없앤다.
const RX = 45
const RY = 44
// 궤도 선. 좌표는 궤도 칸의 실제 크기(720×465)와 같게 두어 선 굵기가 거의 1:1 이다
const RING_W = 720
const RING_H = 465
const ring = { cx: RING_W / 2, cy: RING_H / 2, rx: (RX / 100) * RING_W, ry: (RY / 100) * RING_H }
const RING_D = `M${ring.cx} ${ring.cy - ring.ry} A${ring.rx} ${ring.ry} 0 1 1 ${ring.cx} ${ring.cy + ring.ry} A${ring.rx} ${ring.ry} 0 1 1 ${ring.cx} ${ring.cy - ring.ry}`
const NODES = COMPANIES.map((name, i) => {
  const ang = (i / COMPANIES.length) * Math.PI * 2 - Math.PI / 2
  const x = 50 + RX * Math.cos(ang)
  const y = 50 + RY * Math.sin(ang)
  // 깊이: 궤도를 위에서 비스듬히 내려다본 것처럼 위쪽(먼 쪽) 0 → 아래쪽(가까운 쪽) 1
  const t = (Math.sin(ang) + 1) / 2
  return {
    name,
    x,
    y,
    t,
    left: `${x.toFixed(2)}%`,
    top: `${y.toFixed(2)}%`
  }
})

export function CrewJourney() {
  return (
    <section className={styles.section} aria-label="우테코를 거쳐 간 크루들의 행선지">
      <h2 className={styles.heading}>우테코를 넘어 소프트웨어 생태계로</h2>
      <p className={styles.lede}>
        이 길을 지난 크루 <strong>{crewCount}명</strong>이,
        <br />
        지금 이런 회사들에서 IT 생태계에 영향력을 펼치고 있습니다.
      </p>

      {/* 데스크톱 — 궤도 */}
      <div
        className={styles.orbit}
        role="img"
        aria-label={`크루들이 일하는 회사: ${COMPANIES.join(', ')}`}
      >
        {/* 궤도 선 — 먼 쪽(위)은 옅고 가까운 쪽(아래)은 진하게 */}
        <svg className={styles.ring} viewBox={`0 0 ${RING_W} ${RING_H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="journey-ring" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className={styles.ringFar} />
              <stop offset="1" className={styles.ringNear} />
            </linearGradient>
          </defs>
          <path d={RING_D} stroke="url(#journey-ring)" pathLength={1} />
        </svg>
        <div className={styles.core}>
          <span className={styles.coreGlow} aria-hidden="true" />
          <img className={styles.planet} src="/images/characters/행성이-걷기.png" alt="" width={104} />
          {/* 숫자는 세어 올리지 않고 처음부터 보여 준다 — 바로 위 본문의 '735명'과 언제 봐도 같아야 한다 */}
          <span className={styles.coreN}>{crewCount}명</span>
        </div>
        {NODES.map((n) => (
          <span
            key={n.name}
            className={styles.node}
            // --t: 깊이(먼 위쪽 0 → 가까운 아래쪽 1). 크기·진하기·그림자가 이 값을 따른다
            style={
              {
                left: n.left,
                top: n.top,
                zIndex: 1 + Math.round(n.t * 10),
                '--t': n.t.toFixed(3)
              } as CSSProperties
            }
            aria-hidden="true"
          >
            {n.name}
          </span>
        ))}
      </div>

      {/* 모바일 — 칩 목록. 국내·해외로 나눈다. 모바일에선 위 궤도가 숨겨지므로 이 목록을 화면 낭독기가 읽는다 */}
      <div className={styles.fallback}>
        <img className={styles.planet} src="/images/characters/행성이-걷기.png" alt="" width={72} />
        {GROUPS.map((g) => (
          <div key={g.label} className={styles.group}>
            <p className={styles.groupLabel} id={`journey-${g.label}`}>
              {g.label}
            </p>
            <ul className={styles.chips} aria-labelledby={`journey-${g.label}`}>
              {g.names.map((name) => (
                <li key={name} className={styles.chip}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className={styles.global}>
        <span className={styles.sentence}>크루는 한국에만 있지 않습니다.</span>{' '}
        <span className={styles.sentence}>
          그 영향력은 <span className={styles.cities}>베를린·두바이</span>까지 이어집니다.
        </span>
      </p>
    </section>
  )
}
