'use client'
// fix(#19): 로그아웃 시 clearCart 제거 — localStorage 유지하여 재로그인 시 장바구니 복원
// CartBtn이 비로그인 시 배지 숨김 처리하므로 로그아웃 후 UI에서는 0건 표시

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
    // useLocale fail -> default ko
  }

  useEffect(() => {
    void (async () => {
      let token = localStorage.getItem('access_token')
      if (!token) {
        token = await refreshAccessToken()
        if (!token) { setLoading(false); return }
      }

      const payload = decodeJwt(token)
      if (!payload) { setLoading(false); return }

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
    // fix(#19): clearCart 제거 — localStorage(kn541_cart) 유지
    // CartBtn이 access_token 유무로 배지 표시 결정 → 로그아웃 시 자동 숨김
    // 재로그인 시 localStorage에서 장바구니 자동 복원
    setUser(null)
    window.location.href = `/${locale}`
  }

  return { user, loading, logout }
}
