// KN541 마이페이지 Mock 데이터
// Phase 2 API 완성 후 실제 응답으로 교체

import type {
  MypageHomeResponse,
  OrderListItem, OrderListResponse,
  InquiryItem, InquiryListResponse,
  MypageProfile,
  PointLedgerItem, PointsResponse,
  CouponItem, CouponListResponse,
  ShopTemplate, UrlCheckResponse,
  MemberShopHome, ShopProduct, AvailableProduct,
  ShopSalesStats,
} from './types'

// ──── Phase 4: 홈 시나리오 ────────────────────────────────────────────────

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

// ──── Phase 5-1: 주문 Mock ───────────────────────────────────────────────

export const MOCK_ORDERS: OrderListItem[] = [
  {
    order_id: 'ord-001', order_no: '2026040300001',
    ordered_at: '2026-04-03T10:23:00+09:00',
    status: 'DELIVERED', status_label: '배송완료',
    total_amount: 33_000,
    main_item_name: 'ITREX 아이티렉스 5A C타입 충전케이블',
    main_item_thumbnail: null, item_count: 1,
  },
  {
    order_id: 'ord-002', order_no: '2026040400012',
    ordered_at: '2026-04-04T15:00:00+09:00',
    status: 'SHIPPING', status_label: '배송중',
    total_amount: 87_000,
    main_item_name: '국산 건표고버섯 선물세트',
    main_item_thumbnail: null, item_count: 3,
  },
  {
    order_id: 'ord-003', order_no: '2026040500033',
    ordered_at: '2026-04-05T09:00:00+09:00',
    status: 'PREPARING', status_label: '상품준비중',
    total_amount: 12_500,
    main_item_name: '청정 세안제 리필업',
    main_item_thumbnail: null, item_count: 1,
  },
]

export const MOCK_ORDER_RESPONSE: OrderListResponse = {
  items: MOCK_ORDERS, total: MOCK_ORDERS.length, page: 1, size: 20,
  status_counts: {
    ALL: 3, PAID: 0, PREPARING: 1, SHIPPING: 1, DELIVERED: 1,
    CANCELED: 0, RETURNED: 0, EXCHANGED: 0,
  },
}

// ──── Phase 5-2: 문의 Mock ───────────────────────────────────────────────

export const MOCK_INQUIRIES: InquiryItem[] = [
  {
    inquiry_id: 'inq-001', subject: '상품 관련 문의드립니다',
    content: '주문한 상품의 교환이 가능한가요?',
    status: 'ANSWERED', status_label: '답변완료',
    created_at: '2026-04-10T10:00:00+09:00',
    answered_at: '2026-04-11T14:00:00+09:00',
    answer: '네, 수령 후 7일 이내 교환 신청이 가능합니다.',
  },
  {
    inquiry_id: 'inq-002', subject: '적립금 사용 문의',
    content: '적립금은 언제 사용할 수 있나요?',
    status: 'WAITING', status_label: '답변대기',
    created_at: '2026-04-14T09:00:00+09:00',
    answered_at: null, answer: null,
  },
]

export const MOCK_INQUIRY_RESPONSE: InquiryListResponse = {
  items: MOCK_INQUIRIES, total: 2,
  status_counts: { ALL: 2, WAITING: 1, ANSWERED: 1 },
}

// ──── Phase 5-3: 프로필 Mock ──────────────────────────────────────────────

export const MOCK_PROFILE: MypageProfile = {
  user_id: 'user-001', username: 'hong123',
  email: 'hong@example.com', phone: '01012345678',
  name: '홍길동', birth_date: '1960-01-01', gender: 'M',
  zip_code: '06000', address1: '서울특별시 강남구 테헤란로', address2: '101동 202호',
}

// ──── Phase 5-4: 적립금 / 쿠폰 Mock ──────────────────────────────────────

export const MOCK_POINTS: PointsResponse = {
  current_balance: 3_000, this_month_earned: 500, total: 4,
  items: [
    { ledger_id: 'pt-001', occurred_at: '2026-04-05T10:00:00+09:00', change_type: 'EARN', amount: 300, reason: '구매 적립', balance_after: 3_000 },
    { ledger_id: 'pt-002', occurred_at: '2026-04-01T10:00:00+09:00', change_type: 'USE',  amount: -1_000, reason: '쿠폰 사용', balance_after: 2_700 },
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

// ──── Phase 6: 마이샵 Mock ────────────────────────────────────────────────

export const MOCK_TEMPLATES: ShopTemplate[] = [
  { template_code: 'CLASSIC', template_name: '클래식',  description: '단정한 느낌의 기본 템플릿',     primary_color: '#7367F0', thumbnail_url: null, sort_order: 10 },
  { template_code: 'MODERN',  template_name: '모던',    description: '깔끔하고 현대적인 레이아웃',     primary_color: '#28C76F', thumbnail_url: null, sort_order: 20 },
  { template_code: 'WARM',    template_name: '따뜻함',  description: '포근한 색감의 부드러운 디자인', primary_color: '#FF9F43', thumbnail_url: null, sort_order: 30 },
  { template_code: 'COOL',    template_name: '시원함',  description: '시원한 블루 톤 디자인',         primary_color: '#00CFE8', thumbnail_url: null, sort_order: 40 },
  { template_code: 'ELEGANT', template_name: '우아함',  description: '고급스러운 다크 톤 디자인',     primary_color: '#1E1E2F', thumbnail_url: null, sort_order: 50 },
]

// URL 코드 Mock 중복 체크 (개발용: 'taken' or 'admin' 포함 시 중복 처리)
export function mockCheckUrlCode(code: string): UrlCheckResponse {
  if (code.length < 3)   return { available: false, reason: 'TOO_SHORT' }
  if (code.length > 50)  return { available: false, reason: 'TOO_LONG' }
  if (!/^[a-z0-9_]+$/i.test(code)) return { available: false, reason: 'INVALID_FORMAT' }
  if (code.toLowerCase().includes('taken') || code.toLowerCase() === 'admin')
    return { available: false, reason: 'TAKEN' }
  return { available: true }
}

export const MOCK_SHOP_HOME: MemberShopHome = {
  shop_id: 'shop-001', shop_name: '홍길동의 건강샵',
  shop_url_code: 'hong-health',
  full_url: 'https://shop.kn541.co.kr/shop/hong-health',
  template_code: 'CLASSIC', status: 'APPROVED', status_label: '운영 중',
  logo_url: null,
  this_month_visit_count: 234, this_month_share_count: 12, this_month_order_count: 3,
  total_visit_count: 1_842, total_share_count: 89, total_product_count: 24,
}

export const MOCK_SHOP_PRODUCTS: ShopProduct[] = [
  { shop_product_id: 'sp-001', product_id: 'p-001', product_name: '국산 건표고버섯 선물세트', product_price: 28_000, product_thumbnail: null, sort_order: 10, added_at: '2026-04-10T09:00:00' },
  { shop_product_id: 'sp-002', product_id: 'p-002', product_name: 'ITREX C타입 충전케이블',  product_price: 15_000, product_thumbnail: null, sort_order: 20, added_at: '2026-04-11T10:00:00' },
  { shop_product_id: 'sp-003', product_id: 'p-003', product_name: '청정 세안제 리필업',     product_price: 12_500, product_thumbnail: null, sort_order: 30, added_at: '2026-04-12T11:00:00' },
]

export const MOCK_AVAILABLE_PRODUCTS: AvailableProduct[] = [
  { product_id: 'p-001', product_name: '국산 건표고버섯 선물세트', price: 28_000, thumbnail: null, category_code: 'food',        is_added: true  },
  { product_id: 'p-002', product_name: 'ITREX C타입 충전케이블',  price: 15_000, thumbnail: null, category_code: 'electronics', is_added: true  },
  { product_id: 'p-003', product_name: '청정 세안제 리필업',     price: 12_500, thumbnail: null, category_code: 'beauty',      is_added: true  },
  { product_id: 'p-004', product_name: '유기농 녹차 50티백',     price: 18_000, thumbnail: null, category_code: 'food',        is_added: false },
  { product_id: 'p-005', product_name: '스마트 체중계',          price: 45_000, thumbnail: null, category_code: 'health',      is_added: false },
  { product_id: 'p-006', product_name: '천연 샴푸 300ml',        price: 22_000, thumbnail: null, category_code: 'beauty',      is_added: false },
]

export const MOCK_SHOP_SALES: Record<string, ShopSalesStats> = {
  TODAY: {
    period: 'TODAY', order_count: 1, total_revenue: 28_000, avg_order_value: 28_000,
    daily_series: [],
    recent_orders: [
      { order_no: '2026041600001', ordered_at: '2026-04-16T10:00:00', main_item_name: '국산 건표고버섯 선물세트', item_count: 1, amount: 28_000 },
    ],
    top_products: [{ product_id: 'p-001', product_name: '국산 건표고버섯', sold_count: 15 }],
  },
  WEEK: {
    period: 'WEEK', order_count: 3, total_revenue: 87_000, avg_order_value: 29_000,
    daily_series: [
      { date: '04-10', revenue: 28_000, orders: 1 },
      { date: '04-12', revenue: 33_000, orders: 1 },
      { date: '04-16', revenue: 28_000, orders: 1 },
    ],
    recent_orders: [
      { order_no: '2026041600001', ordered_at: '2026-04-16T10:00:00', main_item_name: '국산 건표고버섯 선물세트', item_count: 1, amount: 28_000 },
      { order_no: '2026041200012', ordered_at: '2026-04-12T15:00:00', main_item_name: '청정 세안제 리필업 외 1건', item_count: 2, amount: 33_000 },
    ],
    top_products: [
      { product_id: 'p-001', product_name: '국산 건표고버섯', sold_count: 2 },
      { product_id: 'p-003', product_name: '청정 세안제 리필업', sold_count: 1 },
    ],
  },
  MONTH: {
    period: 'MONTH', order_count: 8, total_revenue: 248_000, avg_order_value: 31_000,
    daily_series: [],
    recent_orders: [
      { order_no: '2026041600001', ordered_at: '2026-04-16T10:00:00', main_item_name: '국산 건표고버섯 선물세트', item_count: 1, amount: 28_000 },
      { order_no: '2026041200012', ordered_at: '2026-04-12T15:00:00', main_item_name: '청정 세안제 리필업 외 1건', item_count: 2, amount: 33_000 },
      { order_no: '2026041000008', ordered_at: '2026-04-10T09:00:00', main_item_name: 'ITREX C타입 충전케이블', item_count: 1, amount: 15_000 },
    ],
    top_products: [
      { product_id: 'p-001', product_name: '국산 건표고버섯', sold_count: 15 },
      { product_id: 'p-002', product_name: 'ITREX C타입 케이블', sold_count: 8 },
      { product_id: 'p-003', product_name: '청정 세안제', sold_count: 5 },
    ],
  },
  ALL: {
    period: 'ALL', order_count: 42, total_revenue: 1_284_000, avg_order_value: 30_571,
    daily_series: [],
    recent_orders: [
      { order_no: '2026041600001', ordered_at: '2026-04-16T10:00:00', main_item_name: '국산 건표고버섯 선물세트', item_count: 1, amount: 28_000 },
      { order_no: '2026041200012', ordered_at: '2026-04-12T15:00:00', main_item_name: '청정 세안제 리필업 외 1건', item_count: 2, amount: 33_000 },
      { order_no: '2026041000008', ordered_at: '2026-04-10T09:00:00', main_item_name: 'ITREX C타입 충전케이블', item_count: 1, amount: 15_000 },
      { order_no: '2026040500033', ordered_at: '2026-04-05T09:00:00', main_item_name: '청정 세안제 리필업', item_count: 1, amount: 12_500 },
      { order_no: '2026040300001', ordered_at: '2026-04-03T10:00:00', main_item_name: '국산 건표고버섯 선물세트', item_count: 1, amount: 28_000 },
    ],
    top_products: [
      { product_id: 'p-001', product_name: '국산 건표고버섯', sold_count: 18 },
      { product_id: 'p-002', product_name: 'ITREX C타입 케이블', sold_count: 12 },
      { product_id: 'p-003', product_name: '청정 세안제', sold_count: 8 },
      { product_id: 'p-004', product_name: '유기농 녹차 50티백', sold_count: 4 },
    ],
  },
}
