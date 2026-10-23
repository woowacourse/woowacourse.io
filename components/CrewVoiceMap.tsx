'use client'

import { useState, type CSSProperties } from 'react'
import styles from './CrewVoiceMap.module.css'
import { crewThemes, crewThemesAreExample } from '../content/crew-voices'
import { Eyebrow } from './Eyebrow'

/**
 * CrewVoiceMap — "크루들이 가장 많이 남긴 메시지"를 손그림 별자리로.
 * 서브텍스트의 '이 10개월을 경험한 크루들'은 TecoWay 섹션(우테코의 10개월)을 받는 연결어 —
 * 통계 출처가 아니라 위 여정의 서사를 잇는다. 응답자 수(422)는 상세 페이지(crew-voices.mdx)가 담당.
 * 크루의 말 = 별(점). 가장 많이 나온 '함께 자란 동료'를 길잡이 북극성으로 위에 두고,
 * 나머지 테마 7개가 북두칠성 국자를 이룬다. 국자 끝 두 별이 그 북극성을 가리킨다.
 * 별은 좌표에 고정 배치(별자리는 '모양이 곧 의미') + 은은한 연결선으로 형태를 드러낸다.
 * 호버/포커스/탭하면 대표 문장이 아래 캡션에 뜬다(그 별에만 색이 든다). 데이터: content/crew-voices.ts
 */

// 손그림 동그라미 3종(.inbox/동그란 점) — 살짝 찌그러진 점. 인덱스별로 번갈아 써 손맛을 낸다.
// box 는 path 의 실제 바깥 경계(getBBox)다. viewBox 를 여기에 딱 맞춰야 점의 중심이 그림 칸의 중심이 되고,
// 별자리 선이 점 한가운데를 지난다(예전엔 칸이 점보다 커서 점이 왼쪽 위로 치우쳐 선과 어긋났다).
const DOTS = [
  { box: [0, 0, 3.759, 4.174], d: 'M1.80179 4.1699C0.701792 4.0599 -0.108209 3.2599 0.0117907 2.2999C0.201791 0.709895 1.00179 -0.100106 2.09179 0.00989424C3.07179 0.109894 3.84179 1.0099 3.75179 1.9199C3.63179 3.1099 2.64179 4.2499 1.80179 4.1699Z' },
  { box: [0, 0, 3.416, 3.136], d: 'M3.40602 1.46213C3.40602 1.62213 3.44602 1.82213 3.36602 1.94213C3.14602 2.32213 2.94602 2.90213 2.61602 2.99213C1.83602 3.21213 0.946013 3.27213 0.356013 2.49213C0.00601304 2.03213 -0.14398 1.50213 0.17602 0.932134C0.50602 0.332134 1.67602 -0.147866 2.36602 0.0421336C2.84602 0.182134 3.43602 0.972134 3.40602 1.46213Z' },
  { box: [0, 0, 3.496, 3.247], d: 'M1.94484 0.00335708C2.78484 0.0433571 3.52484 0.833357 3.49484 1.66336C3.46484 2.58336 2.50484 3.30336 1.39484 3.24336C0.444838 3.19336 -0.0551615 2.67336 0.00483848 1.79336C0.0848385 0.693356 0.884841 -0.0566429 1.94484 0.00335708Z' }
] as const

function HandDot({ size, index, rotate = 0 }: { size: number; index: number; rotate?: number }) {
  const dot = DOTS[index % DOTS.length]
  const [x, y, w, h] = dot.box
  // 기울기는 점 자기 중심을 축으로 돌린다(그림 칸 밖으로 살짝 나가도 보이게 overflow: visible)
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <svg
      className={styles.starSvg}
      width={size}
      height={Math.round((size * h) / w)}
      viewBox={`${x} ${y} ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d={dot.d} transform={`rotate(${rotate} ${cx} ${cy})`} />
    </svg>
  )
}

// 북두칠성 asterism 좌표(0-100 정규화). 핸들 왼쪽(완만한 곡선) → 국자 오른쪽.
// 사발(megrez·dubhe·merak·phecda)은 깊고 좁은 사다리꼴. 국자 끝 두 별(merak·dubhe)이
// 위쪽 북극성(polaris)을 가리킨다.
// X는 필드 중앙(50%) 기준으로 좌우 대칭이 되게 배치한다 — 별들의 사용 범위 17~82%, 중심 49.5%.
// (별자리 모양=상대 배치는 그대로 두고 좌표계를 통째로 오른쪽으로 옮겨, 좁은 풀블리드 모바일에서
//  왼쪽 여백이 좁아 별자리가 왼쪽으로 쏠려 보이던 문제를 해소.)
const STAR = {
  polaris: [76, 14],
  alkaid: [17, 55],
  mizar: [32, 47],
  alioth: [48, 42],
  megrez: [61, 47],
  phecda: [63, 69],
  merak: [82, 68],
  dubhe: [81, 42]
} as const

// 국자 7별 = 테마 7개. count 내림차순 순서와 1:1로 자리·라벨방향을 준다.
// dir: 라벨을 별의 위/아래 어느 쪽에 둘지 — 좁은 폭에서 라벨끼리 겹치지 않게 손튜닝.
const THEME_SLOTS: Array<{ pos: readonly [number, number]; dir: 'up' | 'down' }> = [
  { pos: STAR.dubhe, dir: 'down' }, //  소프트스킬·협업 (포인터·최대)
  { pos: STAR.alioth, dir: 'up' }, //   실전 프로젝트·미션
  { pos: STAR.megrez, dir: 'down' }, // 자기주도 학습
  { pos: STAR.phecda, dir: 'down' }, // '왜'를 묻는 사고
  { pos: STAR.alkaid, dir: 'down' }, // 코치·원온원 (손잡이 끝)
  { pos: STAR.merak, dir: 'down' }, //  몰입·집중
  { pos: STAR.mizar, dir: 'down' } //   자신감·정체성
]

// 연결선: 국자(핸들+사발). 북극성은 포인터별 dubhe와 실선으로 잇는다(다른 선과 동일 스타일).
// 실제 하늘에서도 사발 끝 dubhe가 북극성을 가리키는 포인터별. 점선(겹쳐 어색)이 아니라 실선으로.
const DIPPER_LINE = [STAR.alkaid, STAR.mizar, STAR.alioth, STAR.megrez, STAR.dubhe, STAR.merak, STAR.phecda, STAR.megrez]
const POLE_LINE = [STAR.dubhe, STAR.polaris]

const pts = (line: readonly (readonly [number, number])[]) => line.map(([x, y]) => `${x},${y}`).join(' ')

// 점마다 다른 기울기 → 같은 path라도 손그림처럼 제각각 (결정적)
const ROT = [8, -10, 6, -7, 5, -6, 9]

// 배경 잔별 (장식) — 밤하늘 깊이
const SPARKS: Array<[number, number, number]> = [
  [14, 20, 3],
  [88, 24, 4],
  [46, 86, 3],
  [70, 84, 3],
  [8, 62, 2],
  [93, 60, 3]
]

export function CrewVoiceMap({ bleed = false }: { bleed?: boolean }) {
  const sorted = [...crewThemes].sort((a, b) => b.count - a.count)
  const pole = sorted[0]
  const dipper = sorted.slice(1) // 테마 7개

  const [activeKey, setActiveKey] = useState(pole.key)
  const active = sorted.find((t) => t.key === activeKey) ?? pole

  // 빈도 → 점 크기(px). 북극성은 가장 크되 과하지 않게(18), 국자는 9~17.
  const counts = dipper.map((t) => t.count)
  const dMax = Math.max(...counts)
  const dMin = Math.min(...counts)
  const dotPx = (c: number) => Math.round(9 + Math.sqrt((c - dMin) / (dMax - dMin || 1)) * 8)

  // 한 번이라도 별을 건드리면 '눌러 보세요' 안내를 거둔다
  const [explored, setExplored] = useState(false)
  const activate = (key: string) => {
    setActiveKey(key)
    setExplored(true)
  }

  return (
    <section
      className={bleed ? `${styles.section} ${styles.bleed}` : styles.section}
      aria-label="크루들이 가장 많이 남긴 메시지"
    >
      <Eyebrow onDark>크루의 목소리</Eyebrow>
      <h2 className={styles.heading}>크루들이 가장 많이 남긴 메시지</h2>
      <p className={styles.sub}>
        이 10개월을 경험한 크루들이 수료 직전 마지막 설문에 남긴 메시지를{' '}
        <br className={styles.brDesktop} />
        가장 자주 나온 키워드별로 별자리로 그렸습니다.{' '}
        <br className={styles.brDesktop} />
        가장 크게 남은 건 강의도, 코치도, 시설도 아닌 함께 자란 동료였습니다.
        {crewThemesAreExample && <span className={styles.tag}>예시 미리보기</span>}
      </p>

      <div
        className={styles.field}
        role="group"
        aria-label={`크루가 가장 많이 남긴 메시지: ${sorted.map((t) => t.label).join(', ')}`}
      >
        <div className={styles.glow} aria-hidden="true" />
        {SPARKS.map(([x, y, s], i) => (
          <span
            key={`s${i}`}
            className={styles.spark}
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s }}
            aria-hidden="true"
          />
        ))}

        {/* 별자리 연결선 — 국자(북두칠성) + 포인터별 dubhe→북극성. 모두 같은 실선 스타일. */}
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline className={styles.dipperLine} points={pts(DIPPER_LINE)} />
          <polyline className={styles.dipperLine} points={pts(POLE_LINE)} />
        </svg>

        {/* 북극성 — 함께 자란 동료 (가장 밝게, 색은 호버/선택 시에만) */}
        <button
          type="button"
          className={
            active.key === pole.key ? `${styles.star} ${styles.pole} ${styles.on}` : `${styles.star} ${styles.pole}`
          }
          style={{ left: `${STAR.polaris[0]}%`, top: `${STAR.polaris[1]}%`, '--tw': '0s' } as CSSProperties}
          onMouseEnter={() => activate(pole.key)}
          onFocus={() => activate(pole.key)}
          onClick={() => activate(pole.key)}
          aria-pressed={active.key === pole.key}
        >
          <HandDot size={18} index={0} rotate={-4} />
          <span className={styles.lab}>{pole.label}</span>
        </button>

        {/* 국자 별 — 나머지 테마 7개 */}
        {dipper.map((t, i) => {
          const slot = THEME_SLOTS[i]
          const [x, y] = slot.pos
          const on = t.key === active.key
          const cls = [styles.star, slot.dir === 'up' ? styles.up : '', on ? styles.on : ''].filter(Boolean).join(' ')
          return (
            <button
              key={t.key}
              type="button"
              className={cls}
              style={{ left: `${x}%`, top: `${y}%`, '--tw': `${(i + 1) * 0.55}s` } as CSSProperties}
              onMouseEnter={() => activate(t.key)}
              onFocus={() => activate(t.key)}
              onClick={() => activate(t.key)}
              aria-pressed={on}
            >
              <HandDot size={dotPx(t.count)} index={i} rotate={ROT[i]} />
              <span className={styles.lab}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* 별을 누를 수 있다는 걸 처음 보는 사람도 알게. 한 번 건드리면 사라진다(자리는 유지해 화면이 흔들리지 않게) */}
      <p className={explored ? `${styles.hint} ${styles.hintGone}` : styles.hint} aria-hidden={explored}>
        별을 누르면 다른 메시지도 볼 수 있습니다
      </p>

      {active && (
        <figure className={styles.cap} aria-live="polite">
          <p className={styles.quote}>{active.quote}</p>
          <figcaption className={styles.meta}>
            {active.label} · 비슷한 메시지 {active.count}건
          </figcaption>
        </figure>
      )}

      <p className={styles.close}>
        이 동료들과 함께, 더 큰 <strong>선한 영향력</strong>을 펼쳐나가기를 바랍니다.
      </p>
    </section>
  )
}
