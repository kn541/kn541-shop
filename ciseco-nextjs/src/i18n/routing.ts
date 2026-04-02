import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  // always: 모든 URL에 locale prefix 포함 (/ko/products, /en/products)
  // as-needed는 Vercel static cache와 충돌 → always로 변경
  localePrefix: 'always',
})

export type AppLocale = (typeof routing.locales)[number]
