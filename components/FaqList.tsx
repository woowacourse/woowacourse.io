import faq, { FAQ_CATEGORIES } from '../content/faq'
import styles from './FaqList.module.css'

export function FaqList() {
  return (
    <div className={styles.wrap}>
      {FAQ_CATEGORIES.map((category) => {
        const items = faq.filter((f) => f.category === category)
        if (items.length === 0) return null
        return (
          <section key={category} className={styles.section}>
            <h2 className={styles.category}>{category}</h2>
            <dl className={styles.list}>
              {items.map((f) => (
                <div key={f.question} className={styles.item}>
                  <dt className={styles.question}>{f.question}</dt>
                  <dd className={styles.answer}>{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
