'use client'
// KN541 헤더 장바구니 버튼 — 실제 수량 배지 표시

import { useCart } from '@/lib/cart-context'
import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useAside } from '../aside'

export default function CartBtn() {
  const t = useTranslations('Common')
  const { open: openAside } = useAside()
  const { totalCount } = useCart()

  return (
    <button
      type="button"
      onClick={() => openAside('cart')}
      aria-label={t('cart')}
      className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
    >
      {/* ★ totalCount > 0 일 때만 배지 표시 */}
      {totalCount > 0 && (
        <div className="absolute top-2 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] leading-none font-medium text-white dark:bg-primary-600">
          <span className="mt-px">{totalCount > 99 ? '99+' : totalCount}</span>
        </div>
      )}
      <HugeiconsIcon icon={ShoppingCart02Icon} size={24} color="currentColor" strokeWidth={1.5} />
    </button>
  )
}
