// KN541 Shop — next-intl 미들웨어
// 모든 요청에 대해 locale prefix를 자동 처리 (ko/en/zh)
// localePrefix: 'always' 설정에 따라 /myshop → /ko/myshop 자동 리다이렉트

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // API 라우트, Next.js 내부, 정적 파일 제외
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
