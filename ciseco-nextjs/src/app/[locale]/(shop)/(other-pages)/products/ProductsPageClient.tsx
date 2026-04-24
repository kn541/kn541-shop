'use client'
// KN541 상품목록 — 클라이언트 렌더링
// fix: 총 상품 수 표시 (total props → 헤더에 렌더)
// fix: 빈 상태(Empty State) UX — 다른 카테고리 탐색 유도
// fix: 브레드크럼, 카테고리 버튼, 정렬 메뉴 유지

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
  delivery?: { sc_type?: number; shipping_fee?: number; free_over?: number | null }
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
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ★ 빈 상태 — 카테고리 유도 컴포넌트
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

  // 카테고리 이동 — page, sort 유지하되 page는 1로 초기화
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

  // 페이지 이동 — cid, sort 유지
  const goPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  // 홈 URL
  const homeUrl = pathname.replace(/\/products.*/, '')

  // 상위 카테고리 id
  const parentCid = breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].id : null

  const pageTitle = currentCategory?.category_name ?? '전체 상품'

  // 페이지 번호 배열 (최대 5개)
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

      {/* ── 브레드크럼 ── */}
      <nav className="mb-4 flex items-center flex-wrap gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => router.push(homeUrl)}
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
      </nav>

      {/* ── 페이지 타이틀 + ★ 총 상품 수 ── */}
      <div className="mb-6 flex items-end gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {pageTitle}
        </h1>
        {/* ★ total이 0이 아닐 때만 표시 */}
        {total > 0 && (
          <span className="mb-1 text-sm text-neutral-400">
            총 <strong className="text-neutral-700 dark:text-neutral-300">{total.toLocaleString('ko-KR')}</strong>개
          </span>
        )}
      </div>

      {/* ── 하위 카테고리 버튼 ── */}
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

      {/* ── 정렬 메뉴 ── */}
      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* ── 상품 그리드 or 빈 상태 ── */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard data={product as any} key={product.id} />
          ))}
        </div>
      ) : (
        // ★ 개선된 빈 상태 UX
        <EmptyState onReset={() => goCategory(null)} />
      )}

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2 lg:mt-20">
          <button
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
          >
            ‹
          </button>

          {getPageNumbers()[0] > 1 && (
            <>
              <button
                onClick={() => goPage(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
              >
                1
              </button>
              {getPageNumbers()[0] > 2 && <span className="text-neutral-400">…</span>}
            </>
          )}

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
