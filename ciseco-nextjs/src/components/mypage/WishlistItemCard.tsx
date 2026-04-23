'use client'

import Image from 'next/image'

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

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={src}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={src.startsWith('http')}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {item.name}
        </h3>
        <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {item.price.toLocaleString('ko-KR')}원
        </p>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="mt-auto w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          {removing ? '삭제 중…' : '삭제'}
        </button>
      </div>
    </div>
  )
}
