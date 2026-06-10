'use client'

// 메인 단일 product-card 마크업 (디자인 정합성 v1 §7)

import type { MainCartPreviewPayload } from '@/components/main-page/main-cart-types'
import { useMainCartPreviewOptional } from '@/components/main-page/main-cart-preview-context'
import type { Product } from '@/lib/api/products'
import { getProductImageUrl } from '@/lib/api/products'
import { formatPrice } from '@/lib/formatPrice'
import { formatSalesCountBadge, readSalesCount } from '@/lib/sales-count'
import { useCart } from '@/lib/cart-context'
import { Link } from '@/shared/link'
import clsx from 'clsx'
import Image from 'next/image'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import './kn541-main.css'

const CART_ICON = '/images/main-v1/icons/icon-cart-card.svg'

const PLACE_L1 = '[사전예약] 제품명 제품명 제품명 제품명 제품'
const PLACE_L2 = '제품명 제품명 제품명 제품명 제품명'

export type { MainCartPreviewPayload } from '@/components/main-page/main-cart-types'

function splitTitle(name: string): [string, string] {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return [name || PLACE_L1, PLACE_L2]
  const mid = Math.ceil(parts.length / 2)
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')]
}

type Base = { compact?: boolean; className?: string; onCartPreview?: (payload: MainCartPreviewPayload) => void }

type MainProductCardProps =
  | (Base & { mode: 'placeholder'; imageUrl: string })
  | (Base & { mode: 'api'; product: Product })

export function MainProductCard(props: MainProductCardProps) {
  const { addItem } = useCart()
  const previewCtx = useMainCartPreviewOptional()
  const tCart = useTranslations('Cart')
  const tProduct = useTranslations('Product')
  const compact = props.compact ?? false
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)

  const openPreview = props.onCartPreview ?? previewCtx?.openCartPreview

  if (props.mode === 'placeholder') {
    const handleCart = () => {
      if (openPreview) {
        openPreview({
          imageUrl: props.imageUrl,
          titleLine1: PLACE_L1,
          titleLine2: PLACE_L2,
          price: 88888,
          originalPrice: 88888,
          discountRate: 88,
          productId: '',
          name: `${PLACE_L1} ${PLACE_L2}`,
          stockQty: 0,
          shippingFee: 0,
          freeShippingOver: 0,
          scType: 1,
        })
        return
      }
      toast.error('디자인 샘플 상품입니다.')
    }

    return (
      <>
        {/* TODO: 백엔드 sort=best 추가 후 fetch로 교체 (베스트 플레이스홀더) */}
        <article
          className={clsx('product-card shrink-0 text-kn541-black', compact && 'compact', props.className)}
          data-placeholder="true"
        >
        <div className="thumb relative h-[320px] w-full overflow-hidden rounded-[10px] bg-[#e8e8e8]">
          <Image src={props.imageUrl} alt="" fill className="object-cover" sizes="280px" />
          <button
            type="button"
            className={clsx('like-button', liked && 'is-liked')}
            aria-label={liked ? '찜 해제' : '찜하기'}
            aria-pressed={liked}
            onClick={(e) => {
              e.preventDefault()
              setLiked((v) => !v)
            }}
          />
        </div>
        <button
          type="button"
          className={clsx(
            'cart-button mt-3 flex h-9 w-full items-center justify-center gap-[9px] rounded-[5px] border border-[#b5b5b5] text-[16px] font-normal text-kn541-black',
            added && 'border-kn541-green bg-kn541-green-soft text-kn541-green'
          )}
          onClick={handleCart}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CART_ICON} alt="" width={18} height={17} className="h-[17px] w-[18px]" />
          <span className="cart-label">담기</span>
        </button>
        <h3 className="mt-[17px] mb-[11px] min-h-[38px] overflow-hidden text-[16px] font-light leading-normal tracking-[-0.32px] text-kn541-black line-clamp-2">
          <span className="title-line block">{PLACE_L1}</span>
          <span className="title-line block">{PLACE_L2}</span>
        </h3>
        <p className="price m-0 flex flex-wrap items-baseline gap-x-3 leading-[1.2]">
          <span className="text-[18px] font-normal text-kn541-red">88%</span>
          <strong className="text-[18px] font-bold">{formatPrice(88888)}</strong>
          <del className="-order-1 mb-[3px] basis-full text-[14px] font-normal text-[#b5b5b5] decoration-1 line-through">
            {formatPrice(88888)}
          </del>
        </p>
        <p className="review">999+</p>
        </article>
      </>
    )
  }

  const { product } = props
  const pid = product.product_id || product.id || ''
  const img = getProductImageUrl(product)
  const sale = Number(product.sale_price) || 0
  const retail = Number(product.consumer_price ?? product.market_price ?? 0) || sale
  const rate =
    product.sale_discount_rate != null
      ? Math.round(Number(product.sale_discount_rate))
      : retail > sale
        ? Math.round((1 - sale / retail) * 100)
        : 0
  const ps = String(product.product_status ?? '').toUpperCase()
  const soldOut =
    product.is_soldout ||
    ps === 'SOLDOUT' ||
    ps === 'SOLD_OUT' ||
    product.product_status === '품절' ||
    (Number(product.stock_qty) || 0) <= 0

  const [l1, l2] = splitTitle(product.product_name || '')
  const categoryLabel = (product.category_name_2 || product.category_name_1 || '').trim()
  const salesCount = readSalesCount(product)
  const salesBadge = formatSalesCountBadge(salesCount, {
    productType: product.product_type,
    title: product.product_name,
  })

  const buildPayload = (): MainCartPreviewPayload => ({
    imageUrl: img,
    titleLine1: l1,
    titleLine2: l2,
    price: sale,
    originalPrice: retail > sale ? retail : sale,
    discountRate: rate,
    productId: pid,
    name: product.product_name || '',
    stockQty: Number(product.stock_qty ?? 0),
    shippingFee: Number(product.shipping_fee ?? product.sc_price ?? 0),
    freeShippingOver: Number(product.free_shipping_over ?? product.sc_minimum ?? 0) || 0,
    scType: Number(product.sc_type ?? 2),
  })

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (soldOut) {
      toast.error(tProduct('soldOutNotice'))
      return
    }
    if (openPreview) {
      if (!pid) {
        toast.error('상품 정보를 불러올 수 없습니다.')
        return
      }
      // 카드의 '담기'는 상품선택 팝업을 여는 트리거일 뿐, 실제 담기는 팝업에서 수행.
      // 따라서 카드 버튼을 '눌린 상태(added)'로 두지 않는다 (QA 18: 팝업 취소해도 버튼 눌림 유지 방지).
      openPreview(buildPayload())
      return
    }
    if (!pid) {
      toast.error('상품 정보를 불러올 수 없습니다.')
      return
    }
    addItem({
      productId: pid,
      name: product.product_name || '',
      price: sale,
      quantity: 1,
      image: img,
      shippingFee: Number(product.shipping_fee ?? product.sc_price ?? 0),
      freeShippingOver: Number(product.free_shipping_over ?? product.sc_minimum ?? 0) || 0,
      scType: Number(product.sc_type ?? 2),
      stockQty: Number(product.stock_qty ?? 0),
    })
    toast.success(
      (toastItem) => (
        <span>
          {tCart('addedToCartToast')}{' '}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => toast.dismiss(toastItem.id)}
          >
            {tCart('afterAddContinueShopping')}
          </button>
        </span>
      ),
      { duration: 3000 }
    )
    setAdded(true)
  }

  return (
    <article className={clsx('product-card shrink-0 text-kn541-black', compact && 'compact', props.className)}>
      <div className="thumb relative h-[320px] w-full overflow-hidden rounded-[10px] bg-[#e8e8e8]">
        <Link href={`/products/${pid}`} className="absolute inset-0 block">
          <Image
            src={img}
            alt=""
            fill
            className={clsx('object-cover', soldOut && 'grayscale')}
            sizes="280px"
          />
        </Link>
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center rounded-[10px] bg-black/50">
            <span className="text-sm font-bold tracking-wide text-white">{tProduct('outOfStock')}</span>
          </div>
        )}
        {(product.is_recommended || product.product_type === '002' || salesBadge) && (
          <div className="pointer-events-none absolute start-2 top-2 z-[2] flex flex-wrap gap-1">
            {product.is_recommended ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">추천</span>
            ) : null}
            {product.product_type === '002' ? (
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-800">예약</span>
            ) : null}
            {salesBadge ? (
              <span className="rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-700 shadow-sm">
                {salesBadge}
              </span>
            ) : null}
          </div>
        )}
        <button
          type="button"
          className={clsx('like-button z-[1]', liked && 'is-liked')}
          aria-label={liked ? '찜 해제' : '찜하기'}
          aria-pressed={liked}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLiked((v) => !v)
          }}
        />
      </div>
      <button
        type="button"
        disabled={soldOut}
        className={clsx(
          'cart-button relative z-[1] mt-3 flex h-9 w-full items-center justify-center gap-[9px] rounded-[5px] border border-[#b5b5b5] text-[16px] font-normal text-kn541-black',
          added && 'border-kn541-green bg-kn541-green-soft text-kn541-green',
          soldOut && 'cursor-not-allowed opacity-50'
        )}
        onClick={handleCart}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CART_ICON} alt="" width={18} height={17} className="h-[17px] w-[18px]" />
        <span className="cart-label">{soldOut ? tProduct('outOfStock') : '담기'}</span>
      </button>
      <h3 className="mt-[17px] mb-[11px] min-h-[38px] overflow-hidden text-[16px] font-light leading-normal tracking-[-0.32px] text-kn541-black line-clamp-2">
        <Link href={`/products/${pid}`} className="block min-w-0">
          {categoryLabel ? (
            <span className="title-line mb-0.5 block truncate text-[12px] font-normal text-[#999]">{categoryLabel}</span>
          ) : null}
          {product.brand ? (
            <span className="title-line mb-0.5 block truncate text-[13px] font-normal text-[#888]">{product.brand}</span>
          ) : null}
          <span className="title-line block">{l1}</span>
          <span className="title-line block">{l2}</span>
        </Link>
      </h3>
      <p className="price m-0 flex flex-wrap items-baseline gap-x-3 leading-[1.2]">
        {rate > 0 && <span className="text-[18px] font-normal text-kn541-red">{rate}%</span>}
        <strong className="text-[18px] font-bold">{formatPrice(sale)}</strong>
        {retail > sale && (
          <del className="-order-1 mb-[3px] basis-full text-[14px] font-normal text-[#b5b5b5] line-through decoration-1">
            {formatPrice(retail)}
          </del>
        )}
      </p>
      <p className="review">999+</p>
    </article>
  )
}
