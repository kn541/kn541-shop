'use client'
import Image from 'next/image'
import { Link } from '@/shared/link'
import { formatPrice } from '@/lib/formatPrice'

export interface WishlistProduct {
  product_id: string
  name: string
  price: number
  thumbnail_url: string | null
}

const PLACEHOLDER = '/placeholder-product.jpg'

export default function WishlistItemCard({
  item,
  onRemove,
  removing,
}: {
  item: WishlistProduct
  onRemove: () => void
  removing?: boolean
}) {
  const src = item.thumbnail_url?.trim() || PLACEHOLDER
  const productHref = `/products/${item.product_id}`

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <Link href={productHref} className="relative block aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
        <Image src={src} alt={item.name} fill className="object-cover transition-opacity hover:opacity-90" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized={src.startsWith('http')} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={productHref} className="group flex flex-col gap-1">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-neutral-100 dark:group-hover:text-primary-400">{item.name}</h3>
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">{formatPrice(item.price)}</p>
        </Link>
        <button type="button" onClick={onRemove} disabled={removing} className="mt-auto w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40">
          {removing ? '삭제 중…' : '삭제'}
        </button>
      </div>
    </div>
  )
}
