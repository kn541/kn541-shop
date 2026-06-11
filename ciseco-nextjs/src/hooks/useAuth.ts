'use client'
// fix: 재로그인 시 장바구니 목록 사라짐 — logout()에 clearCart 치확 호출 (#업무-온라인오픈 18번)
//   원인: 로그아웃 시 localStorage access_token만 제거하고 cart storage는 유지
//          → 로그아웃 후 다른 회원이 로그인하면 이전 회원 장바구니가 노이거나
//          팀 PC에서 hydration 시 묶이는 미세한 race로 사라지는 것처럼 보임
//   수정: logout() 시 clearCart() 명시적 호출 → kn541_cart localStorage 완전 제거

import { useEffect, useState } from 'react'
import { refreshAccessToken, clearAuthAndRedirect } from '@/lib/mypage/api'
import { useLocale } from 'next-intl'
import { useCart } from '@/lib/cart-context'

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
  const { clearCart } = useCart()
  let locale = 'ko'
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    locale = useLocale()
  } catch {
    // useLocale 실패 시 기본값 ko
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
    // ★ fix #18: 로그아웃 시 장바구니 명시적 제거
    // 이전: cart storage 유지 → 다음 로그인 회원에게 이전 회원 장바구니 노임
    // 이후: clearCart()로 kn541_cart localStorage 완전 제거
    clearCart()
    setUser(null)
    window.location.href = `/${locale}`
  }

  return { user, loading, logout }
}
