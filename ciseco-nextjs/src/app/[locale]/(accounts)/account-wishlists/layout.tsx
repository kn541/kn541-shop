import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '위시리스트',
  description: '저장한 상품 목록',
}

export default function AccountWishlistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
