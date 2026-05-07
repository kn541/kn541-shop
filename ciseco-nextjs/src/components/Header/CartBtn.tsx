'use client'
// KN541 헤더 장바구니 버튼 — 한글 텍스트 + 수량 배지

import { useCart } from '@/lib/cart-context'
import { useAside } from '../aside'

export default function CartBtn() {
  const { open: openAside } = useAside()
  const { totalCount } = useCart()

  return (
    <button
      type="button"
      onClick={() => openAside('cart')}
      aria-label="장바구니"
      className="relative inline-flex items-center rounded-md px-2.5 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap"
    >
      <span>장바구니</span>
      {totalCount > 0 && (
        <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-medium leading-none text-white dark:bg-primary-600">
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </button>
  )
}
