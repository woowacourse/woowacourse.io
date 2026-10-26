'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

export type InViewPhase = 'static' | 'waiting' | 'in'

/**
 * InView — 감싼 섹션이 화면에 들어올 때 data-inview="in" 을 단다. 움직임은 각 섹션 CSS 가 정한다.
 * 섹션마다 '의미 있는 순서'(단계가 차례로 켜짐, 별자리 선이 이어짐 등)를 한 번 재생하기 위한 장치다.
 * 모든 섹션을 똑같이 떠오르게 하던 Reveal 을 랜딩에서 대신한다.
 *
 * - 서버 렌더·JS 없음·모션 최소화·처음부터 통째로 보임: 'static' → 숨기지 않고 재생도 하지 않는다
 *   (다 보이는 것을 숨겼다가 다시 보여 주면 깜빡인다).
 * - 일부만 보이거나 화면 아래면 'waiting'(준비 상태)으로 두었다가, threshold 만큼 보이면 'in' 으로 재생한다.
 *   첫 화면 아래쪽에 걸친 섹션(TecoWay)도 조금 내려 읽기 시작할 때 순서가 재생된다.
 */
export function InView({
  children,
  className,
  threshold
}: {
  children: ReactNode
  className?: string
  /** 섹션이 이만큼(0~1) 보이면 재생. 기본은 조금만 들어와도 */
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const phase = useInViewPhase(ref, threshold)
  return (
    <div ref={ref} data-inview={phase} className={className}>
      {children}
    </div>
  )
}

/** InView 와 같은 규칙으로 단계만 돌려준다. 섹션이 스스로 data-inview 를 달 때 쓴다(별자리) */
export function useInViewPhase(ref: RefObject<HTMLElement | null>, threshold = 0.05): InViewPhase {
  const [phase, setPhase] = useState<InViewPhase>('static')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return
    const rect = el.getBoundingClientRect()
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) return
    setPhase('waiting')
    // 화면보다 훨씬 큰 섹션은 threshold 에 끝내 못 닿아 숨은 채로 남을 수 있다. 화면 높이로 닿을 수 있는 만큼으로 낮춘다
    const t = Math.min(threshold, ((window.innerHeight * 0.88) / rect.height) * 0.8)
    const io = new IntersectionObserver(
      (entries) => {
        // isIntersecting 은 조금만 겹쳐도 참이라, 실제로 보이는 비율로 판단한다
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= t - 0.001)) {
          setPhase('in')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: [0, t] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])

  return phase
}
