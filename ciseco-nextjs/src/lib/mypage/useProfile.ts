'use client'
import { useEffect, useState, useCallback } from 'react'
import type { MypageProfile } from './types'
import { MOCK_PROFILE } from './mocks'
import { getAuthHeader, isLoggedIn } from './auth'

const BASE = process.env.NEXT_PUBLIC_API_URL

export function useProfile() {
  const [data, setData] = useState<MypageProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!BASE) {
      setData(MOCK_PROFILE)
      setLoading(false)
      return
    }
    if (!isLoggedIn()) {
      setData(MOCK_PROFILE)
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`${BASE}/auth/me`, {
      headers: getAuthHeader() as HeadersInit,
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((res: { status: string; data: Record<string, unknown> }) => {
        const d = res.data
        setData({
          user_id:    String(d.id ?? d.user_id ?? ''),
          member_no:  d.member_no ? String(d.member_no) : '',
          username:   String(d.username ?? ''),
          email:      d.email   ? String(d.email)    : null,
          phone:      d.phone   ? String(d.phone)    : null,
          name:       String(d.name ?? d.full_name ?? ''),
          birth_date: d.birth_date ? String(d.birth_date) : null,
          gender:     d.gender != null && d.gender !== '' ? String(d.gender) : null,
          zip_code:   d.zip_code  ? String(d.zip_code)   : null,
          address1:   d.address1  ? String(d.address1)   : null,
          address2:   d.address2  ? String(d.address2)   : null,
          user_type:  d.user_type != null && d.user_type !== '' ? String(d.user_type) : null,
        })
        setError(null)
      })
      .catch(e => {
        // API 실패 시 Mock으로 폴백
        console.warn('[useProfile] API 실패, Mock 사용:', e)
        setData(MOCK_PROFILE)
        setError(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, reload: load }
}
