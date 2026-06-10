'use client'

import clsx from 'clsx'
import { formatPriceKo } from '@/lib/formatPrice'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from 'next-intl'
import { FC } from 'react'

export interface PricesProps {
  className?: string
  price: number
  contentClass?: string
}

// 프리오픈(폐쇄몰) 모드: 환경변수 NEXT_PUBLIC_PREOPEN_HIDE_PRICE === 'true' 이고
// 비로그인 상태일 때만 가격을 숨긴다. 오픈 시 Vercel 환경변수를 false로 바꾸고
// 재배포하면 전원 정상 노출된다.
const PREOPEN_HIDE_PRICE = process.env.NEXT_PUBLIC_PREOPEN_HIDE_PRICE === 'true'
const HIDDEN_PRICE_LABEL = '로그인 후 가격 확인'

const Prices: FC<PricesProps> = ({
  className,
  price,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
}) => {
  const locale = useLocale()
  const { user, loading } = useAuth()

  // 프리오픈 모드 + (로딩 끝난 뒤) 비로그인 → 가격 숨김
  // loading 동안에는 숨기지 않음(서버 렌더와 일치, hydration mismatch 방지)
  const hidePrice = PREOPEN_HIDE_PRICE && !loading && !user

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
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatPriceKo(price)}</span>
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
