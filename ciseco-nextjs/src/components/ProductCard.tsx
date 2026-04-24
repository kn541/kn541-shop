'use client'

// KN541 상품 카드
// fix: 장바구니 버튼 클릭 버블링 방지 (e.stopPropagation)
// fix: useCart().addItem() 실제 연동 (toast만 띄우던 버그 수정)
// fix: 폐쇄몰 — 비로그인 시 메인 페이지로 이동
// fix: locale 동적화 (하드코딩 /products/ → /${locale}/products/)
// fix: 별점/리뷰 0이면 미표시, 무료배송 뱃지, 뱃지 정비

import { TProductItem } from '@/data/data'
import { useCart } from '@/lib/cart-context'
import NcImage from '@/shared/NcImage/NcImage'
import { Link } from '@/shared/link'
import { ArrowsPointingOutIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { usePathname, useRouter } from 'next/navigation'
import { FC } from 'react'
import toast from 'react-hot-toast'
import LikeButton from './LikeButton'
import Prices from './Prices'
import ProductStatus from './ProductStatus'
import { useAside } from './aside'

interface Props {
  className?: string
  data: TProductItem
  isLiked?: boolean
}

const ProductCard: FC<Props> = ({ className = '', data, isLiked }) => {
  const { title, price, status, rating, options, handle, selectedOptions, reviewNumber, images, featuredImage } = data

  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'ko'
  const router   = useRouter()
  const { addItem } = useCart()
  const { open: openAside, setProductQuickViewHandle } = useAside()

  // 배송 정보
  const delivery = (data as any).delivery as {
    sc_type?: number
    shipping_fee?: number
    free_over?: number | null
  } | undefined
  const isFreeShipping = delivery?.sc_type === 1 || (delivery?.shipping_fee ?? 0) === 0

  // 품절 여부
  const stockQty  = Number((data as any).stockQty ?? 0)
  const isSoldOut = stockQty === 0 && stockQty !== undefined && (data as any).stockQty !== undefined
    ? false  // stockQty 없는 경우(목록 API) 일단 구매 가능으로 처리
    : status === '품절'

  // 사전예약
  const isPreOrder = typeof title === 'string' && title.includes('[사전예약]')

  // 뱃지
  const getBadge = () => {
    if (isPreOrder) return { label: '사전예약', className: 'bg-violet-100 text-violet-700' }
    if (status === '신상품' || status === 'New in') return { label: 'NEW', className: 'bg-blue-100 text-blue-700' }
    if (status === '베스트' || status === 'Best Seller') return { label: 'BEST', className: 'bg-amber-100 text-amber-700' }
    if (status === '할인' || status === 'Sale') return { label: 'SALE', className: 'bg-red-100 text-red-600' }
    return null
  }
  const badge = getBadge()

  const productUrl = `/${locale}/products/${handle}`

  // ★ 장바구니 담기 — 클릭 버블링 방지 + useCart 실제 연동
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 폐쇄몰: 비로그인 → 메인 페이지
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      router.push(`/${locale}`)
      return
    }

    if (isSoldOut) {
      toast.error('품절된 상품입니다.')
      return
    }

    const deliveryData = (data as any).delivery || {}
    const pid = String(data.id || data.handle || '')

    if (!pid) {
      toast.error('상품 정보를 불러올 수 없습니다.')
      return
    }

    addItem({
      productId: pid,
      name: title || '',
      price: Number(price) || 0,
      quantity: 1,
      image: featuredImage?.src || '',
      shippingFee: Number(deliveryData.shipping_fee ?? 0),
      freeShippingOver: Number(deliveryData.free_over ?? 0),
      scType: Number(deliveryData.sc_type ?? 1),
      stockQty: Number((data as any).stockQty ?? 0),
    })

    toast.success(
      <span>
        장바구니에 담겼습니다!{' '}
        <button
          type="button"
          className="font-semibold underline"
          onClick={() => router.push(`/${locale}/cart`)}
        >
          장바구니 보기
        </button>
      </span>,
      { duration: 3000 }
    )
  }

  // ★ 빠른보기 — 클릭 버블링 방지
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setProductQuickViewHandle(handle || '')
    openAside('product-quick-view')
  }

  const renderColorOptions = () => {
    const optionColorValues = options?.find((option) => option.name === 'Color')?.optionValues
    if (!optionColorValues?.length) return null
    return (
      <div className="flex gap-2">
        {optionColorValues.map((color) => (
          <div key={color.name} className="relative size-4 cursor-pointer overflow-hidden rounded-full">
            <div
              className="absolute inset-0 z-0 rounded-full bg-cover ring-1 ring-neutral-900/20 dark:ring-white/20"
              style={{
                backgroundColor: color.swatch?.color,
                backgroundImage: color.swatch?.image ? `url(${color.swatch.image})` : undefined,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderGroupButtons = () => (
    <div className="invisible absolute inset-x-1 bottom-0 flex justify-center gap-1.5 opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
      {/* ★ 장바구니 버튼 — e.stopPropagation + useCart.addItem */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isSoldOut}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs/normal text-white shadow-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBagIcon className="-ml-1 size-3.5" />
        <span>{isSoldOut ? '품절' : '장바구니'}</span>
      </button>

      {/* ★ 빠른보기 버튼 — e.stopPropagation */}
      <button
        type="button"
        onClick={handleQuickView}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs/normal text-neutral-950 shadow-lg hover:bg-neutral-50"
      >
        <ArrowsPointingOutIcon className="-ml-1 size-3.5" />
        <span>빠른보기</span>
      </button>
    </div>
  )

  return (
    <div className={`product-card relative flex flex-col bg-transparent ${className}`}>
      {/* ★ 상품 상세 링크 — locale 포함 */}
      <Link href={productUrl} className="absolute inset-0 z-0" />

      <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
        <Link href={productUrl} className="block">
          {featuredImage?.src && (
            <NcImage
              containerClassName="flex aspect-w-11 aspect-h-12 w-full h-0"
              src={featuredImage}
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              alt={title || '상품 이미지'}
            />
          )}
        </Link>

        {/* 품절 오버레이 */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-neutral-800">품절</span>
          </div>
        )}

        <ProductStatus status={status} />
        <LikeButton liked={isLiked} className="absolute end-3 top-3 z-10" />
        {renderGroupButtons()}
      </div>

      <div className="space-y-3 px-2.5 pt-4 pb-2.5">
        {renderColorOptions()}

        <div>
          {badge && (
            <span className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          )}
          <h2 className="nc-ProductCard__title line-clamp-2 text-sm font-semibold leading-snug transition-colors text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Prices price={price ?? 0} contentClass="py-0 text-sm" />
          {isFreeShipping && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 whitespace-nowrap">
              무료배송
            </span>
          )}
        </div>

        {(rating ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {rating}
              {(reviewNumber ?? 0) > 0 && ` (${reviewNumber})`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
