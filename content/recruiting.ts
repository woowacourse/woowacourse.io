export type RecruitingStatus = '모집중' | '모집예정' | '마감'

export interface RecruitingSchedule {
  /** 단계명 (예: '서류접수') */
  phase: string
  /** 기간/날짜 문자열 */
  period: string
  /** 보조 설명·링크 안내 (선택) */
  note?: string
}

export interface Recruiting {
  /** 기수 (예: '8기') */
  cohort: string
  /** 모집 연도 */
  year: number
  status: RecruitingStatus
  /** 일정이 아직 없을 때 보여 줄 안내 (사이트 상단 배너와 지원 안내 페이지에 함께 쓰임) */
  announcement?: string
  /** 안내와 함께 걸 공지 경로 (선택) */
  announcementHref?: string
  /** 일정 확정 전 지원 안내 페이지에서 행성이와 함께 보여 줄 안내 (문단 단위) */
  preparingNote?: string[]
  /** 지원 폼 URL */
  applyUrl?: string
  /** 이번 기수 입학 설명회 영상 URL */
  infoSessionUrl?: string
  /** 이번 기수 영상이 없을 때 대신 보여 줄 지난 입학 설명회 */
  previousInfoSession?: { label: string; url: string }
  schedule: RecruitingSchedule[]
  /** 미리 생각해 볼 질문 */
  questions: string[]
}

// 다음 기수 모집은 이 파일만 수정하면 됩니다.
// - 일정이 확정되면 schedule 을 채우고 announcement 를 지웁니다(배너도 함께 사라집니다).
// - status 를 '모집중' 으로 바꾸면 지원 안내 페이지 맨 위에 모집 상태와 지원하기 버튼이 나타납니다.
const recruiting: Recruiting = {
  cohort: '9기',
  year: 2027,
  status: '모집예정',
  announcement: '우아한테크코스 9기 선발 안내는 11월 중 공개합니다.',
  announcementHref: '/notice/2026-10-23-9th-recruiting-announcement',
  preparingNote: [
    '우테코는 지금 AI 시대에 맞는 교육 과정을 새로 만들고 있습니다.',
    '바뀌는 과정과 9기 선발 안내는 2026년 11월 중에 이 홈페이지에서 발표합니다.'
  ],
  applyUrl: 'https://apply.techcourse.co.kr/recruits',
  previousInfoSession: {
    label: '2026 신입생(8기) 입학 설명회',
    url: 'https://www.youtube.com/watch?v=cv01__jxppU'
  },
  schedule: [],
  questions: []
}

export default recruiting
