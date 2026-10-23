import type { Notice } from './content/notices'

export interface SiteRedirect {
  source: string
  destination: string
}

// 옮기거나 이름을 바꾼 주소 목록. GitHub Pages 는 서버 리다이렉트가 없어서
// 빌드 후 scripts/redirects/build.mjs 가 source 마다 바로 넘어가는 HTML 을 out/ 에 만든다.
// 로컬 next dev 에서는 next.config.ts 가 같은 목록을 리다이렉트로 쓴다.
export function buildRedirects(notices: Notice[]): SiteRedirect[] {
  return [
    { source: '/ai-experience', destination: '/apply/curriculum' },
    { source: '/education-model', destination: '/apply/curriculum' },
    { source: '/education-experiment', destination: '/apply/curriculum' },
    // 교육 메뉴를 다듬는 동안 /education 은 지원 탭 '교육 과정'으로 임시 이동(다시 공개하면 지운다)
    { source: '/education', destination: '/apply/curriculum' },
    { source: '/education/design-poe', destination: '/apply/curriculum' },
    { source: '/apply/contact', destination: '/contact' },
    { source: '/apply/notices', destination: '/notice' },
    // 9기 안내 공지의 게시일을 바로잡으며 주소가 바뀌었다(2026-10-28 → 2026-10-23)
    { source: '/notice/2026-10-28-9th-recruiting-announcement', destination: '/notice/2026-10-23-9th-recruiting-announcement' },
    // 옛 woowacourse.io(우피) 메뉴 주소
    { source: '/intro', destination: '/apply/about' },
    { source: '/curriculum', destination: '/apply/curriculum' },
    { source: '/faq', destination: '/apply/faq' },
    { source: '/hero', destination: '/apply/hero' },
    // 옛 woowacourse.io(노션) 공지 주소 → 새 공지 상세
    ...notices
      .filter((n) => n.legacyId)
      .map((n) => ({ source: `/${n.legacyId}`, destination: `/notice/${n.slug}` }))
  ]
}
