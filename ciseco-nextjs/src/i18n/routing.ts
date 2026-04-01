import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // 지원 언어 목록
  locales: ['ko', 'en'],
  // 기본 언어 = 한국어
  defaultLocale: 'ko',
  // 기본 언어는 URL에 prefix 없음 (/ = 한국어, /en/ = 영어)
  localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]
