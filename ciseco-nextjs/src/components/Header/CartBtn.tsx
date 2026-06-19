'use client'
// KN541 헤더 장바구니 버튼 — 한글 텍스트 + 수량 배지
// fix(#19): 비로그인 시 배지 숨김 — 로그아웃 후 장바구니 표시 방지

import { useCart } from '@/lib/cart-context'
import { useAside } from '../aside'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export default function CartBtn() {
  const router = useRouter()
  const { open: openAside } = useAside()
  const { totalCount } = useCart()
  const t = useTranslations('Common')

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'))
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem('access_token'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('access_token'))
  }, [totalCount])

  const onCartClick = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.push('/login')
      return
    }
    openAside('cart')
  }

  const showBadge = isLoggedIn && totalCount > 0

  return (
    <button
      type="button"
      onClick={onCartClick}
      aria-label={t('cart')}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2.5 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 md:min-h-0 md:min-w-0"
    >
      <ShoppingBagIcon className="h-6 w-6 md:hidden" aria-hidden />
      <span className="hidden whitespace-nowrap md:inline">{t('cart')}</span>
      {showBadge && (
        <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-medium leading-none text-white dark:bg-primary-600">
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </button>
  )
}
