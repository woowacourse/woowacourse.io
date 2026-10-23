import notices from '../notices'

// 공지 게시판: 사이드바 없이 목록(index, 폴더 자체) → 상세로만 오간다.
// 화면 설정은 content/_meta.ts 의 notice 항목이 하위 페이지까지 적용한다.
export default Object.fromEntries(
  // 상세는 노션처럼 제목 위에 경로(공지 > 제목)를 보여 준다
  notices.map((n) => [n.slug, { title: n.title, display: 'hidden', theme: { breadcrumb: true } }])
)
