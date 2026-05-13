// KN541 상품목록 페이지 — 무한스크롤
import { Suspense } from 'react'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

import { productSortToApiQuery, normalizeProductSortParam } from '@/lib/product-list-sort'

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
    return flattenCategories(raw)
  } catch {
    return []
  }
}

function parseSortParam(sort?: string): { sort_by: string; sort_order: string } {
  const normalized = normalizeProductSortParam(sort ?? undefined)
  return productSortToApiQuery(normalized)
}

function mapProduct(p: any) {
  const pid = String(p.product_id || p.id || '')
  let status = '판매중'
  if (p.product_status === 'SOLDOUT' || p.is_soldout) status = '품절'
  else if (p.product_status === 'DISCONTINUED' || p.is_discontinued) status = '판매종료'
  else if (p.is_new) status = '신상품'
  else if (p.is_best) status = '베스트'
  else if (p.is_sale) status = '할인'
  return {
    id: pid,
    handle: pid,
    title: p.product_name,
    price: p.sale_price,
    createdAt: p.created_at,
    vendor: p.brand != null && String(p.brand).trim() ? String(p.brand).trim() : '',
    featuredImage: p.thumbnail_url
      ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
      : { src: '/placeholder-product.jpg', width: 600, height: 600, alt: p.product_name },
    images: [],
    reviewNumber: 0,
    rating: 0,
    status,
    options: [],
    selectedOptions: [],
    delivery: {
      sc_type: p.sc_type ?? 1,
      shipping_fee: p.shipping_fee ?? 0,
      free_over: p.free_shipping_over ?? null,
    },
  }
}

async function fetchProducts(params: {
  categoryId?: string
  page: number
  size: number
  sort?: string
}) {
  try {
    const qs = new URLSearchParams({
      size: String(params.size),
      page: String(params.page),
    })
    if (params.categoryId) qs.set('category_id', params.categoryId)
    const sortParams = parseSortParam(params.sort)
    qs.set('sort_by', sortParams.sort_by)
    qs.set('sort_order', sortParams.sort_order)

    const res = await fetch(`${BASE}/products?${qs}`, { cache: 'no-store' })
    if (!res.ok) return { products: [], hasNext: false }
    const data = await res.json()
    const items = data?.data?.items ?? []
    const hasNext = data?.data?.has_next ?? false
    return { products: items.map(mapProduct), hasNext }
  } catch {
    return { products: [], hasNext: false }
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cid?: string; page?: string; sort?: string }>
}) {
  const { cid, sort } = await searchParams

  const [allCategories, { products, hasNext }] = await Promise.all([
    fetchAllCategories(),
    fetchProducts({ categoryId: cid, page: 1, size: PAGE_SIZE, sort }),
  ])

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
        hasNextInitial={hasNext}
        currentPage={1}
        totalPages={0}
        total={0}
      />
    </Suspense>
  )
}
