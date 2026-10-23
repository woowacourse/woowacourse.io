import type { ReactNode } from 'react'
import styles from './Manifesto.module.css'

// 번호 붙은 원칙 선언 — H2 제목 아래에서 그 원칙의 핵심 명제를 크게 드러낸다.
export function Claim({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <div className={styles.claim}>
      {n && <span className={styles.num} aria-hidden="true">{n}</span>}
      <p className={styles.claimText}>{children}</p>
    </div>
  )
}
