'use client'
// KN541 상품 상세 — 장바구니 담기 / 바로구매
// useCart Context로 전역 상태 관리 (localStorage 동기화)

import NcInputNumber from '@/components/NcInputNumber'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import { useCart } from '@/lib/cart-context'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  productId: string   // ★ UUID (장바구니 ID 키)
  options: any
  colorSelected: string
  sizeSelected: string
  price: number
  productName: string
  productImage: string
}

export default function ProductActions({
  productId,
  options,
  colorSelected,
  sizeSelected,
  price,
  productName,
  productImage,
}: Props) {
  const router = useRouter()
  const { addItem, clearCart } = useCart()
  const [qty, setQty] = useState(1)

  // 선택된 옵션 텍스트 생성
  const buildOption = () => {
    const parts: string[] = []
    if (colorSelected) parts.push(colorSelected)
    if (sizeSelected) parts.push(sizeSelected)
    return parts.join(' / ') || undefined
  }

  // ── 장바구니 담기 ──
  const handleAddToCart = () => {
    addItem({
      productId,
      name: productName,
      price,
      quantity: qty,
      image: productImage,
      option: buildOption(),
    })
    toast.success(
      <span>
        장바구니에 담겼습니다!{' '}
        <button
          className="font-semibold underline"
          onClick={() => router.push('/ko/cart')}
        >
          장바구니 보기
        </button>
      </span>,
      { duration: 3000 }
    )
  }

  // ── 바로구매 ── 기존 장바구니를 이 상품으로 대체 후 결제페이지로
  const handleBuyNow = () => {
    clearCart()
    addItem({
      productId,
      name: productName,
      price,
      quantity: qty,
      image: productImage,
      option: buildOption(),
    })
    router.push('/ko/checkout')
  }

  return (
    <div className="flex flex-col gap-6">
      <ProductColorOptions options={options} defaultColor={colorSelected} />
      <ProductSizeOptions options={options} defaultSize={sizeSelected} />

      {/* 수량 */}
      <div className="flex items-center gap-3">
        <span className="w-20 text-sm font-medium text-neutral-600 dark:text-neutral-400">수량</span>
        <div className="flex items-center justify-center rounded-full bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800">
          <NcInputNumber
            defaultValue={1}
            min={1}
            max={99}
            onChange={(val) => setQty(val)}
          />
        </div>
      </div>

      {/* 버튼 2개 */}
      <div className="flex gap-3 pt-2">
        {/* 장바구니 */}
        <button
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <HugeiconsIcon
            icon={ShoppingBag03Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.5}
            className="hidden sm:block"
          />
          <span>장바구니에 담기</span>
        </button>

        {/* 바로구매 */}
        <button
          onClick={handleBuyNow}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          바로구매
        </button>
      </div>
    </div>
  )
}
