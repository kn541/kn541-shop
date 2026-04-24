// KN541 상품목록 페이지
// fix: product_status 'ACTIVE' 필터 제거 (실제 DB는 ON_SALE)
// fix: handle = product_id(UUID) 기반 (상세페이지 UUID 직접 조회)
// fix: 백엔드 category_id OR 조건 지원으로 대/중/소분류 모두 매칭
// fix: BASE URL fallback 추가 (env var 미설정 시에도 동작)
// fix: 실제 페이지네이션 구현 (page/size 파라미터)

import { Suspense } from 'react'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

// ★ env var 미설정 시 Railway URL로 fallback
const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://kn541-production.up.railway.app'

// 페이지당 상품 수
const PAGE_SIZE = 20

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
    if (Array.isArray(c.children) && c.children.length > 0) {
      result.push(...flattenCategories(c.children))
    }
  }
  return result
}

async function fetchAllCategories(): Promise<CategoryInfo[]> {
  try {
    const url = `${BASE}/categories`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.error('[products] fetchAllCategories HTTP error:', res.status, res.statusText)
      return []
    }
    const data = await res.json()
    const raw = data?.data?.items ?? []
    console.log('[products] 카테고리 수:', raw.length)
    return flattenCategories(raw)
  } catch (err) {
    console.error('[products] fetchAllCategories 예외:', err)
    return []
  }
}

/** 상품 매핑 — product_id(UUID) 기반, adapters.ts와 일치 */
function mapProduct(p: any) {
  const pid = String(p.product_id || p.id || '')
  return {
    id: pid,
    // ★ handle = UUID → 쇼핑몰 상세페이지에서 getProductById 직접 조회
    handle: pid,
    title: p.product_name,
    price: p.sale_price,
    createdAt: p.created_at,
    vendor: p.brand || p.supplier_name || '',
    featuredImage: p.thumbnail_url
      ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
      : { src: '/placeholder-product.jpg', width: 600, height: 600, alt: p.product_name },
    images: [],
    reviewNumber: 0,
    rating: 0,
    status: (
      p.product_status === 'SOLDOUT' || p.is_soldout
        ? 'Sold Out'
        : p.is_new
          ? 'New in'
          : 'In Stock'
    ),
    options: [],
    selectedOptions: [],
  }
}

interface FetchProductsResult {
  products: any[]
  total: number
}

async function fetchProducts(params: {
  categoryId?: string
  page: number
  size: number
}): Promise<FetchProductsResult> {
  try {
    const qs = new URLSearchParams({
      size: String(params.size),
      page: String(params.page),
    })
    if (params.categoryId) qs.set('category_id', params.categoryId)
    const url = `${BASE}/products?${qs}`
    console.log('[products] fetchProducts URL:', url)
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.error('[products] fetchProducts HTTP error:', res.status, res.statusText)
      return { products: [], total: 0 }
    }
    const data = await res.json()
    const items = data?.data?.items ?? []
    const total = data?.data?.total ?? 0
    console.log('[products] 상품 수:', items.length, '/ 전체:', total)
    return { products: items.map(mapProduct), total }
  } catch (err) {
    console.error('[products] fetchProducts 예외:', err)
    return { products: [], total: 0 }
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cid?: string; page?: string }>
}) {
  const { cid, page: pageParam } = await searchParams
  const currentPage = Math.max(1, Number(pageParam) || 1)

  const [allCategories, { products, total }] = await Promise.all([
    fetchAllCategories(),
    fetchProducts({ categoryId: cid, page: currentPage, size: PAGE_SIZE }),
  ])

  console.log('[products] 렌더링 — 카테고리:', allCategories.length, '| 상품:', products.length, '| 전체:', total)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const currentCategory = cid
    ? allCategories.find((c) => c.id === String(cid)) ?? null
    : null

  const breadcrumbs: CategoryInfo[] = []
  if (currentCategory) {
    let cur: CategoryInfo | undefined = currentCategory
    while (cur) {
      breadcrumbs.unshift(cur)
      cur = cur.parent_id ? allCategories.find((c) => c.id === cur!.parent_id) : undefined
    }
  }

  const childCategories = currentCategory
    ? allCategories
        .filter((c) => c.parent_id !== null && c.parent_id === currentCategory.id && c.is_active)
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
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
      />
    </Suspense>
  )
}
