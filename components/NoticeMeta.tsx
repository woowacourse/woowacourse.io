import notices from '../content/notices'
import { NoticeTag } from './NoticeTag'
import styles from './NoticeMeta.module.css'

/** 공지 상세 머리 — 노션 페이지 속성(게시일 · 분류). 값은 content/notices.ts 에서 slug 로 찾는다 */
export function NoticeMeta({ slug }: { slug: string }) {
  const notice = notices.find((n) => n.slug === slug)
  if (!notice) return null

  return (
    <div className={styles.wrap} data-notice-page>
      <dl className={styles.props}>
        <div className={styles.prop}>
          <dt className={styles.name}>
            <span aria-hidden="true">📅</span> 게시일
          </dt>
          <dd className={styles.value}>
            <time dateTime={notice.date}>{notice.date.replaceAll('-', '.')}</time>
          </dd>
        </div>
        <div className={styles.prop}>
          <dt className={styles.name}>
            <span aria-hidden="true">🏷️</span> 분류
          </dt>
          <dd className={styles.value}>
            <NoticeTag category={notice.category} />
          </dd>
        </div>
      </dl>
    </div>
  )
}
