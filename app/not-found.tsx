import Link from 'next/link'

export const metadata = {
  title: '페이지를 찾을 수 없습니다'
}

// 커스텀 404 — Next.js/Nextra 기본 영문 404 대신 한국어 안내와 복귀 경로를 제공한다.
// app/layout.tsx 의 <Layout> 안에서 렌더되므로 상단 네비바·푸터는 자동으로 붙는다.
export default function NotFound() {
  return (
    // 다른 페이지처럼 본문 랜드마크를 두고, 헤더의 '본문 바로가기' 링크가 여기로 오게 한다
    <main
      id="nextra-skip-nav"
      style={{
        minHeight: 'calc(100vh - var(--nextra-navbar-height, 4rem))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        gap: '0.5rem'
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/characters/행성이-호기심.png"
        alt="길을 찾는 행성이"
        width={128}
        height={128}
        style={{ height: '8rem', width: 'auto', marginBottom: '1rem' }}
      />
      <p
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: 'var(--accent-text)',
          margin: 0
        }}
      >
        404
      </p>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
        찾으시는 페이지가 없습니다
      </h1>
      <p style={{ color: 'var(--fl-text-secondary)', maxWidth: '28rem', lineHeight: 1.7, margin: '0.5rem 0 0' }}>
        주소가 바뀌었거나 삭제되었을 수 있습니다. 아래에서 다시 시작하거나, 상단
        검색(⌘K)으로 원하는 내용을 찾아보세요.
      </p>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '1.5rem'
        }}
      >
        <Link
          href="/"
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            background: 'rgb(23, 23, 23)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textDecoration: 'none'
          }}
        >
          홈으로
        </Link>
        <Link
          href="/apply/about"
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgb(214, 214, 214)',
            color: 'inherit',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textDecoration: 'none'
          }}
        >
          우테코 소개 보기
        </Link>
      </div>
    </main>
  )
}
