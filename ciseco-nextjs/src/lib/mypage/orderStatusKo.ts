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

/**
 * 구매확정 버튼 표시 여부.
 *
 * 발송완료(004/SHIPPED) 건만 허용 — 백엔드
 * POST /mypage/orders/{id}/confirm 의 허용 조건과 반드시 일치시킬 것.
 * ⛔ DELIVERED 는 order_status 값이 아니다(탭 개념). 추가하지 말 것.
 */
export function canConfirmOrderStatus(code: string | undefined | null): boolean {
  const c = (code || '').trim().toUpperCase()
  return ['004', 'SHIPPED', 'SHIPPING'].includes(c)
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

/** 결제수단 → 한국어 (숫자코드 + 텍스트 모두 지원) */
export function paymentMethodLabelKo(code: string | undefined | null): string {
  const c = (code || '').trim().toUpperCase()
  const map: Record<string, string> = {
    '001': '신용카드',
    '002': '가상계좌',
    '003': '간편결제',
    '004': '현금',
    '005': '복합결제',
    '006': '계좌이체',
    CARD: '신용카드',
    VIRTUAL_ACCOUNT: '가상계좌',
    EASY_PAY: '간편결제',
    CASH: '현금',
    MIXED: '복합결제',
    TOSS: '간편결제',
    BANK_TRANSFER: '계좌이체',
  }
  return map[c] || code || '—'
}

/**
 * 타임스탬프 → KST 한국어 날짜 문자열.
 *
 * ⚠ DB timezone = Asia/Seoul → timezone 없는 값은 KST로 해석해야 함.
 *   기존에 'Z'(UTC)를 붙여서 9시간 이중변환 오류가 발생했음.
 *   fix(2026-07-16): timezone 없으면 '+09:00'(KST) 붙여서 해석.
 */
export function formatKST(ts: string | undefined | null): string {
  if (!ts) return '—'
  // timezone 정보가 이미 있으면 그대로 사용
  const hasTimezone = /Z$/i.test(ts) || /[+-]\d{2}:?\d{2}$/.test(ts)
  // DB timezone = Asia/Seoul → timezone 없는 값은 KST(+09:00)
  const normalized = hasTimezone ? ts : ts.replace(' ', 'T') + '+09:00'
  try {
    return new Date(normalized).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  } catch {
    return ts
  }
}
