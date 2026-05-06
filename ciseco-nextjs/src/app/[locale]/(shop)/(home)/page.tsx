export const dynamic = 'force-dynamic'

import MainPageBody from '@/components/main-page/MainPageBody'
import { MainPageCartProvider } from '@/components/main-page/main-cart-preview-context'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'MainPage' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: ['KN541', '쇼핑몰', 'Next.js', 'e-commerce'],
  }
}

export default async function PageHome() {
  return (
    <MainPageCartProvider>
      <MainPageBody />
    </MainPageCartProvider>
  )
}
