import styles from './BookCover.module.css'

interface BookCoverProps {
  /** 표지 폭. 랜딩은 작게, 책 페이지는 크게 */
  size?: 'sm' | 'lg'
  /** 도서 페이지 표지(그림자를 진하게, 페이지 식별용 data 속성) */
  overlap?: boolean
  /** '표지 시안' 라벨. 도서 페이지는 본문 문장으로 안내하므로 끈다 */
  label?: boolean
}

/**
 * BookCover — 우테코 책 표지. 아직 시안이라 '표지 시안' 라벨을 붙인다.
 * 확정 표지가 나오면 이미지 교체 후 라벨만 빼면 된다(랜딩·책 페이지 공통).
 */
export function BookCover({ size = 'sm', overlap = false, label = true }: BookCoverProps) {
  return (
    <figure
      className={`${styles.cover} ${styles[size]} ${overlap ? styles.overlap : ''}`}
      data-book-page={overlap || undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/book/cover-draft.jpg"
        alt="책 표지 시안: AI 시대 개발자의 NEXT STEP, 우아한테크코스의 배움과 성장"
        width={960}
        height={1440}
        loading="lazy"
      />
      {label && <figcaption className={styles.caption}>표지 시안</figcaption>}
    </figure>
  )
}
