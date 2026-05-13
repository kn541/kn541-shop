'use client'
// KN541 쇼핑몰 — 헤더 우측 유저 액션 (단순화 v2)
// - 비로그인: 로그인 / 회원가입 텍스트
// - 로그인:  로그아웃(로그인 자리) + 마이페이지
// - hydration mismatch 방지: isMounted 패턴 유지

import { useEffect, useState, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'react-hot-toast'
import {
  KN541_CART_SELECTED_STORAGE_KEY,
  KN541_CART_STORAGE_KEY,
  useCart,
} from '@/lib/cart-context'

const BASE = process.env.NEXT_PUBLIC_API_URL

interface UserInfo {
  name: string
  user_id: string
}

export default function HeaderUserActions() {
  const locale = useLocale()
  const router = useRouter()
  const { clearCart } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_type')
    localStorage.removeItem(KN541_CART_STORAGE_KEY)
    localStorage.removeItem(KN541_CART_SELECTED_STORAGE_KEY)
    clearCart()
    setUser(null)
    toast.success('로그아웃되었습니다')
    router.push('/')
  }, [router, clearCart])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const token = localStorage.getItem('access_token')
    if (!token || !BASE) { setLoading(false); return }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) {
          setUser({
            name: json.data.name ?? json.data.username ?? '회원',
            user_id: json.data.user_id,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isMounted])

  if (!isMounted) {
    return <div className="h-9 w-24" />
  }

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800" />
  }

  /* ─── 비로그인 → 로그인 / 회원가입 ─── */
  if (!user) {
    return (
      <div className="flex items-center text-sm">
        <a
          href={`/${locale}/login`}
          className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
        >
          로그인
        </a>
        <a
          href={`/${locale}/signup`}
          className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
        >
          회원가입
        </a>
      </div>
    )
  }

  /* ─── 로그인 → 로그아웃(로그인 자리) + 마이페이지 ─── */
  return (
    <div className="flex items-center text-sm">
      <button
        type="button"
        onClick={logout}
        className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
      >
        로그아웃
      </button>
      <a
        href={`/${locale}/account`}
        className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
      >
        마이페이지
      </a>
    </div>
  )
}
