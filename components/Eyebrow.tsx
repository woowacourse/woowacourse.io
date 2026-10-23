import type { ReactNode } from 'react'
import styles from './Eyebrow.module.css'

/**
 * Eyebrow — 섹션 위에 놓는 작은 라벨 배지. 섹션 종류를 한눈에 알리고 스캔성을 높인다.
 * 통일 액센트(따뜻한 오렌지) pill.
 */
export function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  // onDark: 라이트 모드에서도 늘 어두운 바탕(별자리 띠 등) 위에 놓일 때. 밝은 주황으로 대비를 맞춘다
  return <span className={onDark ? `${styles.eyebrow} ${styles.onDark}` : styles.eyebrow}>{children}</span>
}
