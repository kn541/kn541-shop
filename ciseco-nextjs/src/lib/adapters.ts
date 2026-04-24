/**
 * KN541 API 데이터 → Ciseco 컴포넌트 형식 변환 어댑터
 * fix v4: status 기본값 한국어화 ('In Stock' → '판매중')
 */

import type { Category } from './api/categories'
import type { Product } from './api/products'
import type { TCollection, TProductItem } from '@/data/data'

const PLACEHOLDER_IMG = '/placeholder-product.jpg'

const BG_COLORS = [
  'bg-indigo-50', 'bg-orange-50', 'bg-green-50', 'bg-blue-50',
  'bg-red-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50',
]

export function adaptProduct(p: Product): TProductItem {
  const pid = p.product_id || p.id || ''

  // ★ 기본값 '판매중' (한국어)
  let status = '판매중'
  if (p.stock_qty === 0) status = '품절'
  else if (p.is_soldout || p.product_status === 'SOLDOUT') status = '품절'
  else if (p.is_discontinued || p.product_status === 'DISCONTINUED') status = '판매종료'
  else if (p.is_new) status = '신상품'
  else if (p.is_best) status = '베스트'
  else if (p.is_sale) status = '할인'

  const thumbImg = p.thumbnail_url
    ? { src: p.thumbnail_url, width: 600, height: 600, alt: p.product_name }
    : { src: PLACEHOLDER_IMG, width: 600, height: 600, alt: p.product_name }

  const thumbImgs = (p.images || [])
    .filter(img => img?.image_url && img.image_type === 'THUMBNAIL')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(img => ({ src: img.image_url, width: 800, height: 800, alt: p.product_name }))

  const detailImgs = (p.images || [])
    .filter(img => img?.image_url && img.image_type !== 'THUMBNAIL')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(img => ({ src: img.image_url, width: 800, height: 800, alt: p.product_name }))

  let allImages: typeof thumbImg[]
  if (thumbImgs.length > 0) {
    allImages = [...thumbImgs, ...detailImgs]
  } else if (detailImgs.length > 0) {
    allImages = [thumbImg, ...detailImgs]
  } else {
    allImages = [thumbImg]
  }

  const vendor = p.brand || p.supplier_name || p.category_name_1 || 'KN541'
  const shippingFee = p.shipping_fee ?? 0
  const freeOver = p.free_shipping_over ?? null
  const taxLabel = p.tax_type === 1 ? '비과세' : p.tax_type === 2 ? '면세' : '과세 (10%)'

  const categoryBreadcrumbs: { name: string }[] = []
  if (p.category_name_1) categoryBreadcrumbs.push({ name: p.category_name_1 })
  if (p.category_name_2) categoryBreadcrumbs.push({ name: p.category_name_2 })
  if (p.category_name) categoryBreadcrumbs.push({ name: p.category_name })

  return {
    id: pid,
    title: p.product_name,
    handle: pid,
    price: p.sale_price,
    createdAt: p.created_at,
    vendor,
    featuredImage: thumbImg,
    images: allImages,
    reviewNumber: 0,
    rating: 0,
    status,
    options: (p.options || []).map(opt => ({
      id: opt.id,
      option_name: opt.option_name,
      add_price: opt.add_price,
      stock_qty: opt.stock_qty,
    })),
    selectedOptions: [],
    description: p.description || p.summary || '',
    delivery: {
      sc_type: p.sc_type ?? 1,
      shipping_fee: shippingFee,
      free_over: freeOver,
      return_fee: p.return_fee ?? 0,
      exchange_fee: p.exchange_fee ?? 0,
      delivery_days: p.delivery_days ?? 3,
      delivery_company: (p as any).delivery_company ?? null,
    },
    categoryBreadcrumbs,
    categoryName: p.category_name ?? '',
    categoryName1: p.category_name_1 ?? '',
    categoryName2: p.category_name_2 ?? '',
    origin: (p as any).origin ?? '',
    taxLabel,
    taxType: p.tax_type ?? 0,
    productCode: p.product_code ?? '',
    productNo: p.product_no ?? '',
    stockQty: p.stock_qty ?? 0,
    productStatus: p.product_status ?? '',
    minOrderQty: p.min_order_qty ?? 1,
    maxOrderQty: p.max_order_qty ?? null,
    supplierName: p.supplier_name ?? '',
    originalSupplyPrice: p.original_supply_price ?? 0,
    summary: p.summary ?? '',
    consumerPrice: p.consumer_price ?? 0,
    isSoldout: p.is_soldout ?? false,
    isDiscontinued: p.is_discontinued ?? false,
  } as TProductItem & Record<string, any>
}

export function adaptProducts(items: Product[]): TProductItem[] {
  return items.map(adaptProduct)
}

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
