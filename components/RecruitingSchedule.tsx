import recruiting from '../content/recruiting'
import { Timeline, TimelineItem } from './Timeline'
import { Embed } from './Embed'
import { Callout } from './Callout'
import { PlanetNote } from './PlanetNote'
import styles from './RecruitingSchedule.module.css'

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    const id =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') ? u.pathname.slice(1) : null)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch {
    return null
  }
}

export function RecruitingSchedule() {
  const { year, cohort, schedule, questions, infoSessionUrl, previousInfoSession, preparingNote } =
    recruiting
  const infoSessionEmbed = infoSessionUrl ? toYouTubeEmbed(infoSessionUrl) : null
  const previousEmbed =
    !infoSessionEmbed && previousInfoSession ? toYouTubeEmbed(previousInfoSession.url) : null

  return (
    <div className={styles.wrap}>
      {schedule.length > 0 ? (
        <Timeline label={`${year} 신입생 (${cohort}) 선발 일정`}>
          {schedule.map((s) => (
            <TimelineItem key={s.phase} date={s.period} title={s.phase}>
              {s.note}
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        // 일정 확정 전: 지난 기수 일정 대신 행성이가 준비 중임을 알린다
        preparingNote && (
          <PlanetNote pose="코딩">
            {preparingNote.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </PlanetNote>
        )
      )}

      {infoSessionEmbed && (
        <div className={styles.info}>
          <h2 className={styles.infoTitle}>입학 설명회 라이브 영상</h2>
          <Embed src={infoSessionEmbed} title="입학 설명회 라이브 영상" />
        </div>
      )}

      {previousEmbed && previousInfoSession && (
        <div className={styles.info}>
          <h2 className={styles.infoTitle}>지난 입학 설명회가 궁금하다면</h2>
          <p className={styles.infoLede}>{previousInfoSession.label} 영상입니다.</p>
          <Embed src={previousEmbed} title={previousInfoSession.label} />
        </div>
      )}

      {questions.length > 0 && (
        <Callout type="note" emoji="💭">
          <p>
            <strong>미리 생각해 볼 질문</strong>
          </p>
          {questions.map((q) => (
            <p key={q}>{q}</p>
          ))}
        </Callout>
      )}
    </div>
  )
}
