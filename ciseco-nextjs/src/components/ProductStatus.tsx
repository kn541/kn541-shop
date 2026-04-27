// KN541 상품 상태 뱃지
// fix: 영어 status값 → 한국어 매핑 (In Stock, Sold Out, New in, Best Seller 등)

import { ClockIcon, NoSymbolIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'
import IconDiscount from './IconDiscount'

interface Props {
  status?: string
  className?: string
}

// ★ 영어 → 한국어 상태 매핑
const STATUS_MAP: Record<string, { label: string; icon?: 'sparkles' | 'no-symbol' | 'clock' | 'discount' | 'tag' }> = {
  // 영어 원본값
  'New in':        { label: '신상품', icon: 'sparkles' },
  'Best Seller':   { label: '베스트', icon: 'sparkles' },
  'In Stock':      { label: '판매중', icon: 'tag' },
  'Sold Out':      { label: '품절', icon: 'no-symbol' },
  'Trending':      { label: '인기', icon: 'sparkles' },
  'Limited Edition': { label: '한정판', icon: 'clock' },
  'limited edition': { label: '한정판', icon: 'clock' },
  'Sale':          { label: '할인', icon: 'discount' },
  '50% Discount':  { label: '50% 할인', icon: 'discount' },
  // 한국어 값 (어댑터에서 이미 한국어로 온 경우)
  '신상품':  { label: '신상품', icon: 'sparkles' },
  '베스트':  { label: '베스트', icon: 'sparkles' },
  '할인':    { label: '할인', icon: 'discount' },
  '품절':    { label: '품절', icon: 'no-symbol' },
  '판매종료': { label: '판매종료', icon: 'no-symbol' },
  '판매중':  { label: '판매중', icon: 'tag' },
}

const ProductStatus: FC<Props> = ({
  status = '',
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
}) => {
  if (!status) return null

  const mapped = STATUS_MAP[status]
  // 매핑이 없거나 '판매중'/'In Stock'은 뱃지 표시 안 함 (정상 판매 상태)
  if (!mapped || status === 'In Stock' || status === '판매중') return null

  const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`
  const label = mapped.label

  const renderIcon = () => {
    switch (mapped.icon) {
      case 'sparkles':  return <SparklesIcon className="h-3.5 w-3.5" />
      case 'no-symbol': return <NoSymbolIcon className="h-3.5 w-3.5" />
      case 'clock':     return <ClockIcon className="h-3.5 w-3.5" />
      case 'discount':  return <IconDiscount className="h-3.5 w-3.5" />
      case 'tag':       return <TagIcon className="h-3.5 w-3.5" />
      default:          return null
    }
  }

  return (
    <div className={classes}>
      {renderIcon()}
      <span className="ms-1 leading-none">{label}</span>
    </div>
  )
}

export default ProductStatus
