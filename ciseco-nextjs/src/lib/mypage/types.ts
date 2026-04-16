// KN541 마이페이지 타입 정의
// Phase 4: MypageHomeResponse
// Phase 5: Order / Inquiry / Profile / Points / Coupon
// Phase 6: Shop (L2 마이샵)

// ──── Phase 4: 홈 ───────────────────────────────────────────────────────────

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

// ──── Phase 5-1: 주문 ────────────────────────────────────────────────────────

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

// ──── Phase 5-2: 1:1 문의 ─────────────────────────────────────────────────

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

// ──── Phase 5-3: 내 정보 ──────────────────────────────────────────────────

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

// ──── Phase 5-4: 적립금 / 쿠폰 ───────────────────────────────────────────

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

// ──── Phase 6: L2 마이샵 ─────────────────────────────────────────────────

export type ShopTemplateCode = 'CLASSIC' | 'MODERN' | 'WARM' | 'COOL' | 'ELEGANT'

export interface ShopTemplate {
  template_code: ShopTemplateCode
  template_name: string
  description: string
  primary_color: string
  thumbnail_url: string | null
  sort_order: number
}

export interface ShopApplyFormState {
  shop_name: string
  shop_description: string
  shop_url_code: string
  template_code: ShopTemplateCode
}

export interface ShopApplyResponse {
  shop_id: string
  status: 'PENDING'
  status_label: string
  shop_name: string
  shop_url_code: string
  applied_at: string
}

export interface UrlCheckResponse {
  available: boolean
  reason?: 'TAKEN' | 'INVALID_FORMAT' | 'TOO_SHORT' | 'TOO_LONG'
}

export interface MemberShopHome {
  shop_id: string
  shop_name: string
  shop_url_code: string
  full_url: string
  template_code: string
  status: 'APPROVED'
  status_label: string
  logo_url: string | null
  this_month_visit_count: number
  this_month_share_count: number
  this_month_order_count: number
  total_visit_count: number
  total_share_count: number
  total_product_count: number
}

export interface ShopProduct {
  shop_product_id: string
  product_id: string
  product_name: string
  product_price: number
  product_thumbnail: string | null
  sort_order: number
  added_at: string
}

export interface AvailableProduct {
  product_id: string
  product_name: string
  price: number
  thumbnail: string | null
  category_code: string | null
  is_added: boolean
}

export interface ShopSalesRecentOrder {
  order_no: string
  ordered_at: string
  main_item_name: string
  item_count: number
  amount: number
}

export interface ShopSalesTopProduct {
  product_id: string
  product_name: string
  sold_count: number
}

export type ShopSalesPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'

export interface ShopSalesStats {
  period: ShopSalesPeriod
  order_count: number
  total_revenue: number
  avg_order_value: number
  daily_series: { date: string; revenue: number; orders: number }[]
  recent_orders: ShopSalesRecentOrder[]
  top_products: ShopSalesTopProduct[]
}
