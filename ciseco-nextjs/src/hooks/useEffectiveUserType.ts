'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

import { apiUrl } from '@/lib/api/base'

/**
 * JWT → localStorage user_type → /auth/me 순으로 회원 유형 확인
 */
export function useEffectiveUserType() {
  const { user, loading: authLoading } = useAuth()
  const [userType, setUserType] = useState('')
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    const jwtType = (user?.user_type || '').trim()
    const lsType =
      typeof window !== 'undefined' ? localStorage.getItem('user_type')?.trim() || '' : ''
    const cached = jwtType || lsType

    if (cached) {
      setUserType(cached)
      setResolved(true)
      return
    }

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      setUserType('')
      setResolved(true)
      return
    }

    let cancelled = false
    fetch(apiUrl('/auth/me'), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        const t = String(json?.data?.user_type ?? '').trim()
        if (t && typeof window !== 'undefined') {
          localStorage.setItem('user_type', t)
        }
        setUserType(t)
      })
      .catch(() => {
        if (!cancelled) setUserType('')
      })
      .finally(() => {
        if (!cancelled) setResolved(true)
      })

    return () => {
      cancelled = true
    }
  }, [user?.user_type])

  return {
    userType,
    loading: authLoading || !resolved,
    isPaidMember: userType === '006' || userType === '001',
    isGeneralMember: userType === '002',
  }
}
