// KN541 마이페이지 Mock 시나리오 4종
// Phase 2 API 완성 후 실제 GET /mypage/home 응답으로 교체
import type { MypageHomeResponse } from './types'

export type ScenarioKey = 'L1' | 'L2-pending' | 'L2' | 'L3'

export const MOCK_SCENARIOS: Record<ScenarioKey, MypageHomeResponse> = {
  // L1: 가입 기본 회원 — 쇼핑·주문·혜택만 이용
  L1: {
    user: { name: '홍길동', member_level: 'L1', email: 'hong@example.com' },
    summary: { points: 3_000, coupons: 2, orders_pending: 1 },
    shop: { status: 'NONE' },
    paid: { is_active: false, expires_at: null },
  },

  // L2-pending: 마이샵 신청 후 승인 대기 중
  'L2-pending': {
    user: { name: '김신청', member_level: 'L1', email: 'kim@example.com' },
    summary: { points: 15_000, coupons: 0, orders_pending: 0 },
    shop: { status: 'PENDING' },
    paid: { is_active: false, expires_at: null },
  },

  // L2: 마이샵 승인 완료 — 내몰 운영 가능
  L2: {
    user: { name: '이마이샵', member_level: 'L2', email: 'lee@example.com' },
    summary: { points: 28_000, coupons: 5, orders_pending: 2 },
    shop: { status: 'APPROVED', shop_name: '이마이샵 스토어' },
    paid: { is_active: false, expires_at: null },
  },

  // L3: 유료회원 — 수당·조직도·출금 전체 이용
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
