import ShopListingPageClient from '@/components/shop-listing/ShopListingPageClient'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '밸류업 | KN541',
  description: '가성비 밸류업 특가 상품 모음.',
}

export default function ValueUpProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kn541-green border-t-transparent" />
        </div>
      }
    >
      <ShopListingPageClient
        kind="value-up"
        title="밸류업"
        description="밸류업 특가 상품입니다."
      />
    </Suspense>
  )
}
