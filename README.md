# 우아한테크코스 공식 홈페이지

우아한테크코스의 소개와 교육 과정, 지원 안내, 공지사항을 담은 공식 홈페이지 소스입니다.
[Nextra 4](https://nextra.site/)와 Next.js App Router로 만들었습니다.

## 로컬에서 실행하기

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run dev     # http://localhost:3000
```

배포용 빌드는 `npm run build`로 합니다. 결과물은 정적 파일로 `out/`에 만들어지고, 빌드한 결과는 `npm start`로 띄워 볼 수 있습니다.
빌드 중에 아래 파일이 함께 만들어집니다.

- LLM용 요약: `llms.txt`, `llms-full.txt`
- 옮긴 주소의 이동용 페이지: 목록은 `redirects.ts`
- `sitemap.xml`
- 검색 색인: `_pagefind/`

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해 GitHub Pages로 배포합니다. 주소는 https://woowacourse.io 입니다.

- 진행 상황은 저장소의 Actions 탭에서 봅니다. 실패하면 이전 배포가 그대로 유지됩니다.
- 손으로 다시 배포하려면 Actions 탭에서 `Deploy to GitHub Pages`를 골라 `Run workflow`를 누릅니다.
- 도메인은 저장소 Settings > Pages의 Custom domain에 연결되어 있습니다.
- GitHub Pages는 서버 리다이렉트를 지원하지 않습니다. 페이지 주소를 옮기면 `redirects.ts`에 옛 주소와 새 주소를 한 줄 추가합니다.

## 페이지 구성

| 메뉴 | 경로 | 내용 |
|---|---|---|
| 홈 | `/` | 랜딩 페이지 |
| 지원 | `/apply` | 우테코 소개, 교육 과정, 지원 안내, 자주 묻는 질문, 글로벌 확장 |
| 공지 | `/notice` | 모집·행사·개인정보처리방침 공지 |
| 문의 | `/contact` | 캠퍼스 주소, 카카오톡 채널·이메일 문의 |
| 도서 | `/book` | 우테코 도서 소개 |

## 폴더 구조

```
content/            페이지 본문(MDX)과 페이지가 쓰는 데이터
├── index.mdx         홈
├── apply/            지원 탭
├── book/             책 소개
├── notice/           공지사항 목록과 공지별 상세 페이지
├── notices.ts        공지 목록 데이터
├── recruiting.ts     모집 일정 데이터
├── faq.ts            FAQ 데이터
└── ...
components/         페이지에서 쓰는 React 컴포넌트
app/                Next.js 앱 진입점과 전역 스타일
public/             이미지 등 정적 파일
scripts/            빌드·검사 스크립트
```

메뉴 순서와 제목은 각 폴더의 `_meta.ts`에서 정합니다.

## 자주 하는 작업

### 공지 올리기

1. `content/notice/{YYYY-MM-DD}-{slug}.mdx`를 만듭니다. 기존 공지 파일을 복사해서 제목과 본문만 바꾸면 됩니다.
2. `content/notices.ts` 배열 맨 위에 같은 `slug`로 한 줄을 추가합니다.

### 모집 일정·FAQ 바꾸기

모집 일정은 `content/recruiting.ts`, FAQ는 `content/faq.ts`만 고치면 지원 탭에 반영됩니다. 일정이 확정되기 전에는 `recruiting.ts`의 `announcement`에 안내 문구를 넣어 두면 사이트 상단 배너와 지원 안내 페이지에 함께 표시됩니다.

### 새 페이지 추가

해당 폴더에 MDX 파일을 만들고 같은 폴더의 `_meta.ts`에 등록합니다.

## 글쓰기 규칙

- 본문은 합니다체로 씁니다.
- 범위를 나타내는 물결표는 `\~`로 씁니다(예: `레벨 3\~4`). 한 문단에 `~`가 두 번 나오면 그 사이가 취소선이 됩니다.
- 아래 검사로 문체와 코드블록 형식을 확인할 수 있습니다.

```bash
npm run lint:tone        # 문체
npm run lint:codefence   # 코드블록 빈 줄
npm run lint:mobile      # 모바일 표시
```

## 문의

우아한테크코스 문의는 홈페이지의 [문의](https://woowacourse.io/contact/) 페이지를 참고해 주세요.
