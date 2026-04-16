// KN541 배당 유형별 색상 설정 (인라인 스타일 기반)
import type { DividendType } from './types'

export const DIVIDEND_COLORS: Record<DividendType, {
  bg: string
  color: string
  icon: string
  label: string
  description: string
}> = {
  MLM: {
    bg: '#F3EFFF', color: '#7C3AED',
    icon: '💜', label: '541 배당',
    description: '하선 회원이 구매할 때 받는 배당',
  },
  EQUITY: {
    bg: '#EFF6FF', color: '#1D4ED8',
    icon: '💙', label: '동사가치',
    description: '회사 지분 기반 월 정기 배당',
  },
  AGIT: {
    bg: '#FFF7ED', color: '#C2410C',
    icon: '🧡', label: '아지트',
    description: '아지트 활동 기반 배당',
  },
}
