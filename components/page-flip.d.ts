// page-flip(StPageFlip) 2.0.7 은 타입 선언을 싣지 않는다. BookSample 이 쓰는 부분만 적는다.
// 원본: node_modules/page-flip/src/PageFlip.ts, src/Settings.ts
declare module 'page-flip' {
  export interface FlipSetting {
    startPage?: number
    size?: 'fixed' | 'stretch'
    width: number
    height: number
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    autoSize?: boolean
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    clickEventForward?: boolean
    useMouseEvents?: boolean
    swipeDistance?: number
    showPageCorners?: boolean
    disableFlipByClick?: boolean
  }

  export class PageFlip {
    constructor(element: HTMLElement, setting: FlipSetting)
    loadFromHTML(items: HTMLElement[]): void
    destroy(): void
    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    flip(page: number, corner?: 'top' | 'bottom'): void
    turnToPage(page: number): void
    getCurrentPageIndex(): number
    getPageCount(): number
    getUI(): { getDistElement(): HTMLElement }
    // 손으로 잡아 넘기기 — pos 는 getUI().getDistElement() 기준 좌표
    startUserTouch(pos: { x: number; y: number }): void
    userMove(pos: { x: number; y: number }, isTouch: boolean): void
    userStop(pos: { x: number; y: number }, isSwipe?: boolean): void
    on(event: 'flip' | 'changeOrientation' | 'changeState' | 'init' | 'update', callback: (e: { data: unknown }) => void): PageFlip
  }
}
