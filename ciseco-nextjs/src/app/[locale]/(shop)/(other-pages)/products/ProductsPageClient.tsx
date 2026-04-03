'use client'
// KN541 상품목록 — 브레드크럼(홈>카테고리>...) + 하위카테고리 버튼
// 홈 = 전체상품이므로 "전체 상품" 텍스트 제거

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { Divider } from '@/components/Divider'
import type { CategoryInfo } from './page'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'

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
}

function ChevronIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
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
  const activeCid = searchParams.get('cid')

  const goCategory = (id: string | null) => {
    if (id) {
      router.push(`${pathname}?cid=${id}`)
    } else {
      router.push(pathname)
    }
  }

  // 홈(=전체 상품) URL
  const homeUrl = pathname.replace(/\/products.*/, '')

  const pageTitle = currentCategory?.category_name ?? '전체 상품'

  // 브레드크럼에서 한 단계 위 카테고리 id
  const parentCid = breadcrumbs.length >= 2
    ? breadcrumbs[breadcrumbs.length - 2].id
    : null

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

      {/* ── 페이지 타이틀 ── */}
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        {pageTitle}
      </h1>

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

      {/* 상품 그리드 */}
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
