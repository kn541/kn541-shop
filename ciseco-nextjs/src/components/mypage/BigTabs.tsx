'use client'

interface Tab {
  value: string
  label: string
  badge?: string | number
}
interface Props {
  tabs: Tab[]
  value: string
  onChange: (v: string) => void
}

export default function BigTabs({ tabs, value, onChange }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '1px solid var(--mp-color-border)',
        overflowX: 'auto',
      }}
    >
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              height: 56,
              minWidth: 80,
              padding: '0 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: active
                ? '3px solid var(--mp-color-primary)'
                : '3px solid transparent',
              color: active
                ? 'var(--mp-color-primary)'
                : 'var(--mp-color-text-muted)',
              fontSize: 16,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
            {t.badge != null && (
              <span
                style={{
                  marginLeft: 6,
                  background: active ? 'var(--mp-color-primary)' : '#E9E9E9',
                  color: active ? '#fff' : 'var(--mp-color-text-muted)',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: '2px 8px',
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
