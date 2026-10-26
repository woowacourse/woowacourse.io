import type { ReactNode } from 'react'
import styles from './Traits.module.css'

/**
 * Traits — '이런 분을 찾습니다'처럼 사람의 특징을 몇 가지 나열할 때.
 * 항목마다 왼쪽에 행성이 라인아트, 오른쪽에 굵은 제목 한 줄 + 설명. 순서가 아니라 번호는 없다.
 * 그림은 장식이라 읽지 않는다(alt=""). 포즈는 public/images/characters/index.md 에서 고른다.
 *
 * <Traits>
 *   <Trait pose="코딩" title="최소한의 구현 역량을 갖춘 사람">설명…</Trait>
 * </Traits>
 */
export function Traits({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>
}

export function Trait({ pose, title, children }: { pose: string; title: string; children: ReactNode }) {
  return (
    <li className={styles.item}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.pose} src={`/images/characters/행성이-${pose}.png`} alt="" />
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <div className={styles.desc}>{children}</div>
      </div>
    </li>
  )
}
