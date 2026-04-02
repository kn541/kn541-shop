import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/** next-intl 로케일 감지·리다이렉트 미들웨어
 * - 기본 언어: ko (한국어)
 * - /en/* → 영어, 그 외 → 한국어
 */
export default createMiddleware(routing)

export const config = {
  // 언어 미들웨어 적용 경로 (_next, api, 정적 파일 등 제외)
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}
