// KN541 마이페이지 — 배당 요약 훅 (M5-2: 실 API 연결)
// /mypage/dividends (L3 인증) 실 데이터 호출
// api.ts·useAuth.ts 수정 없이 mypageFetch 호출만 사용
import { useState, useEffect } from 'react'
import { mypageFetch, MypageApiError } from './api'

/** BE /mypage/dividends 최근 항목 (요약용 — order_id·reward_type 없음) */
export interface CommissionSummaryItem {
  commission_id: string
  commission_type: string
  commission_type_label: string
  status: string
  status_label: string
  amount: number
  pay_timing: string | null
  created_at: string
}

/** BE /mypage/dividends 요약 응답 */
export interface DividendSummaryData {
  /** rule_type_code → 총 누적 금액 */
  total_by_type: Record<string, number>
  /** rule_type_code → 이번 달 금액 */
  this_month_by_type: Record<string, number>
  withdrawable_balance: number
  recent_items: CommissionSummaryItem[]
}

export interface UseDividendSummaryResult {
  data: DividendSummaryData | null
  loading: boolean
  error: string | null
}

/** 배당 요약 실 API 훅 */
export function useDividendSummary(): UseDividendSummaryResult {
  const [data, setData] = useState<DividendSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)

    mypageFetch<DividendSummaryData>('/mypage/dividends')
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(e => {
        if (cancelled) return
        // 401: mypageFetch가 refresh 시도 → 실패 시 clearAuthAndRedirect() 호출
        if (e instanceof MypageApiError && e.status === 401) return
        setError(e instanceof Error ? e.message : '배당 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
