import type { ReactNode } from 'react'
import styles from './PlanetNote.module.css'

interface PlanetNoteProps {
  /** public/images/characters/행성이-{pose}.png — 고르는 법은 같은 폴더 index.md */
  pose: string
  children: ReactNode
}

/** 행성이와 함께 보여 주는 짧은 안내. 노션 콜아웃처럼 옅은 바탕에 캐릭터를 왼쪽에 둔다 */
export function PlanetNote({ pose, children }: PlanetNoteProps) {
  return (
    <div className={styles.note}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.character}
        src={`/images/characters/행성이-${pose}.png`}
        alt=""
        width={96}
        height={96}
      />
      <div className={styles.body}>{children}</div>
    </div>
  )
}
