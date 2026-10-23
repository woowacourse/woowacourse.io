import styles from './ExternalPreviewCard.module.css'

interface ExternalPreviewCardProps {
  href: string
  title: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  eyebrow?: string
  meta?: string
  actionLabel?: string
}

export function ExternalPreviewCard({
  href,
  title,
  description,
  imageSrc,
  imageAlt,
  eyebrow,
  meta,
  actionLabel = 'Open link',
}: ExternalPreviewCardProps) {
  return (
    <a className={styles.card} href={href} target="_blank" rel="noreferrer">
      {imageSrc && (
        <div className={styles.media}>
          <img className={styles.image} src={imageSrc} alt={imageAlt ?? ''} loading="lazy" />
        </div>
      )}
      <div className={styles.content}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        {meta && <p className={styles.meta}>{meta}</p>}
        <span className={styles.action}>
          {actionLabel}
          <span aria-hidden="true">-&gt;</span>
        </span>
      </div>
    </a>
  )
}
