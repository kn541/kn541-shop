import Link from 'next/link'

interface Props {
  icon: string
  label: string
  href: string
  badge?: string | number
}

export default function BigCard({ icon, label, href, badge }: Props) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        border: '1px solid var(--mp-color-border)',
        borderRadius: 'var(--mp-radius-lg)',
        padding: 16,
        minHeight: 120,
        textDecoration: 'none',
        color: 'var(--mp-color-text)',
        position: 'relative',
        transition: 'all 0.15s',
      }}
    >
      {badge != null && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'var(--mp-color-danger)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 10,
            padding: '2px 8px',
            minWidth: 20,
            textAlign: 'center',
          }}
        >
          {badge}
        </span>
      )}
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, textAlign: 'center' }}>{label}</div>
    </Link>
  )
}
