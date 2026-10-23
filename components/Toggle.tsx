'use client'

import { useState, type ReactNode } from 'react'
import styles from './Toggle.module.css'

interface ToggleProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function Toggle({ title, defaultOpen = false, children }: ToggleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={styles.toggle}>
      <button
        className={styles.header}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>
          &#9654;
        </span>
        <span className={styles.title}>{title}</span>
      </button>
      <div className={`${styles.body} ${open ? styles.bodyOpen : ''}`}>
        <div className={styles.bodyInner}>{children}</div>
      </div>
    </div>
  )
}
