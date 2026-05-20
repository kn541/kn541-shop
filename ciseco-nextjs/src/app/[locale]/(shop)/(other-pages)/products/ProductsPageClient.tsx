'use client'
// KN541 상품목록 — URL ?page= 페이지네이션

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import ScrollToTop from '@/components/ScrollToTop'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { Divider } from '@/components/Divider'
import type { CategoryInfo } from './page'
import { PRODUCT_LIST_PAGE_SIZE } from '@/lib/product-list-constants'
import ProductListPagination from './ProductListPagination'

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
  pageSize: number
  total: number
  hasNext: boolean
  pageTitle?: string
}

function ChevronIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function EmptyState({
  onReset,
  generic,
}: {
  onReset: () => void
  generic?: boolean
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-neutral-200 py-12 px-6 text-center dark:border-neutral-700">
      <div className="text-5xl">🔍</div>
      <div>
        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">상품이 없습니다</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {generic
            ? '등록된 상품이 없습니다.'
            : '선택한 카테고리에 등록된 상품이 없습니다.'}
        </p>
      </div>
      {!generic && (
        <button
          onClick={onReset}
          className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
        >
          전체 상품 보기
        </button>
      )}
    </div>
  )
}

export default function ProductsPageClient({
  products,
  currentCategory,
  breadcrumbs,
  childCategories,
  currentPage,
  pageSize = PRODUCT_LIST_PAGE_SIZE,
  total,
  hasNext,
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
  const displayTitle = pageTitleProp ?? currentCategory?.category_name ?? '전체 상품'

  const showPagination =
    products.length > 0 && (currentPage > 1 || hasNext || (total > 0 && total > pageSize))

  return (
    <div className="container py-10 lg:py-16">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => router.push(homeUrl || '/')}
          className="transition-colors hover:text-neutral-900 dark:hover:text-white"
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
                className="transition-colors hover:text-neutral-900 dark:hover:text-white"
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {displayTitle}
        </h1>
      </div>

      {childCategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {currentCategory && (
            <button
              onClick={() => goCategory(parentCid)}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
            >
              ← 전체
            </button>
          )}
          {childCategories.map(cat => (
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

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-3 md:gap-x-5 xl:grid-cols-5 xl:gap-x-8 [&>*]:min-w-0">
            {products.map(product => (
              <ProductCard data={product as any} key={product.id} />
            ))}
          </div>

          {showPagination ? (
            <ProductListPagination
              page={currentPage}
              pageSize={pageSize}
              total={total}
              hasNext={hasNext}
              pathname={pathname}
              searchParamsString={searchParams.toString()}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          onReset={() => goCategory(null)}
          generic={!currentCategory && !!pageTitleProp}
        />
      )}

      <ScrollToTop />
    </div>
  )
}
