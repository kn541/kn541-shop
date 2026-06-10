// KN541 마이페이지 — 동사가치배당 출금 요약 훅
// GET /mypage/withdraw/summary (L3 인증)
//   - withdrawable_balance: 출금 가능 잔액(동사가치 PENDING 합)
//   - has_bank_account + 계좌정보: 출금 팝업 입력란 노출 판정용
import { useCallback, useEffect, useState } from 'react'
import { mypageFetch, MypageApiError } from './api'

export interface WithdrawSummaryData {
  withdrawable_balance: number
  has_bank_account: boolean
  bank_name: string | null
  /** 평문 계좌번호(본인) — 신청 payload 용. 화면 표시는 masked 사용 */
  bank_account: string | null
  bank_account_masked: string | null
  account_holder: string | null
}

export interface UseWithdrawSummaryResult {
  data: WithdrawSummaryData | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useWithdrawSummary(): UseWithdrawSummaryResult {
  const [data, setData] = useState<WithdrawSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    mypageFetch<WithdrawSummaryData>('/mypage/withdraw/summary')
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(e => {
        if (cancelled) return
        if (e instanceof MypageApiError && e.status === 401) return
        setError(e instanceof Error ? e.message : '출금 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { data, loading, error, reload }
}
