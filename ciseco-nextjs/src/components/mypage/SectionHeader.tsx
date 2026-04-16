export default function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div style={{ padding: '24px 16px 12px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--mp-color-text-muted)', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
