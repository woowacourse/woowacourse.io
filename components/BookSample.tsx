'use client'

import 'page-flip/src/Style/stPageFlip.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { PageFlip } from 'page-flip'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { paginate } from './bookPaginate'
import styles from './BookSample.module.css'

// 글자 크기 단계. 고른 단계와 보기 방식은 다음에 다시 열어도 그대로다(이 브라우저에만 남는다)
const SIZES = ['작게', '보통', '크게'] as const
const SIZE_KEY = 'book-sample-size'
const VIEW_KEY = 'book-sample-view'

type View = 'book' | 'scroll'

const load = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

/**
 * 쪽 크기 — 읽는 자리(stage)에 맞춘다.
 * - 양면: 넓고 충분히 높으면. 쪽 비율은 신국판(152×225) 가까이(가로:세로 = 0.68), 너무 크면 940px 높이에서 멈춘다
 * - 한 면: 휴대폰·세로 화면. 화면을 꽉 채운다(비율보다 글자 수가 중요하다)
 * 표지 판(쪽 뒤로 비치는 남색)의 여백: 양면 위 12·옆 18·아래 26px, 한 면 위 8·왼쪽 8·오른쪽 14·아래 12px
 */
function geometry(stageW: number, stageH: number) {
  const spread = stageW >= 880 && stageH >= 520 && stageW > stageH * 1.15
  if (spread) {
    let h = Math.min(stageH - 38, 940)
    let w = Math.round(h * 0.68)
    const maxW = Math.floor((stageW - 36 - 2 * 64) / 2) // 양옆 ‹ › 자리
    if (w > maxW) {
      w = maxW
      h = Math.min(h, Math.round(w / 0.6))
    }
    return { spread, w, h }
  }
  const w = Math.min(stageW - 22, 640)
  const h = Math.min(stageH - 20, Math.round(w / 0.56))
  return { spread, w, h }
}

/**
 * BookSample — 원고 미리 읽기(content/book/chapter-*.mdx). 도서 목차에서 장을 누르면 이 화면으로 온다.
 * 사이트 머리·꼬리 위로 책이 화면을 꽉 채운다(position: fixed).
 *
 * - 책으로 보기(기본): 본문을 쪽 크기에 맞춰 나눈 뒤(bookPaginate) page-flip(StPageFlip) 으로 종이가 휘며 넘어가게 한다.
 *   넓은 화면은 도서 목차처럼 두 쪽 펼침, 휴대폰은 한 쪽. 첫 쪽은 장 표제지(행성이 일러스트), 쪽마다 머리글·쪽 번호.
 *   넘기기: 쪽 모서리를 잡아 끌기·쪽 누르기(라이브러리), ‹ › 버튼, ←/→·PageUp/PageDown·스페이스, 휠·트랙패드, 터치로 밀기
 * - 스크롤로 보기: 종이 한 장을 내려 읽는다(위 막대에서 바꾼다)
 * - 위 막대: 목차로 돌아가기, 지금 읽는 절 제목, 보기 방식, 글자 크기, 읽은 만큼 차는 진행 막대. Esc 로도 목차로
 * - 본문은 MDX 그대로 children 으로 받는다(서버 HTML·검색·llms-full.txt 에 남는다). 책으로 볼 땐 이 원본을 감추고 복제본으로 쪽을 짠다.
 *   본문 서식은 globals.css 의 .book-sample-*, 쪽 서식은 .bs-page
 */
export function BookSample({ chapter, title, children }: { chapter: string; title: string; children: ReactNode }) {
  const router = useRouter()
  const screenRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLDivElement>(null)
  const sandboxRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)

  const [size, setSize] = useState(1)
  const [view, setView] = useState<View>('book')
  const [ready, setReady] = useState(false)
  const [spread, setSpread] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [sections, setSections] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [scrollSection, setScrollSection] = useState('')
  // 창 크기가 바뀌면 다시 짠다
  const [resizeTick, setResizeTick] = useState(0)

  const pageRef = useRef(0)
  const totalRef = useRef(0)
  // 글자 크기·보기 방식·창 크기가 바뀌면 다시 짠 뒤 같은 비율 위치로 돌아간다
  const keepRef = useRef<number | null>(null)
  const wheel = useRef({ acc: 0, locked: false, timer: undefined as ReturnType<typeof setTimeout> | undefined })

  useEffect(() => {
    const saved = load(SIZE_KEY)
    const i = saved === null ? -1 : Number(saved)
    if (Number.isInteger(i) && i >= 0 && i < SIZES.length) setSize(i)
    if (load(VIEW_KEY) === 'scroll') setView('scroll')
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        // 쪽 수가 달라지므로 쪽 번호가 아니라 읽은 비율로 돌아간다
        if (keepRef.current === null && totalRef.current > 1) keepRef.current = pageRef.current / (totalRef.current - 1)
        setResizeTick((t) => t + 1)
      }, 220)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
    }
  }, [])

  const bookRatio = () => (totalRef.current > 1 ? pageRef.current / (totalRef.current - 1) : 0)

  // 책으로 보기: 쪽을 짜고 page-flip 을 올린다
  useEffect(() => {
    if (view !== 'book') return
    let cancelled = false
    const screen = screenRef.current
    const stage = stageRef.current
    const source = sourceRef.current
    const sandbox = sandboxRef.current
    const book = bookRef.current
    if (!screen || !stage || !source || !sandbox || !book) return

    const build = async () => {
      // 쪽 나누기는 글꼴 너비에 달려 있다 — 본문에 쓰는 글자의 명조 글꼴이 다 도착한 뒤에 잰다
      const text = source.textContent ?? ''
      await Promise.all(
        ['400', '600', '700'].map((w) => document.fonts?.load(`${w} 18px "Noto Serif KR"`, text).catch(() => undefined))
      )
      const { PageFlip: Flip } = await import('page-flip')
      if (cancelled) return

      const rect = stage.getBoundingClientRect()
      const geo = geometry(rect.width, rect.height)
      screen.dataset.layout = geo.spread ? 'spread' : 'single'
      screen.style.setProperty('--pg-w', `${geo.w}px`)
      screen.style.setProperty('--pg-h', `${geo.h}px`)

      const { pages, sections: secs } = paginate({ source, sandbox, spread: geo.spread, chapter, title })
      if (cancelled) return

      const keep = keepRef.current
      keepRef.current = null
      let start = keep === null ? pageRef.current : Math.round(keep * (pages.length - 1))
      start = Math.max(0, Math.min(pages.length - 1, start))
      if (geo.spread) start -= start % 2

      flipRef.current?.destroy()
      const host = document.createElement('div')
      host.className = 'bs-host'
      host.style.width = `${geo.spread ? geo.w * 2 : geo.w}px`
      host.style.height = `${geo.h}px`
      book.style.width = host.style.width
      book.style.height = host.style.height
      book.append(host)

      const flip = new Flip(host, {
        width: geo.w,
        height: geo.h,
        size: 'fixed',
        autoSize: false,
        usePortrait: !geo.spread,
        showCover: false,
        drawShadow: true,
        maxShadowOpacity: 0.4,
        flippingTime: 760,
        mobileScrollSupport: false,
        clickEventForward: true,
        showPageCorners: true,
        swipeDistance: 30,
        startPage: start,
      })
      flip.loadFromHTML(pages)
      flip.on('flip', (e) => {
        pageRef.current = Number(e.data)
        setPage(pageRef.current)
      })
      flipRef.current = flip
      pageRef.current = start
      totalRef.current = pages.length
      setPage(start)
      setTotal(pages.length)
      setSections(secs)
      setSpread(geo.spread)
      setReady(true)
    }
    build()

    return () => {
      cancelled = true
    }
  }, [view, size, resizeTick, chapter, title])

  // 화면을 떠날 때 page-flip 을 걷는다(자기가 만든 host 째로 지운다)
  useEffect(
    () => () => {
      flipRef.current?.destroy()
      flipRef.current = null
    },
    []
  )

  // 스크롤로 보기로 바꾸면 책을 걷는다
  useEffect(() => {
    if (view === 'book') return
    flipRef.current?.destroy()
    flipRef.current = null
    setReady(false)
  }, [view])

  const turn = useCallback((d: number) => {
    const flip = flipRef.current
    if (!flip) return
    if (d > 0) flip.flipNext()
    else flip.flipPrev()
  }, [])

  // 책: 휠·트랙패드 한 번 굴림 = 한 번 넘김. 관성으로 이어지는 굴림은 멈출 때까지 무시한다
  useEffect(() => {
    const el = stageRef.current
    if (view !== 'book' || !el) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // 핀치 확대
      e.preventDefault()
      const w = wheel.current
      clearTimeout(w.timer)
      w.timer = setTimeout(() => {
        w.locked = false
        w.acc = 0
      }, 220)
      if (w.locked) return
      w.acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(w.acc) > 40) {
        turn(w.acc > 0 ? 1 : -1)
        w.acc = 0
        w.locked = true
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [view, turn])

  // 스크롤로 보기: 진행과 절 제목
  useEffect(() => {
    if (view !== 'scroll') return
    const el = stageRef.current
    if (!el) return
    const keep = keepRef.current
    keepRef.current = null
    if (keep !== null) el.scrollTop = keep * (el.scrollHeight - el.clientHeight)
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
      // 막대 바로 아래를 지난 마지막 절 제목이 지금 읽는 절이다
      const top = el.getBoundingClientRect().top + 96
      let current = ''
      el.querySelectorAll('.book-sample-page h2').forEach((h) => {
        if (h.getBoundingClientRect().top < top) current = h.textContent ?? ''
      })
      setScrollSection(current)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [view, size])

  useEffect(() => {
    // 열리면 바로 읽을 수 있게 초점을 둔다(스크롤로 보기는 ↑↓·스페이스)
    stageRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/book#목차')
        return
      }
      if (view !== 'book' || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement).closest?.('input, textarea, [contenteditable]')) return
      const next = e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)
      const prev = e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)
      if (next || prev) {
        e.preventDefault()
        turn(next ? 1 : -1)
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        flipRef.current?.turnToPage(e.key === 'Home' ? 0 : totalRef.current - 1)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router, view, turn])

  const keepPlace = () => {
    if (view === 'book') keepRef.current = bookRatio()
    else {
      const el = stageRef.current
      keepRef.current = el && el.scrollHeight > el.clientHeight ? el.scrollTop / (el.scrollHeight - el.clientHeight) : 0
    }
  }
  const changeSize = () => {
    keepPlace()
    const next = (size + 1) % SIZES.length
    setSize(next)
    save(SIZE_KEY, String(next))
  }
  const changeView = () => {
    keepPlace()
    const next: View = view === 'book' ? 'scroll' : 'book'
    setView(next)
    save(VIEW_KEY, next)
  }

  // 지금 보이는 쪽 — 양면은 왼쪽·오른쪽, 한 면은 하나
  const first = page + 1
  const last = spread ? Math.min(total, page + 2) : first
  const pageLabel = total ? (last > first ? `${first}–${last}` : `${first}`) : ''
  const bookProgress = total > 1 ? Math.min(1, (last - 1) / (total - 1)) : 0
  const section = view === 'book' ? (sections[last - 1] ?? '') : scrollSection

  return (
    <div
      ref={screenRef}
      className={`book-sample ${styles.screen}`}
      data-size={size}
      data-view={view}
      data-ready={ready ? '' : undefined}
    >
      <header className={styles.bar}>
        <Link href="/book#목차" className={styles.back}>
          <span aria-hidden="true">←</span> 목차
        </Link>
        <p className={styles.where} aria-hidden="true">
          <span className={styles.chapter}>{chapter}</span>
          <span className={styles.section}>{section || title}</span>
        </p>
        <button type="button" className={styles.tool} onClick={changeView}>
          {view === 'book' ? (
            <>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <rect x="4" y="1.5" width="8" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6.5 5h3M6.5 8h3M6.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className={styles.toolLabel}>스크롤로 보기</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M8 3.5C6.5 2.5 4 2.2 1.5 2.6v10c2.5-.4 5 0 6.5 1 1.5-1 4-1.4 6.5-1v-10C12 2.2 9.5 2.5 8 3.5zm0 0v10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <span className={styles.toolLabel}>책으로 보기</span>
            </>
          )}
        </button>
        <button type="button" className={styles.tool} onClick={changeSize} aria-label={`글자 크기: ${SIZES[size]}. 눌러서 바꾸기`}>
          <span aria-hidden="true">
            가<span className={styles.sizeBig}>가</span>
          </span>
          <span className={styles.toolLabel}>{SIZES[size]}</span>
        </button>
        <span className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${view === 'book' ? bookProgress : progress})` }} />
        </span>
      </header>

      <div ref={stageRef} className={styles.stage} tabIndex={-1}>
        {/* 책으로 보기 — 표지 판 위에 page-flip 이 쪽을 놓는다 */}
        <div className={styles.shelf}>
          <button type="button" className={styles.side} onClick={() => turn(-1)} disabled={page === 0} aria-label="앞 쪽">
            ‹
          </button>
          <div className={styles.board}>
            <div ref={bookRef} className={styles.book} />
          </div>
          <button type="button" className={styles.side} onClick={() => turn(1)} disabled={last >= total} aria-label="다음 쪽">
            ›
          </button>
          {!ready && <p className={styles.loading}>책을 펼치는 중…</p>}
        </div>
        {/* 원본 — 스크롤로 보기에선 이 종이 한 장을 그대로 읽고, 책으로 볼 땐 감춘 채 쪽을 짜는 데만 쓴다 */}
        <div ref={sourceRef} className="book-sample-page">
          {children}
        </div>
        {/* 쪽 재기용 빈 쪽 자리(보이지 않는다) */}
        <div ref={sandboxRef} className={styles.sandbox} aria-hidden="true" />
      </div>

      <footer className={styles.foot}>
        <button type="button" className={styles.turn} onClick={() => turn(-1)} disabled={page === 0} aria-label="앞 쪽">
          ‹
        </button>
        <span className={styles.status}>
          <span aria-live="polite">{pageLabel ? `${pageLabel} / ${total}` : ''}</span>
        </span>
        <button type="button" className={styles.turn} onClick={() => turn(1)} disabled={last >= total} aria-label="다음 쪽">
          ›
        </button>
      </footer>
    </div>
  )
}
