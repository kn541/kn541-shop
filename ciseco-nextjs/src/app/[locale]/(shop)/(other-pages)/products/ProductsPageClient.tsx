'use client'
// KN541 상품목록 — 무한스크롤 방식

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import ScrollToTop from '@/components/ScrollToTop'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { Divider } from '@/components/Divider'
import type { CategoryInfo } from './page'
import { applyProductSortToSearchParams, normalizeProductSortParam } from '@/lib/product-list-sort'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'
const PAGE_SIZE = 20

interface ProductItem {
  id: string
  title?: string
  handle?: string
  price?: number
  featuredImage?: { src: string; width: number; height: number; alt: string }
  images?: any[]
  reviewNumber?: number
  rating?: number
  status?: string
  options?: any[]
  selectedOptions?: any[]
  delivery?: { sc_type?: number; shipping_fee?: number; free_over?: number | null }
}

interface Props {
  products: ProductItem[]
  currentCategory: CategoryInfo | null
  breadcrumbs: CategoryInfo[]
  childCategories: CategoryInfo[]
  hasNextInitial: boolean
  currentPage: number
  totalPages: number
  total: number
  pageTitle?: string
}

function ChevronIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 py-12 px-6 text-center">
      <div className="text-5xl">🔍</div>
      <div>
        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">상품이 없습니다</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          선택한 카테고리에 등록된 상품이 없습니다.
        </p>
      </div>
      <button
        onClick={onReset}
        className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white transition-colors"
      >
        전체 상품 보기
      </button>
    </div>
  )
}

/** API 상품 → 컴포넌트 형식 매핑 */
function mapApiProduct(p: any): ProductItem {
  const pid = String(p.product_id || p.id || '')
  let status = '판매중'
  if (p.product_status === 'SOLDOUT' || p.is_soldout) status = '품절'
  else if (p.product_status === 'DISCONTINUED' || p.is_discontinued) status = '판매종료'
  else if (p.is_new) status = '신상품'
  else if (p.is_best) status = '베스트'
  else if (p.is_sale) status = '할인'
  return {
    id: pid,
    handle: pid,
    title: p.product_name,
    price: p.sale_price,
    featuredImage: p.thumbnail_url
      ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
      : { src: '/placeholder-product.jpg', width: 600, height: 600, alt: p.product_name },
    images: [],
    reviewNumber: 0,
    rating: 0,
    status,
    options: [],
    selectedOptions: [],
    delivery: {
      sc_type: p.sc_type ?? 1,
      shipping_fee: p.shipping_fee ?? 0,
      free_over: p.free_shipping_over ?? null,
    },
  }
}

export default function ProductsPageClient({
  products: initialProducts,
  currentCategory,
  breadcrumbs,
  childCategories,
  hasNextInitial,
  pageTitle: pageTitleProp,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCid = searchParams.get('cid')
  const activeSort = normalizeProductSortParam(searchParams.get('sort'))

  // ★ 무한스크롤 상태
  const [products, setProducts] = useState<ProductItem[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(hasNextInitial)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 카테고리/정렬 변경 시 리셋
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setHasNext(hasNextInitial)
  }, [initialProducts, hasNextInitial])

  // ★ 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (loading || !hasNext) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const qs = new URLSearchParams({ page: String(nextPage), size: String(PAGE_SIZE) })
      if (activeCid) qs.set('category_id', activeCid)
      applyProductSortToSearchParams(qs, activeSort)

      const res = await fetch(`${API_BASE}/products?${qs}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      const newItems: any[] = data?.data?.items ?? []
      const nextHasNext = data?.data?.has_next ?? false

      setProducts(prev => [...prev, ...newItems.map(mapApiProduct)])
      setPage(nextPage)
      setHasNext(nextHasNext)
    } catch (err) {
      console.error('[infinite-scroll] loadMore error:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasNext, page, activeCid, activeSort])

  // ★ IntersectionObserver — 하단 감지 시 자동 로드
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const goCategory = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (id) {
      params.set('cid', id)
    } else {
      params.delete('cid')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const homeUrl = pathname.replace(/\/products.*/, '').replace(/\/(preorder|value-up|best|new|recommend).*/, '')
  const parentCid = breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].id : null
  const displayTitle = pageTitleProp ?? currentCategory?.category_name ?? '전체 상품'

  return (
    <div className="container py-10 lg:py-16">

      {/* 브레드크럼 */}
      <nav className="mb-4 flex items-center flex-wrap gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => router.push(homeUrl || '/')}
          className="hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          홈
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <ChevronIcon />
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-neutral-900 dark:text-white">{crumb.category_name}</span>
            ) : (
              <button
                onClick={() => goCategory(crumb.id)}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {crumb.category_name}
              </button>
            )}
          </span>
        ))}
        {breadcrumbs.length === 0 && pageTitleProp && (
          <span className="flex items-center gap-1.5">
            <ChevronIcon />
            <span className="font-semibold text-neutral-900 dark:text-white">{pageTitleProp}</span>
          </span>
        )}
      </nav>

      {/* 페이지 타이틀 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {displayTitle}
        </h1>
      </div>

      {/* 하위 카테고리 버튼 */}
      {childCategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {currentCategory && (
            <button
              onClick={() => goCategory(parentCid)}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white transition-colors"
            >
              ← 전체
            </button>
          )}
          {childCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => goCategory(cat.id)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeCid === cat.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white',
              ].join(' ')}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      <Divider className="mb-8" />

      {/* 정렬 메뉴 */}
      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* 상품 그리드 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard data={product as any} key={product.id} />
          ))}
        </div>
      ) : (
        <EmptyState onReset={() => goCategory(null)} />
      )}

      {/* ★ 로딩 인디케이터 */}
      {loading && (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-600 dark:border-t-white" />
        </div>
      )}

      {/* ★ 무한스크롤 감지 센티널 */}
      {hasNext && <div ref={sentinelRef} className="h-1" />}

      {/* 더 이상 없음 표시 */}
      {!hasNext && products.length > PAGE_SIZE && (
        <p className="mt-12 text-center text-sm text-neutral-400">
          모든 상품을 불러왔습니다
        </p>
      )}

      {/* ★ 상단이동 버튼 */}
      <ScrollToTop />
    </div>
  )
}
