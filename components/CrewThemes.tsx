import styles from './CrewThemes.module.css'
import { crewThemes } from '../content/crew-voices'

/**
 * CrewThemes — "무엇이 가장 많이 나왔나"를 문서 형태로.
 * 랜딩의 별무리(CrewVoiceMap)와 같은 데이터(crewThemes)를 쓰지만,
 * docs 본문에서는 별 메타포 대신 빈도순 목록 + 가는 막대 + 대표 문장으로 깔끔하게 읽힌다.
 * (별=흰색 SVG라 어두운 캔버스가 필요 → 사이드바와 충돌. 본문 페이지는 밝게 간다.)
 * 라이트/다크 색 토큰은 같은 페이지의 CrewVoices(개별 메시지 카드)와 맞춘다.
 */
export function CrewThemes() {
  const themes = [...crewThemes].sort((a, b) => b.count - a.count)
  const max = Math.max(...themes.map((t) => t.count))

  return (
    <ol className={styles.list} aria-label="반복된 주제 빈도순">
      {themes.map((t, i) => (
        <li className={styles.row} key={t.key}>
          <div className={styles.head}>
            <span className={styles.rank} aria-hidden="true">
              {i + 1}
            </span>
            <span className={styles.label}>{t.label}</span>
            <span className={styles.count}>
              {t.count}
              <span className={styles.unit}>건</span>
            </span>
          </div>
          <div className={styles.track} aria-hidden="true">
            <span className={styles.bar} style={{ width: `${Math.round((t.count / max) * 100)}%` }} />
          </div>
          <blockquote className={styles.quote}>{t.quote}</blockquote>
        </li>
      ))}
    </ol>
  )
}
