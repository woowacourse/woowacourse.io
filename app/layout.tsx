import { Footer, LastUpdated, Layout, Navbar, ThemeSwitch } from 'nextra-theme-docs'
import { Banner, Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import Link from 'next/link'
import recruiting from '../content/recruiting'
import { MobileBannerOffset } from '../components/MobileBannerOffset'
import 'nextra-theme-docs/style.css'
import './folio-tokens.css'
import './globals.css'

export const metadata = {
  // 공유 미리보기(og)·canonical 의 절대 주소 기준
  metadataBase: new URL('https://woowacourse.io'),
  title: {
    default: '우아한테크코스',
    template: '%s | 우아한테크코스'
  },
  description: '우아한테크코스의 소개와 교육 과정, 지원 안내, 공지사항을 담은 공식 홈페이지',
  // 링크 공유 미리보기(슬랙·카카오톡 등). 이미지는 1200x630, 모든 페이지가 같은 이미지를 쓴다
  openGraph: {
    type: 'website',
    siteName: '우아한테크코스',
    locale: 'ko_KR',
    images: [{ url: '/images/og-v2.png', width: 1200, height: 630, alt: '우아한테크코스' }]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-v2.png']
  }
}

const logo = (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/images/brand/logo-wordmark.svg"
    alt="우아한테크코스"
    className="site-logo"
    style={{ height: '1.5rem', width: 'auto', display: 'block' }}
  />
)

// 모집 안내 배너: content/recruiting.ts 의 announcement 가 있을 때만 사이트 전체 상단에 띄운다.
// 문구가 바뀌면 storageKey 도 바뀌어, 닫았던 방문자에게도 새 안내가 다시 보인다.
const recruitingBanner = recruiting.announcement ? (
  <Banner storageKey={`recruiting-${recruiting.cohort}-${recruiting.announcement.length}`}>
    <span className="site-banner-text">
      {recruiting.announcement}{' '}
      {recruiting.announcementHref && (
        <Link href={recruiting.announcementHref} className="site-banner-link">
          공지 보기 →
        </Link>
      )}
    </span>
  </Banner>
) : undefined

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      {/* 페이지 배경은 Folio --fl-bg (라이트 #ffffff · 다크 #1a1918).
          Nextra primary는 채도 0으로 두어 사이드바·목차 선택 표시를 노션처럼 무채색으로 */}
      <Head
        backgroundColor={{ light: '#ffffff', dark: '#1a1918' }}
        color={{ hue: 0, saturation: 0, lightness: { light: 30, dark: 80 } }}
      >
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 책 안쪽(펼친 목차·첫 장) 글꼴 — 원고에 쓴 Noto Serif KR. 한글은 필요한 글자 묶음만 내려받는다 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap"
        />
      </Head>
      <body>
        <MobileBannerOffset />
        <Layout
          banner={recruitingBanner}
          navbar={
            <Navbar logo={logo} logoLink="/">
              <ThemeSwitch lite className="theme-switch-navbar" />
            </Navbar>
          }
          search={<Search placeholder="문서 검색..." />}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/woowacourse/woowacourse.io/tree/main"
          copyPageButton={false}
          editLink={null}
          // 피드백 링크는 목차 옆에 혼자 떠 있지 않도록 푸터로 옮겼다
          feedback={{ content: null }}
          toc={{ title: '목차', backToTop: '맨 위로' }}
          themeSwitch={{ light: '라이트 모드', dark: '다크 모드', system: '시스템 설정' }}
          lastUpdated={<LastUpdated locale="ko">마지막 수정일</LastUpdated>}
          sidebar={{
            // 모바일 메뉴에서 '지원' 하위 메뉴를 처음부터 펼쳐 둔다(한 번 더 누르지 않게)
            defaultMenuCollapseLevel: 2,
            toggleButton: false
          }}
          footer={
            <Footer className="site-footer">
              <div className="site-footer-inner">
                {/* 개인정보 처리방침은 홈페이지에 늘 게재하고 다른 문구와 구분되게 굵게 둔다 */}
                <nav className="site-footer-links" aria-label="사이트 정보">
                  <a
                    href="https://terms.baemin.com/content/WOOWACOURSE_644?shotList=true"
                    target="_blank"
                    rel="noreferrer"
                    className="site-footer-privacy"
                  >
                    개인정보 처리방침
                  </a>
                  <Link href="/contact">문의</Link>
                  <a
                    href="https://github.com/woowacourse/woowacourse.io/issues/new?labels=feedback"
                    target="_blank"
                    rel="noreferrer"
                  >
                    피드백 보내기
                  </a>
                </nav>
                <span className="site-footer-copy">
                  © {new Date().getFullYear()} 우아한테크코스 · 우아한형제들 테크교육개발팀
                </span>
              </div>
            </Footer>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
