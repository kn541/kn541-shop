// KN541 마이페이지 타입 정의
// Phase 4~7 전체

// ──── Phase 4 ─────────────────────────────────────────────────────────────

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

// ──── Phase 5-1 ────────────────────────────────────────────────────────────

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

/** GET /mypage/orders/{id} — 백엔드 필드 유연 매핑 */
export interface OrderDetailLineItem {
  product_id?: string
  product_name?: string
  name?: string
  thumbnail_url?: string | null
  image_url?: string | null
  quantity?: number
  qty?: number
  unit_price?: number
  price?: number
  line_amount?: number
  amount?: number
}

export interface OrderDetail {
  order_id: string
  order_no?: string
  order_status?: string
  status?: string
  created_at?: string
  ordered_at?: string
  total_amount?: number
  payment_method?: string | null
  tracking_number?: string | null
  invoice_no?: string | null
  shipping_address?: {
    recipient_name?: string
    recipient_phone?: string
    zip_code?: string
    address1?: string
    address2?: string | null
  } | null
  recipient_name?: string
  recipient_phone?: string
  zip_code?: string
  address1?: string
  address2?: string | null
  items?: OrderDetailLineItem[]
}

/** GET /my/commissions?month=YYYY-MM */
export interface CommissionMonthRow {
  id?: string
  amount?: number | string
  status?: string
  created_at?: string
  rule_name?: string
  from_member_name?: string
  [key: string]: unknown
}

export interface CommissionMonthResponse {
  month_total?: number
  cumulative_total?: number
  items?: CommissionMonthRow[]
  total?: number
  rows?: CommissionMonthRow[]
}

// ──── Phase 5-2 ────────────────────────────────────────────────────────────

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

// ──── Phase 5-3 ────────────────────────────────────────────────────────────

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
  /** 시스템 회원유형 코드 (창업회원: 006) */
  user_type?: string | null
}

// ──── Phase 5-4 ────────────────────────────────────────────────────────────

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

// ──── Phase 6 ─────────────────────────────────────────────────────────────

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

export type ShopSalesPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'

export interface ShopSalesStats {
  period: ShopSalesPeriod
  order_count: number
  total_revenue: number
  avg_order_value: number
  daily_series: { date: string; revenue: number; orders: number }[]
  recent_orders: {
    order_no: string
    ordered_at: string
    main_item_name: string
    item_count: number
    amount: number
  }[]
  top_products: {
    product_id: string
    product_name: string
    sold_count: number
  }[]
}

// ──── Phase 7: L3 수당 ────────────────────────────────────────────────────

export type DividendType = 'MLM' | 'EQUITY' | 'AGIT'

export interface DividendItem {
  dividend_id: number
  dividend_type: DividendType
  dividend_type_label: string      // '541 배당' | '동사가치' | '아지트'
  dividend_date: string            // YYYY-MM-DD
  amount: number
  source_order_no: string | null
  source_member_masked: string | null  // '홍**' 마스킹
  depth: number | null
}

export interface DividendSummaryResponse {
  withdrawable_balance: number
  total_by_type: Record<DividendType, number>
  this_month_by_type: Record<DividendType, number>
  recent_items: DividendItem[]
}

export interface DividendHistoryResponse {
  items: DividendItem[]
  total: number
  page: number
  size: number
  total_amount: number
}

export interface DownlineMember {
  user_id: string
  username_masked: string          // '홍**'
  member_no_masked: string         // 'M***123'
  joined_at: string
  depth: number
  parent_username_masked: string | null
  downline_count: number
}

export interface DownlineTreeResponse {
  root_user_id: string
  members: DownlineMember[]
  total_count: number
  max_depth: number
  by_depth: Record<number, number>
}

export interface WithdrawRequest {
  requested_amount: number
  bank_name: string
  bank_account: string
  account_holder: string
  dividend_type?: DividendType
}

export type WithdrawalStatus = 'REQUESTED' | 'APPROVED' | 'PAID' | 'REJECTED'

export interface WithdrawalItem {
  withdrawal_id: number
  requested_amount: number
  status: WithdrawalStatus
  status_label: string
  bank_name: string
  bank_account_masked: string      // '국민 *** 5678'
  requested_at: string
  reviewed_at: string | null
  paid_at: string | null
  rejected_reason: string | null
}

export interface WithdrawalListResponse {
  items: WithdrawalItem[]
  total: number
  status_counts: Record<'REQUESTED' | 'APPROVED' | 'PAID' | 'REJECTED', number>
}
