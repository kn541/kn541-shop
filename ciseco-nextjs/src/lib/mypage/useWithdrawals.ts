'use client'

import { useCallback, useEffect, useState } from 'react'
import { mypageFetch, MypageApiError } from './api'
import type { WithdrawalListResponse } from './types'

const EMPTY_COUNTS: WithdrawalListResponse['status_counts'] = {
  ALL: 0,
  REQUESTED: 0,
  APPROVED: 0,
  PAID: 0,
  REJECTED: 0,
}

export type WithdrawTabKey = 'ALL' | 'REQUESTED' | 'PAID' | 'REJECTED'

export function useWithdrawals(tab: WithdrawTabKey) {
  const [data, setData] = useState<WithdrawalListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = tab === 'ALL' ? 'ALL' : tab
      const qs = new URLSearchParams({ page: '1', size: '50', status })
      const raw = await mypageFetch<WithdrawalListResponse>(`/mypage/withdraw?${qs}`)
      setData({
        ...raw,
        status_counts: { ...EMPTY_COUNTS, ...raw.status_counts },
      })
    } catch (e) {
      setData(null)
      setError(e instanceof MypageApiError ? e.message : '출금 내역을 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, reload: load }
}
