import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  variant?: 'grid' | 'list'
  /** list 변형에서 왼쪽에 위로 향하는 방향 레일을 그린다. 전달한 문자열이 레일 라벨이 된다. (예: "승격") */
  rail?: string
}

export function CardGrid({ children, columns = 2, variant = 'grid', rail }: CardGridProps) {
  if (variant === 'list') {
    if (rail) {
      return (
        <div className={styles.listWithRail}>
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.railArrow}>&#9650;</span>
            <span className={styles.railLabel}>{rail}</span>
            <span className={styles.railTrack} />
          </div>
          <div className={styles.list}>{children}</div>
        </div>
      )
    }
    return <div className={styles.list}>{children}</div>
  }
  return (
    <div
      className={styles.grid}
      data-columns={columns}
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
