import styles from './Embed.module.css'

interface EmbedProps {
  /** iframe src (유튜브는 youtube-nocookie/embed, 지도는 place URL) */
  src: string
  title: string
  /** CSS aspect-ratio 문자열. 기본 16/9 (영상) */
  ratio?: string
  /** 제3자 페이지(지도 등)의 top 창 가로채기를 막기 위한 sandbox */
  sandbox?: string
  /** 임베드 아래에 원본으로 가는 링크 (임베드가 깨질 때의 대비책) */
  fallbackHref?: string
  fallbackLabel?: string
}

export function Embed({
  src,
  title,
  ratio = '16 / 9',
  sandbox,
  fallbackHref,
  fallbackLabel
}: EmbedProps) {
  return (
    <div className={styles.outer}>
      <div className={styles.frameWrap} style={{ aspectRatio: ratio }}>
        <iframe
          src={src}
          title={title}
          className={styles.frame}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          {...(sandbox ? { sandbox } : { allowFullScreen: true })}
        />
      </div>
      {fallbackHref && (
        <p className={styles.fallback}>
          <a href={fallbackHref} target="_blank" rel="noreferrer">
            {fallbackLabel ?? '새 창에서 열기'} →
          </a>
        </p>
      )}
    </div>
  )
}
