import ShopListingPageClient from '@/components/shop-listing/ShopListingPageClient'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '신상품 | KN541',
  description: '새로 등록된 상품을 가장 빠르게 만나보세요.',
}

export default function NewProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-kn541-green border-t-transparent" />
        </div>
      }
    >
      <ShopListingPageClient kind="new" title="신상품" description="최근 등록된 상품입니다." />
    </Suspense>
  )
}
