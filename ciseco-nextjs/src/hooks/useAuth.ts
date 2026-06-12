'use client'

import { useEffect, useState } from 'react'
import { refreshAccessToken, clearAuthAndRedirect } from '@/lib/mypage/api'
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
    void (async () => {
      // access_token 확보 (없으면 refresh_token으로 재발급 시도)
      let token = localStorage.getItem('access_token')
      if (!token) {
        token = await refreshAccessToken()
        if (!token) { setLoading(false); return }
      }

      const payload = decodeJwt(token)
      if (!payload) { setLoading(false); return }

      // JWT 만료 체크 — 만료 시 refresh 시도 / 실패 시 전부 제거 + 로그인 리다이렉트
      const exp = payload.exp as number | undefined
      if (exp && exp * 1000 < Date.now()) {
        const newToken = await refreshAccessToken()
        if (!newToken) { clearAuthAndRedirect(); setLoading(false); return }
        const newPayload = decodeJwt(newToken)
        if (!newPayload) { clearAuthAndRedirect(); setLoading(false); return }
        setUser({
          user_id: (newPayload.sub as string) || (newPayload.user_id as string) || '',
          user_type: (newPayload.user_type as string) || '',
          username: newPayload.username as string | undefined,
          email: newPayload.email as string | undefined,
          name: (newPayload.name as string | undefined) || (newPayload.user_name as string | undefined),
        })
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
    })()
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
