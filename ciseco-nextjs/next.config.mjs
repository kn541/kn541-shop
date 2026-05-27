import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 180,

  // 수동 redirects 제거 — middleware.ts가 next-intl locale 라우팅을 자동 처리
  // 기존: /mypage → /ko/mypage 등 20개 수동 리다이렉트
  // 문제: myshop, commission 등 누락 + middleware와 충돌 가능
  // 해결: middleware.ts의 createMiddleware(routing)이 전체 처리

  images: {
    minimumCacheTTL: 2678400 * 12,
    remotePatterns: [
      { protocol: 'https', hostname: '**', port: '', pathname: '/**' },
      { protocol: 'http',  hostname: '**', port: '', pathname: '/**' },
    ],
  },
}

export default withNextIntl(nextConfig)
