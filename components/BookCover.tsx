'use client'

import { useRef, useState } from 'react'
import styles from './BookCover.module.css'

interface BookCoverProps {
  /** 표지 폭. 랜딩은 작게, 책 페이지는 크게 */
  size?: 'sm' | 'lg'
  /** 도서 페이지 표지(그림자를 진하게, 페이지 식별용 data 속성). 펼치지 않는 평면 표지로 그린다 */
  overlap?: boolean
  /** '표지 시안' 라벨. 도서 페이지는 본문 문장으로 안내하므로 끈다 */
  label?: boolean
}

// 펼친 책에 보이는 목차(4부). 도서 페이지 목차(content/book/index.mdx)와 같게 둔다
const PARTS = ['1부 우테코 설계의 출발점', '2부 강의 없는 학습 환경', '3부 가르치지 않는 코치', '4부 앞으로의 교육, 대체되지 않는 개발자']
// 도서 페이지처럼 왼쪽 면에 1·2부, 오른쪽 면에 3·4부
const PARTS_ON_LEFT = 2

const COVER_SRC = '/images/book/cover-draft.jpg'
const COVER_ALT = '책 표지 시안: AI 시대 개발자의 NEXT STEP, 우아한테크코스의 배움과 성장'

/**
 * BookCover — 우테코 책 표지. 아직 시안이라 '표지 시안' 라벨을 붙인다.
 * 확정 표지가 나오면 이미지 교체 후 라벨만 빼면 된다(랜딩·책 페이지 공통).
 *
 * 랜딩(기본): 정면으로 선 입체 책. 펼치면 표지가 완전히 넘어가
 * 왼쪽 면(1·2부)과 오른쪽 면(3·4부)의 목차가 보인다. 마우스는 올리면 펼치고,
 * 터치·키보드는 누를 때마다 펼치고 접는다. 책은 링크가 아니다 — 모바일에서 탭하자마자
 * 페이지가 넘어가 펼치는 모습을 못 보던 문제 때문. 도서 페이지로는 '도서 보기' 버튼으로 간다.
 * 도서 페이지(overlap): 펼치지 않는 평면 표지.
 */
export function BookCover({ size = 'sm', overlap = false, label = true }: BookCoverProps) {
  const [open, setOpen] = useState(false)
  // 한 번이라도 펼쳐 봤는지. 터치 안내(누르면 펼쳐진다)는 처음 한 번만 필요하다
  const [opened, setOpened] = useState(false)
  // 마지막으로 누른 포인터 종류. 마우스는 올릴 때 이미 펼쳐졌으니 클릭으로 다시 접지 않는다
  const pressedWith = useRef('')

  const toggle = (next: boolean) => {
    setOpen(next)
    if (next) setOpened(true)
  }

  return (
    <>
      <figure
        className={`${styles.cover} ${styles[size]} ${overlap ? styles.overlap : ''} ${open ? styles.open : ''}`}
        data-book-page={overlap || undefined}
      >
        {overlap ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.flat} src={COVER_SRC} alt={COVER_ALT} width={960} height={1440} loading="lazy" />
        ) : (
          <button
            type="button"
            className={styles.toggle}
            aria-pressed={open}
            aria-label="책 목차 펼쳐 보기"
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') toggle(true)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') setOpen(false)
            }}
            onPointerDown={(e) => {
              pressedWith.current = e.pointerType
            }}
            onClick={() => {
              // 터치·펜·키보드(Enter/Space는 포인터가 없어 '')만 펼침을 뒤집는다
              if (pressedWith.current !== 'mouse') toggle(!open)
              pressedWith.current = ''
            }}
          >
            <span className={styles.stage}>
              <span className={styles.volume}>
                {/* 오른쪽 면(첫 장) — 표지 바로 뒤에 숨어 있다가 표지가 열리면 보인다. 3·4부 */}
                <span className={styles.page} aria-hidden="true">
                  {PARTS.slice(PARTS_ON_LEFT).map((part) => (
                    <span key={part} className={styles.pageLine}>
                      {part}
                    </span>
                  ))}
                </span>
                {/* 표지 — 바깥(그림)과 안쪽 면 두 장. 왼쪽 모서리를 축으로 넘어간다. 펼치면 안쪽 면이 왼쪽 면이 된다(목차 제목과 1·2부) */}
                <span className={styles.lid}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.front} src={COVER_SRC} alt={COVER_ALT} width={960} height={1440} loading="lazy" />
                  <span className={styles.inside} aria-hidden="true">
                    <span className={styles.sheet}>
                      <span className={styles.pageHead}>목차</span>
                      {PARTS.slice(0, PARTS_ON_LEFT).map((part) => (
                        <span key={part} className={styles.pageLine}>
                          {part}
                        </span>
                      ))}
                    </span>
                  </span>
                </span>
                <span className={styles.spine} aria-hidden="true" />
                <span className={styles.back} aria-hidden="true" />
              </span>
            </span>
          </button>
        )}
        {label && <figcaption className={styles.caption}>표지 시안</figcaption>}
      </figure>
      {/* 터치 기기에서만 보이는 안내 — 마우스는 올리기만 해도 펼쳐지지만, 터치는 눌러 볼 수 있다는 단서가 없으면 그냥 지나친다.
          별자리의 '별을 누르면…' 안내와 같은 모양. 한 번 펼쳐 보면 사라진다(자리는 남겨 아래 내용이 들썩이지 않게) */}
      {!overlap && (
        <span className={`${styles.tapHint} ${opened ? styles.tapHintGone : ''}`} aria-hidden="true">
          책을 누르면 목차가 펼쳐집니다
        </span>
      )}
    </>
  )
}
