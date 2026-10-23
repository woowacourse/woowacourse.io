'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './Reveal.module.css'

interface RevealProps {
  children: ReactNode
}

/**
 * Reveal — 섹션이 스크롤로 뷰포트에 들어올 때 fade-up 한 번.
 * Hero의 로드 안무(별→제목→설명→CTA)를 페이지 전체로 확장해, 아래 섹션들이
 * "처음부터 박혀 있는" 게 아니라 스크롤하며 차례로 등장하는 시퀀스를 만든다.
 *
 * - prefers-reduced-motion / IntersectionObserver 미지원이면 관찰 없이 즉시 표시.
 * - 한 번 보이면 관찰을 해제한다(재진입 시 다시 숨기지 않음).
 * - 폭 제약·패딩 없는 plain block이라 CrewVoiceMap 풀블리드(margin-inline: calc(50% - 50vw))를
 *   깨지 않는다. transform은 레이아웃 박스 폭을 바꾸지 않으므로 음수 마진 트릭과 충돌 없음.
 */
export function Reveal({ children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    // 로드 시점에 이미 뷰포트에 걸친 섹션은 관찰 없이 바로 등장시킨다.
    // 아래 rootMargin -10% 기준으로는 fold 걸침 섹션이 트리거되지 않아
    // 첫 화면 하단이 투명한 여백으로 남는다 — "아래에 콘텐츠가 없어 보인다"의 원인.
    // (첫 페인트 뒤 상태 전환이라 fade-up 전환은 그대로 재생된다)
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      // 요소 상단이 뷰포트 하단에서 10% 올라오면 발동 — 화면에 충분히 들어온 뒤 재생
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={shown ? `${styles.reveal} ${styles.shown}` : styles.reveal}>
      {children}
    </div>
  )
}
