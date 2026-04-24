'use client'
// KN541 상품 상세 — 장바구니 담기 / 바로구매
// fix: isSoldout prop 추가 — 서버에서 계산된 품절 상태로 버튼 비활성화

import NcInputNumber from '@/components/NcInputNumber'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import { useCart } from '@/lib/cart-context'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  productId: string
  options: any
  price: number
  productName: string
  productImage: string
  shippingFee?: number
  freeShippingOver?: number
  scType?: number
  productStatus: string
  stock: number
  hasColorOption: boolean
  hasSizeOption: boolean
  listingStatus?: string
  isSoldout?: boolean // ★ 서버에서 계산된 품절 여부
}

function validateCartAction(p: {
  productStatus: string
  stock: number
  qty: number
  hasColorOption: boolean
  hasSizeOption: boolean
  colorSelected: string
  sizeSelected: string
  listingStatus?: string
  isSoldout?: boolean
}): string | null {
  const { productStatus, stock, qty, hasColorOption, hasSizeOption, colorSelected, sizeSelected, listingStatus, isSoldout } = p
  // ★ 서버에서 계산된 품절 상태 우선 체크
  if (isSoldout) return '현재 구매할 수 없는 상품입니다.'
  const list = (listingStatus || '').trim()
  if (list === '품절' || list === '판매종료' || list === 'Sold Out') return '현재 구매할 수 없는 상품입니다.'
  const ps = (productStatus || '').toUpperCase()
  if (ps && ['SOLDOUT', 'SOLD_OUT', 'DISCONTINUED', 'INACTIVE', 'WAITING', 'PENDING'].includes(ps))
    return '현재 구매할 수 없는 상품입니다.'
  if (stock <= 0) return '품절된 상품입니다.'
  if (qty > stock) return `최대 ${stock.toLocaleString('ko-KR')}개까지 구매할 수 있습니다.`
  if (hasColorOption && !String(colorSelected).trim()) return '색상을 선택해 주세요.'
  if (hasSizeOption && !String(sizeSelected).trim()) return '사이즈를 선택해 주세요.'
  return null
}

export default function ProductActions({
  productId, options, price, productName, productImage,
  shippingFee = 0, freeShippingOver = 0, scType = 1,
  productStatus, stock, hasColorOption, hasSizeOption, listingStatus, isSoldout,
}: Props) {
  const router = useRouter()
  const { addItem, clearCart } = useCart()
  const [qty, setQty] = useState(1)
  const [colorSel, setColorSel] = useState('')
  const [sizeSel, setSizeSel] = useState('')

  const maxQty = Math.max(1, Math.min(99, stock || 1))

  const blockReason = useMemo(
    () => validateCartAction({ productStatus, stock, qty, hasColorOption, hasSizeOption, colorSelected: colorSel, sizeSelected: sizeSel, listingStatus, isSoldout }),
    [productStatus, stock, qty, hasColorOption, hasSizeOption, colorSel, sizeSel, listingStatus, isSoldout]
  )

  const buildOption = () => {
    const parts: string[] = []
    if (colorSel) parts.push(colorSel)
    if (sizeSel) parts.push(sizeSel)
    return parts.join(' / ') || undefined
  }

  const runWithValidation = (fn: () => void) => {
    const err = validateCartAction({ productStatus, stock, qty, hasColorOption, hasSizeOption, colorSelected: colorSel, sizeSelected: sizeSel, listingStatus, isSoldout })
    if (err) { toast.error(err); return }
    fn()
  }

  const cartPayload = () => ({
    productId, name: productName, price, quantity: qty,
    image: productImage, option: buildOption(),
    shippingFee, freeShippingOver, scType,
    stockQty: stock,
  })

  const handleAddToCart = () => {
    runWithValidation(() => {
      addItem(cartPayload())
      toast.success(
        <span>
          장바구니에 담겼습니다!{' '}
          <button type="button" className="font-semibold underline" onClick={() => router.push('/ko/cart')}>
            장바구니 보기
          </button>
        </span>,
        { duration: 3000 }
      )
    })
  }

  const handleBuyNow = () => {
    runWithValidation(() => {
      clearCart()
      addItem(cartPayload())
      router.push('/ko/checkout')
    })
  }

  const buttonsDisabled = Boolean(blockReason)
  const hint = stock > 0 && blockReason && !['색상을 선택해 주세요.', '사이즈를 선택해 주세요.'].includes(blockReason)
    ? blockReason : null

  return (
    <div className="flex flex-col gap-6">
      {/* ★ 품절 시 안내 메시지 */}
      {isSoldout && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-center">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            현재 구매할 수 없는 상품입니다.
          </p>
        </div>
      )}

      {!isSoldout && (
        <>
          <ProductColorOptions options={options} colorSelected={colorSel} onColorChange={setColorSel} />
          <ProductSizeOptions options={options} sizeSelected={sizeSel} onSizeChange={setSizeSel} />

          {hasColorOption && !colorSel.trim() && (
            <p className="text-sm text-amber-700 dark:text-amber-400">색상을 선택해 주세요.</p>
          )}
          {hasSizeOption && !sizeSel.trim() && (
            <p className="text-sm text-amber-700 dark:text-amber-400">사이즈를 선택해 주세요.</p>
          )}
          {hint && <p className="text-sm text-red-600 dark:text-red-400">{hint}</p>}

          {/* 수량 */}
          <div className="flex items-center gap-3">
            <span className="w-20 text-sm font-medium text-neutral-600 dark:text-neutral-400">수량</span>
            <div className="flex items-center justify-center rounded-full bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800">
              <NcInputNumber defaultValue={1} min={1} max={maxQty} onChange={(val) => setQty(val)} />
            </div>
            {stock > 0 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                (재고 {stock.toLocaleString('ko-KR')}개)
              </span>
            )}
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={handleAddToCart} disabled={buttonsDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
          <HugeiconsIcon icon={ShoppingBag03Icon} size={18} color="currentColor" strokeWidth={1.5} className="hidden sm:block" />
          <span>{isSoldout ? '품절' : '장바구니에 담기'}</span>
        </button>
        <button type="button" onClick={handleBuyNow} disabled={buttonsDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
          {isSoldout ? '구매불가' : '바로구매'}
        </button>
      </div>
    </div>
  )
}
