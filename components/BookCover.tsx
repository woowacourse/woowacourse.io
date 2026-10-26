import styles from './BookCover.module.css'

interface BookCoverProps {
  /** 표지 폭. 랜딩은 작게, 책 페이지는 크게 */
  size?: 'sm' | 'lg'
  /** 도서 페이지 표지(그림자를 진하게, 페이지 식별용 data 속성). 펼치지 않는 평면 표지로 그린다 */
  overlap?: boolean
  /** '표지 시안' 라벨. 도서 페이지는 본문 문장으로 안내하므로 끈다 */
  label?: boolean
}

// 펼친 첫 장에 보이는 목차(4부). 도서 페이지 목차(content/book/index.mdx)와 같게 둔다
const PARTS = ['1부 우테코 설계의 출발점', '2부 강의 없는 학습 환경', '3부 가르치지 않는 코치', '4부 앞으로의 교육, 대체되지 않는 개발자']

const COVER_SRC = '/images/book/cover-draft.jpg'
const COVER_ALT = '책 표지 시안: AI 시대 개발자의 NEXT STEP, 우아한테크코스의 배움과 성장'

/**
 * BookCover — 우테코 책 표지. 아직 시안이라 '표지 시안' 라벨을 붙인다.
 * 확정 표지가 나오면 이미지 교체 후 라벨만 빼면 된다(랜딩·책 페이지 공통).
 *
 * 랜딩(기본): 정면으로 선 입체 책. 마우스를 올리면 표지가 완전히 펼쳐져
 * 첫 장의 목차가 보인다(누른 사람에게만 반응하는 움직임).
 * 도서 페이지(overlap): 펼치지 않는 평면 표지.
 */
export function BookCover({ size = 'sm', overlap = false, label = true }: BookCoverProps) {
  return (
    <figure
      className={`${styles.cover} ${styles[size]} ${overlap ? styles.overlap : ''}`}
      data-book-page={overlap || undefined}
    >
      {overlap ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.flat} src={COVER_SRC} alt={COVER_ALT} width={960} height={1440} loading="lazy" />
      ) : (
        <span className={styles.stage}>
          <span className={styles.volume}>
            {/* 첫 장 — 표지 바로 뒤에 숨어 있다가 표지가 열리면 보인다 */}
            <span className={styles.page} aria-hidden="true">
              <span className={styles.pageHead}>목차</span>
              {PARTS.map((part) => (
                <span key={part} className={styles.pageLine}>
                  {part}
                </span>
              ))}
            </span>
            {/* 표지 — 바깥(그림)과 안쪽 면 두 장. 왼쪽 모서리를 축으로 넘어간다 */}
            <span className={styles.lid}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.front} src={COVER_SRC} alt={COVER_ALT} width={960} height={1440} loading="lazy" />
              <span className={styles.inside} aria-hidden="true" />
            </span>
            <span className={styles.spine} aria-hidden="true" />
            <span className={styles.edge} aria-hidden="true" />
            <span className={styles.back} aria-hidden="true" />
          </span>
        </span>
      )}
      {label && <figcaption className={styles.caption}>표지 시안</figcaption>}
    </figure>
  )
}
