import Link from 'next/link'
import styles from './EnterDocs.module.css'

/**
 * EnterDocs — 랜딩의 닫는 초대.
 * 열망(Hero) → 우테코란 곳(TecoWay) → 흔적(CrewVoiceMap) → 확산(CrewJourney)을 본 독자에게, 독자별 입구를 준다.
 * 입구는 교육 과정(/apply/curriculum) · 지원 안내(/apply) · 문의(/contact) 세 갈래다.
 * 책은 바로 위 BookNote 섹션이 맡으므로 입구에 다시 두지 않는다.
 */
// 입구마다 그 페이지에서 무엇을 찾는지 한 줄로. 그림은 행성이 라인아트(이모지·색 바탕 대신)
const DOORS = [
  {
    pose: '행성이-걷기',
    title: '교육 과정',
    desc: '레벨 0부터 5까지 10개월',
    href: '/apply/curriculum'
  },
  {
    pose: '행성이-코딩',
    title: '지원 안내',
    desc: '선발 일정과 지원 방법',
    href: '/apply'
  },
  {
    pose: '행성이-커피',
    title: '문의',
    desc: '카카오톡·이메일·캠퍼스 위치',
    href: '/contact'
  }
]

export function EnterDocs() {
  return (
    <section className={styles.section} aria-label="다음으로 갈 곳">
      <h2 className={styles.heading}>이 경험이, 이제 여러분에게도 연결되도록</h2>
      <p className={styles.lede}>
        우테코의 10개월이 궁금한 분, 지원하려는 분, 더 궁금한 점이 있는 분들은 아래 페이지를 참고해 주세요.
      </p>

      <div className={styles.doors}>
        {DOORS.map((d) => (
          <Link className={styles.door} href={d.href} key={d.href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.pose} src={`/images/characters/${d.pose}.png`} alt="" />
            <span className={styles.doorBody}>
              <span className={styles.doorTitle}>{d.title}</span>
              <span className={styles.doorDesc}>{d.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
