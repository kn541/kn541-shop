'use client'

import { useCallback, useEffect, useState } from 'react'
import { mypageFetch, MypageApiError } from './api'

export function useWithdrawableBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const d = await mypageFetch<{ withdrawable_balance?: number }>('/mypage/dividends')
      setBalance(Number(d.withdrawable_balance) || 0)
    } catch (e) {
      setBalance(null)
      setError(e instanceof MypageApiError ? e.message : '출금 가능 잔액을 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { balance, loading, error, reload }
}
