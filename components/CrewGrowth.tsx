import styles from './CrewGrowth.module.css'
import { Eyebrow } from './Eyebrow'
import GROWTH_ARC from '../content/growth-arc'

/**
 * CrewGrowth — "작은 행성이가 개발자로 자라기까지"
 * 레벨 0~5 성장 아크를 한눈에 보여주는 히어로 + 단계별 서사.
 * content/growth-arc.ts 한 배열이 두 뷰를 모두 그린다.
 * 데스크톱은 가로 성장 길, 모바일(<=880px)은 세로 척추. 포즈 크기는 단계 무관 동일.
 */
const src = (pose: string) => `/images/characters/${pose}.png`
const ariaSummary = `우테코 10개월 교육 과정: ${GROWTH_ARC.map((s) => `${s.level} ${s.stage}`).join(', ')}`

export function CrewGrowth() {
  return (
    <section className={styles.section} aria-label="우테코 10개월 교육 과정">
      <Eyebrow>레벨 0 → 레벨 5</Eyebrow>
      <h2 className={styles.heading}>작은 행성이가 개발자로 자라기까지</h2>
      <p className={styles.lede}>
        우테코의 10개월은 레벨 0에서 5로 이어집니다.
        <br />
        낯선 우테코에 도착한 작은 행성이가 한 단계씩 커지며 빛나는 개발자로 자라는 과정을 한눈에 담았습니다.
      </p>

      {/* 데스크톱 — 가로 성장 길 */}
      <div className={styles.arcDesktop} role="img" aria-label={ariaSummary}>
        <div className={styles.rail} aria-hidden="true">
          {GROWTH_ARC.map((s) => (
            <div key={s.level} className={styles.fig}>
              <img className={styles.pose} src={src(s.pose)} alt="" />
            </div>
          ))}
        </div>
        <div className={styles.labels} aria-hidden="true">
          {GROWTH_ARC.map((s) => (
            <div key={s.level} className={styles.col}>
              <span className={styles.lv}>
                {s.level} · {s.stage}
              </span>
              <span className={styles.gl}>{s.glance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 모바일 — 세로 성장 척추 */}
      <ol className={styles.arcMobile} aria-label="우테코 10개월 성장 단계">
        {GROWTH_ARC.map((s) => (
          <li key={s.level} className={styles.spineRow}>
            <span className={styles.spineFig} aria-hidden="true">
              <img className={styles.pose} src={src(s.pose)} alt="" />
            </span>
            <span className={styles.spineText}>
              <span className={styles.lv}>
                {s.level} · {s.stage}
              </span>
              <span className={styles.gl}>{s.glance}</span>
            </span>
          </li>
        ))}
      </ol>

      {/* 단계별 서사 */}
      <p className={styles.storiesIntro}>단계마다, 크루는 이렇게 자랍니다.</p>
      <div className={styles.stories}>
        {GROWTH_ARC.map((s) => (
          <article key={s.level} className={styles.storyCard}>
            <div className={styles.storyFigure} aria-hidden="true">
              <img className={styles.pose} src={src(s.pose)} alt="" width={64} />
            </div>
            <div className={styles.storyBody}>
              <div className={styles.storyHead}>
                <span className={styles.storyLevel}>{s.level}</span>
                <span className={styles.storyStage}>{s.stage}</span>
              </div>
              <h3 className={styles.storyTitle}>{s.title}</h3>
              <p className={styles.storyText}>{s.story}</p>
              {s.links && s.links.length > 0 && (
                <div className={styles.storyLinks}>
                  {s.links.map((l) => (
                    <a key={l.href} className={styles.storyLink} href={l.href}>
                      {l.label} →
                    </a>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
