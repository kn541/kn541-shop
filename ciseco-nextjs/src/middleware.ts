import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * KN541 쇼핑몰 — next-intl 로케일 미들웨어
 * - 기본 언어: ko (한국어) — URL prefix 없음
 * - /en/* → 영어
 * - proxy.ts는 비워두고 이 파일에서 단독 관리
 */
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}
