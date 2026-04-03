import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * KN541 쇼핑몰 — next-intl 로케일 미들웨어 (Next.js 16: proxy.ts 사용)
 * - 기본 언어: ko (한국어) — URL prefix 없음
 * - /en/* → 영어
 * - middleware.ts 와 proxy.ts 동시 존재 불가 → proxy.ts만 사용
 */
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\..*).*)'],
}
