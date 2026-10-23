import styles from './PageCover.module.css'

interface PageCoverProps {
  /** public/images/covers/ 아래 이미지 경로 */
  src: string
  /** 사진 내용을 설명하는 대체 텍스트 */
  alt: string
  /** 잘라 보여 줄 기준 위치(CSS object-position). 사람이 아래쪽에 몰려 있으면 'center 70%' 처럼 */
  position?: string
}

/** 노션 페이지 커버 — 화면 가로를 꽉 채운다. 사이드바 없는 한 장짜리 페이지(공지·문의·도서)에만 쓴다 */
export function PageCover({ src, alt, position = 'center' }: PageCoverProps) {
  return (
    <div className={`page-cover ${styles.cover}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ objectPosition: position }} loading="eager" />
    </div>
  )
}
