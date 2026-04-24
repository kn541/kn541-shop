'use client'
// KN541 상품목록 — 브레드크럼(홈>카테고리>...) + 하위카테고리 버튼
// fix: 실제 페이지네이션 연동 (currentPage/totalPages)

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { Divider } from '@/components/Divider'
import type { CategoryInfo } from './page'

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
}

interface Props {
  products: ProductItem[]
  currentCategory: CategoryInfo | null
  breadcrumbs: CategoryInfo[]
  childCategories: CategoryInfo[]
  currentPage: number
  totalPages: number
  total: number
}

function ChevronIcon() {
  return (
    <svg
      className="w-3 h-3 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function ProductsPageClient({
  products,
  currentCategory,
  breadcrumbs,
  childCategories,
  currentPage,
  totalPages,
  total,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCid = searchParams.get('cid')

  // 카테고리 이동 — page는 1로 초기화
  const goCategory = (id: string | null) => {
    if (id) {
      router.push(`${pathname}?cid=${id}`)
    } else {
      router.push(pathname)
    }
  }

  // 페이지 이동 — cid 유지
  const goPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  // 홈(=전체 상품) URL
  const homeUrl = pathname.replace(/\/products.*/, '')

  const pageTitle = currentCategory?.category_name ?? '전체 상품'

  // 브레드크럼에서 한 단계 위 카테고리 id
  const parentCid =
    breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].id : null

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const half = 2
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, currentPage + half)
    if (currentPage <= half) end = Math.min(totalPages, 5)
    if (currentPage >= totalPages - half) start = Math.max(1, totalPages - 4)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <div className="container py-10 lg:py-16">
      {/* ── 브레드크럼: 홈 > 카테고리 > 하위카테고리 ── */}
      <nav className="mb-4 flex items-center flex-wrap gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        {/* 홈 (= 전체 상품) */}
        <button
          onClick={() => router.push(homeUrl)}
          className="hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          홈
        </button>

        {/* 카테고리 체인 */}
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <ChevronIcon />
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-neutral-900 dark:text-white">
                {crumb.category_name}
              </span>
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
      </nav>

      {/* ── 페이지 타이틀 + 총 상품 수 ── */}
      <div className="mb-6 flex items-end gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {pageTitle}
        </h1>
        {total > 0 && (
          <span className="mb-1 text-sm text-neutral-400">총 {total.toLocaleString('ko-KR')}개</span>
        )}
      </div>

      {/* ── 하위 카테고리 버튼 ── */}
      {childCategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {/* 현재 카테고리 선택 중이면 상위로 가는 ← 전체 버튼 */}
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

      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* ── 상품 그리드 ── */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard data={product as any} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">상품이 없습니다.</p>
        </div>
      )}

      {/* ── 실제 페이지네이션 ── */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2 lg:mt-20">
          {/* 이전 */}
          <button
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
          >
            ‹
          </button>

          {/* 첫 페이지 + 생략 */}
          {getPageNumbers()[0] > 1 && (
            <>
              <button
                onClick={() => goPage(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
              >
                1
              </button>
              {getPageNumbers()[0] > 2 && (
                <span className="text-neutral-400">…</span>
              )}
            </>
          )}

          {/* 페이지 번호들 */}
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => goPage(p)}
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
                p === currentPage
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white',
              ].join(' ')}
            >
              {p}
            </button>
          ))}

          {/* 마지막 페이지 + 생략 */}
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <>
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                <span className="text-neutral-400">…</span>
              )}
              <button
                onClick={() => goPage(totalPages)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* 다음 */}
          <button
            onClick={() => goPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
