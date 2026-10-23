// ─────────────────────────────────────────────────────────────
// 크루의 목소리 — 두 갈래 데이터
//   crewThemes : 메시지에서 무엇이 "얼마나 자주" 나왔는가 (랜딩 타이포 빈도 맵)
//   crewVoices : 개별 메시지 원문 (아카이브 전체 인용)
//
// 출처: 3·4·5·6·7기 레벨5 "과정 최종 피드백" 설문 422명 응답에서 상향식으로 추출.
//   원본(익명화)은 팀 내부 기록에 보존.
//   crewThemes.count = 5개 기수 합산, 긍정·성장·추천 컬럼에서 그 주제가 언급된 응답 근사치.
//   crewVoices.quote = 실제 응답 원문(거의 그대로, 명백한 오타·깨짐만 정리). 작성자는 익명(기수·트랙).
// ─────────────────────────────────────────────────────────────

/** 메시지에서 반복된 주제 한 묶음 — 랜딩 타이포 빈도 맵의 단위 */
export interface CrewTheme {
  /** 식별 키 */
  key: string
  /** 화면에 보일 주제명 (글자 크기로 빈도를 인코딩) */
  label: string
  /** 이 주제가 언급된 메시지 수 (5개 기수 합산 근사치) */
  count: number
  /** 이 주제를 대표하는 크루 문장 — 호버/탭하면 캡션에 뜬다 */
  quote: string
}

/** 지금까지 우테코를 수료한 누적 크루 수. TecoWay 캡션과 CrewJourney 궤도가 공유한다 */
export const crewCount = 735

/** 별자리(crewThemes) 데이터의 출처 — 3~7기 레벨5 '과정 최종 피드백' 설문에 응답한 크루 수 */
export const crewVoiceRespondentCount = 422

/** 빈도 내림차순으로 둔다. 맵은 이 순서와 count로 크기·위계를 만든다 */
export const crewThemes: CrewTheme[] = [
  {
    key: 'together',
    label: '함께 자란 동료',
    count: 300,
    quote: `개발을 배우러 왔는데 인간의 따뜻함을 느끼고 갑니다.`,
  },
  {
    key: 'soft',
    label: '소프트스킬·협업',
    count: 199,
    quote: `다른 사람의 의견을 먼저 들어보는 성격을 가지게 된 것 같아 너무 좋았습니다.`,
  },
  {
    key: 'project',
    label: '실전 프로젝트·미션',
    count: 138,
    quote: `기획부터 개발과 배포까지, 프로젝트의 한 사이클을 경험할 수 있었습니다.`,
  },
  {
    key: 'learning',
    label: '자기주도 학습',
    count: 133,
    quote: `주입식 교육이 아니라 친구들과 함께 찾아가는 모험 같았습니다.`,
  },
  {
    key: 'why',
    label: `'왜'를 묻는 사고`,
    count: 124,
    quote: `그저 좋다고 해서 하는 것이 아닌 '왜?'를 계속 물어봐주어 능동적인 개발자가 될 수 있었습니다.`,
  },
  {
    key: 'coach',
    label: '코치·원온원',
    count: 84,
    quote: `코치분들이 결론을 내주시지 않고 질문을 통해 제 머릿속을 구체화해주신 게 너무 좋았습니다.`,
  },
  {
    key: 'focus',
    label: '몰입·집중',
    count: 75,
    quote: `개발 공부에만 온전히 집중할 수 있는 환경이 좋았습니다.`,
  },
  {
    key: 'confidence',
    label: '자신감·정체성',
    count: 50,
    quote: `개발자를 동경하는 사람에서, 개발자가 될 수 있었습니다.`,
  },
]

/** 표시값이 실측임을 한곳에서 켠다(과거 예시 모드 종료). */
export const crewThemesAreExample = false

/** 아카이브 전체 인용에 쓰는 개별 메시지 */
export interface CrewVoice {
  /** 메시지 본문 */
  quote: string
  /** 익명 표기. 예: '6기 백엔드 크루' */
  author: string
  /** crewThemes 의 key (집계·필터용, 선택) */
  theme?: string
  /** "이런 분께 추천한다" 한 줄 (일부 항목에만) */
  recommendsTo?: string
  /** true면 '예시' 배지. 실제 메시지를 받으면 이 줄을 지운다 */
  example?: boolean
}

const crewVoices: CrewVoice[] = [
  {
    quote: `같은 곳을 바라보는 열정적인 동료 100명과 함께한 이 시간을 평생 잊지 못할 것 같아요.`,
    author: '5기 백엔드 크루',
    theme: 'together',
    recommendsTo: '혼자보다 함께 더 멀리 가고 싶은 분',
  },
  {
    quote: `학습하는 법을 배운 게 가장 큰 것 같네요. 코테용 코드밖에 못 짜던 사람이 이제는 무엇이든 만들 자신감이 생겼습니다.`,
    author: '4기 프론트엔드 크루',
    theme: 'learning',
    recommendsTo: '스스로 배우는 힘을 기르고 싶은 분',
  },
  {
    quote: `옛날에는 잘 하는 사람의 코드를 따라가려고만 했는데, 우테코를 수료하고 '내 방식'이라는 게 생겼어요.`,
    author: '6기 프론트엔드 크루',
    theme: 'why',
  },
  {
    quote: `소프트 스킬이 많이 늘었어요. 원래 사람들이랑 말도 잘 안했거든요.`,
    author: '5기 프론트엔드 크루',
    theme: 'soft',
  },
  {
    quote: `두려움을 떨쳐낼 수 있었어요. 경력 전환, 짧은 기간에 다 배울 수 있을까, 취업시장에서 인정받을 수 있을까 하는 두려움들이 사라졌어요.`,
    author: '6기 프론트엔드 크루',
    theme: 'confidence',
    recommendsTo: '새로운 분야로 도전하는 게 두려운 분',
  },
  {
    quote: `존경하는 사람들과 대화를 통해 더 많은 동기부여와 성장을 할 수 있었던 원온원이 가장 좋았다.`,
    author: '7기 프론트엔드 크루',
    theme: 'coach',
  },
  {
    quote: `기술보다 동료가 중요하다는 사실! 잊지 않고 하시면 우테코 기간을 잘 보내실 수 있을 거라 생각합니다.`,
    author: '4기 프론트엔드 크루',
    theme: 'together',
    recommendsTo: '10개월을 어떻게 보낼지 고민인 분',
  },
]

export default crewVoices
