'use client'

import { useAuth } from '@/hooks/useAuth'

// 프리오픈(폐쇄몰) 모드 가격 노출 제어
// - 환경변수 NEXT_PUBLIC_PREOPEN_HIDE_PRICE === 'true' 이고 비로그인일 때만 가격을 숨긴다.
// - 오픈 시: Vercel 환경변수를 false로 바꾸거나 삭제 후 재배포하면 전원 정상 노출.
//
// 주의: NEXT_PUBLIC_* 는 빌드 타임에 인라인되지만 로그인 여부는 클라이언트에서만 알 수 있으므로,
//       useAuth().loading 동안에는 숨기지 않는다(서버 렌더와 일치 → hydration mismatch 방지).
export const PREOPEN_HIDE_PRICE = process.env.NEXT_PUBLIC_PREOPEN_HIDE_PRICE === 'true'
export const HIDDEN_PRICE_LABEL = '로그인 후 가격 확인'

/** 현재 사용자에게 가격을 숨겨야 하면 true */
export function usePreopenHidePrice(): boolean {
  const { user, loading } = useAuth()
  return PREOPEN_HIDE_PRICE && !loading && !user
}
