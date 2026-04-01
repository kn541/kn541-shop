/**
 * KN541 API 데이터 → Ciseco 컴포넌트 형식 변환 어댑터
 * - lib/api/products.ts의 Product 타입 기준
 * - lib/api/categories.ts의 Category 타입 기준
 */

import type { Category } from './api/categories'
import type { Product } from './api/products'
import type { TCollection, TProductItem } from '@/data/data'

const PLACEHOLDER_IMG = '/placeholder-product.jpg'

// 카테고리별 배경색 (순환)
const BG_COLORS = [
  'bg-indigo-50',
  'bg-orange-50',
  'bg-green-50',
  'bg-blue-50',
  'bg-red-50',
  'bg-yellow-50',
  'bg-purple-50',
  'bg-pink-50',
]

// ─── 상품 어댑터 ──────────────────────────────────────────────

export function adaptProduct(p: Product): TProductItem {
  // 상태 레이블 결정
  let status = 'In Stock'
  if (p.product_status === 'SOLDOUT') status = 'Sold Out'
  else if (p.is_new) status = 'New in'
  else if (p.is_best) status = 'Best Seller'
  else if (p.is_sale) status = 'Sale'

  return {
    id: String(p.id),
    title: p.product_name,
    handle: p.product_code,          // product_code를 URL slug로 사용
    price: p.sale_price,
    createdAt: p.created_at,
    vendor: '',
    featuredImage: p.thumbnail_url
      ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
      : { src: PLACEHOLDER_IMG, width: 600, height: 600, alt: p.product_name },
    images: p.thumbnail_url
      ? [{ src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }]
      : [],
    reviewNumber: 0,
    rating: 0,
    status,
    options: [],
    selectedOptions: [],
  }
}

export function adaptProducts(items: Product[]): TProductItem[] {
  return items.map(adaptProduct)
}

// ─── 카테고리 어댑터 ──────────────────────────────────────────

export function adaptCategory(c: Category, index = 0): TCollection {
  return {
    id: String(c.id),
    title: c.category_name,
    handle: c.category_code,          // category_code를 URL handle로 사용
    description: '',
    sortDescription: '',
    color: BG_COLORS[index % BG_COLORS.length],
    count: 0,
    image: {
      src: PLACEHOLDER_IMG,
      width: 600,
      height: 600,
      alt: c.category_name,
    },
  }
}

export function adaptCategories(items: Category[]): TCollection[] {
  return items.map((c, i) => adaptCategory(c, i))
}
