import { Metadata } from 'next'
import { Suspense } from 'react'
import MyShopPublicView from '@/components/myshop/MyShopPublicView'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>
}): Promise<Metadata> {
  const { code } = await params
  return {
    title: `분양몰 | ${code}`,
    description: 'KN541 분양몰',
  }
}

function LoadingFallback() {
  return (
    <div className="flex justify-center py-32">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )
}

export default async function MyShopPublicPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>
}) {
  const { locale, code } = await params
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyShopPublicView code={code} locale={locale} />
    </Suspense>
  )
}
