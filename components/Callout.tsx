import type { ReactNode } from 'react'
import styles from './Callout.module.css'

type CalloutType = 'info' | 'warning' | 'tip' | 'danger' | 'note'

interface CalloutProps {
  type?: CalloutType
  emoji?: string
  children: ReactNode
}

const defaultEmojis: Record<CalloutType, string> = {
  info: '\u{1F4A1}',
  warning: '\u26A0\uFE0F',
  tip: '\u2705',
  danger: '\u{1F6AB}',
  note: '\u{1F4DD}',
}

export function Callout({ type = 'info', emoji, children }: CalloutProps) {
  const icon = emoji ?? defaultEmojis[type]

  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      <span className={styles.emoji}>{icon}</span>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
