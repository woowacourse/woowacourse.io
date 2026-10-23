import nextra from 'nextra'
import notices from './content/notices'
import { buildRedirects } from './redirects'

const withNextra = nextra({
  search: {
    codeblocks: false
  },
  contentDirBasePath: '/'
})

const isDev = process.env.NODE_ENV === 'development'

export default withNextra({
  // GitHub Pages 배포용 정적 내보내기(npm run build → out/). 주소는 /notice/ 처럼 끝에 / 를 붙인다
  output: 'export',
  trailingSlash: true,
  // 빌드 산출물 디렉터리. 기본은 .next. 격리 실행 시 NEXT_DIST_DIR 로 분리 가능
  // (병렬 빌드가 공유 .next 를 깨뜨릴 때 NEXT_DIST_DIR=.inbox/next-serve 처럼 분리).
  // 배포 빌드(CI)에서는 지정하지 않는다. 다른 디렉터리로 바꾸면 내보내기가 404 페이지만 만든다
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    unoptimized: true
  },
  // 정적 내보내기에서는 리다이렉트가 동작하지 않는다. 로컬 개발 서버에서만 쓰고,
  // 배포본은 scripts/redirects/build.mjs 가 같은 목록으로 이동용 HTML 을 만든다
  ...(isDev && {
    async redirects() {
      return buildRedirects(notices).map((r) => ({ ...r, permanent: false }))
    }
  })
})
