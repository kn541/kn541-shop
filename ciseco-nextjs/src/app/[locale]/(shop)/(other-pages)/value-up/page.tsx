// 밸류업 상품 목록 — 카테고리 페이지와 동일한 디자인/기능
// 2026-07-22: fix — sc_type 기본값 1→3 (배송비 미전달 시 유료 기본)
// 2026-06-16: #13 정렬 파라미터 연동 — ?sort= URL → API sort_by/sort_order
import { Suspense } from 'react'
import ProductsPageClient from '../products/ProductsPageClient'
import type { Metadata } from 'next'
import { PRODUCT_LIST_PAGE_SIZE } from '@/lib/product-list-constants'
import { readSalesCount } from '@/lib/sales-count'
import { normalizeProductSortParam, applyProductSortToSearchParams } from '@/lib/product-list-sort'

export const metadata: Metadata = {
  title: '밸류업 | KN541',
  description: '소비의 가치를 높여주는 밸류업 상품입니다.',
}

import { apiUrl } from '@/lib/api/base'

function mapProduct(p: any) {
  const pid = String(p.product_id || p.id || '')
  let status = '판매중'
  if (p.product_status === 'SOLDOUT' || p.is_soldout) status = '품절'
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
      // ★ [2026-07-22] 기본값 3(유료) — API에서 sc_type 미전달 시 무료배송으로 오표시되던 버그 수정
      sc_type: p.sc_type ?? 3,
      shipping_fee: p.shipping_fee ?? 0,
      free_over: p.free_shipping_over ?? null,
    },
    salesCount: readSalesCount(p),
    productType: p.product_type ?? '006',
  }
}

async function fetchValueUp(page: number, sortParam?: string) {
  try {
    const qs = new URLSearchParams({ page: String(page), size: String(PRODUCT_LIST_PAGE_SIZE) })
    // 정렬 파라미터 적용
    const sort = normalizeProductSortParam(sortParam)
    applyProductSortToSearchParams(qs, sort)
    const res = await fetch(apiUrl(`/public/products/value-up?${qs}`), { cache: 'no-store' })
    if (!res.ok) return { products: [], total: 0 }
    const json = await res.json()
    const items = json.data?.items ?? []
    const total = json.data?.total ?? 0
    return { products: items.map(mapProduct), total }
  } catch {
    return { products: [], total: 0 }
  }
}

export default async function ValueUpProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  const { page: pageParam, sort: sortParam } = await searchParams
  const currentPage = Math.max(1, Number(pageParam) || 1)
  const { products, total } = await fetchValueUp(currentPage, sortParam)
  const hasNext = currentPage * PRODUCT_LIST_PAGE_SIZE < total

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kn541-green border-t-transparent" />
        </div>
      }
    >
      <ProductsPageClient
        products={products}
        currentCategory={null}
        breadcrumbs={[]}
        childCategories={[]}
        currentPage={currentPage}
        pageSize={PRODUCT_LIST_PAGE_SIZE}
        total={total}
        hasNext={hasNext}
        pageTitle="밸류업"
      />
    </Suspense>
  )
}
