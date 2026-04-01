import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/** next-intl 로케일 감지·리다이렉트 (Next.js 16 — proxy.ts가 미들웨어 역할) */
export default createMiddleware(routing)

export const config = {
  // 언어 미들웨어 적용 경로 (_next, api, 정적 파일 등 제외)
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}
