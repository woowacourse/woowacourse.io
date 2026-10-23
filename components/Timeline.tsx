import type { ReactNode } from 'react'
import styles from './Timeline.module.css'

type TimelineItemStatus = 'completed' | 'active' | 'upcoming'

interface TimelineItemProps {
  date: string
  title: string
  href?: string
  status?: TimelineItemStatus
  children?: ReactNode
}

interface TimelineProps {
  children: ReactNode
  label?: string
}

export function TimelineItem({
  date,
  title,
  href,
  status = 'upcoming',
  children,
}: TimelineItemProps) {
  return (
    <div className={`${styles.item} ${styles[status]}`}>
      <div className={styles.marker}>
        <span className={styles.dot} />
        <span className={styles.line} />
      </div>
      <div className={styles.content}>
        <span className={styles.date}>{date}</span>
        {href ? (
          <a href={href} className={styles.titleLink}>
            <h3 className={styles.title}>{title}</h3>
          </a>
        ) : (
          <h3 className={styles.title}>{title}</h3>
        )}
        {children && <div className={styles.description}>{children}</div>}
      </div>
    </div>
  )
}

export function Timeline({ children, label }: TimelineProps) {
  return (
    <div className={styles.timeline}>
      {label && <span className={styles.label}>{label}</span>}
      {children}
    </div>
  )
}
