/**
 * bookPaginate — 원고 본문(MDX 가 그린 DOM)을 책 쪽 크기에 맞춰 쪽 요소 여러 개로 나눈다(BookSample 이 page-flip 에 넘긴다).
 * 미리 읽기로 연 장이 여럿이면 차례대로 이어 한 권으로 짠다. 쪽 번호는 끝까지 이어지고, 장마다 표제지부터 시작한다.
 *
 * 실제 쪽과 같은 크기·글꼴의 빈 쪽(sandbox 안)에 블록을 하나씩 채워 보며 넘치는지 잰다.
 * - 문단은 넘치면 띄어쓰기 자리에서 둘로 나눈다. 앞 조각이 두 줄이 안 되면 통째로 다음 쪽으로 보낸다
 * - 절 제목(h2)·소절 제목(h3)은 쪽 끝에 홀로 남지 않게 다음 블록과 함께 넘긴다
 * - 그림·인용·목록 같은 블록은 나누지 않는다. 그림은 쪽 높이의 60% 안으로 줄인다
 * - 장의 첫 쪽은 장 표제지(.book-sample-opener). 양면이면 장마다 쪽 수를 짝수로 맞춰(끝에 빈 쪽) 다음 장이 왼쪽 쪽에서 시작한다
 * - 장 끝 인사(.book-sample-end, '미리 읽기는 여기까지')는 마지막 장에만 남긴다
 */

export type Paginated = {
  pages: HTMLElement[]
  /** 쪽마다 그 쪽까지 시작한 마지막 절 제목(장의 첫 절 앞은 '') — 위 막대의 '지금 읽는 절' */
  sections: string[]
  /** 쪽마다 그 쪽이 속한 장('4장') */
  chapters: string[]
}

/** 한 장의 원본 — MDX 가 그린 종이 한 장(.book-sample-page)과 장 번호·제목 */
export type Sheet = { source: HTMLElement; chapter: string; title: string }

type Options = {
  sheets: Sheet[]
  sandbox: HTMLElement
  /** 양면(왼쪽·오른쪽 쪽의 안쪽 여백이 다르다)인지 */
  spread: boolean
}

const SPLIT_SKIP = ['book-sample-ask', 'book-sample-example']

const isSplittable = (el: Element) =>
  el.tagName === 'P' && el.children.length === 0 && !SPLIT_SKIP.some((c) => el.classList.contains(c))

// 원본을 복제할 때 쪽 안에서 쓸모없는 것 — 제목 옆 링크 표시, 중복될 id
const cleanClone = (el: Element) => {
  const copy = el.cloneNode(true) as HTMLElement
  copy.querySelectorAll('h1 > a, h2 > a, h3 > a').forEach((a) => a.remove())
  copy.removeAttribute('id')
  copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
  return copy
}

export function paginate({ sheets, sandbox, spread }: Options): Paginated {
  sandbox.replaceChildren()
  const pages: HTMLElement[] = []
  // 쪽마다 어느 장(sheets 의 몇 번째)인지
  const owner: number[] = []
  let current = 0

  const makePage = (kind?: string) => {
    const index = pages.length
    const page = document.createElement('div')
    const side = spread ? (index % 2 === 0 ? 'left' : 'right') : 'single'
    page.className = `bs-page bs-page--${side}${kind ? ` bs-page--${kind}` : ''}`
    // page-flip 이 쪽 요소의 인라인 스타일(display 까지)을 통째로 덮어쓰므로, 쪽 안 배치는 안쪽 종이(.bs-sheet)가 맡는다
    page.innerHTML =
      '<div class="bs-sheet"><div class="bs-head" aria-hidden="true"></div><div class="bs-body"></div><div class="bs-folio" aria-hidden="true"></div></div>'
    sandbox.append(page)
    pages.push(page)
    owner.push(current)
    return page.querySelector('.bs-body') as HTMLElement
  }

  // 지금 채우는 쪽의 본문 자리
  let body: HTMLElement
  const fits = () => body.scrollHeight <= body.clientHeight + 1
  const isEmpty = () => body.childElementCount === 0
  const lineHeight = () => parseFloat(getComputedStyle(body).lineHeight) || 28

  const sizeImages = (node: HTMLElement) => {
    // 본문 그림(figure)만 쪽에 맞춘다. 장식 그림(행성이)은 CSS 크기 그대로
    node.querySelectorAll<HTMLImageElement>('figure img').forEach((img) => {
      const w = Number(img.getAttribute('width'))
      const h = Number(img.getAttribute('height'))
      img.removeAttribute('loading')
      if (!w || !h) return
      const ratio = w / h
      const width = Math.min(body.clientWidth, body.clientHeight * 0.6 * ratio)
      img.style.width = `${Math.floor(width)}px`
      img.style.height = `${Math.floor(width / ratio)}px`
    })
  }

  const nextPage = () => {
    // 쪽 끝에 남은 절·소절 제목은 다음 쪽으로 데려간다
    const last = body.lastElementChild
    const carry = last && /^H[23]$/.test(last.tagName) && body.childElementCount > 1 ? last : null
    carry?.remove()
    body = makePage()
    if (carry) body.append(carry)
  }

  // 문단을 지금 쪽에 들어가는 만큼만 남기고 나머지를 돌려준다. 앞 조각이 두 줄이 안 되면 null(통째로 넘긴다)
  const splitParagraph = (p: HTMLElement): HTMLElement | null => {
    const text = p.textContent ?? ''
    const head = p.cloneNode(false) as HTMLElement
    body.append(head)
    let lo = 0
    let hi = text.length
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2)
      head.textContent = text.slice(0, mid)
      if (fits()) lo = mid
      else hi = mid - 1
    }
    // 단어 가운데서 끊지 않는다 — 들어간 만큼 안에서 마지막 띄어쓰기까지
    let cut = text.lastIndexOf(' ', lo)
    if (lo === text.length) cut = lo
    if (cut <= 0) {
      head.remove()
      return null
    }
    // 다음 쪽 첫 줄에 낱말 몇 개만 남지 않게, 꼬리가 아주 짧으면 한 번 더 앞에서 끊는다
    if (text.length - cut < 14) {
      const earlier = text.lastIndexOf(' ', cut - 1)
      if (earlier > 0) cut = earlier
    }
    head.textContent = text.slice(0, cut)
    if (head.offsetHeight < lineHeight() * 1.9) {
      head.remove()
      return null
    }
    const tail = p.cloneNode(false) as HTMLElement
    tail.classList.add('bs-cont') // 이어지는 문단 — 들여쓰기 없이
    tail.textContent = text.slice(cut).trimStart()
    return tail
  }

  const fill = (block: Element) => {
    let node: HTMLElement | null = cleanClone(block)
    while (node) {
      if (node.querySelector('figure img')) sizeImages(node)
      body.append(node)
      if (fits()) {
        node = null
        continue
      }
      node.remove()
      if (isEmpty()) {
        // 한 쪽보다 큰 블록 — 그대로 둔다(그림은 이미 줄였다)
        body.append(node)
        node = null
        continue
      }
      if (isSplittable(node)) {
        const tail = splitParagraph(node)
        if (tail) {
          body = makePage()
          node = tail
          continue
        }
      }
      nextPage()
    }
  }

  sheets.forEach(({ source }, i) => {
    current = i
    // 1) 장 표제지
    const opener = source.querySelector('.book-sample-opener')
    if (opener) makePage('opener').append(cleanClone(opener))
    // 2) 본문 — 장 끝 인사는 마지막 장에만
    body = makePage()
    const last = i === sheets.length - 1
    for (const block of Array.from(source.children)) {
      if (block === opener || (!last && block.classList.contains('book-sample-end'))) continue
      fill(block)
    }
    // 3) 양면은 짝수 쪽으로 — 장 마지막 펼침의 오른쪽 빈 쪽. 다음 장 표제지는 왼쪽 쪽에 온다
    if (spread && pages.length % 2 === 1) makePage('blank')
  })

  // 4) 머리글(왼쪽 쪽은 장, 오른쪽 쪽은 그 쪽 맨 위에서 이어지는 절)과 쪽 번호
  const sections: string[] = []
  let running = ''
  pages.forEach((page, i) => {
    const { chapter, title } = sheets[owner[i]]
    if (i > 0 && owner[i] !== owner[i - 1]) running = '' // 새 장
    const heads = page.querySelectorAll('.bs-body h2')
    const first = page.querySelector('.bs-body')?.firstElementChild
    const atTop = first?.tagName === 'H2' ? (first.textContent ?? '') : running
    if (heads.length) running = heads[heads.length - 1].textContent ?? running
    sections.push(running)
    if (page.classList.contains('bs-page--opener') || page.classList.contains('bs-page--blank')) return
    const left = spread ? i % 2 === 0 : false
    ;(page.querySelector('.bs-head') as HTMLElement).textContent = left ? `${chapter}  ${title}` : atTop || title
    ;(page.querySelector('.bs-folio') as HTMLElement).textContent = String(i + 1)
  })

  pages.forEach((p) => p.remove())
  return { pages, sections, chapters: owner.map((o) => sheets[o].chapter) }
}
