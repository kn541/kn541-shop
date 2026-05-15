// 사전예약 상품 목록 — 카테고리 페이지와 동일한 디자인/기능
import { Suspense } from 'react'
import ProductsPageClient from '../products/ProductsPageClient'
import type { Metadata } from 'next'
import { PRODUCT_LIST_PAGE_SIZE } from '@/lib/product-list-constants'

export const metadata: Metadata = {
  title: '사전예약 | KN541',
  description: '진행 중인 사전예약 상품을 만나보세요.',
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kn541-production.up.railway.app'

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
      sc_type: p.sc_type ?? 1,
      shipping_fee: p.shipping_fee ?? 0,
      free_over: p.free_shipping_over ?? null,
    },
  }
}

async function fetchPreorder(page: number) {
  try {
    const qs = new URLSearchParams({ page: String(page), size: String(PRODUCT_LIST_PAGE_SIZE) })
    const res = await fetch(`${BASE}/public/products/preorder?${qs}`, { cache: 'no-store' })
    if (!res.ok) return { products: [], total: 0 }
    const json = await res.json()
    const items = json.data?.items ?? []
    const total = json.data?.total ?? 0
    return { products: items.map(mapProduct), total }
  } catch {
    return { products: [], total: 0 }
  }
}

export default async function PreorderProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, Number(pageParam) || 1)
  const { products, total } = await fetchPreorder(currentPage)
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
        pageTitle="사전예약"
      />
    </Suspense>
  )
}
