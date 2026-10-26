'use client'

import { useEffect } from 'react'

/**
 * 모바일에서 상단 안내 배너가 화면을 따라다니지 않게 했다(globals.css). 대신 배너가 지금 화면에
 * 얼마나 보이는지(--banner-visible)를 알려, 모바일 메뉴가 배너가 있던 자리만큼만 비우고 시작하게 한다.
 * (Nextra 는 배너가 늘 붙어 있다고 보고 배너 높이만큼 메뉴를 내린다. 스크롤한 뒤에는 그만큼 빈칸이 생겼다)
 */
export function MobileBannerOffset() {
  useEffect(() => {
    const banner = document.querySelector<HTMLElement>('.nextra-banner')
    if (!banner) return
    const root = document.documentElement
    let raf = 0
    const update = () => {
      raf = 0
      const visible = Math.max(0, Math.round(banner.getBoundingClientRect().bottom))
      root.style.setProperty('--banner-visible', `${visible}px`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return null
}
