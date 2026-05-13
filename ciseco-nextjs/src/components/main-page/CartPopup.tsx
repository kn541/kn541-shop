'use client'

import type { MainCartPreviewPayload } from '@/components/main-page/main-cart-types'
import './kn541-main.css'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

type Props = {
  payload: MainCartPreviewPayload | null
  onClose: () => void
}

export function CartPopup({ payload, onClose }: Props) {
  const { addItem } = useCart()
  const t = useTranslations('Cart')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
  }, [payload?.productId, payload?.imageUrl])

  if (!payload) {
    return null
  }

  const maxOrder = 5
  const maxByStock =
    payload.stockQty > 0 ? Math.min(maxOrder, payload.stockQty) : maxOrder
  const dec = () => setQty((q) => Math.max(1, q - 1))
  const inc = () => setQty((q) => Math.min(maxByStock, q + 1))

  const shippingLabel =
    payload.shippingFee > 0 ? formatPrice(payload.shippingFee) : '무료'

  const addToCart = () => {
    if (!payload.productId) {
      toast.error('디자인 샘플 상품입니다.')
      return
    }
    if (payload.stockQty <= 0) {
      toast.error('품절된 상품입니다.')
      return
    }
    addItem({
      productId: payload.productId,
      name: payload.name,
      price: payload.price,
      quantity: qty,
      image: payload.imageUrl,
      shippingFee: payload.shippingFee,
      freeShippingOver: payload.freeShippingOver,
      scType: payload.scType,
      stockQty: payload.stockQty,
    })
    onClose()
    toast.success(
      (toastItem) => (
        <span>
          {t('addedToCartToast')}{' '}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => toast.dismiss(toastItem.id)}
          >
            {t('afterAddContinueShopping')}
          </button>
        </span>
      ),
      { duration: 3000 }
    )
  }

  return (
    <div
      className="cart-popup"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="cart-popup-panel">
        <button type="button" className="cart-popup-close" aria-label="닫기" onClick={onClose} />
        <div className="cart-popup-handle" aria-hidden />
        <h2 id="cart-popup-title">상품선택</h2>
        <div className="cart-popup-product">
          <Image
            src={payload.imageUrl}
            alt=""
            width={50}
            height={50}
            className="size-[50px] rounded-[5px] object-cover"
            unoptimized
          />
          <p>
            <span>{payload.titleLine1}</span>
            <span>{payload.titleLine2}</span>
          </p>
        </div>
        <div className="cart-popup-price">
          <strong>{formatPrice(payload.price)}</strong>
          {payload.originalPrice > payload.price && (
            <del>{formatPrice(payload.originalPrice)}</del>
          )}
          {payload.discountRate > 0 && <span>{payload.discountRate}%</span>}
          <div className="qty-control" aria-label="수량 선택">
            <button type="button" className="qty-minus" aria-label="수량 감소" onClick={dec} />
            <output>{qty}</output>
            <button type="button" className="qty-plus" aria-label="수량 증가" onClick={inc} />
          </div>
        </div>
        <dl className="cart-popup-info">
          <div>
            <dt>주문한도</dt>
            <dd>최대 {maxOrder}개</dd>
          </div>
          <div>
            <dt>배송방법</dt>
            <dd>택배발송</dd>
          </div>
          <div>
            <dt>배송비</dt>
            <dd>{shippingLabel}</dd>
          </div>
        </dl>
        <button type="button" className="cart-popup-submit" onClick={addToCart}>
          장바구니 담기
        </button>
      </div>
    </div>
  )
}
