import ShopListingPageClient from '@/components/shop-listing/ShopListingPageClient'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '사전예약 | KN541',
  description: '지금 예약하고 먼저 만나보는 사전예약 상품.',
}

export default function PreorderProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kn541-green border-t-transparent" />
        </div>
      }
    >
      <ShopListingPageClient
        kind="preorder"
        title="사전예약"
        description="진행 중인 예약 상품입니다."
      />
    </Suspense>
  )
}
