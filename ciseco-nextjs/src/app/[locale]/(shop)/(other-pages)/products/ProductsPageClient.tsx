'use client'
// KN541 상품목록 — 클라이언트 컴포넌트
// 카테고리 탭(API fetch), 정렬, 상품 그리드, 페이지네이션 담당

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { Divider } from '@/components/Divider'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'

interface Category {
  id: string
  category_code: string
  category_name: string
  depth: number
  sort_order: number
  is_active: boolean
}

interface Product {
  id: string
  [key: string]: unknown
}

const BASE = process.env.NEXT_PUBLIC_API_URL

export default function ProductsPageClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  const [categories, setCategories] = useState<Category[]>([])

  // 카테고리 클라이언트에서 fetch
  useEffect(() => {
    fetch(`${BASE}/categories`)
      .then((r) => r.json())
      .then((data) => {
        const items: Category[] = data?.data?.items ?? []
        setCategories(
          items
            .filter((c) => c.depth === 1 && c.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
        )
      })
      .catch(() => {})
  }, [])

  const handleCategory = (code: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (code) params.set('category', code)
    else params.delete('category')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="container py-16 lg:py-24">
      <h1 className="mb-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        전체 상품
      </h1>

      {/* 카테고리 탭 */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => handleCategory(null)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              !activeCategory
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400',
            ].join(' ')}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.category_code)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeCategory === cat.category_code
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400',
              ].join(' ')}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      )}

      <Divider className="mb-8" />

      {/* 우측 정렬 */}
      <div className="mb-8 flex justify-end">
        <FilterSortByMenuListBox />
      </div>

      {/* 상품 그리드 — 4열 */}
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
