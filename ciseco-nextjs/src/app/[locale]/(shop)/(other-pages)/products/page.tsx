// KN541 상품목록 페이지
// fix: /categories API는 tree 구조 반환 → flatten 처리
// fix: parent_id 비교 String() 통일
// 브레드크럼: 홈 > 상위카테고리 > 현재카테고리
// 하위카테고리: 현재 카테고리의 직속 자식 버튼

import { Suspense } from 'react'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_API_URL

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

// API tree 구조를 flat 배열로 재귀 변환
function flattenCategories(items: any[]): CategoryInfo[] {
  const result: CategoryInfo[] = []
  for (const c of items) {
    result.push({
      id: String(c.id),
      category_code: c.category_code ?? '',
      category_name: c.category_name ?? '',
      parent_id: c.parent_id != null ? String(c.parent_id) : null,
      depth: c.depth ?? 0,
      sort_order: c.sort_order ?? 0,
      is_active: c.is_active ?? true,
    })
    // children이 있으면 재귀 flatten
    if (Array.isArray(c.children) && c.children.length > 0) {
      result.push(...flattenCategories(c.children))
    }
  }
  return result
}

async function fetchAllCategories(): Promise<CategoryInfo[]> {
  if (!BASE) return []
  try {
    const res = await fetch(`${BASE}/categories`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    const raw = data?.data?.items ?? []
    return flattenCategories(raw)
  } catch {
    return []
  }
}

async function fetchProducts(categoryId?: string) {
  if (!BASE) return []
  try {
    const qs = new URLSearchParams({ size: '40', product_status: 'ACTIVE' })
    if (categoryId) qs.set('category_id', categoryId)
    const res = await fetch(`${BASE}/products?${qs}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    const items = data?.data?.items ?? []
    return items.map((p: any) => ({
      id: String(p.id),
      title: p.product_name,
      handle: p.product_code,
      price: p.sale_price,
      createdAt: p.created_at,
      vendor: '',
      featuredImage: p.thumbnail_url
        ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
        : { src: '/placeholder-product.jpg', width: 600, height: 600, alt: p.product_name },
      images: [],
      reviewNumber: 0,
      rating: 0,
      status: p.product_status === 'SOLDOUT' ? 'Sold Out' : p.is_new ? 'New in' : 'In Stock',
      options: [],
      selectedOptions: [],
    }))
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cid?: string }>
}) {
  // cid = category id (UUID) — # ; 특수문자 없이 안전
  const { cid } = await searchParams
  const allCategories = await fetchAllCategories()
  const products = await fetchProducts(cid)

  // 현재 카테고리 (String 비교)
  const currentCategory = cid
    ? allCategories.find((c) => c.id === String(cid)) ?? null
    : null

  // 브레드크럼 (최상위 → 현재)
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

  // 하위 카테고리 (parent_id 기준, String 비교)
  const childCategories = currentCategory
    ? allCategories
        .filter(
          (c) =>
            c.parent_id !== null &&
            c.parent_id === currentCategory.id &&
            c.is_active
        )
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
