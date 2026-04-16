'use client'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  icon: string
  label: string
  reason: string
  benefitList: string[]
  actionLabel: string
  actionHref: string
}

export default function LockedCard({
  icon,
  label,
  reason,
  benefitList,
  actionLabel,
  actionHref,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F5F5',
          border: '1px solid var(--mp-color-border)',
          borderRadius: 'var(--mp-radius-lg)',
          padding: 16,
          minHeight: 120,
          cursor: 'pointer',
          width: '100%',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 16,
            color: 'var(--mp-color-text-muted)',
          }}
        >
          🔒
        </span>
        <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.4 }}>{icon}</div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--mp-color-text-muted)',
            textAlign: 'center',
          }}
        >
          {label}
        </div>
      </button>

      {open && (
        <div
          role='dialog'
          aria-modal='true'
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 420,
              width: '100%',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0 }}>
              🔒 {label}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>{reason}</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              해제되면 이런 것들이 열려요:
            </p>
            <ul style={{ fontSize: 16, lineHeight: 1.8, paddingLeft: 20 }}>
              {benefitList.map((b, i) => (
                <li key={i}>✓ {b}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  height: 56,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#F5F5F5',
                  border: 'none',
                  borderRadius: 'var(--mp-radius)',
                  cursor: 'pointer',
                }}
              >
                닫기
              </button>
              <Link
                href={actionHref}
                style={{
                  flex: 2,
                  height: 56,
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'var(--mp-color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--mp-radius)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                {actionLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
