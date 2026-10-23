import styles from './CrewJourney.module.css'
import { Eyebrow } from './Eyebrow'
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

// 궤도 좌표 — 결정적 계산(12시 방향부터 시계방향으로 균등 배치)
// RX/RY는 링 타원(.ring inset 6% 5%)과 정확히 일치 → 각 pill 중심이 링 선 위에 놓인다.
// 타원을 세로로 더 둥글게(RY↑) 키워, 위쪽에 몰린 긴 라벨 두 개(딜리버리·탈라밧)의 겹침을 없앤다.
const RX = 45
const RY = 44
const NODES = COMPANIES.map((name, i) => {
  const ang = (i / COMPANIES.length) * Math.PI * 2 - Math.PI / 2
  return {
    name,
    left: `${(50 + RX * Math.cos(ang)).toFixed(2)}%`,
    top: `${(50 + RY * Math.sin(ang)).toFixed(2)}%`
  }
})

export function CrewJourney() {
  return (
    <section className={styles.section} aria-label="우테코를 거쳐 간 크루들의 행선지">
      <Eyebrow>크루의 행선지</Eyebrow>
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
        <div className={styles.ring} aria-hidden="true" />
        <div className={styles.core}>
          <span className={styles.coreGlow} aria-hidden="true" />
          <img className={styles.planet} src="/images/characters/행성이-걷기.png" alt="" width={104} />
          <span className={styles.coreN}>{crewCount}명</span>
        </div>
        {NODES.map((n) => (
          <span
            key={n.name}
            className={styles.node}
            style={{ left: n.left, top: n.top }}
            aria-hidden="true"
          >
            {n.name}
          </span>
        ))}
      </div>

      {/* 모바일 — 칩 폴백 */}
      <div className={styles.fallback} aria-hidden="true">
        <img className={styles.planet} src="/images/characters/행성이-걷기.png" alt="" width={72} />
        <ul className={styles.chips}>
          {COMPANIES.map((name) => (
            <li key={name} className={styles.chip}>
              {name}
            </li>
          ))}
        </ul>
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
