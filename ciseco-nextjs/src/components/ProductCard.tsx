'use client'

// KN541 상품 카드
// fix: alt=UUID → alt=상품명
// fix: "Add to bag" → "장바구니", "Quick view" → "빠른보기"
// fix: 상품명 line-clamp-2 (카드 높이 균일화)
// fix: 별점/리뷰 0이면 미표시
// feat: 무료배송 뱃지
// feat: 사전예약/신상품/베스트/할인 뱃지 정비

import { TProductItem } from '@/data/data'
import NcImage from '@/shared/NcImage/NcImage'
import { Link } from '@/shared/link'
import { ArrowsPointingOutIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { FC } from 'react'
import AddToCardButton from './AddToCardButton'
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
  const color = selectedOptions?.find((option) => option.name === 'Color')?.value

  // 배송 정보 (adapters.ts에서 delivery 객체로 전달됨)
  const delivery = (data as any).delivery as {
    sc_type?: number
    shipping_fee?: number
    free_over?: number | null
  } | undefined
  const isFreeShipping = delivery?.sc_type === 1 || (delivery?.shipping_fee ?? 0) === 0

  // 사전예약 여부 — 상품명에 [사전예약] 포함 시
  const isPreOrder = typeof title === 'string' && title.includes('[사전예약]')

  // 뱃지 결정 (우선순위: 사전예약 > 신상품 > 베스트 > 할인)
  const getBadge = () => {
    if (isPreOrder) return { label: '사전예약', className: 'bg-violet-100 text-violet-700' }
    if (status === '신상품' || status === 'New in') return { label: 'NEW', className: 'bg-blue-100 text-blue-700' }
    if (status === '베스트' || status === 'Best Seller') return { label: 'BEST', className: 'bg-amber-100 text-amber-700' }
    if (status === '할인' || status === 'Sale') return { label: 'SALE', className: 'bg-red-100 text-red-600' }
    return null
  }
  const badge = getBadge()

  const { open: openAside, setProductQuickViewHandle } = useAside()

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

  const renderGroupButtons = () => {
    return (
      <div className="invisible absolute inset-x-1 bottom-0 flex justify-center gap-1.5 opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
        <AddToCardButton
          as={'button'}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs/normal text-white shadow-lg hover:bg-neutral-800"
          title={title || ''}
          imageUrl={featuredImage?.src || ''}
          price={price || 0}
          quantity={1}
          size={selectedOptions?.find((option) => option.name === 'Size')?.value}
          color={selectedOptions?.find((option) => option.name === 'Color')?.value}
        >
          <ShoppingBagIcon className="-ml-1 size-3.5" />
          <span>장바구니</span>
        </AddToCardButton>

        <button
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs/normal text-neutral-950 shadow-lg hover:bg-neutral-50"
          type="button"
          onClick={() => {
            setProductQuickViewHandle(handle || '')
            openAside('product-quick-view')
          }}
        >
          <ArrowsPointingOutIcon className="-ml-1 size-3.5" />
          <span>빠른보기</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={`product-card relative flex flex-col bg-transparent ${className}`}>
        <Link href={'/products/' + handle} className="absolute inset-0"></Link>

        <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
          <Link href={'/products/' + handle} className="block">
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
    </>
  )
}

export default ProductCard
