'use client'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface Props {
  title: string
  rightAction?: ReactNode
}

export default function BackHeader({ title, rightAction }: Props) {
  const router = useRouter()
  return (
    <header
      style={{
        height: 56,
        background: '#fff',
        borderBottom: '1px solid var(--mp-color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => router.back()}
        aria-label='뒤로가기'
        style={{
          width: 48,
          height: 48,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ←
      </button>
      <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h1>
      <div style={{ width: 48, display: 'flex', justifyContent: 'flex-end' }}>
        {rightAction}
      </div>
    </header>
  )
}
