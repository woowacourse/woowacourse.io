'use client'

import Link from 'next/link'
import { useState } from 'react'
import notices, { type NoticeCategory } from '../content/notices'
import { NoticeTag } from './NoticeTag'
import styles from './NoticeList.module.css'

const FILTERS: Array<'전체' | NoticeCategory> = ['전체', '공지', '이벤트', '개인정보']

/** 공지 목록 — 노션 데이터베이스 표 보기: 보기 탭(분류 필터) + 머리줄 + 행 */
export function NoticeList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('전체')
  const sorted = [...notices].sort((a, b) => b.date.localeCompare(a.date))
  const items = filter === '전체' ? sorted : sorted.filter((n) => n.category === filter)
  const count = (f: (typeof FILTERS)[number]) =>
    f === '전체' ? notices.length : notices.filter((n) => n.category === f).length

  return (
    <div className={styles.board} data-notice-page>
      <div className={styles.views} role="tablist" aria-label="분류로 거르기">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={styles.view}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className={styles.viewCount}>{count(f)}</span>
          </button>
        ))}
      </div>

      <div className={styles.table}>
        <div className={styles.head} aria-hidden="true">
          <span>제목</span>
          <span>분류</span>
          <span className={styles.headDate}>게시일</span>
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>등록된 공지가 없습니다.</p>
        ) : (
          <ul className={styles.rows}>
            {items.map((n) => (
              <li key={n.slug}>
                <Link className={styles.row} href={`/notice/${n.slug}`}>
                  <span className={styles.title}>
                    <span className={styles.pageIcon} aria-hidden="true">
                      📄
                    </span>
                    {n.title}
                  </span>
                  <span className={styles.category}>
                    <NoticeTag category={n.category} />
                  </span>
                  <time className={styles.date} dateTime={n.date}>
                    {n.date.replaceAll('-', '.')}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
