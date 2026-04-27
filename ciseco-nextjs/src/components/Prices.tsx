import clsx from 'clsx'
import { FC } from 'react'

export interface PricesProps {
  className?: string
  price: number
  contentClass?: string
}

// ★ 한국 원화 포맷: 30,000원
const Prices: FC<PricesProps> = ({
  className,
  price,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
}) => {
  const formatted = new Intl.NumberFormat('ko-KR').format(Math.round(price))

  return (
    <div className={clsx(className)}>
      <div className={`flex items-center ${contentClass}`}>
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {formatted}
          <span className="ms-0.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">원</span>
        </span>
      </div>
    </div>
  )
}

export default Prices
