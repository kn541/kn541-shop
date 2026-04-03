// KN541 상품목록 페이지
// 서버에서 현재 카테고리 + 상위/하위 카테고리 조회 → 클라이언트에 전달

import { Suspense } from 'react'
import { getProducts, TProductItem } from '@/data/data'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '상품목록 | KN541',
  description: 'KN541 쇼핑몰 전체 상품',
}

export interface CategoryInfo {
  id: string
  category_code: string
  category_name: string
  parent_id: string | null
  depth: number
  sort_order: number
  is_active: boolean
}

async function fetchAllCategories(): Promise<CategoryInfo[]> {
  const BASE = process.env.NEXT_PUBLIC_API_URL
  if (!BASE) return []
  try {
    const res = await fetch(`${BASE}/categories`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data?.data?.items ?? []
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categoryCode } = await searchParams
  const allCategories = await fetchAllCategories()
  const products: TProductItem[] = await getProducts(
    categoryCode ? { category: categoryCode } : undefined
  )

  // 현재 카테고리 찾기
  const currentCategory = categoryCode
    ? allCategories.find((c) => c.category_code === categoryCode) ?? null
    : null

  // 상위 카테고리 체인 (브레드크럼용)
  const breadcrumbs: CategoryInfo[] = []
  if (currentCategory) {
    let cur: CategoryInfo | undefined = currentCategory
    while (cur) {
      breadcrumbs.unshift(cur)
      cur = cur.parent_id
        ? allCategories.find((c) => c.id === cur!.parent_id)
        : undefined
    }
  }

  // 하위 카테고리 — 현재 카테고리의 직속 자식
  const childCategories = currentCategory
    ? allCategories
        .filter((c) => c.parent_id === currentCategory.id && c.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
    : allCategories
        .filter((c) => c.depth === 1 && c.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <Suspense
      fallback={
        <div className="container py-16 lg:py-24">
          <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
        </div>
      }
    >
      <ProductsPageClient
        products={products}
        currentCategory={currentCategory}
        breadcrumbs={breadcrumbs}
        childCategories={childCategories}
      />
    </Suspense>
  )
}
