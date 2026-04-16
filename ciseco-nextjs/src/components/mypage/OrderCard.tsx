// 주문 상태 chip 스타일
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PAID:      { bg: '#EBF5FB', color: '#2E86C1' },
  PREPARING: { bg: '#FEF9E7', color: '#D4AC0D' },
  SHIPPING:  { bg: '#FFF3E0', color: '#E65100' },
  DELIVERED: { bg: '#E9F7EF', color: '#1E8449' },
  CANCELED:  { bg: '#F2F3F4', color: '#717D7E' },
  RETURNED:  { bg: '#FDEDEC', color: '#C0392B' },
  EXCHANGED: { bg: '#F5EEF8', color: '#7D3C98' },
}

import Link from 'next/link'
import BigButton from './BigButton'
import type { OrderListItem } from '@/lib/mypage/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function OrderCard({
  order,
  detailHref,
}: {
  order: OrderListItem
  detailHref: string
}) {
  const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.CANCELED

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--mp-radius-lg)',
      border: '1px solid var(--mp-color-border)',
      padding: 16,
    }}>
      {/* 주문일시 */}
      <div style={{ fontSize: 13, color: 'var(--mp-color-text-muted)', marginBottom: 10 }}>
        {formatDate(order.ordered_at)} 주문 &middot; {order.order_no}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* 썸네일 */}
        <div style={{
          width: 80, height: 80, borderRadius: 8,
          background: '#F5F5F5', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, overflow: 'hidden',
        }}>
          {order.main_item_thumbnail
            ? <img src={order.main_item_thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '📦'}
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 600,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 6,
          }}>
            {order.main_item_name}
            {order.item_count > 1 && (
              <span style={{ color: 'var(--mp-color-text-muted)', fontWeight: 400 }}>
                {' '}외 {order.item_count - 1}건
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              {order.total_amount.toLocaleString('ko-KR')}원
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              background: st.bg, color: st.color,
              borderRadius: 20, padding: '3px 10px',
            }}>
              {order.status_label}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href={detailHref}>
          <BigButton variant="outline" fullWidth>주문상세 보기</BigButton>
        </Link>
      </div>
    </div>
  )
}
