import type { ReactNode } from 'react'
import styles from './Placeholder.module.css'

interface PlaceholderProps {
  /** 작성 예정인 내용에 대한 힌트 */
  children?: ReactNode
}

export function Placeholder({ children }: PlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.icon}>✏️</span>
      <div className={styles.content}>
        <span className={styles.label}>작성 예정</span>
        {children && <span className={styles.hint}>{children}</span>}
      </div>
    </div>
  )
}
