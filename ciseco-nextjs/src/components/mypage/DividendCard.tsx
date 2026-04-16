import { DIVIDEND_COLORS } from '@/lib/mypage/dividendColors'
import type { DividendItem } from '@/lib/mypage/types'

export default function DividendCard({ item }: { item: DividendItem }) {
  const c = DIVIDEND_COLORS[item.dividend_type]

  const sourceText = item.source_member_masked
    ? `${item.source_member_masked} 하선 (${item.depth}단계) 구매`
    : item.dividend_type === 'EQUITY'
    ? '월 정기 배당'
    : '정기 배당'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      padding: 16, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              background: c.bg, color: c.color,
              borderRadius: 20, padding: '3px 10px',
              whiteSpace: 'nowrap',
            }}>
              {c.icon} {item.dividend_type_label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--mp-color-text-muted)' }}>
              {item.dividend_date}
            </span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--mp-color-text-muted)' }}>
            {sourceText}
          </div>
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700,
          color: 'var(--mp-color-success)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          +{item.amount.toLocaleString('ko-KR')}원
        </div>
      </div>
    </div>
  )
}
