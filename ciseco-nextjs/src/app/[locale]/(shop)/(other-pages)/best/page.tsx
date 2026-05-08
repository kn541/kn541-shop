import ShopListingPageClient from '@/components/shop-listing/ShopListingPageClient'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '베스트 상품 | KN541',
  description: '최근 인기 상품과 누적 베스트 상품을 만나보세요.',
}

export default function BestProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kn541-green border-t-transparent" />
        </div>
      }
    >
      <ShopListingPageClient
        kind="best"
        title="베스트"
        description="최근 14일 인기 상품입니다. 데이터가 부족할 때는 누적 인기 상품으로 자동 보충됩니다."
      />
    </Suspense>
  )
}
