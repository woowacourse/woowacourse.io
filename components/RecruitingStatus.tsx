import recruiting from '../content/recruiting'
import styles from './RecruitingStatus.module.css'

/** 모집 상태 + 지원하기 버튼(실제 지원 사이트로 가는 유일한 '지원하기'). 모집 중일 때만 보인다(모집예정·마감일 때는 안내 문구가 대신한다) */
export function RecruitingStatus() {
  const { cohort, year, status, applyUrl } = recruiting
  const isOpen = status === '모집중'
  if (!isOpen) return null

  return (
    <div className={styles.box} data-status={status}>
      <span className={styles.badge}>{status}</span>
      <span className={styles.label}>
        {year} 신입생 ({cohort})
      </span>
      {isOpen && applyUrl && (
        <a
          className={styles.cta}
          href={applyUrl}
          target="_blank"
          rel="noreferrer"
        >
          지원하기
        </a>
      )}
    </div>
  )
}
