import Link from 'next/link'
import { BookCover } from './BookCover'
import { Eyebrow } from './Eyebrow'
import styles from './BookNote.module.css'

/**
 * BookNote — 랜딩 아래쪽 책 소개 섹션(크루의 행선지 다음, 닫는 입구 앞). 책 페이지(/book)로 이어 준다.
 * 제목은 가제, 표지는 시안이다. 확정되면 이 컴포넌트와 /book 만 고치면 된다.
 */
export function BookNote() {
  return (
    <section className={styles.section} aria-label="우테코 책 소개">
      <Eyebrow>우테코의 책</Eyebrow>
      <h2 className={styles.heading}>우테코의 8년을 책으로 만들고 있습니다</h2>
      <Link href="/book" className={styles.coverLink} aria-label="도서 보기">
        <BookCover />
      </Link>
      <p className={styles.note}>
        {/* 랜딩은 '표지 시안' 태그가 바로 위에 있어, 태그를 하나 더 두지 않고 제목 앞에 (가제)로 적는다 */}
        (가제) AI 시대 개발자의 NEXT STEP
        <br />
        <span className={styles.tag}>2027년</span> 출간 예정
      </p>
      <Link href="/book" className={styles.more}>
        도서 보기
      </Link>
    </section>
  )
}
