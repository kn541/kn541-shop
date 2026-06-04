// KN541 마이페이지 — 배당 내역 훅 (M5: 실 API 연결)
// /mypage/dividends/history (L3 인증) 실 데이터 호출
// api.ts·useAuth.ts 수정 없이 mypageFetch 호출만 사용
import { useState, useEffect } from 'react'
import { mypageFetch, MypageApiError } from './api'

/** BE /mypage/dividends/history 응답 항목 (실 필드 기준) */
export interface CommissionHistoryItem {
  commission_id: string
  order_id: string
  commission_type: string
  commission_type_label: string
  status: string
  status_label: string
  amount: number
  pay_timing: string | null
  reward_type: string | null
  created_at: string
}

/** BE /mypage/dividends/history 페이지네이션 응답 */
export interface CommissionHistoryData {
  items: CommissionHistoryItem[]
  total: number
  page: number
  size: number
}

export interface UseDividendHistoryResult {
  data: CommissionHistoryData | null
  loading: boolean
  error: string | null
}

/**
 * 배당 내역 실 API 훅
 * @param from  YYYY-MM-DD 시작일 (undefined 시 필터 없음)
 * @param to    YYYY-MM-DD 종료일 (undefined 시 필터 없음)
 * @param page  페이지 (기본 1)
 * @param size  페이지 크기 (기본 20)
 */
export function useDividendHistory(
  from: string | undefined,
  to: string | undefined,
  page = 1,
  size = 20,
): UseDividendHistoryResult {
  const [data, setData] = useState<CommissionHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)

    const qs = new URLSearchParams({ page: String(page), size: String(size) })
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)

    mypageFetch<CommissionHistoryData>(`/mypage/dividends/history?${qs}`)
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(e => {
        if (cancelled) return
        // 401: mypageFetch가 refresh 시도 → 실패 시 clearAuthAndRedirect() 호출
        // 이 catch 블록까지 오면 재시도도 실패한 상태 → 별도 처리 불필요
        if (e instanceof MypageApiError && e.status === 401) return
        setError(e instanceof Error ? e.message : '배당 내역을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [from, to, page, size])

  return { data, loading, error }
}
