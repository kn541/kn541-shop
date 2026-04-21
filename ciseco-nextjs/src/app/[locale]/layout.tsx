// 빌드 시 API 호출로 인한 SSG 타임아웃 방지 — 전체 locale 라우트 dynamic 처리
export const dynamic = 'force-dynamic'

import { CartProvider } from '@/lib/cart-context'
import { routing } from '@/i18n/routing'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'ko' | 'en')) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {/* ★ CartProvider: 전체 locale 범위에서 장바구니 전역 상태 공유 */}
      <CartProvider>
        {children}
      </CartProvider>
    </NextIntlClientProvider>
  )
}
