import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: '상품 검색 | KN541',
  description: 'KN541 쇼핑몰에서 상품을 검색하세요.',
}

export default function PageSearch() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  )
}
