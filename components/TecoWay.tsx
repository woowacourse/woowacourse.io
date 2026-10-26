import type { ReactNode } from 'react'
import styles from './TecoWay.module.css'
import { crewCount } from '../content/crew-voices'

/**
 * TecoWay: 랜딩에서 Hero 다음에 오는 '우테코의 10개월' 소개.
 * 헤드라인은 교육 철학 첫 H2("우리는 가르치지 않습니다")의 예고편 — philosophy.mdx와 호응.
 * 리드 한 줄은 히어로의 '10개월 교육 과정'을 받아 레벨 흐름으로 잇고,
 * 5단계는 레벨 0→5 시간순이되 단계마다 우테코만 말할 수 있는 사실 하나를 싣는다
 * (다른 교육기관 랜딩에 붙여도 어색하지 않은 문장은 넣지 않는다 — 문구 출처: growth-arc.ts·philosophy.mdx).
 * 마커는 행성이 포즈(동일 크기 — 크기 변화는 모호해서 뺐다), 점선 길이 다섯 정거장을 모두 잇고
 * 마지막 수료 정거장(반짝·글로우)이 아크를 닫는다 — 포즈는 사실 헤드라인과 1:1(카탈로그: characters/index.md).
 * 레벨 5 텍스트의 735가 다운스트림 행선지 CrewJourney('이 길을 지난 735명')의 지시 대상(crewCount 단일 원천).
 * 별자리(CrewVoiceMap) 서브텍스트('이 10개월을 경험한 크루들')는 숫자 없이 이 섹션의 서사만 받는다.
 * 레벨별 상세는 지원 탭 '교육 과정'(/apply/curriculum, CrewGrowth)이 담당한다.
 */
const STEPS: Array<{ level: string; fact: string; pose: string; text?: ReactNode; star?: boolean }> = [
  {
    level: '레벨 0',
    fact: '첫 미션은 코드가 아니라 연극입니다',
    pose: '행성이-호기심',
  },
  {
    level: '레벨 1~2',
    fact: '강의보다 미션이 먼저입니다',
    pose: '행성이-페어',
  },
  {
    level: '레벨 3',
    fact: '사용자를 위한 진짜 서비스를 만듭니다',
    pose: '행성이-회의',
  },
  {
    level: '레벨 4',
    fact: '이미 있는 도구를 일부러 다시 만듭니다',
    pose: '행성이-과열',
  },
  {
    level: '레벨 5',
    fact: '개발자가 되어 생태계로 나갑니다',
    text: (
      <>
        지금까지 이 길을 지난 크루 <strong>{crewCount}명</strong>
      </>
    ),
    pose: '행성이-반짝',
    star: true,
  },
]

export function TecoWay() {
  return (
    <section id="teco-way" className={styles.section} aria-label="우테코의 10개월 — 우리는 가르치지 않습니다">
      <h2 className={styles.heading}>
        우리는 가르치지 않습니다.
        <br />
        10개월의 경험이 가르칩니다.
      </h2>
      <p className={styles.lede}>
        우테코의 10개월은 레벨 0부터 5까지 이렇게 이어집니다.
      </p>

      <ol className={styles.timeline}>
        {STEPS.map((s) => (
          <li key={s.level} className={styles.step}>
            <span className={styles.marker} aria-hidden="true">
              {s.star && <span className={styles.glow} />}
              <img className={styles.pose} src={`/images/characters/${s.pose}.png`} alt="" width={56} />
            </span>
            <span className={styles.stepLevel}>{s.level}</span>
            <span className={styles.stepFact}>{s.fact}</span>
            {s.text && <span className={styles.stepText}>{s.text}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}
