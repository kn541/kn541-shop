'use client'

import { MainProductCard } from '@/components/main-page/MainProductCard'
import {
  fetchAllShopPublicItems,
  fetchShopPublicList,
  mapShopListItemToProduct,
  type ShopListKind,
  type ShopPublicListItem,
} from '@/lib/api/shopPublicLists'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { getPaginationItems } from '@/utils/paginationRange'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 20

export type SortMode = 'api' | 'newest' | 'price_asc' | 'price_desc'

function sortItems(items: ShopPublicListItem[], mode: SortMode): ShopPublicListItem[] {
  const copy = [...items]
  if (mode === 'newest') {
    copy.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    return copy
  }
  if (mode === 'price_asc') {
    copy.sort((a, b) => Number(a.sale_price) - Number(b.sale_price))
    return copy
  }
  if (mode === 'price_desc') {
    copy.sort((a, b) => Number(b.sale_price) - Number(a.sale_price))
    return copy
  }
  return copy
}

function buildQuery(page: number, sort: SortMode) {
  const q = new URLSearchParams()
  if (page > 1) q.set('page', String(page))
  if (sort !== 'api') q.set('sort', sort)
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
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const urlPage = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
  const urlSort = (sp.get('sort') || 'api') as SortMode
  const sort: SortMode = ['api', 'newest', 'price_asc', 'price_desc'].includes(urlSort) ? urlSort : 'api'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** API 순서 모드: 현재 페이지 원본 */
  const [pageItems, setPageItems] = useState<ShopPublicListItem[]>([])
  const [total, setTotal] = useState(0)

  /** 정렬 모드: 전체 목록 (fetch 후) */
  const [sortedBuffer, setSortedBuffer] = useState<ShopPublicListItem[] | null>(null)
  const [bestMeta, setBestMeta] = useState<{ weight?: { qty: number; order: number; sales: number }; window_days?: number } | null>(null)

  const syncUrl = useCallback(
    (page: number, nextSort: SortMode) => {
      router.replace(`${pathname}${buildQuery(page, nextSort)}`, { scroll: false })
    },
    [pathname, router],
  )

  const loadApiPage = useCallback(
    async (page: number) => {
      setLoading(true)
      setError(null)
      setSortedBuffer(null)
      try {
        const res = await fetchShopPublicList(kind, page, PAGE_SIZE)
        setPageItems(res.items)
        setTotal(res.total)
        if (kind === 'best') {
          setBestMeta({ weight: res.weight, window_days: res.window_days })
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
        setPageItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    [kind],
  )

  const loadSortedAll = useCallback(
    async (mode: SortMode) => {
      setLoading(true)
      setError(null)
      setSortedBuffer(null)
      try {
        const res = await fetchAllShopPublicItems(kind)
        setSortedBuffer(sortItems(res.items, mode))
        setTotal(res.total)
        if (kind === 'best') {
          setBestMeta({ weight: res.weight, window_days: res.window_days })
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
        setSortedBuffer([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    [kind],
  )

  useEffect(() => {
    if (sort === 'api') {
      void loadApiPage(urlPage)
    }
  }, [sort, urlPage, loadApiPage])

  useEffect(() => {
    if (sort !== 'api') {
      void loadSortedAll(sort)
    }
  }, [sort, loadSortedAll])

  const displayItems = useMemo(() => {
    if (sort === 'api') {
      return pageItems
    }
    if (!sortedBuffer) return []
    const sliceFrom = (urlPage - 1) * PAGE_SIZE
    return sortedBuffer.slice(sliceFrom, sliceFrom + PAGE_SIZE)
  }, [sort, pageItems, sortedBuffer, urlPage])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const onSortChange = (next: SortMode) => {
    syncUrl(1, next)
  }

  const pageItemsRange = getPaginationItems(urlPage, totalPages)

  const isValueUpEmpty = kind === 'value-up' && !loading && total === 0

  return (
    <main className="kn-shop-listing container mx-auto max-w-[1280px] px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 md:text-base">{description}</p>
          {kind === 'best' && bestMeta?.window_days != null && (
            <p className="mt-1 text-xs text-neutral-400">
              집계: 최근 {bestMeta.window_days}일 판매 기준
              {bestMeta.weight
                ? ` · 가중치 수량 ${(bestMeta.weight.qty * 100).toFixed(0)}% / 주문 ${(bestMeta.weight.order * 100).toFixed(0)}% / 매출 ${(bestMeta.weight.sales * 100).toFixed(0)}%`
                : ''}
              {` · 부족 시 누적 인기로 보충`}
            </p>
          )}
        </div>
        {!isValueUpEmpty && (
          <label className="flex shrink-0 items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <span className="whitespace-nowrap text-neutral-500">정렬</span>
            <select
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortMode)}
              aria-label="상품 정렬"
            >
              <option value="api">추천순</option>
              <option value="newest">신상품순</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
            </select>
          </label>
        )}
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
          <div className="best-grid grid grid-cols-2 justify-center gap-x-8 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {displayItems.map((row) => (
              <MainProductCard key={row.product_id} mode="api" product={mapShopListItemToProduct(row)} compact />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-14 flex justify-center">
              <Pagination className="mx-auto">
                <PaginationPrevious href={urlPage > 1 ? `${pathname}${buildQuery(urlPage - 1, sort)}` : null} />
                <PaginationList>
                  {pageItemsRange.map((item, idx) =>
                    item === 'gap' ? (
                      <PaginationGap key={`gap-${idx}`} />
                    ) : (
                      <PaginationPage
                        key={item}
                        href={`${pathname}${buildQuery(item as number, sort)}`}
                        current={item === urlPage}
                      >
                        {item}
                      </PaginationPage>
                    ),
                  )}
                </PaginationList>
                <PaginationNext
                  href={urlPage < totalPages ? `${pathname}${buildQuery(urlPage + 1, sort)}` : null}
                />
              </Pagination>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-neutral-400">
            {total.toLocaleString('ko-KR')}개 중 {(urlPage - 1) * PAGE_SIZE + 1}–
            {Math.min(urlPage * PAGE_SIZE, total).toLocaleString('ko-KR')} 표시
          </p>
        </>
      )}
    </main>
  )
}
