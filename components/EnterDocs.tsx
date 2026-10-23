import Link from 'next/link'
import styles from './EnterDocs.module.css'
import { Eyebrow } from './Eyebrow'

/**
 * EnterDocs — 랜딩의 닫는 초대.
 * 열망(Hero) → 우테코란 곳(TecoWay) → 흔적(CrewVoiceMap) → 확산(CrewJourney)을 본 독자에게, 독자별 입구를 준다.
 * 입구는 교육 과정(/apply/curriculum) · 지원 안내(/apply) · 문의(/contact) 세 갈래다.
 * 책은 바로 위 BookNote 섹션이 맡으므로 입구에 다시 두지 않는다.
 */
const DOORS = [
  {
    icon: '🗺️',
    title: '교육 과정',
    href: '/apply/curriculum'
  },
  {
    icon: '✍️',
    title: '지원 안내',
    href: '/apply'
  },
  {
    icon: '💬',
    title: '문의',
    href: '/contact'
  }
]

export function EnterDocs() {
  return (
    <section className={styles.section} aria-label="다음으로 갈 곳">
      <Eyebrow>그리고</Eyebrow>
      <h2 className={styles.heading}>이 경험이, 이제 여러분에게도 연결되도록</h2>
      <p className={styles.lede}>
        우테코의 10개월이 궁금한 분, 우테코에 지원하려는 분, 더 궁금한 점이 있는 분들은 아래 페이지를 참고해 주세요.
      </p>

      <div className={styles.doors}>
        {DOORS.map((d) => (
          <Link className={styles.door} href={d.href} key={d.href}>
            <span className={styles.icon} aria-hidden="true">
              {d.icon}
            </span>
            <span className={styles.doorBody}>
              <span className={styles.doorTitle}>{d.title}</span>
            </span>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
