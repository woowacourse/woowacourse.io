'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './BookSample.module.css'

// 글자 크기 단계. 고른 단계는 다음에 다시 열어도 그대로다(이 브라우저에만 남는다)
const SIZES = ['작게', '보통', '크게'] as const
const STORAGE_KEY = 'book-sample-size'

/**
 * BookSample — 원고 미리 읽기(content/book/chapter-*.mdx). 도서 목차에서 장을 누르면 이 화면으로 온다.
 * 사이트 머리·꼬리 위로 종이 한 장이 화면을 꽉 채우고(position: fixed), 그 안에서만 내려 읽는다.
 *
 * - 위 막대: 목차로 돌아가기, 지금 읽는 절 제목, 글자 크기, 읽은 만큼 차는 진행 막대
 * - Esc 로도 목차로 돌아간다
 * - 본문은 MDX 그대로 children 으로 받는다(검색·llms-full.txt 에도 남는다). 본문 서식은 globals.css 의 .book-sample-*
 */
export function BookSample({ chapter, title, children }: { chapter: string; title: string; children: ReactNode }) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [section, setSection] = useState('')
  const [size, setSize] = useState(1)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const i = saved === null ? -1 : Number(saved)
      if (Number.isInteger(i) && i >= 0 && i < SIZES.length) setSize(i)
    } catch {}
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
      // 막대 바로 아래를 지난 마지막 절 제목이 지금 읽는 절이다
      const top = el.getBoundingClientRect().top + 96
      let current = ''
      el.querySelectorAll('h2').forEach((h) => {
        if (h.getBoundingClientRect().top < top) current = h.textContent ?? ''
      })
      setSection(current)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // 열리면 바로 내려 읽을 수 있게 스크롤 영역에 초점을 둔다(키보드 ↑↓·스페이스)
    scrollRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/book#목차')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])

  const changeSize = () => {
    const next = (size + 1) % SIZES.length
    setSize(next)
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {}
  }

  return (
    <div className={`book-sample ${styles.screen}`} data-size={size}>
      <header className={styles.bar}>
        <Link href="/book#목차" className={styles.back}>
          <span aria-hidden="true">←</span> 목차
        </Link>
        <p className={styles.where} aria-hidden="true">
          <span className={styles.chapter}>{chapter}</span>
          <span className={styles.section}>{section || title}</span>
        </p>
        <button type="button" className={styles.size} onClick={changeSize} aria-label={`글자 크기: ${SIZES[size]}. 눌러서 바꾸기`}>
          <span aria-hidden="true">
            가<span className={styles.sizeBig}>가</span>
          </span>
          <span className={styles.sizeLabel}>{SIZES[size]}</span>
        </button>
        <span className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </header>
      <div ref={scrollRef} className={styles.scroll} tabIndex={-1}>
        <div className="book-sample-page">{children}</div>
      </div>
    </div>
  )
}
