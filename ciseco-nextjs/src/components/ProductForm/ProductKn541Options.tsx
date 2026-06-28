'use client'

import clsx from 'clsx'
import { formatPrice } from '@/lib/formatPrice'

export type Kn541ProductOption = {
  id: string
  option_name: string
  add_price: number
  stock_qty: number
}

export default function ProductKn541Options({
  options,
  selectedId,
  onSelect,
  disabled = false,
  className,
}: {
  options: Kn541ProductOption[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
  className?: string
}) {
  if (!options.length) return null

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">옵션 선택</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = opt.id === selectedId
          const isOutOfStock = opt.stock_qty === 0
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled || isOutOfStock}
              onClick={() => onSelect(isSelected ? '' : opt.id)}
              className={clsx(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300',
                (disabled || isOutOfStock) && 'cursor-not-allowed opacity-40 line-through'
              )}
            >
              {opt.option_name}
              {opt.add_price > 0 && ` (+${formatPrice(opt.add_price)})`}
            </button>
          )
        })}
      </div>
      {!selectedId && (
        <p className="text-xs text-amber-600 dark:text-amber-400">옵션을 선택해 주세요.</p>
      )}
    </div>
  )
}
