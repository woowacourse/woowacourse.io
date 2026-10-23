import styles from './AssetCard.module.css'

type AssetCategory = 'ec' | 'ee' | 'ok' | 'au' | 'aw'

interface AssetCardProps {
  id: string
  title: string
  category: AssetCategory
  author?: string
  date?: string
  tags?: string[]
  href?: string
}

const categoryLabels: Record<AssetCategory, string> = {
  ec: '\uAD50\uC721 \uCF58\uD150\uCE20',
  ee: '\uAD50\uC721 \uC2E4\uD5D8',
  ok: '\uC6B4\uC601 \uB178\uD558\uC6B0',
  au: 'AI \uD65C\uC6A9 \uC0AC\uB840',
  aw: 'AI \uC6CC\uD06C\uD50C\uB85C\uC6B0',
}

export function AssetCard({
  id,
  title,
  category,
  author,
  date,
  tags,
  href,
}: AssetCardProps) {
  const content = (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles[category]}`}>
          {categoryLabels[category]}
        </span>
        <span className={styles.id}>{id}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.meta}>
        {author && <span className={styles.author}>{author}</span>}
        {date && <span className={styles.date}>{date}</span>}
      </div>
      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} className={styles.link}>
        {content}
      </a>
    )
  }

  return content
}
