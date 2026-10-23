import type { NoticeCategory } from '../content/notices'
import styles from './NoticeTag.module.css'

// 분류별 노션 색 태그(Folio .fl-tag). 브랜드 주황과 겹치지 않게 이벤트는 노션 주황 틴트를 쓴다.
const TONE: Record<NoticeCategory, string> = {
  공지: styles.gray,
  이벤트: styles.orange,
  개인정보: styles.blue
}

export function NoticeTag({ category }: { category: NoticeCategory }) {
  return <span className={`${styles.tag} ${TONE[category]}`}>{category}</span>
}
