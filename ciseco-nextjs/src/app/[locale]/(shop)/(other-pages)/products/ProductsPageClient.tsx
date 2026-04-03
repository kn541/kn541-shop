'use client'
// KN541 상품목록 — 카테고리 브레드크럼 + 하위카테고리 버튼

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { Divider } from '@/components/Divider'
import { TProductItem } from '@/data/data'
import type { CategoryInfo } from './page'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'

interface Props {
  products: TProductItem[]
  currentCategory: CategoryInfo | null
  breadcrumbs: CategoryInfo[]
  childCategories: CategoryInfo[]
}

export default function ProductsPageClient({
  products,
  currentCategory,
  breadcrumbs,
  childCategories,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goCategory = (code: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (code) params.set('category', code)
    else params.delete('category')
    router.push(`${pathname}?${params.toString()}`)
  }

  const pageTitle = currentCategory?.category_name ?? '전체 상품'

  return (
    <div className="container py-10 lg:py-16">

      {/* ── 브레드크럼 네비게이션 ─────────────────────────────── */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => goCategory(null)}
          className="hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          전체
        </button>
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-neutral-900 dark:text-white">
                {crumb.category_name}
              </span>
            ) : (
              <button
                onClick={() => goCategory(crumb.category_code)}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {crumb.category_name}
              </button>
            )}
          </span>
        ))}
      </nav>

      {/* ── 페이지 타이틀 ──────────────────────────────────────── */}
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        {pageTitle}
      </h1>

      {/* ── 하위 카테고리 버튼 ─────────────────────────────────── */}
      {childCategories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {/* 현재 카테고리가 있으면 '전체' 버튼(상위로 올라가기) 표시 */}
            {currentCategory && (
              <button
                onClick={() =>
                  goCategory(
                    breadcrumbs.length >= 2
                      ? breadcrumbs[breadcrumbs.length - 2].category_code
                      : null
                  )
                }
                className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white transition-colors"
              >
                ← 전체 보기
              </button>
            )}
            {childCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => goCategory(cat.category_code)}
                className={[
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  searchParams.get('category') === cat.category_code
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white',
                ].join(' ')}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Divider className="mb-8" />

      {/* 우측 정렬 */}
      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* 상품 그리드 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">상품이 없습니다.</p>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="mt-16 flex justify-center lg:mt-20">
        <Pagination className="mx-auto">
          <PaginationPrevious href="?page=1" />
          <PaginationList>
            <PaginationPage href="?page=1" current>1</PaginationPage>
            <PaginationPage href="?page=2">2</PaginationPage>
            <PaginationPage href="?page=3">3</PaginationPage>
            <PaginationPage href="?page=4">4</PaginationPage>
          </PaginationList>
          <PaginationNext href="?page=2" />
        </Pagination>
      </div>
    </div>
  )
}
