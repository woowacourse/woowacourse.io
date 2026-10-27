// 도서 폴더 자체가 소개·목차 페이지다(index.mdx 의 asIndexPage). 원고 미리 읽기는 목차의 장 링크로만 들어오므로
// 메뉴에는 감춰 둔다. 화면 설정(사이드바·목차 없음)은 content/_meta.ts 의 book 항목이 하위 페이지까지 적용한다
export default {
  'chapter-5': { title: '5장 미리 읽기', display: 'hidden' }
}
