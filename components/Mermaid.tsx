'use client'

import { useEffect, useRef } from 'react'

export function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false

    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        fontFamily: 'inherit',
      })
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
      mermaid.render(id, chart.trim()).then(({ svg }) => {
        if (!cancelled && el) {
          // Mermaid.render produces sanitized SVG internally.
          // We insert via DOM API rather than dangerouslySetInnerHTML.
          el.innerHTML = ''
          const wrapper = document.createElement('div')
          wrapper.innerHTML = svg
          el.appendChild(wrapper)
        }
      })
    })

    return () => { cancelled = true }
  }, [chart])

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}
    />
  )
}
