'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './YouTubeLightbox.module.css'

/**
 * YouTubeLightbox — 페이지에 한 번 얹으면, 아티클 안의 모든 유튜브 링크를
 * "그 자리에서 재생되는 모달"로 승격한다. 본문(MDX)·목록 컴포넌트의 링크를
 * 하나도 고치지 않고 전역 클릭 위임으로 가로챈다. iframe은 클릭한 순간 1개만
 * 생성하므로(파사드), 영상이 수백 개인 페이지에서도 안전하다.
 *
 * 가로채지 않는 경우(기존 동작 보존):
 *  - 재생목록(list=) 링크 — "재생목록 바로가기"는 유튜브로 보낸다
 *  - ⌘/Ctrl/Shift+클릭·중간클릭 — 새 탭으로 열려는 의도
 */

/** 유튜브 watch/youtu.be/embed/shorts URL에서 11자리 videoId를 뽑는다. 아니면 null. */
function parseYouTubeId(href: string): string | null {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  const isYouTube =
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtube-nocookie.com' ||
    host === 'youtu.be'
  if (!isYouTube) return null

  // 재생목록 링크는 모달로 열지 않는다(유튜브에서 목록을 보게 둔다).
  if (url.searchParams.has('list')) return null

  let id: string | null = null
  if (host === 'youtu.be') {
    id = url.pathname.slice(1)
  } else if (url.pathname === '/watch') {
    id = url.searchParams.get('v')
  } else if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
    id = url.pathname.split('/')[2] ?? null
  }

  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
}

interface Playing {
  id: string
  title: string
}

export function YouTubeLightbox() {
  const [mounted, setMounted] = useState(false)
  const [playing, setPlaying] = useState<Playing | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => setPlaying(null), [])

  // 전역 클릭 위임 — 유튜브 링크를 가로채 모달을 연다.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // 새 탭 의도(수식키·중간클릭)는 기본 동작에 맡긴다.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return
      const id = parseYouTubeId(href)
      if (!id) return

      e.preventDefault()
      lastFocused.current = anchor as HTMLElement
      setPlaying({ id, title: anchor.textContent?.trim() || '유튜브 영상' })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // 열렸을 때: 스크롤 잠금 · 포커스 이동 · Esc 닫기 · 포커스 복원
  useEffect(() => {
    if (!playing) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      lastFocused.current?.focus?.()
    }
  }, [playing, close])

  if (!mounted || !playing) return null

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${playing.title} 재생`}
      onClick={close}
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label="닫기">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className={styles.frameWrap}>
          <iframe
            key={playing.id}
            className={styles.frame}
            src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0`}
            title={playing.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
