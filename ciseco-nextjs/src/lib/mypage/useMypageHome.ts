'use client'
/**
 * useMypageHome — Step 5-H API 스왑
 * - ?mock=L1|L2-pending|L2|L3  개발용 Mock 스위치
 * - 그 외  GET /mypage/home 실 API 호출
 * - Mock fallback 금지: 에러는 error 상태로 노출
 */
import { useEffect, useState } from 'react'
import type { MypageHomeResponse } from './types'
import { MOCK_SCENARIOS, type ScenarioKey } from './mocks'
import { mypageFetch, adaptMypageHome, MypageApiError } from './api'

export function useMypageHome() {
  const [data,    setData]    = useState<MypageHomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<MypageApiError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // URL ?mock= 파라미터 파싱 (window.location.search 직접 사용 — Suspense 불필요)
      const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : ''
      )
      const mockKey = params.get('mock') as ScenarioKey | null

      // 개발용 Mock 분기: ?mock=L1 / L2-pending / L2 / L3
      if (mockKey && mockKey in MOCK_SCENARIOS) {
        if (!cancelled) {
          setData(MOCK_SCENARIOS[mockKey])
          setLoading(false)
        }
        return
      }

      // 실 API 호출
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await mypageFetch<any>('/mypage/home')
        if (!cancelled) {
          setData(adaptMypageHome(raw))
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof MypageApiError
              ? e
              : new MypageApiError(0, null, '알 수 없는 오류가 발생했습니다')
          )
          setLoading(false)
          // Mock fallback 절대 금지 — 에러를 실제로 노출할 것
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
