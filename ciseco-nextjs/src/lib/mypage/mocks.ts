// KN541 마이페이지 Mock 데이터 (Phase 4~7)
import type {
  MypageHomeResponse,
  OrderListItem, OrderListResponse,
  InquiryItem, InquiryListResponse,
  MypageProfile, PointLedgerItem, PointsResponse,
  CouponItem, CouponListResponse,
  ShopTemplate, UrlCheckResponse,
  DividendItem, DividendSummaryResponse, DividendHistoryResponse,
  DownlineMember, DownlineTreeResponse,
  WithdrawalItem, WithdrawalListResponse,
} from './types'

// ──── Phase 4 ─────────────────────────────────────────────────────────────

export type ScenarioKey = 'L1' | 'L2-pending' | 'L2' | 'L3'

export const MOCK_SCENARIOS: Record<ScenarioKey, MypageHomeResponse> = {
  L1: {
    user: { name: '홍길동', member_level: 'L1', email: 'hong@example.com' },
    summary: { points: 3_000, coupons: 2, orders_pending: 1 },
    shop: { status: 'NONE' },
    paid: { is_active: false, expires_at: null },
  },
  'L2-pending': {
    user: { name: '김신청', member_level: 'L1', email: 'kim@example.com' },
    summary: { points: 15_000, coupons: 0, orders_pending: 0 },
    shop: { status: 'PENDING' },
    paid: { is_active: false, expires_at: null },
  },
  L2: {
    user: { name: '이마이샵', member_level: 'L2', email: 'lee@example.com' },
    summary: { points: 28_000, coupons: 5, orders_pending: 2 },
    shop: { status: 'APPROVED', shop_name: '이마이샵 스토어' },
    paid: { is_active: false, expires_at: null },
  },
  L3: {
    user: { name: '박유료', member_level: 'L3', email: 'park@example.com' },
    summary: { points: 150_000, coupons: 12, orders_pending: 3 },
    shop: { status: 'APPROVED', shop_name: '박유료 프리미엄몰' },
    paid: { is_active: true, expires_at: '2027-04-16T00:00:00Z' },
  },
}

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  L1:          'L1 일반회원',
  'L2-pending': 'L2 신청중',
  L2:          'L2 마이샵',
  L3:          'L3 유료회원',
}

export const DEFAULT_SCENARIO: ScenarioKey = 'L1'

// ──── Phase 5 ─────────────────────────────────────────────────────────────

export const MOCK_ORDERS: OrderListItem[] = [
  { order_id: 'ord-001', order_no: '2026040300001', ordered_at: '2026-04-03T10:23:00+09:00', status: 'DELIVERED', status_label: '배송완료', total_amount: 33_000, main_item_name: 'ITREX 5A C타입 충전케이블', main_item_thumbnail: null, item_count: 1 },
  { order_id: 'ord-002', order_no: '2026040400012', ordered_at: '2026-04-04T15:00:00+09:00', status: 'SHIPPING', status_label: '배송중', total_amount: 87_000, main_item_name: '국산 건표고버섯 선물세트', main_item_thumbnail: null, item_count: 3 },
  { order_id: 'ord-003', order_no: '2026040500033', ordered_at: '2026-04-05T09:00:00+09:00', status: 'PREPARING', status_label: '상품준비중', total_amount: 12_500, main_item_name: '청정 세안제 리필업', main_item_thumbnail: null, item_count: 1 },
]

export const MOCK_ORDER_RESPONSE: OrderListResponse = {
  items: MOCK_ORDERS, total: MOCK_ORDERS.length, page: 1, size: 20,
  status_counts: { ALL: 3, PAID: 0, PREPARING: 1, SHIPPING: 1, DELIVERED: 1, CANCELED: 0, RETURNED: 0, EXCHANGED: 0 },
}

export const MOCK_INQUIRIES: InquiryItem[] = [
  { inquiry_id: 'inq-001', subject: '상품 관련 문의드립니다', content: '주문한 상품의 교환이 가능한가요?', status: 'ANSWERED', status_label: '답변완료', created_at: '2026-04-10T10:00:00+09:00', answered_at: '2026-04-11T14:00:00+09:00', answer: '네, 수령 후 7일 이내 교환 신청이 가능합니다.' },
  { inquiry_id: 'inq-002', subject: '적립금 사용 문의', content: '적립금은 언제 사용할 수 있나요?', status: 'WAITING', status_label: '답변대기', created_at: '2026-04-14T09:00:00+09:00', answered_at: null, answer: null },
]

export const MOCK_INQUIRY_RESPONSE: InquiryListResponse = {
  items: MOCK_INQUIRIES, total: 2,
  status_counts: { ALL: 2, WAITING: 1, ANSWERED: 1 },
}

export const MOCK_PROFILE: MypageProfile = {
  user_id: 'user-001', username: 'hong123', email: 'hong@example.com', phone: '01012345678',
  name: '홍길동', birth_date: '1960-01-01', gender: 'M',
  zip_code: '06000', address1: '서울특별시 강남구 테헄란로', address2: '101동 202호',
  user_type: '002',
}

export const MOCK_POINTS: PointsResponse = {
  current_balance: 3_000, this_month_earned: 500, total: 4,
  items: [
    { ledger_id: 'pt-001', occurred_at: '2026-04-05T10:00:00+09:00', change_type: 'EARN', amount: 300, reason: '구매 적립', balance_after: 3_000 },
    { ledger_id: 'pt-002', occurred_at: '2026-04-01T10:00:00+09:00', change_type: 'USE', amount: -1_000, reason: '쿠폰 사용', balance_after: 2_700 },
    { ledger_id: 'pt-003', occurred_at: '2026-03-20T10:00:00+09:00', change_type: 'EARN', amount: 200, reason: '구매 적립', balance_after: 3_700 },
    { ledger_id: 'pt-004', occurred_at: '2026-03-01T10:00:00+09:00', change_type: 'EARN', amount: 3_500, reason: '신규 가입 적립', balance_after: 3_500 },
  ] as PointLedgerItem[],
}

export const MOCK_COUPONS: CouponListResponse = {
  status_counts: { AVAILABLE: 2, USED: 1, EXPIRED: 1 },
  items: [
    { coupon_id: 'cp-001', name: '신규 가입 축하 5,000원', discount_amount: 5_000, discount_rate: null, min_order_amount: 20_000, valid_from: '2026-04-01T00:00:00+09:00', valid_until: '2026-05-31T23:59:59+09:00', status: 'AVAILABLE', target_label: '전 상품' },
    { coupon_id: 'cp-002', name: '4월달 10% 할인 쿠폰', discount_amount: null, discount_rate: 10, min_order_amount: 30_000, valid_from: '2026-04-01T00:00:00+09:00', valid_until: '2026-04-30T23:59:59+09:00', status: 'AVAILABLE', target_label: '식품 카테고리' },
    { coupon_id: 'cp-003', name: '3월달 원픽 3,000원', discount_amount: 3_000, discount_rate: null, min_order_amount: 15_000, valid_from: '2026-03-01T00:00:00+09:00', valid_until: '2026-03-31T23:59:59+09:00', status: 'EXPIRED', target_label: '전 상품' },
    { coupon_id: 'cp-004', name: '첫 구매 2,000원 할인', discount_amount: 2_000, discount_rate: null, min_order_amount: 10_000, valid_from: '2026-04-01T00:00:00+09:00', valid_until: '2026-06-30T23:59:59+09:00', status: 'USED', target_label: '전 상품' },
  ] as CouponItem[],
}

// ──── Phase 6 ─────────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: ShopTemplate[] = [
  { template_code: 'CLASSIC', template_name: '클래식',  description: '단정한 느낌의 기본 템플릿',     primary_color: '#7367F0', thumbnail_url: null, sort_order: 10 },
  { template_code: 'MODERN',  template_name: '모던',    description: '깔끔하고 현대적인 레이아웃',     primary_color: '#28C76F', thumbnail_url: null, sort_order: 20 },
  { template_code: 'WARM',    template_name: '따뜻함',  description: '포근한 색감의 부드러운 디자인', primary_color: '#FF9F43', thumbnail_url: null, sort_order: 30 },
  { template_code: 'COOL',    template_name: '시원함',  description: '시원한 블루 톤 디자인',         primary_color: '#00CFE8', thumbnail_url: null, sort_order: 40 },
  { template_code: 'ELEGANT', template_name: '우아함',  description: '고급스러운 다크 톤 디자인',     primary_color: '#1E1E2F', thumbnail_url: null, sort_order: 50 },
]

export function mockCheckUrlCode(code: string): UrlCheckResponse {
  if (code.length < 3) return { available: false, reason: 'TOO_SHORT' }
  if (code.length > 50) return { available: false, reason: 'TOO_LONG' }
  if (!/^[a-z0-9_]+$/i.test(code)) return { available: false, reason: 'INVALID_FORMAT' }
  if (code.toLowerCase().includes('taken') || code.toLowerCase() === 'admin')
    return { available: false, reason: 'TAKEN' }
  return { available: true }
}

// ──── Phase 7 ─────────────────────────────────────────────────────────────

const RECENT_DIVIDENDS: DividendItem[] = [
  { dividend_id: 1, dividend_type: 'MLM',    dividend_type_label: '541 배당', dividend_date: '2026-04-15', amount: 12_000, source_order_no: null, source_member_masked: '홍**', depth: 1 },
  { dividend_id: 2, dividend_type: 'EQUITY', dividend_type_label: '동사가치', dividend_date: '2026-04-14', amount: 8_500, source_order_no: null, source_member_masked: null, depth: null },
  { dividend_id: 3, dividend_type: 'AGIT',   dividend_type_label: '아지트', dividend_date: '2026-04-13', amount: 5_000, source_order_no: null, source_member_masked: null, depth: null },
  { dividend_id: 4, dividend_type: 'MLM',    dividend_type_label: '541 배당', dividend_date: '2026-04-12', amount: 3_200, source_order_no: null, source_member_masked: '김**', depth: 2 },
  { dividend_id: 5, dividend_type: 'MLM',    dividend_type_label: '541 배당', dividend_date: '2026-04-10', amount: 15_000, source_order_no: null, source_member_masked: '이**', depth: 1 },
]

export const MOCK_DIVIDEND_SUMMARY: DividendSummaryResponse = {
  withdrawable_balance: 1_234_000,
  total_by_type: { MLM: 3_245_000, EQUITY: 1_200_000, AGIT: 987_000 },
  this_month_by_type: { MLM: 245_000, EQUITY: 120_000, AGIT: 50_000 },
  recent_items: RECENT_DIVIDENDS,
}

export const MOCK_DIVIDEND_HISTORY: DividendHistoryResponse = {
  items: [
    ...RECENT_DIVIDENDS,
    { dividend_id: 6,  dividend_type: 'EQUITY', dividend_type_label: '동사가치', dividend_date: '2026-03-31', amount: 8_500, source_order_no: null, source_member_masked: null, depth: null },
    { dividend_id: 7,  dividend_type: 'MLM',    dividend_type_label: '541 배당', dividend_date: '2026-03-28', amount: 9_200, source_order_no: null, source_member_masked: '박**', depth: 1 },
    { dividend_id: 8,  dividend_type: 'AGIT',   dividend_type_label: '아지트', dividend_date: '2026-03-25', amount: 5_000, source_order_no: null, source_member_masked: null, depth: null },
  ],
  total: 8, page: 1, size: 20, total_amount: 66_400,
}

export const MOCK_DOWNLINE: DownlineTreeResponse = {
  root_user_id: 'user-001',
  total_count: 24, max_depth: 4,
  by_depth: { 1: 5, 2: 8, 3: 7, 4: 4 },
  members: [
    { user_id: 'u-101', username_masked: '홍**', member_no_masked: 'M***101', joined_at: '2026-02-15', depth: 1, parent_username_masked: null, downline_count: 3 },
    { user_id: 'u-102', username_masked: '김**', member_no_masked: 'M***102', joined_at: '2026-02-20', depth: 1, parent_username_masked: null, downline_count: 5 },
    { user_id: 'u-103', username_masked: '이**', member_no_masked: 'M***103', joined_at: '2026-03-01', depth: 1, parent_username_masked: null, downline_count: 0 },
    { user_id: 'u-104', username_masked: '박**', member_no_masked: 'M***104', joined_at: '2026-03-05', depth: 1, parent_username_masked: null, downline_count: 2 },
    { user_id: 'u-105', username_masked: '정**', member_no_masked: 'M***105', joined_at: '2026-03-10', depth: 1, parent_username_masked: null, downline_count: 1 },
    { user_id: 'u-201', username_masked: '김**', member_no_masked: 'M***201', joined_at: '2026-03-01', depth: 2, parent_username_masked: '홍**', downline_count: 2 },
    { user_id: 'u-202', username_masked: '신**', member_no_masked: 'M***202', joined_at: '2026-03-03', depth: 2, parent_username_masked: '홍**', downline_count: 1 },
    { user_id: 'u-203', username_masked: '한**', member_no_masked: 'M***203', joined_at: '2026-03-05', depth: 2, parent_username_masked: '김**', downline_count: 3 },
  ] as DownlineMember[],
}

export const MOCK_WITHDRAWALS: WithdrawalListResponse = {
  total: 2,
  status_counts: { REQUESTED: 1, APPROVED: 0, PAID: 1, REJECTED: 0 },
  items: [
    { withdrawal_id: 1, requested_amount: 500_000, status: 'REQUESTED', status_label: '처리 중', bank_name: '국민은행', bank_account_masked: '***-5678', requested_at: '2026-04-10T09:00:00', reviewed_at: null, paid_at: null, rejected_reason: null },
    { withdrawal_id: 2, requested_amount: 300_000, status: 'PAID', status_label: '지급 완료', bank_name: '기업은행', bank_account_masked: '***-9012', requested_at: '2026-03-15T09:00:00', reviewed_at: '2026-03-15T14:00:00', paid_at: '2026-03-17T11:00:00', rejected_reason: null },
  ] as WithdrawalItem[],
}
