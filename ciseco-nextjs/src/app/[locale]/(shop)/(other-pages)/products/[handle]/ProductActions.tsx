'use client'
// KN541 상품 상세 — 장바구니 담기 / 바로구매

import NcInputNumber from '@/components/NcInputNumber'
import { ProductDetailWishlistHeart } from '@/components/ProductDetailWishlistHeart'
import { ProductDetailShareButton } from '@/components/ProductDetailShareButton'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductKn541Options, { type Kn541ProductOption } from '@/components/ProductForm/ProductKn541Options'
import ProductKn541ComboOptions from '@/components/ProductForm/ProductKn541ComboOptions'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import { useCart } from '@/lib/cart-context'
import {
  fetchOptionGroups,
  type OptionCombination,
  type OptionGroup,
  type OptionGroupsData,
} from '@/hooks/useOptionGroups'
import { HugeiconsIcon } from '@hugeicons/react'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

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
  stockIsReal?: boolean
  hasColorOption: boolean
  hasSizeOption: boolean
  kn541Options?: Kn541ProductOption[]
  isOption?: boolean
  listingStatus?: string
  isSoldout?: boolean
}

function validateCartAction(p: {
  productStatus: string
  stock: number
  qty: number
  hasColorOption: boolean
  hasSizeOption: boolean
  hasKn541Options: boolean
  hasComboOptions: boolean
  colorSelected: string
  sizeSelected: string
  kn541OptionSelected: string
  comboValue1: string
  comboValue2: string
  listingStatus?: string
  isSoldout?: boolean
  stockIsReal?: boolean
}): string | null {
  const {
    productStatus, stock, qty, hasColorOption, hasSizeOption, hasKn541Options, hasComboOptions,
    colorSelected, sizeSelected, kn541OptionSelected, comboValue1, comboValue2,
    listingStatus, isSoldout, stockIsReal = true,
  } = p
  if (isSoldout) return '현재 구매할 수 없는 상품입니다.'
  const list = (listingStatus || '').trim()
  if (list === '품절' || list === '판매종료') return '현재 구매할 수 없는 상품입니다.'
  const ps = (productStatus || '').toUpperCase()
  if (ps && ['SOLDOUT', 'SOLD_OUT', 'DISCONTINUED', 'INACTIVE', 'WAITING', 'PENDING'].includes(ps))
    return '현재 구매할 수 없는 상품입니다.'
  if (ps && ps !== 'ON_SALE' && ps !== 'ACTIVE') return '현재 구매할 수 없는 상품입니다.'
  const useStockQty = hasComboOptions || stockIsReal
  if (useStockQty && stock <= 0) return '품절된 상품입니다.'
  if (useStockQty && qty > stock) return `최대 ${stock.toLocaleString('ko-KR')}개까지 구매할 수 있습니다.`
  if (hasComboOptions) {
    if (!comboValue1 || !comboValue2) return '옵션을 선택해 주세요.'
    return null
  }
  if (hasKn541Options && !String(kn541OptionSelected).trim()) return '옵션을 선택해 주세요.'
  if (hasColorOption && !String(colorSelected).trim()) return '색상을 선택해 주세요.'
  if (hasSizeOption && !String(sizeSelected).trim()) return '사이즈를 선택해 주세요.'
  return null
}

export default function ProductActions({
  productId, options, price, productName, productImage,
  shippingFee = 0, freeShippingOver = 0, scType = 1,
  productStatus, stock, hasColorOption, hasSizeOption,
  kn541Options = [], isOption = false, listingStatus, isSoldout = false, stockIsReal = true,
}: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'ko'
  const tCart    = useTranslations('Cart')
  const { addItem, clearCart } = useCart()
  const [qty, setQty] = useState(1)
  const [colorSel, setColorSel] = useState('')
  const [sizeSel, setSizeSel] = useState('')
  const [kn541Sel, setKn541Sel] = useState('')
  const [comboValue1, setComboValue1] = useState('')
  const [comboValue2, setComboValue2] = useState('')
  const [optionData, setOptionData] = useState<OptionGroupsData | null>(null)

  useEffect(() => {
    if (!isOption || !productId) {
      setOptionData(null)
      return
    }
    let cancelled = false
    void fetchOptionGroups(productId).then(data => {
      if (!cancelled) setOptionData(data)
    })
    return () => {
      cancelled = true
    }
  }, [isOption, productId])

  const hasCombinations = (optionData?.combinations?.length ?? 0) > 0
  const comboGroups: OptionGroup[] = optionData?.groups ?? []
  const hasComboMode = hasCombinations && comboGroups.length === 2

  const selectedCombo: OptionCombination | undefined = useMemo(() => {
    if (!hasComboMode || !comboValue1 || !comboValue2) return undefined
    return optionData?.combinations.find(
      c => c.value1_id === comboValue1 && c.value2_id === comboValue2,
    )
  }, [hasComboMode, comboValue1, comboValue2, optionData?.combinations])

  const legacyKn541Options = hasComboMode ? [] : kn541Options
  const hasKn541Options = legacyKn541Options.length > 0
  const maxQty = selectedCombo
    ? Math.max(selectedCombo.stock_qty, 0) || 1
    : stockIsReal && stock > 0
      ? stock
      : 99

  const selectedKn541Option = legacyKn541Options.find(o => o.id === kn541Sel)
  const unitPrice =
    price +
    (selectedCombo ? Number(selectedCombo.add_price) || 0 : selectedKn541Option?.add_price ?? 0)

  const validationParams = {
    productStatus, stock: selectedCombo ? selectedCombo.stock_qty : stock, qty,
    hasColorOption, hasSizeOption, hasKn541Options,
    hasComboOptions: hasComboMode,
    colorSelected: colorSel, sizeSelected: sizeSel, kn541OptionSelected: kn541Sel,
    comboValue1, comboValue2,
    listingStatus, isSoldout, stockIsReal,
  }

  const blockReason = useMemo(
    () => validateCartAction(validationParams),
    [
      productStatus, stock, qty, hasColorOption, hasSizeOption, hasKn541Options, hasComboMode,
      colorSel, sizeSel, kn541Sel, comboValue1, comboValue2, listingStatus, isSoldout, stockIsReal, selectedCombo,
    ],
  )

  const buildOption = () => {
    if (selectedCombo?.option_name) return selectedCombo.option_name
    if (selectedKn541Option?.option_name) return selectedKn541Option.option_name
    const parts: string[] = []
    if (colorSel) parts.push(colorSel)
    if (sizeSel) parts.push(sizeSel)
    return parts.join(' / ') || undefined
  }

  /** KN541 옵션 UUID — POST /orders option_id 로 전달
   *  콤보: OptionCombination.id / kn541 레거시: kn541Sel(UUID) / 색상·사이즈 구형: undefined */
  const buildOptionId = (): string | undefined => {
    if (hasComboMode && selectedCombo) return selectedCombo.id
    if (hasKn541Options && kn541Sel) return kn541Sel
    return undefined
  }

  const runWithValidation = (fn: () => void) => {
    const err = validateCartAction(validationParams)
    if (err) { toast.error(err); return }
    fn()
  }

  const cartPayload = () => ({
    productId,
    name: productName,
    price: unitPrice,
    quantity: qty,
    image: productImage,
    option: buildOption(),
    optionId: buildOptionId(),
    shippingFee,
    freeShippingOver,
    scType,
    stockQty: selectedCombo ? selectedCombo.stock_qty : stock,
  })

  const handleAddToCart = () => {
    runWithValidation(() => {
      addItem(cartPayload())
      toast.success(
        toastItem => (
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
        { duration: 3000 },
      )
    })
  }

  const handleBuyNow = () => {
    runWithValidation(() => {
      clearCart()
      addItem(cartPayload())
      router.push(`/${locale}/checkout`)
    })
  }

  const buttonsDisabled = Boolean(blockReason)
  const optionHints = ['옵션을 선택해 주세요.', '색상을 선택해 주세요.', '사이즈를 선택해 주세요.']
  const hint = (stockIsReal ? stock > 0 : true) && blockReason && !optionHints.includes(blockReason) ? blockReason : null

  // 데스크톱(md+) — 여유 폭. 찜·공유는 세로 묶음
  const ctaButtons = (
    <>
      <button type="button" onClick={handleAddToCart} disabled={buttonsDisabled}
        className="flex min-h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6">
        <HugeiconsIcon icon={ShoppingBag03Icon} size={18} color="currentColor" strokeWidth={1.5} className="hidden sm:block" />
        <span>장바구니에 담기</span>
      </button>
      <button type="button" onClick={handleBuyNow} disabled={buttonsDisabled}
        className="flex min-h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:px-6">
        바로구매
      </button>
      <div className="flex flex-col items-center gap-2">
        <ProductDetailWishlistHeart productId={productId} />
        <ProductDetailShareButton title={productName} price={unitPrice} imageUrl={productImage} />
      </div>
    </>
  )

  // 모바일 하단 고정 바 — 한 줄 고정(줄바꿈 금지). 찜·공유는 가로 아이콘, CTA 2개가 남은 폭 차지
  const mobileCtaButtons = (
    <>
      <ProductDetailWishlistHeart productId={productId} />
      <ProductDetailShareButton title={productName} price={unitPrice} imageUrl={productImage} />
      <button type="button" onClick={handleAddToCart} disabled={buttonsDisabled}
        className="flex min-h-[52px] min-w-0 flex-1 items-center justify-center rounded-full bg-primary-600 px-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
        장바구니
      </button>
      <button type="button" onClick={handleBuyNow} disabled={buttonsDisabled}
        className="flex min-h-[52px] min-w-0 flex-1 items-center justify-center rounded-full bg-neutral-900 px-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
        바로구매
      </button>
    </>
  )

  return (
    <div className="flex flex-col gap-6">
      {hasComboMode ? (
        <ProductKn541ComboOptions
          groups={comboGroups}
          combinations={optionData?.combinations ?? []}
          selectedValue1={comboValue1}
          selectedValue2={comboValue2}
          onSelectValue1={setComboValue1}
          onSelectValue2={setComboValue2}
          disabled={isSoldout || (stockIsReal && stock <= 0)}
        />
      ) : hasKn541Options ? (
        <ProductKn541Options
          options={legacyKn541Options}
          selectedId={kn541Sel}
          onSelect={setKn541Sel}
          disabled={isSoldout || (stockIsReal && stock <= 0)}
        />
      ) : (
        <>
          <ProductColorOptions options={options} colorSelected={colorSel} onColorChange={setColorSel} />
          <ProductSizeOptions options={options} sizeSelected={sizeSel} onSizeChange={setSizeSel} />
          {hasColorOption && !colorSel.trim() && (
            <p className="text-sm text-amber-700 dark:text-amber-400">색상을 선택해 주세요.</p>
          )}
          {hasSizeOption && !sizeSel.trim() && (
            <p className="text-sm text-amber-700 dark:text-amber-400">사이즈를 선택해 주세요.</p>
          )}
        </>
      )}
      {hint && <p className="text-sm text-red-600 dark:text-red-400">{hint}</p>}

      <div className="flex items-center gap-3">
        <span className="w-20 text-sm font-medium text-neutral-600 dark:text-neutral-400">수량</span>
        <div className="flex items-center justify-center rounded-full bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800">
          <NcInputNumber
            defaultValue={1}
            min={1}
            max={maxQty}
            disabled={isSoldout || (selectedCombo ? selectedCombo.stock_qty <= 0 : stockIsReal && stock <= 0)}
            onChange={val => setQty(val)}
          />
        </div>
        {(selectedCombo ? selectedCombo.stock_qty > 0 : stockIsReal && stock > 0) && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            (재고 {(selectedCombo ? selectedCombo.stock_qty : stock).toLocaleString('ko-KR')}개)
          </span>
        )}
      </div>

      <div className="hidden flex-wrap items-center gap-3 pt-2 md:flex">
        {ctaButtons}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-nowrap items-center gap-2">
          {mobileCtaButtons}
        </div>
      </div>

      <div className="h-24 shrink-0 md:hidden" aria-hidden />
    </div>
  )
}
