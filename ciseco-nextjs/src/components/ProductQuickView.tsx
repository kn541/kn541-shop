'use client'

// KN541 빠른보기(Quick View) — 전면 개편
// fix: getProductById + adaptProduct 직접 사용 (불필요한 우회 제거)
// fix: 이미지 src 불일치 수정 (images[0].src 사용)
// fix: 장바구니 실제 연동 (useCart().addItem)
// fix: 로딩 스켈레톤 추가
// fix: 영문 텍스트 한국어화
// fix: 더미 AccordionInfo → 실제 상품 설명 + 배송 정보
// fix: 별점 0이면 숨기기
// feat: 배송비 정보 표시
// feat: KN541 옵션(add_price 기반) 선택 UI

import LikeButton from '@/components/LikeButton'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { getProductById } from '@/lib/api/products'
import { adaptProduct } from '@/lib/adapters'
import { useCart } from '@/lib/cart-context'
import { Link } from '@/shared/link'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FC, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAside } from './aside'

interface ProductQuickViewProps {
  className?: string
}

// ── 로딩 스켈레톤 ──────────────────────────────────────────
function QuickViewSkeleton() {
  return (
    <div className="lg:flex animate-pulse gap-8">
      <div className="w-full lg:w-[50%]">
        <div className="aspect-square rounded-xl bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="w-full pt-6 lg:w-[50%] lg:pt-0 space-y-4">
        <div className="h-7 rounded bg-neutral-200 dark:bg-neutral-700 w-3/4" />
        <div className="h-5 rounded bg-neutral-200 dark:bg-neutral-700 w-1/3" />
        <div className="h-10 rounded bg-neutral-200 dark:bg-neutral-700 w-1/4 mt-4" />
        <div className="h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 mt-6" />
      </div>
    </div>
  )
}

// ── 배송비 텍스트 생성 ─────────────────────────────────────
function getShippingText(scType: number, shippingFee: number, freeShippingOver: number): string {
  if (scType === 1 || shippingFee === 0) return '무료배송'
  const feeStr = shippingFee.toLocaleString('ko-KR')
  if (freeShippingOver > 0) {
    return `${feeStr}원 (${freeShippingOver.toLocaleString('ko-KR')}원 이상 무료)`
  }
  return `${feeStr}원`
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className }) => {
  const { productQuickViewHandle: handle, close } = useAside()
  const { addItem } = useCart()
  const pathname = usePathname()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [qty, setQty] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string>('')

  // ── 상품 데이터 조회 ─────────────────────────────────────
  useEffect(() => {
    if (!handle) return
    setLoading(true)
    setProduct(null)
    setQty(1)
    setSelectedOption('')

    getProductById(handle)
      .then((raw) => setProduct(adaptProduct(raw)))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [handle])

  if (loading) return <QuickViewSkeleton />
  if (!product) return null

  const {
    id: productId,
    title,
    status,
    featuredImage,
    images,
    rating,
    reviewNumber,
    price,
    description,
  } = product

  // 배송 정보
  const delivery = product.delivery || {}
  const shippingFee = Number(delivery.shipping_fee ?? 0)
  const freeShippingOver = Number(delivery.free_over ?? 0)
  const scType = Number(delivery.sc_type ?? 1)
  const returnFee = Number(delivery.return_fee ?? 0)
  const deliveryDays = Number(delivery.delivery_days ?? 3)
  const shippingText = getShippingText(scType, shippingFee, freeShippingOver)
  const returnText = returnFee > 0 ? `반품 ${returnFee.toLocaleString('ko-KR')}원` : '반품 무료'
  const isFreeShipping = scType === 1 || shippingFee === 0

  const stockQty = Number(product.stockQty ?? 0)
  const maxQty = Math.max(1, Math.min(99, stockQty || 1))

  // KN541 옵션 — {id, option_name, add_price, stock_qty} 형태
  const kn541Options: Array<{ id: string; option_name: string; add_price: number; stock_qty: number }> =
    Array.isArray(product.options) ? product.options : []

  // 현재 선택 옵션의 추가 금액
  const selectedOptionObj = kn541Options.find((o) => o.id === selectedOption)
  const addPrice = selectedOptionObj?.add_price ?? 0
  const totalPrice = (price ?? 0) + addPrice

  // 이미지 목록 (중복 제거)
  const allImageSrcs: string[] = [
    featuredImage?.src,
    ...(images || []).map((i: any) => i?.src),
  ]
    .filter(Boolean)
    .filter((src: string, idx: number, arr: string[]) => arr.indexOf(src) === idx)

  const mainImageSrc = allImageSrcs[0] || '/placeholder-product.jpg'
  const subImages = allImageSrcs.slice(1, 3)

  // 상세 페이지 URL
  const locale = pathname.split('/')[1] || 'ko'
  const detailUrl = `/${locale}/products/${handle}`

  // 구매 가능 여부
  const isSoldOut = stockQty === 0 || status === '품절' || status === 'Sold Out'
  const canBuy = !isSoldOut

  // 장바구니 담기
  const handleAddToCart = () => {
    if (!canBuy) { toast.error('품절된 상품입니다.'); return }
    if (kn541Options.length > 0 && !selectedOption) {
      toast.error('옵션을 선택해 주세요.')
      return
    }
    addItem({
      productId: String(productId || handle),
      name: title || '',
      price: totalPrice,
      quantity: qty,
      image: mainImageSrc,
      option: selectedOptionObj?.option_name,
      shippingFee,
      freeShippingOver,
      scType,
      stockQty,
    })
    toast.success('장바구니에 담겼습니다!', { duration: 2500 })
    close('product-quick-view')
  }

  // 아코디언 데이터 (실제 상품 데이터 기반)
  const isHtmlDesc = /<[a-z][\s\S]*>/i.test(description || '')
  const accordionData = [
    ...(description ? [{
      name: '상품 설명',
      content: isHtmlDesc
        ? description
        : `<p class="whitespace-pre-wrap">${description}</p>`,
    }] : []),
    {
      name: '배송 / 교환 / 반품',
      content: `<div class="space-y-1.5 text-sm">
        <div class="flex gap-3"><span class="w-20 shrink-0 font-medium">배송방법</span><span>일반택배 (${deliveryDays}일 이내 출발)</span></div>
        <div class="flex gap-3"><span class="w-20 shrink-0 font-medium">배송비</span><span>${shippingText}</span></div>
        <div class="flex gap-3"><span class="w-20 shrink-0 font-medium">반품비용</span><span>${returnText}</span></div>
        <div class="flex gap-3"><span class="w-20 shrink-0 font-medium">반품기한</span><span>수령 후 30일 이내</span></div>
      </div>`,
    },
  ]

  return (
    <div className={className}>
      <div className="lg:flex lg:gap-8">

        {/* 이미지 영역 */}
        <div className="w-full lg:w-[50%]">
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={mainImageSrc}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-cover"
                alt={title || '상품 이미지'}
                priority
              />
            </div>
            {/* 품절 오버레이 */}
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-neutral-800">품절</span>
              </div>
            )}
            <LikeButton className="absolute end-3 top-3" />
          </div>

          {/* 서브 이미지 (최대 2장) */}
          {subImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {subImages.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={src}
                    fill
                    sizes="25vw"
                    className="h-full w-full object-cover"
                    alt={`${title} 이미지 ${i + 2}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="w-full pt-6 lg:w-[50%] lg:pt-0">
          <div className="flex flex-col gap-5">

            {/* 상품명 */}
            <h2 className="text-xl font-bold leading-snug text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              <Link href={detailUrl}>{title}</Link>
            </h2>

            {/* 가격 + 별점 */}
            <div className="flex flex-wrap items-center gap-3">
              <Prices price={totalPrice} contentClass="py-1 px-2 text-lg font-bold" />
              {isFreeShipping && (
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  무료배송
                </span>
              )}
              {/* 별점 — 0이면 숨기기 */}
              {(rating ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {rating}
                    {(reviewNumber ?? 0) > 0 && ` (${reviewNumber}개 리뷰)`}
                  </span>
                </div>
              )}
            </div>

            {/* 배송비 정보 */}
            <div className="rounded-xl border border-neutral-100 dark:border-neutral-700 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <div className="flex gap-2">
                <span className="w-14 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송비</span>
                <span>{shippingText}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-14 shrink-0 font-medium text-neutral-800 dark:text-neutral-200">배송일</span>
                <span>결제 후 {deliveryDays}일 이내 출발</span>
              </div>
            </div>

            {/* KN541 옵션 선택 */}
            {kn541Options.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">옵션 선택</p>
                <div className="flex flex-wrap gap-2">
                  {kn541Options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id === selectedOption ? '' : opt.id)}
                      disabled={opt.stock_qty === 0}
                      className={[
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                        opt.id === selectedOption
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300',
                        opt.stock_qty === 0 ? 'cursor-not-allowed opacity-40 line-through' : '',
                      ].join(' ')}
                    >
                      {opt.option_name}
                      {opt.add_price > 0 && ` (+${opt.add_price.toLocaleString('ko-KR')}원)`}
                    </button>
                  ))}
                </div>
                {kn541Options.length > 0 && !selectedOption && (
                  <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">옵션을 선택해 주세요.</p>
                )}
              </div>
            )}

            {/* 수량 */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 w-8">수량</span>
              <div className="flex items-center justify-center rounded-full bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800">
                <NcInputNumber defaultValue={1} min={1} max={maxQty} onChange={(val) => setQty(val)} />
              </div>
              {stockQty > 0 && stockQty <= 10 && (
                <span className="text-xs text-orange-600 dark:text-orange-400">재고 {stockQty}개</span>
              )}
            </div>

            {/* 장바구니 버튼 */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canBuy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <HugeiconsIcon icon={ShoppingBag03Icon} size={18} color="currentColor" strokeWidth={1.5} />
              <span>장바구니에 담기</span>
            </button>

            {/* 상세 페이지 이동 */}
            <Link
              href={detailUrl}
              onClick={() => close('product-quick-view')}
              className="text-center text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              상세 페이지에서 보기 →
            </Link>

            {/* 아코디언 — 실제 상품 설명 + 배송 정보 */}
            {accordionData.length > 0 && (
              <div className="w-full space-y-2 pt-2">
                {accordionData.map((item, index) => (
                  <Disclosure key={index} defaultOpen={index === 0}>
                    {({ open }) => (
                      <div>
                        <DisclosureButton className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2.5 text-left text-sm font-medium hover:bg-neutral-200/60 focus:outline-none dark:bg-neutral-800 dark:hover:bg-neutral-700">
                          <span>{item.name}</span>
                          {open
                            ? <MinusIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                            : <PlusIcon className="h-4 w-4 shrink-0 text-neutral-500" />
                          }
                        </DisclosureButton>
                        <DisclosurePanel className="p-4 pt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-6">
                          <div dangerouslySetInnerHTML={{ __html: item.content }} />
                        </DisclosurePanel>
                      </div>
                    )}
                  </Disclosure>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductQuickView
