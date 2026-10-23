// 모든 메뉴에서 '마지막 수정일' 표시를 끈다(하위 페이지에 그대로 적용된다)
export default {
  index: {
    title: '홈',
    type: 'page',
    display: 'hidden',
    theme: {
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false,
      copyPage: false,
      timestamp: false,
      typesetting: 'article'
    }
  },
  // 교육 메뉴는 문장을 다듬는 동안 보류한다. 다시 공개할 때 apply 앞에 education 을 되살린다
  apply: {
    title: '지원',
    type: 'page',
    theme: { timestamp: false }
  },
  // 공지·도서는 폴더 자체가 목록·소개 페이지다(index.mdx 의 asIndexPage). 메뉴에서 한 번에 열린다.
  // 화면 설정(사이드바·목차 없음)은 여기 두면 하위 페이지에도 그대로 적용된다
  notice: {
    title: '공지',
    type: 'page',
    theme: {
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      typesetting: 'article'
    }
  },
  // 문의: 지원과 무관한 방문자도 바로 찾도록 헤더 탭으로 둔다. 페이지 하나라 사이드바·목차 없이
  contact: {
    title: '문의',
    type: 'page',
    theme: { sidebar: false, toc: false, pagination: false, timestamp: false }
  },
  // 책은 출간 전이라 맨 뒤. 원고 미리 읽기가 열리거나 출간되면 앞으로 옮긴다.
  book: {
    title: '도서',
    type: 'page',
    // 원고를 공개할 때: content/book/_meta.ts 를 만들어 '--preview': { type: 'separator', title: '미리 읽기' } 와
    // 원고 항목을 등록하고, 아래 sidebar: false 를 지워 미리 읽기 목차를 보여 줍니다.
    // (항목이 하나도 없는 빈 _meta 는 빌드를 깨뜨리므로 원고가 생길 때 만든다)
    theme: {
      sidebar: false,
      toc: false,
      breadcrumb: false,
      pagination: false,
      timestamp: false,
      typesetting: 'article'
    }
  }
}
