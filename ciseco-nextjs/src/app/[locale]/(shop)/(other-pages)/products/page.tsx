// KN541 상품목록 페이지
// ProductsPageClient는 useSearchParams 사용 → Suspense 필수

import { Suspense } from 'react'
import { getProducts, TProductItem } from '@/data/data'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '상품목록 | KN541',
  description: 'KN541 쇼핑몰 전체 상품',
}

export default async function ProductsPage() {
  const products: TProductItem[] = await getProducts()

  return (
    <Suspense fallback={
      <div className="container py-16 lg:py-24">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
      </div>
    }>
      <ProductsPageClient products={products} />
    </Suspense>
  )
}
