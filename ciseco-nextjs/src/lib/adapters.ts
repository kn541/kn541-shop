/**
 * KN541 API 데이터 → Ciseco 컴포넌트 형식 변환 어댑터
 * - API 응답(ApiProduct, ApiCategory)을 기존 TProductItem, TCollection 형식으로 변환
 * - 이미지 URL이 없으면 플레이스홀더 사용
 */

import type { ApiCategory, ApiProduct } from './api-products'
import type { TCollection, TProductItem } from '@/data/data'

const PLACEHOLDER_IMG = '/placeholder-product.jpg'

// ─── 상품 어댑터 ──────────────────────────────────────────────

export function adaptProduct(p: ApiProduct): TProductItem {
  return {
    id: String(p.id),
    title: p.name,
    handle: p.handle,
    price: p.price,
    createdAt: p.created_at,
    vendor: '',
    featuredImage: p.featured_image_url
      ? {
          src: p.featured_image_url,
          width: 600,
          height: 600,
          alt: p.name,
        }
      : {
          src: PLACEHOLDER_IMG,
          width: 600,
          height: 600,
          alt: p.name,
        },
    images: p.images?.map((img) => ({
      src: img.url,
      width: 600,
      height: 600,
      alt: img.alt || p.name,
    })) || [],
    reviewNumber: p.review_count ?? 0,
    rating: p.rating ?? 0,
    status: p.status || (p.stock > 0 ? 'In Stock' : 'Out of Stock'),
    options: p.options?.map((opt) => ({
      name: opt.name,
      optionValues: opt.values.map((v) => ({
        name: v.name,
        swatch: v.color ? { color: v.color, image: null } : null,
      })),
    })) || [],
    selectedOptions: [],
  }
}

export function adaptProducts(items: ApiProduct[]): TProductItem[] {
  return items.map(adaptProduct)
}

// ─── 카테고리 어댑터 ──────────────────────────────────────────

// 카테고리별 배경색 (순환 사용)
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

export function adaptCategory(c: ApiCategory, index = 0): TCollection {
  return {
    id: String(c.id),
    title: c.name,
    handle: c.handle,
    description: c.description || '',
    sortDescription: '',
    color: BG_COLORS[index % BG_COLORS.length],
    count: c.product_count ?? 0,
    image: c.image_url
      ? {
          src: c.image_url,
          width: 600,
          height: 600,
          alt: c.name,
        }
      : {
          src: PLACEHOLDER_IMG,
          width: 600,
          height: 600,
          alt: c.name,
        },
  }
}

export function adaptCategories(items: ApiCategory[]): TCollection[] {
  return items.map((c, i) => adaptCategory(c, i))
}
