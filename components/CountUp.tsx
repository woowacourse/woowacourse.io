'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * CountUp — 숫자가 0에서 목표값까지 차오른다. InView 로 감싼 섹션 안에서만 움직인다:
 * 바깥 [data-inview] 가 'waiting' 이 되면 0 으로 두었다가 'in' 이 되면 세기 시작한다.
 * 처음부터 보이는 섹션('static')·모션 최소화 설정·JS 없음 → 그냥 목표값을 보여 준다.
 */
export function CountUp({
  to,
  suffix = '',
  duration = 1600,
  delay = 0
}: {
  to: number
  suffix?: string
  /** 밀리초 */
  duration?: number
  /** 'in' 이 된 뒤 기다리는 시간(밀리초) */
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(to)

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>('[data-inview]')
    if (!host) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let timer: number | undefined
    const run = () => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - (1 - p) ** 3 // 빠르게 올라가다 끝에서 천천히
        setN(Math.round(to * eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    // 부모(InView)의 effect 가 자식보다 늦게 돌아, 여기서는 상태 변화를 지켜본다
    const onPhase = () => {
      const phase = host.getAttribute('data-inview')
      if (phase === 'waiting') setN(0)
      if (phase === 'in') {
        mo.disconnect()
        timer = window.setTimeout(run, delay)
      }
    }
    const mo = new MutationObserver(onPhase)
    mo.observe(host, { attributes: true, attributeFilter: ['data-inview'] })
    onPhase()
    return () => {
      mo.disconnect()
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [to, duration, delay])

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  )
}
