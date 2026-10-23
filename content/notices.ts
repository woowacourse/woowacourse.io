export type NoticeCategory = '공지' | '이벤트' | '개인정보'

export interface Notice {
  /** 게시일 YYYY-MM-DD (정렬 기준) */
  date: string
  title: string
  category: NoticeCategory
  /** content/notice/{slug}.mdx 와 같은 이름 */
  slug: string
  /** 옛 woowacourse.io(노션) 페이지 ID. 옛 주소 리다이렉트용 */
  legacyId?: string
}

// 최신 항목을 맨 위에. 새 공지는 content/notice/{slug}.mdx 를 만들고 여기에 한 줄 추가합니다.
const notices: Notice[] = [
  { date: '2026-10-23', title: '우아한테크코스 9기 선발 안내 공개 일정', category: '공지', slug: '2026-10-23-9th-recruiting-announcement' },
  { date: '2026-09-14', title: '개인정보처리방침 개정 안내 (2026년 9월 14일 시행)', category: '개인정보', slug: '2026-09-14-privacy-policy', legacyId: '3d8b51bb-5ed4-80e4-ab59-c9a5539a84d1' },
  { date: '2026-02-11', title: '개인정보처리방침 개정 안내 (2026년 2월 19일 시행)', category: '개인정보', slug: '2026-02-11-privacy-policy', legacyId: '302b51bb-5ed4-8095-a003-d6d931b8e515' },
  { date: '2025-10-14', title: '우아한테크코스 2025 리크루팅데이 참여 기업 모집', category: '이벤트', slug: '2025-10-14-recruiting-day-2025', legacyId: '28cb51bb-5ed4-80da-a71c-fe86e8306b85' },
  { date: '2025-05-19', title: '개인정보처리방침 개정 안내 (2025년 5월 24일 시행)', category: '개인정보', slug: '2025-05-19-privacy-policy', legacyId: '1f4b51bb-5ed4-8021-99dd-dae783c015d5' },
  { date: '2025-01-21', title: '개인정보처리방침 개정 안내 (2025년 1월 29일 시행)', category: '개인정보', slug: '2025-01-21-privacy-policy', legacyId: '12ab51bb-5ed4-80c6-b916-e93072a1c7c2' },
  { date: '2024-10-25', title: '개인정보처리방침 개정 안내 (2024년 11월 5일 시행)', category: '개인정보', slug: '2024-10-25-privacy-policy', legacyId: '182b51bb-5ed4-807d-ad18-ca7c3992689e' },
  { date: '2024-09-09', title: '우아한테크코스 2025 입학설명회', category: '이벤트', slug: '2024-09-09-info-session-2025', legacyId: '8705deab-d8f2-476b-9892-98b37b020779' },
  { date: '2024-05-20', title: '개인정보처리방침 개정 안내 (2024년 5월 27일 시행)', category: '개인정보', slug: '2024-05-20-privacy-policy', legacyId: '00162775-0953-4854-b089-e25d64792adb' },
  { date: '2023-10-23', title: '우아한테크코스 2023 리크루팅데이 참여 기업 모집', category: '이벤트', slug: '2023-10-23-recruiting-day-2023', legacyId: '1cfbc066-bec3-4717-b055-40524b8311c5' },
  { date: '2023-10-06', title: '우아한테크코스 2024 신입생 서류접수 오픈', category: '공지', slug: '2023-10-06-application-open-2024', legacyId: '947a3214-fb03-4f72-a96c-2eea63e89dce' },
  { date: '2023-09-22', title: '우아한테크코스 2024 입학설명회', category: '이벤트', slug: '2023-09-22-info-session-2024', legacyId: 'f4f88d91-dfab-44c1-a230-9546454a1f27' }
]

export default notices
