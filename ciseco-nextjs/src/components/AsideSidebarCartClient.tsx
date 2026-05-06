'use client'

import { Aside, useAside } from '@/components/aside/aside'
import { Link } from '@/components/Link'
import type { CartItem } from '@/lib/cart-context'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/lib/cart-context'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import toast from 'react-hot-toast'

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
            <div className="mt-6 flex justify-center text-center text-sm text-neutral-500 dark:text-neutral-400">
              <p className="text-xs">
                {t('or')}{' '}
                <Link href="/products" className="text-xs font-medium uppercase">
                  {t('continueShoppingLink')}
                  <span aria-hidden="true"> →</span>
                </Link>
              </p>
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
  const maxQ = product.stockQty > 0 ? Math.min(product.stockQty, 99) : 99
  const opts = Array.from({ length: maxQ }, (_, i) => i + 1)

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
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="inline-grid w-full max-w-16 grid-cols-1">
            <select
              name={`quantity-${product.id}`}
              aria-label={`${qtyLabel}, ${product.name}`}
              className="col-start-1 row-start-1 appearance-none rounded-md py-0.5 ps-3 pe-8 text-xs/6 outline-1 -outline-offset-1 outline-neutral-900/10 focus:outline-1 dark:outline-white/15"
              value={Math.min(product.quantity, maxQ)}
              onChange={(e) => {
                const q = Number(e.target.value)
                if (q < 1) return
                if (product.stockQty > 0 && q > product.stockQty) {
                  toast.error('재고 수량을 초과할 수 없습니다.')
                  return
                }
                updateQty(product.id, q)
              }}
            >
              {opts.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 me-2 size-4 self-center justify-self-end text-neutral-500 dark:text-neutral-400"
            />
          </div>

          <div className="flex">
            <button
              type="button"
              className="font-medium text-primary-600 dark:text-primary-500"
              onClick={() => removeItem(product.id)}
            >
              {removeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
