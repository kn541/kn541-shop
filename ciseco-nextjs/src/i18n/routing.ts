import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  // always: 모든 URL에 locale prefix (/ko/products, /en/products)
  localePrefix: 'always',
})

export type AppLocale = (typeof routing.locales)[number]
