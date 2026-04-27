'use client'

import { adaptProducts } from '@/lib/adapters'
import type { Product } from '@/lib/api/products'
import type { TProductItem } from '@/data/data'
import { mypageFetch, MypageApiError } from '@/lib/mypage/api'
import ProductCard from '@/components/ProductCard'
import ButtonCircle from '@/shared/Button/ButtonCircle'
import { useRouter } from '@/i18n/navigation'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface ProductListPayload {
  items: Product[]
  total: number
  page: number
  size: number
}

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const qRaw = searchParams.get('q')?.trim() ?? ''
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<TProductItem[]>([])
  const [total, setTotal] = useState(0)

  const runSearch = useCallback(async (q: string) => {
    if (!q) {
      setItems([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: q,
        keyword: q,
        page: '1',
        size: '20',
      })
      const data = await mypageFetch<ProductListPayload>(`/products?${params.toString()}`)
      const rawItems = data?.items ?? []
      setItems(adaptProducts(rawItems))
      setTotal(data?.total ?? rawItems.length)
    } catch (e) {
      if (e instanceof MypageApiError && e.status === 401) {
        setItems([])
        setTotal(0)
      } else {
        setItems([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void runSearch(qRaw)
  }, [qRaw, runSearch])

  return (
    <div>
      <div className="h-24 w-full bg-primary-50 2xl:h-28 dark:bg-white/10" />
      <div className="container">
        <header className="mx-auto -mt-10 flex max-w-2xl flex-col lg:-mt-7">
          <form
            className="relative w-full"
            onSubmit={e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const input = String(fd.get('q') ?? '').trim()
              router.push(`/search?q=${encodeURIComponent(input)}`)
            }}
          >
            <fieldset className="text-neutral-500 dark:text-neutral-300">
              <label htmlFor="search-q" className="sr-only">
                상품 검색
              </label>
              <HugeiconsIcon
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-2xl sm:left-5"
                icon={Search01Icon}
                size={24}
              />
              <input
                className="block w-full rounded-xl border bg-white py-4 pr-5 pl-12 placeholder:text-zinc-500 focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 sm:py-5 sm:text-sm md:pl-15 dark:bg-neutral-800 dark:placeholder:text-zinc-400 dark:focus:ring-primary-600/25"
                id="search-q"
                name="q"
                type="search"
                defaultValue={qRaw}
                placeholder="상품명을 입력하세요"
              />
              <ButtonCircle
                className="absolute top-1/2 right-2 -translate-y-1/2 sm:right-2.5"
                size="size-11"
                type="submit"
              >
                <ArrowRightIcon className="size-5 text-white" />
              </ButtonCircle>
            </fieldset>
          </form>
        </header>
      </div>

      <div className="container flex flex-col gap-y-10 py-16 lg:py-20">
        {qRaw && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            &quot;{qRaw}&quot; 검색 결과 {total.toLocaleString('ko-KR')}건
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        )}

        {!loading && qRaw && items.length === 0 && (
          <p className="py-16 text-center text-neutral-500">검색 결과가 없습니다.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(item => (
              <ProductCard data={item} key={item.id} />
            ))}
          </div>
        )}

        {!qRaw && !loading && (
          <p className="py-12 text-center text-sm text-neutral-500">검색어를 입력한 뒤 검색해 주세요.</p>
        )}
      </div>
    </div>
  )
}
