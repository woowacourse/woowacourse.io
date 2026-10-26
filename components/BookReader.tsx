'use client'

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import styles from './BookReader.module.css'

// globals.css 의 책 모바일 구간과 같은 경계
const MOBILE = '(max-width: 767px)'

const getLeaves = (el: HTMLElement | null) => Array.from(el?.querySelectorAll<HTMLElement>('.book-leaf') ?? [])

/**
 * BookReader — 도서 페이지 목차를 담는 책(content/book/index.mdx).
 * 데스크톱은 두 쪽 펼침(.book-spread, globals.css) 그대로다. 모바일은 이북 리더처럼 한 번에 한 쪽(.book-leaf = 부 하나)만
 * 화면에 맞는 높이로 보여 주고 옆으로 넘긴다 — 긴 종이 한 장을 스크롤로 훑어 내려가던 모습이 책답지 않았기 때문.
 *
 * - 넘기기: 밀기(가로 scroll-snap — 브라우저 기본 스크롤이라 관성·성능이 그대로), 화면 왼쪽·오른쪽 가장자리 탭, ‹ › 버튼, ←/→ 키
 * - 위치: 쪽마다 아래 가운데 쪽 번호(CSS counter), 책 아래에 '현재 / 전체'와 진행 막대, 오른쪽 종이 뭉치가 남은 쪽만큼 얇아진다
 * - 목차 글자는 MDX 그대로 children 으로 받으므로 검색·llms-full.txt 에도 남는다
 */
export function BookReader({ children }: { children: ReactNode }) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [count, setCount] = useState(0)
  // 한 번이라도 넘기면 넘기는 법 안내를 거둔다
  const [turned, setTurned] = useState(false)

  useEffect(() => {
    const el = pagesRef.current
    if (!el) return
    setCount(getLeaves(el).length)
    // 손으로 밀든 버튼으로 넘기든, 지금 보이는 쪽은 스크롤 위치에서 읽는다
    const onScroll = () => {
      const leaves = getLeaves(el)
      if (!leaves.length) return
      const origin = leaves[0].offsetLeft
      let nearest = 0
      leaves.forEach((leaf, i) => {
        if (Math.abs(leaf.offsetLeft - origin - el.scrollLeft) < Math.abs(leaves[nearest].offsetLeft - origin - el.scrollLeft)) nearest = i
      })
      setIndex(nearest)
      if (nearest > 0) setTurned(true)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (target: number) => {
    const el = pagesRef.current
    const leaves = getLeaves(el)
    if (!el || !leaves.length) return
    const i = Math.max(0, Math.min(leaves.length - 1, target))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: leaves[i].offsetLeft - leaves[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' })
  }

  // 이북처럼 화면 왼쪽 28%를 누르면 앞 쪽, 오른쪽 28%를 누르면 다음 쪽. 가운데와 글자를 고르는 중일 땐 넘기지 않는다
  const onTap = (e: MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia(MOBILE).matches) return
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width * 0.28) goTo(index - 1)
    else if (x > rect.width * 0.72) goTo(index + 1)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!window.matchMedia(MOBILE).matches) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(index - 1)
    }
  }

  const left = Math.max(0, count - 1 - index)

  return (
    <>
      <div className="book-spread" style={{ '--leaves-left': left } as CSSProperties}>
        <div
          ref={pagesRef}
          className="book-pages"
          tabIndex={0}
          role="group"
          aria-roledescription="책"
          aria-label="목차"
          onClick={onTap}
          onKeyDown={onKey}
        >
          {children}
        </div>
      </div>
      {count > 1 && (
        <div className={styles.bar}>
          <button type="button" className={styles.turn} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="앞 쪽">
            ‹
          </button>
          <span className={styles.status}>
            <span aria-live="polite">
              {index + 1} / {count}
            </span>
            <span className={styles.progress} aria-hidden="true">
              <span style={{ transform: `scaleX(${(index + 1) / count})` }} />
            </span>
          </span>
          <button type="button" className={styles.turn} onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label="다음 쪽">
            ›
          </button>
        </div>
      )}
      {count > 1 && <span className={`${styles.hint} ${turned ? styles.hintGone : ''}`}>밀거나 화면 가장자리를 눌러 넘길 수 있습니다</span>}
    </>
  )
}
