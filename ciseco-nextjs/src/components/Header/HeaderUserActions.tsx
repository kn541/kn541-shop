'use client'
// KN541 쇼핑몰 — 헤더 우측 유저 액션
// 비로그인: 로그인 / 회원가입
// 로그인: 로그아웃 + 마이페이지 (회원명은 HeaderUserName)

import { useHeaderUser } from '@/hooks/useHeaderUser'
import {
  KN541_CART_SELECTED_STORAGE_KEY,
  KN541_CART_STORAGE_KEY,
  useCart,
} from '@/lib/cart-context'
import { useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

export default function HeaderUserActions() {
  const locale = useLocale()
  const router = useRouter()
  const { clearCart } = useCart()
  const { isMounted, loading, isLoggedIn, clearUser } = useHeaderUser()
  const tCommon  = useTranslations('Common')
  const tAccount = useTranslations('Account')
  const tHeader  = useTranslations('Header')

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_type')
    localStorage.removeItem(KN541_CART_STORAGE_KEY)
    localStorage.removeItem(KN541_CART_SELECTED_STORAGE_KEY)
    clearCart()
    clearUser()
    toast.success(tHeader('loggedOut'))
    router.push('/')
  }, [router, clearCart, clearUser, tHeader])

  if (!isMounted) {
    return <div className="h-9 w-24" />
  }

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800" />
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center text-sm">
        <a
          href={`/${locale}/login`}
          className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
        >
          {tCommon('login')}
        </a>
        <a
          href={`/${locale}/signup`}
          className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
        >
          {tCommon('signup')}
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center text-sm">
      <button
        type="button"
        onClick={logout}
        className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
      >
        {tCommon('logout')}
      </button>
      <a
        href={`/${locale}/account`}
        className="rounded-md px-2.5 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
      >
        {tAccount('title')}
      </a>
    </div>
  )
}
