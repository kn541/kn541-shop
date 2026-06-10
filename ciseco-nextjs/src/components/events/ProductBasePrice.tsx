'use client'

import Prices from '@/components/Prices'
import { usePreopenHidePrice } from '@/lib/preopenPrice'

interface Props {
  salePrice: number
  consumerPrice: number
  discountRate: number
}

// 상품상세 기본 가격 표시(이벤트 미적용 fallback) — 클라이언트 컴포넌트.
// 판매가는 Prices가 프리오픈 숨김을 처리하고, 할인율(%)·취소선 정가는
// usePreopenHidePrice로 비로그인 시 함께 숨긴다.
export default function ProductBasePrice({ salePrice, consumerPrice, discountRate }: Props) {
  const hidePrice = usePreopenHidePrice()
  const showStrike = !hidePrice && consumerPrice > 0 && consumerPrice > salePrice

  return (
    <div className="flex items-end gap-3">
      {!hidePrice && discountRate > 0 && (
        <span className="text-2xl font-bold text-red-500">{discountRate}%</span>
      )}
      <Prices contentClass="text-3xl font-bold" price={salePrice} />
      {showStrike && (
        <span className="text-base text-neutral-400 line-through mb-0.5">
          {consumerPrice.toLocaleString('ko-KR')}원
        </span>
      )}
    </div>
  )
}
