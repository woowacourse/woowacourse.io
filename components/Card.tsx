import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title: string
  icon?: string
  href?: string
  disabled?: boolean
  meta?: string
  variant?: 'card' | 'row'
  children?: ReactNode
}

export function Card({ title, icon, href, disabled, meta, variant = 'card', children }: CardProps) {
  const baseClass = variant === 'row' ? styles.row : styles.card
  const content = (
    <div className={`${baseClass} ${disabled ? styles.disabled : ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {children && <div className={styles.description}>{children}</div>}
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      {href && !disabled && <span className={styles.arrow} aria-hidden="true">&rarr;</span>}
    </div>
  )

  if (href && !disabled) {
    return (
      <a href={href} className={styles.link}>
        {content}
      </a>
    )
  }

  return content
}
