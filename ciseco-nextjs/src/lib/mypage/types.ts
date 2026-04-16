// KN541 마이페이지 홈 API 응답 타입
// GET /mypage/home 응답 스키마 (Phase 2 API 구현 후 동일 구조 사용)

export interface MypageHomeUser {
  name: string
  member_level: 'L1' | 'L2' | 'L3'
  email: string
}

export interface MypageHomeSummary {
  points: number        // 적립금 (원)
  coupons: number       // 보유 쿠폰 수
  orders_pending: number // 처리중 주문 수
}

export interface MypageHomeShop {
  status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  shop_name?: string
}

export interface MypageHomePaid {
  is_active: boolean
  expires_at: string | null // ISO 8601
}

export interface MypageHomeResponse {
  user: MypageHomeUser
  summary: MypageHomeSummary
  shop: MypageHomeShop
  paid: MypageHomePaid
}
