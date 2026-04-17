/**
 * KN541 API 데이터 → Ciseco 컴포넌트 형식 변환 어댑터
 * fix: product_id(UUID) 사용, images/description 포함
 */

import type { Category } from './api/categories'
import type { Product } from './api/products'
import type { TCollection, TProductItem } from '@/data/data'

const PLACEHOLDER_IMG = '/placeholder-product.jpg'

const BG_COLORS = [
  'bg-indigo-50', 'bg-orange-50', 'bg-green-50', 'bg-blue-50',
  'bg-red-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50',
]

// ─── 상품 어댑터 ──────────────────────────────────────────────

export function adaptProduct(p: Product): TProductItem {
  // ★ product_id(UUID) 우선 사용
  const pid = p.product_id || p.id || ''

  // 상태 레이블 결정
  let status = 'In Stock'
  if (p.is_soldout || p.product_status === 'SOLDOUT') status = 'Sold Out'
  else if (p.is_discontinued || p.product_status === 'DISCONTINUED') status = 'Discontinued'
  else if (p.is_new) status = 'New in'
  else if (p.is_best) status = 'Best Seller'
  else if (p.is_sale) status = 'Sale'

  // ★ 썸네일
  const thumbImg = p.thumbnail_url
    ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
    : { src: PLACEHOLDER_IMG, width: 600, height: 600, alt: p.product_name }

  // ★ 상세 이미지 (v_product_detail의 images JSONB 또는 thumbnail 단독)
  const detailImgs: typeof thumbImg[] = (p.images || [])
    .filter((img) => img?.image_url)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((img) => ({
      src: img.image_url,
      width: 800,
      height: 800,
      alt: p.product_name,
    }))

  // thumbnail + 상세이미지 합산 (중복 제거)
  const allImages =
    detailImgs.length > 0
      ? detailImgs  // 상세이미지가 있으면 그걸 우선
      : [thumbImg]  // 없으면 썸네일만

  // ★ 브랜드: brand → supplier_name → 카테고리
  const vendor = p.brand || p.supplier_name || p.category_name_1 || 'KN541'

  // ★ 배송비 (원 단위)
  const shippingFee = p.sc_price ?? p.shipping_fee ?? 0
  const freeOver = p.sc_minimum ?? p.free_shipping_over ?? null

  return {
    id: pid,
    title: p.product_name,
    handle: p.product_code ?? pid,  // URL slug = product_code
    price: p.sale_price,
    createdAt: p.created_at,
    vendor,
    featuredImage: thumbImg,
    images: allImages,
    reviewNumber: 0,
    rating: 0,
    status,
    options: [],
    selectedOptions: [],
    // 추가 필드 (상세 페이지용)
    description: p.description || p.summary || '',
    delivery: {
      sc_type: p.sc_type ?? 1,
      shipping_fee: shippingFee,
      free_over: freeOver,
      return_fee: p.return_fee ?? 0,
      exchange_fee: p.exchange_fee ?? 0,
      delivery_days: p.delivery_days ?? 3,
    },
  } as TProductItem & { description: string; delivery: any }
}

export function adaptProducts(items: Product[]): TProductItem[] {
  return items.map(adaptProduct)
}

// ─── 카테고리 어댑터 ──────────────────────────────────────────

export function adaptCategory(c: Category, index = 0): TCollection {
  return {
    id: String(c.id),
    title: c.category_name,
    handle: c.category_code,
    description: '',
    sortDescription: '',
    color: BG_COLORS[index % BG_COLORS.length],
    count: 0,
    image: { src: PLACEHOLDER_IMG, width: 600, height: 600, alt: c.category_name },
  }
}

export function adaptCategories(items: Category[]): TCollection[] {
  return items.map((c, i) => adaptCategory(c, i))
}
