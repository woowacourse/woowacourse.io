'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode, type TouchEvent } from 'react'
import styles from './BookSample.module.css'

// 글자 크기 단계. 고른 단계와 보기 방식은 다음에 다시 열어도 그대로다(이 브라우저에만 남는다)
const SIZES = ['작게', '보통', '크게'] as const
const SIZE_KEY = 'book-sample-size'
const VIEW_KEY = 'book-sample-view'
// 두 쪽 펼침 구간 — globals.css·BookSample.module.css 의 같은 미디어 쿼리와 맞춘다.
// 이보다 좁거나 낮으면 한 쪽이 너무 좁고 짧아져, 내려 읽기(한 장)가 낫다
const SPREAD = '(min-width: 1100px) and (min-height: 620px)'

type View = 'spread' | 'scroll'

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
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * BookSample — 원고 미리 읽기(content/book/chapter-*.mdx). 도서 목차에서 장을 누르면 이 화면으로 온다.
 * 사이트 머리·꼬리 위로 책이 화면을 꽉 채운다(position: fixed).
 *
 * - 넓은 데스크톱: 도서 목차처럼 두 쪽을 펼쳐 한 번에 두 쪽씩 넘긴다. 본문을 CSS 다단(쪽 높이에 맞춘 단)으로 흘리고,
 *   가로 스크롤 위치를 펼침 하나씩 옮긴다 — 브라우저 찾기(⌘F)가 단어가 있는 쪽으로 데려가면 그 펼침에 맞춰 선다.
 *   넘기기: ‹ › 버튼, ←/→·PageUp/PageDown·스페이스, 휠·트랙패드, 쪽 바깥 가장자리 누르기, 터치로 밀기
 * - 모바일·좁은 창: 종이 한 장을 내려 읽는다. 넓은 데스크톱에서도 위 막대에서 '스크롤로 보기'를 고를 수 있다
 * - 위 막대: 목차로 돌아가기, 지금 읽는 절 제목, 보기 방식, 글자 크기, 읽은 만큼 차는 진행 막대. Esc 로도 목차로
 * - 본문은 MDX 그대로 children 으로 받는다(검색·llms-full.txt 에도 남는다). 본문 서식은 globals.css 의 .book-sample-*
 */
export function BookSample({ chapter, title, children }: { chapter: string; title: string; children: ReactNode }) {
  const router = useRouter()
  const stageRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState(1)
  const [prefer, setPrefer] = useState<View>('spread')
  const [wide, setWide] = useState(false)
  const spread = wide && prefer === 'spread'

  const [progress, setProgress] = useState(0)
  const [section, setSection] = useState('')
  // 펼침 상태: 지금 펼침, 펼침 수, 쪽 수, 쪽 수가 홀수일 때 끝에 빈 쪽을 하나 덧대는지
  const [index, setIndex] = useState(0)
  const [spreads, setSpreads] = useState(1)
  const [pages, setPages] = useState(2)
  const [pad, setPad] = useState(false)

  const indexRef = useRef(0)
  const spreadsRef = useRef(1)
  const stepRef = useRef(0)
  const padRef = useRef(false)
  // 글자 크기·보기 방식·창 크기가 바뀌면 다시 짠 뒤 같은 비율 위치로 돌아간다
  const keepRef = useRef<number | null>(null)
  const snapTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const wheel = useRef({ acc: 0, locked: false, timer: undefined as ReturnType<typeof setTimeout> | undefined })
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    const saved = load(SIZE_KEY)
    const i = saved === null ? -1 : Number(saved)
    if (Number.isInteger(i) && i >= 0 && i < SIZES.length) setSize(i)
    if (load(VIEW_KEY) === 'scroll') setPrefer('scroll')
    const mq = window.matchMedia(SPREAD)
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const ratio = () => (spreadsRef.current > 1 ? indexRef.current / (spreadsRef.current - 1) : 0)

  const show = useCallback((i: number, smooth: boolean) => {
    const vp = viewportRef.current
    if (!vp) return
    const next = Math.max(0, Math.min(spreadsRef.current - 1, i))
    indexRef.current = next
    setIndex(next)
    vp.scrollTo({ left: next * stepRef.current, behavior: smooth && !reduceMotion() ? 'smooth' : 'auto' })
  }, [])
  const turn = useCallback((d: number) => show(indexRef.current + d, true), [show])

  // 쪽 수 세기 — 단 너비와 단 사이(두 쪽의 안쪽 여백 + 책등)로 가로 길이를 나눈다
  const measure = useCallback(() => {
    const vp = viewportRef.current
    const page = pageRef.current
    if (!vp || !page || !vp.clientWidth) return
    const gap = parseFloat(getComputedStyle(page).columnGap) || 0
    const column = (vp.clientWidth - gap) / 2
    const cols = Math.max(1, Math.round((vp.scrollWidth + gap) / (column + gap)))
    const real = padRef.current ? cols - 1 : cols
    // 홀수 쪽이면 마지막 펼침까지 가로 스크롤이 닿지 않는다. 빈 쪽을 덧대고 다시 센다
    const needPad = real % 2 === 1
    if (needPad !== padRef.current) {
      padRef.current = needPad
      setPad(needPad)
      return
    }
    stepRef.current = vp.clientWidth + gap
    spreadsRef.current = Math.ceil(real / 2)
    setSpreads(spreadsRef.current)
    setPages(real)
    const keep = keepRef.current
    keepRef.current = null
    show(keep === null ? indexRef.current : Math.round(keep * (spreadsRef.current - 1)), false)
  }, [show])

  // 펼침: 글자 크기·덧댄 쪽·창 크기·글꼴 도착이 바뀔 때마다 다시 센다
  useEffect(() => {
    if (!spread) return
    measure()
    const vp = viewportRef.current
    if (!vp) return
    let first = true
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false
        return
      }
      keepRef.current = ratio()
      measure()
    })
    ro.observe(vp)
    document.fonts?.ready.then(() => measure())
    // 그림이 늦게 도착하면 크기가 바뀌어 쪽 수가 달라진다
    const onLoad = () => {
      keepRef.current = ratio()
      measure()
    }
    vp.addEventListener('load', onLoad, true)
    return () => {
      ro.disconnect()
      vp.removeEventListener('load', onLoad, true)
    }
  }, [spread, size, pad, measure])

  // 펼침: 지금 펼침의 절 제목과 진행
  useEffect(() => {
    if (!spread) return
    const vp = viewportRef.current
    if (!vp) return
    const step = stepRef.current || 1
    const origin = vp.getBoundingClientRect().left - vp.scrollLeft
    // 오른쪽 쪽(이 펼침의 둘째 단)까지 시작한 마지막 절
    const until = index * step + step / 2
    let current = ''
    vp.querySelectorAll('h2').forEach((h) => {
      if (h.getBoundingClientRect().left - origin < until) current = h.textContent ?? ''
    })
    setSection(current)
    setProgress(spreads > 1 ? index / (spreads - 1) : 1)
  }, [spread, index, spreads])

  // 펼침: 찾기(⌘F)·탭 이동으로 가로 위치가 옮겨지면 그 펼침에 맞춰 선다
  const onViewportScroll = () => {
    const vp = viewportRef.current
    if (!spread || !vp || !stepRef.current) return
    const i = Math.round(vp.scrollLeft / stepRef.current)
    if (i !== indexRef.current) {
      indexRef.current = i
      setIndex(i)
    }
    clearTimeout(snapTimer.current)
    snapTimer.current = setTimeout(() => {
      if (Math.abs(vp.scrollLeft - indexRef.current * stepRef.current) > 1) show(indexRef.current, false)
    }, 160)
  }

  // 내려 읽기: 진행과 절 제목
  useEffect(() => {
    if (spread) return
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
      el.querySelectorAll('h2').forEach((h) => {
        if (h.getBoundingClientRect().top < top) current = h.textContent ?? ''
      })
      setSection(current)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [spread, size])

  // 펼침: 휠·트랙패드 한 번 굴림 = 한 펼침. 관성으로 이어지는 굴림은 멈출 때까지 무시한다
  useEffect(() => {
    const el = stageRef.current
    if (!spread || !el) return
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
  }, [spread, turn])

  useEffect(() => {
    // 열리면 바로 읽을 수 있게 초점을 둔다(내려 읽기는 ↑↓·스페이스)
    stageRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/book#목차')
        return
      }
      if (!spread || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement).closest?.('input, textarea, [contenteditable]')) return
      const next = e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)
      const prev = e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)
      if (next || prev) {
        e.preventDefault()
        turn(next ? 1 : -1)
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        show(e.key === 'Home' ? 0 : spreadsRef.current - 1, true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router, spread, turn, show])

  // 펼침: 쪽 바깥 가장자리(왼쪽·오른쪽 15%)를 누르면 넘긴다. 링크·글자 고르기는 그대로 둔다
  const onFrameClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!spread || (e.target as HTMLElement).closest('a, button')) return
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    if (x < 0.15) turn(-1)
    else if (x > 0.85) turn(1)
  }
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchX.current = spread ? e.touches[0].clientX : null
  }
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1)
  }

  const keepPlace = () => {
    if (spread) keepRef.current = ratio()
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
    const next: View = prefer === 'spread' ? 'scroll' : 'spread'
    setPrefer(next)
    save(VIEW_KEY, next)
  }

  const left = index * 2 + 1
  const right = left + 1 <= pages ? left + 1 : null

  return (
    <div className={`book-sample ${styles.screen}`} data-size={size} data-view={prefer}>
      <header className={styles.bar}>
        <Link href="/book#목차" className={styles.back}>
          <span aria-hidden="true">←</span> 목차
        </Link>
        <p className={styles.where} aria-hidden="true">
          <span className={styles.chapter}>{chapter}</span>
          <span className={styles.section}>{section || title}</span>
        </p>
        <button type="button" className={`${styles.tool} ${styles.view}`} onClick={changeView}>
          {prefer === 'spread' ? (
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
              <span className={styles.toolLabel}>펼쳐 보기</span>
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
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </header>
      <div ref={stageRef} className={styles.stage} tabIndex={-1}>
        <button type="button" className={styles.turn} onClick={() => turn(-1)} disabled={index === 0} aria-label="앞 쪽">
          ‹
        </button>
        <div className={styles.frame} onClick={onFrameClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div ref={viewportRef} className={styles.viewport} onScroll={onViewportScroll}>
            <div ref={pageRef} className="book-sample-page" data-pad={pad ? '' : undefined}>
              {children}
            </div>
          </div>
          <span className={`${styles.folio} ${styles.folioLeft}`} aria-hidden="true">
            {left}
          </span>
          {right && (
            <span className={`${styles.folio} ${styles.folioRight}`} aria-hidden="true">
              {right}
            </span>
          )}
          <span className={styles.srStatus} aria-live="polite">
            {spread ? `${left}${right ? `–${right}` : ''}쪽 / 전체 ${pages}쪽` : ''}
          </span>
        </div>
        <button type="button" className={styles.turn} onClick={() => turn(1)} disabled={index >= spreads - 1} aria-label="다음 쪽">
          ›
        </button>
      </div>
    </div>
  )
}
