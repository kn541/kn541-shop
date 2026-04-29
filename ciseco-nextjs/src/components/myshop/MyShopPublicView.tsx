'use client'

import ProductCard from '@/components/ProductCard'
import { adaptProduct } from '@/lib/adapters'
import { fetchPublicMyShop, recordMyShopVisit, type PublicMyShopData } from '@/lib/api/myshopPublic'
import NcImage from '@/shared/NcImage/NcImage'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  code: string
  locale: string
}

export default function MyShopPublicView({ code, locale }: Props) {
  const searchParams = useSearchParams()
  const [state, setState] = useState<
    | { phase: 'loading' }
    | { phase: 'error'; status: number; message: string }
    | { phase: 'ok'; data: PublicMyShopData }
  >({ phase: 'loading' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetchPublicMyShop(code)
      if (cancelled) return
      if (!res.ok) {
        setState({ phase: 'error', status: res.status, message: res.message })
        return
      }
      setState({ phase: 'ok', data: res.data })
    })()
    return () => {
      cancelled = true
    }
  }, [code])

  useEffect(() => {
    if (state.phase !== 'ok') return
    const ref = searchParams.get('ref') || 'direct'
    void recordMyShopVisit(code, ref)
  }, [code, searchParams, state.phase])

  if (state.phase === 'loading') {
    return (
      <div className="flex justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (state.phase === 'error') {
    const isInactive = state.status === 403
    return (
      <div className="container py-24 text-center">
        <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
          {isInactive ? '준비 중인 쇼핑몰입니다' : '쇼핑몰을 찾을 수 없습니다'}
        </p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{state.message}</p>
        <a
          href={`/${locale}`}
          className="mt-8 inline-block rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium hover:border-neutral-900 dark:border-neutral-600 dark:hover:border-white"
        >
          쇼핑몰 홈으로
        </a>
      </div>
    )
  }

  const { data } = state
  const shopId = data.shop_id
  const hrefSearch = `shop_id=${encodeURIComponent(shopId)}`

  return (
    <div className="container pb-24 pt-8">
      <div className="mb-10 overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-neutral-100 px-6 py-8 dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900 md:px-10 md:py-10">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          {data.logo_url ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800 md:h-24 md:w-24">
              <NcImage
                containerClassName="relative h-full w-full"
                src={{ src: data.logo_url, width: 200, height: 200, alt: data.shop_name || '로고' }}
                alt={data.shop_name || '로고'}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-neutral-800 md:h-24 md:w-24">
              🏪
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-3xl">
              {data.shop_name || '분양몰'}
            </h1>
            {data.shop_description ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-base">
                {data.shop_description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {data.products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          진열 중인 상품이 없습니다.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.products.map((p) => (
            <ProductCard
              key={p.product_id}
              data={adaptProduct(p)}
              hrefSearch={hrefSearch}
              cartShopId={shopId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
