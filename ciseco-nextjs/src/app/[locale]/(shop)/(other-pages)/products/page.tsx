// KN541 상품목록 페이지
// 구조: 상단 카테고리 탭 → 4열 상품 그리드 → 페이지네이션
// - 검색창/좌측 사이드바 필터 없음
// - 목업 데이터 사용 (getProducts)

import { Divider } from '@/components/Divider'
import ProductCard from '@/components/ProductCard'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { getProducts } from '@/data/data'
import { getCategories } from '@/lib/api/categories'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { Suspense } from 'react'
import CategoryTabsClient from './CategoryTabsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '상품목록 | KN541',
}

// Next.js 16: searchParams는 Promise
// CategoryTabsClient는 useSearchParams 사용 → Suspense로 감싸야 함
interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { category } = await searchParams

  // 목업 상품
  const products = await getProducts()

  // 카테고리 탭
  let categories: { id: string; category_code: string; category_name: string }[] = []
  try {
    const all = await getCategories()
    categories = all
      .filter((c) => c.depth === 1 && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  } catch {
    // API 실패 시 빈 배열
  }

  return (
    <div className="container py-16 lg:py-24">
      {/* 제목 */}
      <h1 className="mb-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        전체 상품
      </h1>

      {/* 상단 카테고리 탭 — useSearchParams 사용하므로 Suspense 필수 */}
      {categories.length > 0 && (
        <div className="mb-8">
          <Suspense fallback={
            <div className="flex flex-wrap gap-2">
              {['전체', ...categories.map(c => c.category_name)].map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-400"
                >
                  {name}
                </span>
              ))}
            </div>
          }>
            <CategoryTabsClient
              categories={categories}
              activeCategory={category ?? null}
            />
          </Suspense>
        </div>
      )}

      <Divider className="mb-8" />

      {/* 정렬 — 우측만 */}
      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* 상품 그리드 — 4열 */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>

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
