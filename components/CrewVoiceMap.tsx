'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import styles from './CrewVoiceMap.module.css'
import { crewThemes, crewThemesAreExample } from '../content/crew-voices'
import { useInViewPhase } from './InView'

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
// nudge: 좁은 화면(모바일)에서 라벨을 별 기준 오른쪽으로 살짝 민다 — 이웃 라벨과 맞닿는 자리만(손튜닝)
const THEME_SLOTS: Array<{ pos: readonly [number, number]; dir: 'up' | 'down'; nudge?: 'right' }> = [
  { pos: STAR.dubhe, dir: 'down', nudge: 'right' }, //  소프트스킬·협업 (포인터·최대) — 375px에서 '자기주도 학습'과 5px 겹쳤다
  { pos: STAR.alioth, dir: 'up' }, //   실전 프로젝트·미션
  { pos: STAR.megrez, dir: 'down' }, // 자기주도 학습
  { pos: STAR.phecda, dir: 'down' }, // '왜'를 묻는 사고
  { pos: STAR.alkaid, dir: 'down' }, // 코치·원온원 (손잡이 끝)
  { pos: STAR.merak, dir: 'down' }, //  몰입·집중
  { pos: STAR.mizar, dir: 'down' } //   자신감·정체성
]

// 연결선: 국자(손잡이 + 사발)와, 사발 끝 dubhe 에서 북극성(polaris)으로 가는 선.
// 실제 하늘에서도 사발 끝 두 별(merak·dubhe)을 이은 선을 늘이면 북극성이 나온다.
const DIPPER_LINE = [STAR.alkaid, STAR.mizar, STAR.alioth, STAR.megrez, STAR.phecda, STAR.merak, STAR.dubhe, STAR.megrez]
const POLE_LINE = [STAR.dubhe, STAR.polaris]

// 별 칸(.field)은 늘 62:34 비율이라, 선 좌표도 같은 비율(620×340)로 두면 가로·세로가 똑같이 확대된다.
// 그래야 선 굵기가 방향마다 달라지지 않는다.
const VW = 620
const VH = 340
const pts = (line: readonly (readonly [number, number])[]) =>
  line.map(([x, y]) => `${(x * VW) / 100},${(y * VH) / 100}`).join(' ')

// ===== 깊이 있는 밤하늘 — 먼 별·중간 별·가까운 별 세 겹 =====
// 결정적 난수라 매번 같은 하늘이 나온다(서버·브라우저 렌더 일치).
const seeded = (seed: number) => {
  let t = seed
  return () => {
    t = (t * 9301 + 49297) % 233280
    return t / 233280
  }
}
type SkyStar = { x: number; y: number; s: number; o: number }
const SKY: Array<{ depth: 'far' | 'mid' | 'near'; stars: SkyStar[] }> = (
  [
    ['far', 60, [0.8, 1.3], [0.22, 0.45]],
    ['mid', 26, [1.3, 2], [0.35, 0.65]],
    ['near', 9, [2.2, 3.2], [0.55, 0.9]]
  ] as const
).map(([depth, n, [s0, s1], [o0, o1]], li) => {
  const r = seeded(31 + li * 977)
  return {
    depth,
    stars: Array.from({ length: n }, () => {
      const x = r() * 100
      const y = r() * 100
      const s = s0 + r() * (s1 - s0)
      const o = o0 + r() * (o1 - o0)
      return { x, y, s, o }
    })
  }
})

// 점마다 다른 기울기 → 같은 path라도 손그림처럼 제각각 (결정적)
const ROT = [8, -10, 6, -7, 5, -6, 9]

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

  // 밤하늘 띠가 화면 아래에서 들어올 때 별똥별이 한 번 지나간다(별자리 자체는 처음부터 다 보인다)
  const sectionRef = useRef<HTMLElement>(null)
  const phase = useInViewPhase(sectionRef)
  useSkyDepth(sectionRef)

  // 한 번이라도 별을 건드리면 '눌러 보세요' 안내를 거둔다
  const [explored, setExplored] = useState(false)
  const activate = (key: string) => {
    setActiveKey(key)
    setExplored(true)
  }

  return (
    <section
      ref={sectionRef}
      data-inview={phase}
      className={bleed ? `${styles.section} ${styles.bleed}` : styles.section}
      aria-label="크루들이 가장 많이 남긴 메시지"
    >
      {/* 밤하늘 — 먼 별일수록 작고 흐리고 덜 움직인다(마우스·스크롤 시차). 장식이라 읽지 않는다 */}
      <div className={styles.sky} aria-hidden="true">
        <div className={`${styles.layer} ${styles.far} ${styles.nebula}`} />
        {SKY.map((l) => (
          <div key={l.depth} className={`${styles.layer} ${styles[l.depth]}`}>
            {l.stars.map((st, i) => (
              <span
                key={i}
                className={styles.skyStar}
                style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, opacity: st.o }}
              />
            ))}
          </div>
        ))}
      </div>

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
        {/* 별똥별 — 띠가 화면에 들어올 때 한 번, 오른쪽 위 빈 하늘에서 북극성(함께 자란 동료)을 향해 떨어진다 */}
        <span className={styles.meteor} aria-hidden="true" />

        {/* 별자리 연결선 — 국자(북두칠성) + 포인터별 dubhe→북극성. 모두 같은 실선 스타일. */}
        <svg className={styles.lines} viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true">
          <polyline className={styles.dipperLine} points={pts(DIPPER_LINE)} />
          <polyline className={styles.dipperLine} points={pts(POLE_LINE)} />
        </svg>

        {/* 북극성 — 함께 자란 동료 (가장 밝게, 색은 호버/선택 시에만) */}
        <button
          type="button"
          className={
            active.key === pole.key ? `${styles.star} ${styles.pole} ${styles.on}` : `${styles.star} ${styles.pole}`
          }
          style={{ left: `${STAR.polaris[0]}%`, top: `${STAR.polaris[1]}%` }}
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
          const cls = [styles.star, slot.dir === 'up' ? styles.up : '', slot.nudge === 'right' ? styles.nudgeRight : '', on ? styles.on : '']
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={t.key}
              type="button"
              className={cls}
              style={{ left: `${x}%`, top: `${y}%` }}
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

/**
 * 밤하늘 깊이 — 스크롤 위치만 CSS 변수(--sy)로 넘긴다.
 *   --sy: 섹션 중심이 화면 중심에서 얼마나 떨어졌나(-1 ~ 1).
 * 레이어마다 다른 배율로 움직여(먼 별은 조금, 가까운 별은 많이) 내려 읽을 때 깊이가 느껴진다.
 * 마우스를 따라 움직이는 시차는 정신없어서 쓰지 않는다.
 * 화면에 보일 때만 계산하고, 모션 최소화 설정이면 아무것도 하지 않는다.
 */
function useSkyDepth(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let visible = false
    const frame = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const sy = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight))
      el.style.setProperty('--sy', sy.toFixed(3))
    }
    const kick = () => {
      if (visible && !raf) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      kick()
    })
    io.observe(el)
    window.addEventListener('scroll', kick, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', kick)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
}
