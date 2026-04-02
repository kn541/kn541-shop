// KN541 상품목록 페이지
// 서버: 목업 상품만 가져옴 (외부 API 없음)
// 카테고리 탭 + 필터는 클라이언트 컴포넌트(ProductsPageClient)가 담당

import { getProducts } from '@/data/data'
import ProductsPageClient from './ProductsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '상품목록 | KN541',
  description: 'KN541 쇼핑몰 전체 상품',
}

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductsPageClient products={products} />
}
