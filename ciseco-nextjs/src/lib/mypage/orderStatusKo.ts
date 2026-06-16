/** 주문 상태 → 한국어 (숫자코드 + 텍스트 모두 지원) */
export function orderStatusLabelKo(code: string | undefined | null): string {
  const c = (code || '').trim().toUpperCase()
  const map: Record<string, string> = {
    // 숫자코드 (system_codes order_status)
    '001': '결제대기',
    '002': '결제완료',
    '003': '상품준비중',
    '004': '발송완료',
    '005': '구매확정',
    '006': '주문취소',
    '007': '환불완료',
    // 텍스트 (레거시 호환)
    PENDING: '결제대기',
    PAID: '결제완료',
    PREPARING: '상품준비중',
    SHIPPED: '배송중',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    COMPLETED: '구매확정',
    CANCELLED: '취소됨',
    CANCELED: '취소됨',
    RETURNED: '반품',
    EXCHANGED: '교환',
    REFUNDED: '환불완료',
  }
  return map[c] || code || '—'
}

export function canCancelOrderStatus(code: string | undefined | null): boolean {
  const c = (code || '').trim().toUpperCase()
  return ['001', '002', '003', 'PENDING', 'PAID', 'PREPARING'].includes(c)
}

export function showTrackingStatus(code: string | undefined | null): boolean {
  const c = (code || '').trim().toUpperCase()
  return ['004', '005', 'SHIPPED', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(c)
}

/** 배송 상태(delivery_status) 숫자코드 → 텍스트 */
export function deliveryStatusLabelKo(code: string | undefined | null): string {
  const c = (code || '').trim().toUpperCase()
  const map: Record<string, string> = {
    '001': '배송준비중',
    '002': '배송중',
    '003': '배송완료',
    '004': '반품진행중',
    '005': '반품완료',
    '006': '취소',
    PENDING: '배송준비중',
    READY: '배송준비중',
    SHIPPING: '배송중',
    SHIPPED: '배송중',
    DELIVERED: '배송완료',
    RETURNING: '반품진행중',
    RETURNED: '반품완료',
    CANCELLED: '취소',
    CANCEL_REQUESTED: '취소요청',
    PREPARING: '배송준비중',
  }
  return map[c] || code || '—'
}

/** 배송조회 버튼 표시 여부 (delivery_status 기준, 송장 유무 무관) */
export function showItemTrackingButton(deliveryStatus: string | undefined | null): boolean {
  const c = (deliveryStatus || '').trim().toUpperCase()
  return ['002', '003', 'SHIPPED', 'SHIPPING', 'DELIVERED'].includes(c)
}
