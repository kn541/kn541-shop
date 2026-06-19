'use client'

import { useHeaderUser } from '@/hooks/useHeaderUser'
import { useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline'
import CartBtn from './CartBtn'

/** 검색바 우측: 회원명 · 장바구니 · 로그인/회원가입 또는 로그아웃/마이페이지 */
export default function HeaderUserBar() {
  const locale = useLocale()
  const router = useRouter()
  const { isMounted, loading, isLoggedIn, greeting, clearUser } = useHeaderUser()
  const tCommon  = useTranslations('Common')
  const tAccount = useTranslations('Account')
  const tHeader  = useTranslations('Header')

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_type')
    // fix(#19): clearCart 제거 — localStorage 유지하여 재로그인 시 장바구니 복원
    // CartBtn이 비로그인 시 배지 숨김 처리하므로 UI에서는 0건 표시
    clearUser()
    toast.success(tHeader('loggedOut'))
    router.push('/')
  }, [router, clearUser, tHeader])

  const iconBtnCls =
    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 md:hidden'

  if (!isMounted) {
    return (
      <>
        <div className="h-9 w-11 md:w-16" />
        <CartBtn />
        <div className="h-9 w-11 md:w-24" />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <div className="hidden h-9 w-14 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800 sm:block" />
        <CartBtn />
        <div className="h-9 w-11 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800 md:w-24" />
      </>
    )
  }

  return (
    <>
      {isLoggedIn && greeting ? (
        <span
          className="max-w-[88px] truncate whitespace-nowrap px-1 text-xs font-medium text-neutral-800 dark:text-neutral-100 sm:max-w-none sm:text-sm hidden md:inline"
          aria-label={tHeader('welcomeAria', { greeting })}
          title={greeting}
        >
          {greeting}
        </span>
      ) : null}

      <CartBtn />

      {!isLoggedIn ? (
        <>
          <a href={`/${locale}/login`} className={iconBtnCls} aria-label={tCommon('login')}>
            <UserIcon className="h-6 w-6" aria-hidden />
          </a>
          <div className="hidden items-center text-sm md:flex">
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
        </>
      ) : (
        <>
          <a href={`/${locale}/account`} className={iconBtnCls} aria-label={tAccount('title')}>
            <UserIcon className="h-6 w-6" aria-hidden />
          </a>
          <button
            type="button"
            onClick={logout}
            className={iconBtnCls}
            aria-label={tCommon('logout')}
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden />
          </button>
          <div className="hidden items-center text-sm md:flex">
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
        </>
      )}
    </>
  )
}
