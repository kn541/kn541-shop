// KN541 상품목록 페이지
// 서버: 목업 상품만 가져옴 (외부 API 없음 → static-to-dynamic 충돌 없음)
// 카테고리 / 필터 / 정렬은 클라이언트(ProductsPageClient)가 담당

import { getProducts, TProductItem } from '@/data/data'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '상품목록 | KN541',
  description: 'KN541 쇼핑몰 전체 상품',
}

export default async function ProductsPage() {
  const products: TProductItem[] = await getProducts()
  return <ProductsPageClient products={products} />
}
