'use client'
// KN541 상품목록 — 클라이언트 렌더링
// fix: 페이지네이션 모듈화 (ProductListPagination 사용)

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import ProductListPagination from '@/components/ProductListPagination'
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
  /** 외부에서 타이틀 직접 지정 (category_name 대신 사용) */
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

export default function ProductsPageClient({
  products,
  currentCategory,
  breadcrumbs,
  childCategories,
  currentPage,
  totalPages,
  total,
  pageTitle: pageTitleProp,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCid = searchParams.get('cid')

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

  // prop 우선, 없으면 카테고리명, 없으면 기본값
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

      {/* 페이지 타이틀 + 총 상품 수 */}
      <div className="mb-6 flex items-end gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {displayTitle}
        </h1>
        {total > 0 && (
          <span className="mb-1 text-sm text-neutral-400">
            총 <strong className="text-neutral-700 dark:text-neutral-300">{total.toLocaleString('ko-KR')}</strong>개
          </span>
        )}
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

      {/* 상품 그리드 or 빈 상태 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard data={product as any} key={product.id} />
          ))}
        </div>
      ) : (
        <EmptyState onReset={() => goCategory(null)} />
      )}

      {/* ★ 모듈화된 페이지네이션 */}
      <ProductListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        pageSize={20}
      />
    </div>
  )
}
