import styles from './CrewVoices.module.css'
import crewVoices from '../content/crew-voices'

/**
 * CrewVoices — 크루들이 남긴 개별 메시지 전체를 카드로.
 * 아카이브 페이지의 "근거(개별 원문)" 자리에 쓴다.
 * 랜딩의 빈도 맵은 CrewVoiceMap 이 담당한다.
 * 데이터 원천: content/crew-voices.ts (crewVoices)
 */
export function CrewVoices() {
  return (
    <ul className={styles.grid} aria-label="크루들이 남긴 개별 메시지">
      {crewVoices.map((v, i) => (
        <li className={styles.card} key={v.author + i}>
          {v.example && <span className={styles.badge}>예시</span>}
          <blockquote className={styles.quote}>{v.quote}</blockquote>
          <div className={styles.meta}>
            <cite className={styles.author}>{v.author}</cite>
            {v.recommendsTo && (
              <span className={styles.recommends}>이런 분께 추천 · {v.recommendsTo}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
