// KN541 마이페이지 타입 정의
// Phase 4: MypageHomeResponse
// Phase 5: Order / Inquiry / Profile / Points / Coupon

// ──── Phase 4: 홈 ──────────────────────────────────────────────────

export interface MypageHomeUser {
  name: string
  member_level: 'L1' | 'L2' | 'L3'
  email: string
}

export interface MypageHomeSummary {
  points: number
  coupons: number
  orders_pending: number
}

export interface MypageHomeShop {
  status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  shop_name?: string
}

export interface MypageHomePaid {
  is_active: boolean
  expires_at: string | null
}

export interface MypageHomeResponse {
  user: MypageHomeUser
  summary: MypageHomeSummary
  shop: MypageHomeShop
  paid: MypageHomePaid
}

// ──── Phase 5-1: 주문 ───────────────────────────────────────────────

export type OrderStatus =
  | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED'
  | 'CANCELED' | 'RETURNED' | 'EXCHANGED'

export interface OrderListItem {
  order_id: string
  order_no: string
  ordered_at: string
  status: OrderStatus
  status_label: string
  total_amount: number
  main_item_name: string
  main_item_thumbnail: string | null
  item_count: number
}

export interface OrderListResponse {
  items: OrderListItem[]
  total: number
  page: number
  size: number
  status_counts: Record<OrderStatus | 'ALL', number>
}

// ──── Phase 5-2: 1:1 문의 ──────────────────────────────────────────

export type InquiryStatus = 'WAITING' | 'ANSWERED'

export interface InquiryItem {
  inquiry_id: string
  subject: string
  content: string
  status: InquiryStatus
  status_label: string
  created_at: string
  answered_at: string | null
  answer: string | null
}

export interface InquiryListResponse {
  items: InquiryItem[]
  total: number
  status_counts: Record<InquiryStatus | 'ALL', number>
}

// ──── Phase 5-3: 내 정보 ─────────────────────────────────────────────

export interface MypageProfile {
  user_id: string
  username: string
  email: string | null
  phone: string | null
  name: string
  birth_date: string | null
  gender: string | null
  zip_code: string | null
  address1: string | null
  address2: string | null
}

// ──── Phase 5-4: 적립금 / 쿠폰 ─────────────────────────────────────────

export type PointChangeType = 'EARN' | 'USE' | 'EXPIRE' | 'CANCEL'

export interface PointLedgerItem {
  ledger_id: string
  occurred_at: string
  change_type: PointChangeType
  amount: number
  reason: string
  balance_after: number
}

export interface PointsResponse {
  current_balance: number
  this_month_earned: number
  items: PointLedgerItem[]
  total: number
}

export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED'

export interface CouponItem {
  coupon_id: string
  name: string
  discount_amount: number | null
  discount_rate: number | null
  min_order_amount: number | null
  valid_from: string
  valid_until: string
  status: CouponStatus
  target_label: string
}

export interface CouponListResponse {
  items: CouponItem[]
  status_counts: Record<CouponStatus, number>
}
