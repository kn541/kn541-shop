'use client'

import ProductCard from '@/components/ProductCard'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import {
  fetchAllShopPublicItems,
  mapShopListItemToProduct,
  type ShopListKind,
  type ShopPublicListItem,
} from '@/lib/api/shopPublicLists'
import { adaptProduct } from '@/lib/adapters'
import { PRODUCT_LIST_PAGE_SIZE } from '@/lib/product-list-constants'
import type { ProductSortValue } from '@/lib/product-list-sort'
import { normalizeProductSortParam } from '@/lib/product-list-sort'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { getPaginationItems } from '@/utils/paginationRange'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = PRODUCT_LIST_PAGE_SIZE

function sortShopItems(items: ShopPublicListItem[], sort: ProductSortValue): ShopPublicListItem[] {
  const copy = [...items]
  const sales = (r: ShopPublicListItem) => Number(r.sort_sales_count ?? 0)
  const reviews = (r: ShopPublicListItem) => Number(r.sort_review_count ?? 0)
  const tie = (a: ShopPublicListItem, b: ShopPublicListItem) =>
    String(b.created_at).localeCompare(String(a.created_at))

  switch (sort) {
    case 'newest':
      copy.sort((a, b) => tie(a, b))
      break
    case 'sales_count':
      copy.sort((a, b) => sales(b) - sales(a) || tie(a, b))
      break
    case 'review_count':
      copy.sort((a, b) => reviews(b) - reviews(a) || tie(a, b))
      break
    case 'price_asc':
      copy.sort((a, b) => Number(a.sale_price) - Number(b.sale_price) || tie(a, b))
      break
    case 'price_desc':
      copy.sort((a, b) => Number(b.sale_price) - Number(a.sale_price) || tie(a, b))
      break
    default:
      copy.sort((a, b) => tie(a, b))
  }
  return copy
}

function buildQuery(page: number, sort: ProductSortValue) {
  const q = new URLSearchParams()
  if (page > 1) q.set('page', String(page))
  q.set('sort', sort)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export default function ShopListingPageClient({
  kind,
  title,
  description,
}: {
  kind: ShopListKind
  title: string
  description: string
}) {
  const pathname = usePathname()
  const sp = useSearchParams()

  const urlPage = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
  const urlSort = normalizeProductSortParam(sp.get('sort'))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortedAll, setSortedAll] = useState<ShopPublicListItem[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      setSortedAll([])
      try {
        const res = await fetchAllShopPublicItems(kind)
        if (cancelled) return
        setSortedAll(sortShopItems(res.items, urlSort))
        setTotal(res.total)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
        setSortedAll([])
        setTotal(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [kind, urlSort])

  const displayItems = useMemo(() => {
    const start = (urlPage - 1) * PAGE_SIZE
    return sortedAll.slice(start, start + PAGE_SIZE)
  }, [sortedAll, urlPage])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageItemsRange = getPaginationItems(urlPage, totalPages)
  const isValueUpEmpty = kind === 'value-up' && !loading && total === 0

  return (
    <main className="kn-shop-listing container mx-auto max-w-[1280px] px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 md:text-base">{description}</p>
          ) : null}
        </div>
        {!isValueUpEmpty && <FilterSortByMenuListBox className="ml-auto sm:ml-0" />}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {isValueUpEmpty && (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center dark:border-neutral-600 dark:bg-neutral-900/40">
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-200">준비 중인 상품입니다</p>
          <p className="mt-2 text-sm text-neutral-500">곧 멋진 밸류업 상품으로 찾아뵙겠습니다.</p>
        </div>
      )}

      {!isValueUpEmpty && loading && (
        <div className="py-20 text-center text-neutral-500">불러오는 중…</div>
      )}

      {!isValueUpEmpty && !loading && displayItems.length === 0 && !error && (
        <div className="py-20 text-center text-neutral-500">등록된 상품이 없습니다.</div>
      )}

      {!isValueUpEmpty && !loading && displayItems.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 xl:gap-x-8">
            {displayItems.map((row) => (
              <ProductCard key={row.product_id} data={adaptProduct(mapShopListItemToProduct(row)) as any} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-14 flex justify-center">
              <Pagination className="mx-auto">
                <PaginationPrevious href={urlPage > 1 ? `${pathname}${buildQuery(urlPage - 1, urlSort)}` : null} />
                <PaginationList>
                  {pageItemsRange.map((item, idx) =>
                    item === 'gap' ? (
                      <PaginationGap key={`gap-${idx}`} />
                    ) : (
                      <PaginationPage
                        key={item}
                        href={`${pathname}${buildQuery(item as number, urlSort)}`}
                        current={item === urlPage}
                      >
                        {item}
                      </PaginationPage>
                    ),
                  )}
                </PaginationList>
                <PaginationNext
                  href={urlPage < totalPages ? `${pathname}${buildQuery(urlPage + 1, urlSort)}` : null}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </main>
  )
}
