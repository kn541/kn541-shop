/**
 * KN541 할인 이벤트 API (공개)
 */
import { apiUrl } from '@/lib/api/base'

export interface ActiveDiscountEvent {
  id: string
  event_name: string
  description?: string
  discount_type: 'FIXED' | 'RATE'
  discount_value: number
  max_discount?: number | null
  min_order_price?: number
  target_type: string
  target_ids?: string[] | null
  member_target: string
  member_levels?: string[] | null
  start_at: string
  end_at: string
}

export interface EventDiscountLine {
  product_id: string
  event_id: string | null
  event_name: string | null
  discount_type: string | null
  discount_value: number | null
  discount_amount: number
  final_price: number
  end_at: string | null
}

export interface EventDiscountCalcResult {
  items: EventDiscountLine[]
  total_discount: number
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json()
  if (!res.ok) {
    const detail = json.detail
    throw new Error(typeof detail === 'string' ? detail : '이벤트 조회 실패')
  }
  return json.data as T
}

/** 진행 중 할인 이벤트 목록 */
export async function fetchActiveDiscountEvents(): Promise<ActiveDiscountEvent[]> {
  const res = await fetch(apiUrl('/events/discount/active'), { cache: 'no-store' })
  const data = await parseJson<{ items: ActiveDiscountEvent[] }>(res)
  return data.items ?? []
}

/** 장바구니/상품 상세 할인 계산 */
export async function calculateEventDiscount(
  productIds: string[],
  quantities: number[],
  memberId?: string | null,
): Promise<EventDiscountCalcResult> {
  if (!productIds.length) {
    return { items: [], total_discount: 0 }
  }
  const q = new URLSearchParams()
  q.set('product_ids', productIds.join(','))
  q.set('quantities', quantities.join(','))
  if (memberId) q.set('member_id', memberId)

  const res = await fetch(apiUrl(`/events/discount/calculate?${q}`), { cache: 'no-store' })
  return parseJson<EventDiscountCalcResult>(res)
}

/** active 목록에서 상품 1건 매칭 (상세 페이지 폴백) */
export function matchActiveEventForProduct(
  events: ActiveDiscountEvent[],
  productId: string,
  categoryIds: string[],
): ActiveDiscountEvent | null {
  for (const ev of events) {
    const tt = ev.target_type
    if (tt === 'ALL') return ev
    const ids = ev.target_ids ?? []
    if (!ids.length) continue
    if (tt === 'PRODUCT' && ids.includes(productId)) return ev
    if (tt === 'CATEGORY' && categoryIds.some(c => c && ids.includes(c))) return ev
  }
  return null
}

export function calcDisplayDiscount(
  salePrice: number,
  quantity: number,
  event: ActiveDiscountEvent,
): { discountAmount: number; finalUnitPrice: number } {
  const qty = Math.max(quantity, 1)
  const lineGross = salePrice * qty
  const minOrder = Number(event.min_order_price ?? 0)
  if (lineGross < minOrder) {
    return { discountAmount: 0, finalUnitPrice: salePrice }
  }
  let discount = 0
  if (event.discount_type === 'FIXED') {
    discount = Math.min(event.discount_value, salePrice) * qty
  } else {
    discount = lineGross * Math.min(event.discount_value, 100) / 100
    if (event.max_discount != null) {
      discount = Math.min(discount, Number(event.max_discount))
    }
  }
  discount = Math.min(discount, lineGross)
  const finalLine = lineGross - discount
  return { discountAmount: discount, finalUnitPrice: finalLine / qty }
}
