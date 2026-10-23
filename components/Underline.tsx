import type { ReactNode } from 'react'
import styles from './Underline.module.css'

/**
 * Underline — 키워드에 손그림 느낌의 밑줄을 친다.
 * Hero StarMark·궤도 고리와 같은 "손으로 그린" 결을 타이포에도 준다.
 * 색은 사이트 통일 액센트(따뜻한 오렌지).
 */
export function Underline({ children }: { children: ReactNode }) {
  return (
    <span className={styles.ul}>
      {children}
      <svg className={styles.line} viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 7 C 45 1, 80 11, 120 6 S 185 3, 198 8" />
      </svg>
    </span>
  )
}
