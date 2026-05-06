'use client'

// 메인 전용 상품 카드 — 추천(API) / 플레이스홀더(디자인 샘플)

import type { Product } from '@/lib/api/products'
import { getProductImageUrl } from '@/lib/api/products'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/lib/cart-context'
import { Link } from '@/shared/link'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLACEHOLDER_TITLE = '[사전예약] 제품명 제품명 제품명 제품명 제품 제품명 제품명 제품명 제품명 제품명'

type MainProductCardProps =
  | {
      mode: 'api'
      product: Product
      className?: string
      compact?: boolean
    }
  | {
      mode: 'placeholder'
      imageUrl: string
      className?: string
      compact?: boolean
    }

export function MainProductCard(props: MainProductCardProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'ko'
  const router = useRouter()
  const { addItem } = useCart()
  const compact = props.compact ?? false

  if (props.mode === 'placeholder') {
    return (
      <article
        className={clsx(
          'flex w-[min(42vw,11rem)] shrink-0 flex-col sm:w-[11.25rem]',
          props.className
        )}
        data-placeholder="true"
      >
        {/* TODO: 백엔드 sort=best 추가 후 fetch로 교체 */}
        <div className="relative aspect-[150/192] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={props.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:640px) 42vw, 180px"
          />
        </div>
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-neutral-200 py-2 text-xs font-medium text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
          onClick={() => toast.error('디자인 샘플 상품입니다.')}
        >
          <ShoppingBagIcon className="h-4 w-4" aria-hidden />
          담기
        </button>
        <h3 className={clsx('mt-2 font-medium text-neutral-900 dark:text-neutral-100', compact ? 'text-xs leading-snug' : 'text-sm')}>
          <span className="line-clamp-2">{PLACEHOLDER_TITLE}</span>
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-1 text-sm">
          <span className="font-semibold text-rose-600">88%</span>
          <strong className="text-neutral-900 dark:text-neutral-100">{formatPrice(88888)}</strong>
          <del className="text-xs text-neutral-400">{formatPrice(88888)}</del>
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">999+</p>
      </article>
    )
  }

  const { product } = props
  const pid = product.product_id || product.id || ''
  const img = getProductImageUrl(product)
  const sale = Number(product.sale_price) || 0
  const retail = Number(product.market_price ?? product.consumer_price ?? 0) || sale
  const rate =
    product.sale_discount_rate != null
      ? Math.round(Number(product.sale_discount_rate))
      : retail > sale
        ? Math.round((1 - sale / retail) * 100)
        : 0
  const soldOut =
    product.is_soldout ||
    product.product_status === '품절' ||
    (Number(product.stock_qty) || 0) <= 0

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      router.push(`/${locale}`)
      return
    }
    if (soldOut) {
      toast.error('품절된 상품입니다.')
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
      <span>
        장바구니에 담겼습니다!{' '}
        <button
          type="button"
          className="font-semibold underline"
          onClick={() => router.push(`/${locale}/cart`)}
        >
          장바구니 보기
        </button>
      </span>,
      { duration: 3000 }
    )
  }

  return (
    <article
      className={clsx(
        'flex w-[min(42vw,11rem)] shrink-0 flex-col sm:w-[11.25rem]',
        props.className
      )}
    >
      <Link href={`/products/${pid}`} className="relative block aspect-[150/192] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Image src={img} alt="" fill className="object-cover" sizes="(max-width:640px) 42vw, 180px" />
      </Link>
      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-neutral-200 py-2 text-xs font-medium text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
        onClick={handleCart}
      >
        <ShoppingBagIcon className="h-4 w-4" aria-hidden />
        담기
      </button>
      <h3 className={clsx('mt-2 font-medium text-neutral-900 dark:text-neutral-100', compact ? 'text-xs leading-snug' : 'text-sm')}>
        <Link href={`/products/${pid}`} className="line-clamp-2">
          {product.product_name}
        </Link>
      </h3>
      <p className="mt-1 flex flex-wrap items-baseline gap-1 text-sm">
        {rate > 0 && <span className="font-semibold text-rose-600">{rate}%</span>}
        <strong className="text-neutral-900 dark:text-neutral-100">{formatPrice(sale)}</strong>
        {retail > sale && <del className="text-xs text-neutral-400">{formatPrice(retail)}</del>}
      </p>
    </article>
  )
}
