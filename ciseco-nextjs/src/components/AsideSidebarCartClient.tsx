'use client'

import { Aside, useAside } from '@/components/aside/aside'
import { Link } from '@/components/Link'
import type { CartItem } from '@/lib/cart-context'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/lib/cart-context'
import NcInputNumber from '@/components/NcInputNumber'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog'

export default function AsideSidebarCartClient() {
  const t = useTranslations('Cart')
  const { items, totalPrice } = useCart()

  return (
    <Aside openFrom="right" type="cart" heading={t('title')}>
      <div className={clsx('flex h-full flex-col')}>
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
          {items.length === 0 ? (
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">{t('empty')}</p>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10">
                {items.map((product) => (
                  <CartLine key={product.id} product={product} removeLabel={t('remove')} qtyLabel={t('quantity')} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <section
          aria-labelledby="summary-heading"
          className="mt-auto grid shrink-0 gap-4 border-t border-neutral-900/10 py-6 dark:border-neutral-100/10"
        >
          <h2 id="summary-heading" className="sr-only">
            {t('orderSummary')}
          </h2>
          <div>
            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-neutral-100">
              <p className="font-medium">{t('subtotal')}</p>
              <p className="font-medium">{formatPrice(totalPrice)}</p>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{t('shippingTaxNote')}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <ButtonSecondary href="/cart">{t('viewCart')}</ButtonSecondary>
              <ButtonPrimary href="/checkout">{t('checkout')}</ButtonPrimary>
            </div>
          </div>
        </section>
      </div>
    </Aside>
  )
}

function CartLine({
  product,
  removeLabel,
  qtyLabel,
}: {
  product: CartItem
  removeLabel: string
  qtyLabel: string
}) {
  const { removeItem, updateQty } = useCart()
  const { close } = useAside()
  const maxQty = product.stockQty > 0 ? product.stockQty : 99
  const [removeOpen, setRemoveOpen] = useState(false)

  return (
    <div className="flex py-5 last:pb-0">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {product.image ? (
          <Image fill src={product.image} alt="" className="object-contain" sizes="200px" />
        ) : null}
        <Link className="absolute inset-0" href={`/products/${product.productId}`} onClick={() => close()} />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="text-base font-medium">
                <Link href={`/products/${product.productId}`} onClick={() => close()}>
                  {product.name}
                </Link>
              </h3>
              {product.option ? (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{product.option}</p>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatPrice(product.price * product.quantity)}
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between gap-2 text-sm">
          <div className="max-w-[11rem] shrink-0 rounded-full bg-neutral-100 py-1 pe-1 ps-1 dark:bg-neutral-800">
            <NcInputNumber
              key={product.id}
              className="!gap-0"
              defaultValue={Math.min(Number(product.quantity) || 1, maxQty)}
              min={1}
              max={maxQty}
              aria-label={`${qtyLabel}, ${product.name}`}
              onChange={(q) => updateQty(product.id, q)}
            />
          </div>

          <div className="flex">
            <button
              type="button"
              className="font-medium text-primary-600 dark:text-primary-500"
              onClick={() => setRemoveOpen(true)}
            >
              {removeLabel}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={async () => {
          removeItem(product.id)
        }}
      />
    </div>
  )
}
