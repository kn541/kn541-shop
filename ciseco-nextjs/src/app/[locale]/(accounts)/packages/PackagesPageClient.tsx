'use client'

// 마이페이지 — 패키지(동사가치) 상품: 즉시구매 → /checkout (토스페이먼츠 기존 플로우)

import { getProductImageUrl, type Product } from '@/lib/api/products'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/formatPrice'
import { isLoggedIn } from '@/lib/mypage/auth'
import { useProfile } from '@/lib/mypage/useProfile'
import { useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function canOrder(p: Product): string | null {
  const ps = String(p.product_status ?? '').toUpperCase()
  if (ps !== 'ON_SALE' && ps !== 'ACTIVE') return '현재 구매할 수 없는 상품입니다.'
  if ((Number(p.stock_qty) || 0) <= 0) return '품절된 상품입니다.'
  return null
}

export default function PackagesPageClient({ initialProducts }: { initialProducts: Product[] }) {
  const t = useTranslations('Account')
  const router = useRouter()
  const locale = useLocale()
  const { data: profile, loading: profileLoading } = useProfile()
  const { clearCart, addItem } = useCart()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isLoggedIn()) {
      router.replace(`/login?redirect=${encodeURIComponent(`/${locale}/packages`)}`)
      return
    }
    setAuthChecked(true)
  }, [locale, router])

  const title = t('packages')

  const handleBuy = (p: Product) => {
    const err = canOrder(p)
    if (err) {
      toast.error(err)
      return
    }
    const pid = p.product_id || p.id || ''
    if (!pid) {
      toast.error('상품 정보가 올바르지 않습니다.')
      return
    }
    clearCart()
    addItem({
      productId: pid,
      name: p.product_name || '',
      price: Number(p.sale_price) || 0,
      quantity: 1,
      image: getProductImageUrl(p),
      shippingFee: Number(p.shipping_fee ?? p.sc_price ?? 0),
      freeShippingOver: Number(p.free_shipping_over ?? p.sc_minimum ?? 0) || 0,
      scType: Number(p.sc_type ?? 2),
      stockQty: Number(p.stock_qty ?? 0),
      product_type: '005',
    })
    router.push(`/checkout`)
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>

      {initialProducts.length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900">
          표시할 패키지 상품이 없습니다.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {initialProducts.map(p => {
            const img = getProductImageUrl(p)
            const block = canOrder(p)
            const sale = Number(p.sale_price) || 0
            return (
              <li
                key={p.product_id || p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
                  <Image src={img} alt="" fill className="object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                    {p.product_name}
                  </h2>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatPrice(sale)}</p>
                  <button
                    type="button"
                    disabled={Boolean(block)}
                    onClick={() => handleBuy(p)}
                    className="mt-auto w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    구매하기
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
