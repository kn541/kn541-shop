'use client'

import clsx from 'clsx'
import { formatPrice } from '@/lib/formatPrice'
import { usePreopenHidePrice, HIDDEN_PRICE_LABEL } from '@/lib/preopenPrice'
import { useLocale } from 'next-intl'
import { FC } from 'react'

export interface PricesProps {
  className?: string
  price: number
  contentClass?: string
}

const Prices: FC<PricesProps> = ({
  className,
  price,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
}) => {
  const locale = useLocale()
  const hidePrice = usePreopenHidePrice()

  if (hidePrice) {
    return (
      <div className={clsx(className)}>
        <div className={`flex items-center ${contentClass}`}>
          <span className="font-medium text-neutral-500 dark:text-neutral-400">{HIDDEN_PRICE_LABEL}</span>
        </div>
      </div>
    )
  }

  const rounded = Math.round(price)
  const formattedNum = new Intl.NumberFormat('ko-KR').format(rounded)

  return (
    <div className={clsx(className)}>
      <div className={`flex items-center ${contentClass}`}>
        {locale === 'ko' ? (
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatPrice(price)}</span>
        ) : (
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {formattedNum}
            <span className="ms-0.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">원</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default Prices
