'use client'
// Phase 5-H에서 GET /mypage/home 실 API로 교체 예정
import { useEffect, useState } from 'react'
import { MOCK_SCENARIOS, DEFAULT_SCENARIO, type ScenarioKey } from './mocks'
import type { MypageHomeResponse } from './types'

export function useMypageHome() {
  const [data, setData] = useState<MypageHomeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('mock') as ScenarioKey
    const key: ScenarioKey = raw && raw in MOCK_SCENARIOS ? raw : DEFAULT_SCENARIO
    setData(MOCK_SCENARIOS[key])
    setLoading(false)
  }, [])

  return { data, loading }
}
