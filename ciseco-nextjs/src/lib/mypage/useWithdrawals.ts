// KN541 마이페이지 — 동사가치배당 출금 신청·내역 훅
//   POST /mypage/withdraw  : 출금 신청 (cash_ratio + 은행 3종)
//   GET  /mypage/withdraw  : 내 출금 신청 내역
import { useCallback, useEffect, useState } from 'react'
import { mypageFetch, MypageApiError } from './api'

export interface WithdrawApplyPayload {
  cash_ratio: number
  bank_name: string
  bank_account: string
  account_holder: string
  /** 출금 금액(원). 미지정/undefined 이면 전액 출금 */
  withdraw_amount?: number
}

export interface WithdrawApplyResult {
  withdrawal_id: number
  status: string
  status_label: string
  total_amount: number
  cash_amount: number
  point_amount: number
  cash_ratio: number
  requested_amount: number
  requested_at: string
}

export interface WithdrawalItem {
  withdrawal_id: number
  total_amount: number
  cash_amount: number
  point_amount: number
  cash_ratio: number
  requested_amount: number
  status: string
  status_label: string
  bank_name: string | null
  bank_account: string | null
  requested_at: string | null
  paid_at: string | null
  reviewed_at: string | null
  rejected_reason: string | null
}

/** 출금 신청 — 성공 시 결과, 실패 시 MypageApiError throw */
export async function applyWithdraw(payload: WithdrawApplyPayload): Promise<WithdrawApplyResult> {
  return mypageFetch<WithdrawApplyResult>('/mypage/withdraw', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface UseWithdrawalsResult {
  items: WithdrawalItem[]
  total: number
  loading: boolean
  error: string | null
  reload: () => void
}

interface WithdrawalListData {
  items: WithdrawalItem[]
  total: number
  page: number
  size: number
}

/** 내 출금 신청 내역 */
export function useWithdrawals(): UseWithdrawalsResult {
  const [items, setItems] = useState<WithdrawalItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    mypageFetch<WithdrawalListData>('/mypage/withdraw')
      .then(result => {
        if (cancelled) return
        setItems(result.items ?? [])
        setTotal(result.total ?? 0)
      })
      .catch(e => {
        if (cancelled) return
        if (e instanceof MypageApiError && e.status === 401) return
        setError(e instanceof Error ? e.message : '출금 내역을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { items, total, loading, error, reload }
}
