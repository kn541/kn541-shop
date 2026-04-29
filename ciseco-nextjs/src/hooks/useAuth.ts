'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'

interface AuthUser {
  user_id: string
  user_type: string
  username?: string
  email?: string
  name?: string
}

// JWT payload 디코딩 (검증 없이 페이로드만 읽기)
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  let locale = 'ko'
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    locale = useLocale()
  } catch {
    // useLocale 실패 시 기본값 ko
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    const payload = decodeJwt(token)
    if (!payload) {
      setLoading(false)
      return
    }

    // JWT 만료 체크
    const exp = payload.exp as number | undefined
    if (exp && exp * 1000 < Date.now()) {
      localStorage.removeItem('access_token')
      setLoading(false)
      return
    }

    setUser({
      user_id: (payload.sub as string) || (payload.user_id as string) || '',
      user_type: (payload.user_type as string) || '',
      username: payload.username as string | undefined,
      email: payload.email as string | undefined,
      name: (payload.name as string | undefined) || (payload.user_name as string | undefined),
    })
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_type')
    setUser(null)
    // 로그아웃 후 메인 페이지로 이동
    window.location.href = `/${locale}`
  }

  return { user, loading, logout }
}
