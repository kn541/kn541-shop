import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 언어 미들웨어 적용 경로
  // _next, api, 이미지 등 제외
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}
