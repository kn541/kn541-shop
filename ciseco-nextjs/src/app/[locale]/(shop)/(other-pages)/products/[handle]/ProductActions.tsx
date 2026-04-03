'use client'

import NcInputNumber from '@/components/NcInputNumber'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  options: any
  colorSelected: string
  sizeSelected: string
  price: number
  productName: string
  productImage: string
}

export default function ProductActions({
  options,
  colorSelected,
  sizeSelected,
  price,
  productName,
  productImage,
}: Props) {
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    // localStorage에 장바구니 저장 (실제 연동 시 zustand or context로 교체)
    try {
      const existing = JSON.parse(localStorage.getItem('kn541_cart') || '[]')
      const item = {
        id: Date.now().toString(),
        name: productName,
        price,
        quantity: qty,
        image: productImage,
        color: colorSelected,
        size: sizeSelected,
      }
      localStorage.setItem('kn541_cart', JSON.stringify([...existing, item]))
    } catch {}

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    // 바로구매: 장바구니에 담고 결제페이지로
    try {
      const item = {
        id: Date.now().toString(),
        name: productName,
        price,
        quantity: qty,
        image: productImage,
        color: colorSelected,
        size: sizeSelected,
      }
      localStorage.setItem('kn541_cart', JSON.stringify([item]))
    } catch {}
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
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {added ? (
            <>
              <span>✓</span>
              <span>담겼습니다!</span>
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={ShoppingBag03Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.5}
                className="hidden sm:block"
              />
              <span>장바구니에 담기</span>
            </>
          )}
        </button>

        {/* 바로구매 */}
        <button
          onClick={handleBuyNow}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          바로구매
        </button>
      </div>

      {/* 장바구니 버튼 클릭 시 안내 */}
      {added && (
        <div className="flex items-center justify-between rounded-2xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-400">✅ 장바구니에 담겼습니다</p>
          <button
            onClick={() => router.push('/ko/cart')}
            className="text-sm font-semibold text-green-700 underline dark:text-green-400"
          >
            장바구니 보기 →
          </button>
        </div>
      )}
    </div>
  )
}
