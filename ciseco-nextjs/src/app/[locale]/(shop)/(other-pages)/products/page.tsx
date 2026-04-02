// KN541 상품목록 페이지
// - 상단 카테고리 탭 (API) + 4열 그리드 (목업) + 페이지네이션
// - 검색창 / 좌측 사이드바 없음
// - dynamic = 'force-dynamic': 외부 API + useSearchParams 충돌 방지

import { Suspense } from 'react'
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
import CategoryTabsClient from './CategoryTabsClient'
import type { Metadata } from 'next'

// 외부 API 호출 + useSearchParams(클라이언트) 혼용 → 반드시 dynamic 필요
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '상품목록 | KN541',
  description: 'KN541 쇼핑몰 전체 상품',
}

export default async function ProductsPage() {
  // 목업 상품 데이터
  const products = await getProducts()

  // 카테고리 탭 — 서버에서 API 호출
  let categories: { id: string; category_code: string; category_name: string }[] = []
  try {
    const all = await getCategories()
    categories = all
      .filter((c) => c.depth === 1 && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  } catch {
    // API 실패 시 탭 없이 전체 상품만 표시
  }

  return (
    <div className="container py-16 lg:py-24">
      {/* 페이지 제목 */}
      <h1 className="mb-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        전체 상품
      </h1>

      {/* 카테고리 탭 — useSearchParams 사용하므로 Suspense 필수 */}
      {categories.length > 0 && (
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white">전체</span>
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-400"
                  >
                    {c.category_name}
                  </span>
                ))}
              </div>
            }
          >
            <CategoryTabsClient categories={categories} />
          </Suspense>
        </div>
      )}

      <Divider className="mb-8" />

      {/* 우측 정렬만 */}
      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* 상품 그리드 — 4열 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
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
