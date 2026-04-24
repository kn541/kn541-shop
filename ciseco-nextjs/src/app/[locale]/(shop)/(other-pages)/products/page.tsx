// KN541 상품목록 페이지
// fix: sort URL 파라미터 → 백엔드 sort_by/sort_order 전달
// fix: 상품 mapProduct에 delivery(배송비) 정보 포함 → 카드 무료배송 뱃지 표시
// fix: is_new/is_best/is_sale/is_soldout 상태 정확히 매핑

import { Suspense } from 'react'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://kn541-production.up.railway.app'

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
    const res = await fetch(`${BASE}/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const raw = data?.data?.items ?? []
    console.log('[products] 카테고리 수:', raw.length)
    return flattenCategories(raw)
  } catch (err) {
    console.error('[products] fetchAllCategories 예외:', err)
    return []
  }
}

// ★ sort 값 → 백엔드 파라미터 매핑
function parseSortParam(sort?: string): { sort_by?: string; sort_order?: string } {
  switch (sort) {
    case 'newest':   return { sort_by: 'created_at', sort_order: 'desc' }
    case 'oldest':   return { sort_by: 'created_at', sort_order: 'asc' }
    case 'price_asc':  return { sort_by: 'sale_price', sort_order: 'asc' }
    case 'price_desc': return { sort_by: 'sale_price', sort_order: 'desc' }
    case 'name_asc':   return { sort_by: 'product_name', sort_order: 'asc' }
    case 'name_desc':  return { sort_by: 'product_name', sort_order: 'desc' }
    default: return {}
  }
}

/** 상품 매핑 — product_id(UUID) + 배송비 정보 포함 */
function mapProduct(p: any) {
  const pid = String(p.product_id || p.id || '')

  // 상태 결정
  let status = 'In Stock'
  if (p.product_status === 'SOLDOUT' || p.is_soldout) status = 'Sold Out'
  else if (p.is_new) status = '신상품'
  else if (p.is_best) status = '베스트'
  else if (p.is_sale) status = '할인'

  return {
    id: pid,
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
    status,
    options: [],
    selectedOptions: [],
    // ★ 배송비 정보 — 카드의 무료배송 뱃지용
    delivery: {
      sc_type: p.sc_type ?? 1,
      shipping_fee: p.shipping_fee ?? 0,
      free_over: p.free_shipping_over ?? null,
    },
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
  sort?: string
}): Promise<FetchProductsResult> {
  try {
    const qs = new URLSearchParams({
      size: String(params.size),
      page: String(params.page),
    })
    if (params.categoryId) qs.set('category_id', params.categoryId)

    // ★ 정렬 파라미터 백엔드 전달
    const sortParams = parseSortParam(params.sort)
    if (sortParams.sort_by) qs.set('sort_by', sortParams.sort_by)
    if (sortParams.sort_order) qs.set('sort_order', sortParams.sort_order)

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
  searchParams: Promise<{ cid?: string; page?: string; sort?: string }>
}) {
  const { cid, page: pageParam, sort } = await searchParams
  const currentPage = Math.max(1, Number(pageParam) || 1)

  const [allCategories, { products, total }] = await Promise.all([
    fetchAllCategories(),
    fetchProducts({ categoryId: cid, page: currentPage, size: PAGE_SIZE, sort }),
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
