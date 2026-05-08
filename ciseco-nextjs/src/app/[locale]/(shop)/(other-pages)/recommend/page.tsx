import ShopListingPageClient from '@/components/shop-listing/ShopListingPageClient'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '추천 상품 | KN541',
  description: '운영자 추천 상품을 카테고리별로 고르게 소개합니다.',
}

export default function RecommendProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kn541-green border-t-transparent" />
        </div>
      }
    >
      <ShopListingPageClient
        kind="recommend"
        title="추천"
        description="1차 카테고리별로 골고루 섞인 추천 상품입니다."
      />
    </Suspense>
  )
}
