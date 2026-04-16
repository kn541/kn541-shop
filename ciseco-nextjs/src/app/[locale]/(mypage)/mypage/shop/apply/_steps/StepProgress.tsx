// 상단 진행 표시 (1 of 3)
const STEPS = ['기본정보', '주소', '디자인']

export default function StepProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ padding: '16px 24px 0', background: '#fff', borderBottom: '1px solid var(--mp-color-border)' }}>
      {/* 도트 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 8 }}>
        {STEPS.map((_, i) => {
          const step = i + 1
          const done    = step < current
          const active  = step === current
          const pending = step > current
          return (
            <>
              {i > 0 && (
                <div key={`line-${i}`} style={{
                  flex: 1, height: 3, maxWidth: 64,
                  background: done ? 'var(--mp-color-primary)' : 'var(--mp-color-border)',
                }} />
              )}
              <div key={step} style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
                background: active ? 'var(--mp-color-primary)' : done ? 'var(--mp-color-primary)' : 'var(--mp-color-border)',
                color: (active || done) ? '#fff' : 'var(--mp-color-text-muted)',
                flexShrink: 0,
              }}>
                {done ? '✓' : step}
              </div>
            </>
          )
        })}
      </div>
      {/* 라벨 */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{
            fontSize: 13, fontWeight: (i + 1) === current ? 700 : 400,
            color: (i + 1) === current ? 'var(--mp-color-primary)' : 'var(--mp-color-text-muted)',
            textAlign: 'center', flex: 1,
          }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
