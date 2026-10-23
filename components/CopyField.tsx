'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './CopyField.module.css'

interface CopyFieldProps {
  /** 표시·복사할 값 (이메일 주소 등) */
  value: string
  /** value를 mailto: 링크로 감쌀지 여부 (이메일일 때 true) */
  mailto?: boolean
}

export function CopyField({ value, mailto = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // 컴포넌트 언마운트 시 "복사됨" 리셋 타이머 정리
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // clipboard API를 못 쓰는 환경(비-https 등)을 위한 폴백
      const ta = document.createElement('textarea')
      ta.value = value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className={styles.field}>
      {mailto ? (
        <a className={styles.value} href={`mailto:${value}`}>
          {value}
        </a>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      <button
        type="button"
        className={styles.button}
        onClick={copy}
        data-copied={copied}
        aria-label={copied ? '복사됨' : `${value} 복사하기`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </span>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
