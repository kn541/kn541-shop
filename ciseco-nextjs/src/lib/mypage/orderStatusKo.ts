/** 주문 상태 → 한국어 (API order_status / status 공통) */
export function orderStatusLabelKo(code: string | undefined | null): string {
  const c = (code || '').toUpperCase()
  const map: Record<string, string> = {
    PENDING: '결제대기',
    PAID: '결제완료',
    PREPARING: '상품준비중',
    SHIPPED: '배송중',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CANCELLED: '취소됨',
    CANCELED: '취소됨',
    RETURNED: '반품',
    EXCHANGED: '교환',
  }
  return map[c] || code || '—'
}

export function canCancelOrderStatus(code: string | undefined | null): boolean {
  const c = (code || '').toUpperCase()
  return c === 'PENDING' || c === 'PAID' || c === 'PREPARING'
}

export function showTrackingStatus(code: string | undefined | null): boolean {
  const c = (code || '').toUpperCase()
  return c === 'SHIPPED' || c === 'SHIPPING' || c === 'DELIVERED'
}
