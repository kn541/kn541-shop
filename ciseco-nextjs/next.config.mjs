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

  // /auto-login → /ko/auto-login 리다이렉트 (어드민 대리접속용)
  // locale prefix 없이 들어오는 요청을 자동으로 /ko/ 붙여서 보냄
  async redirects() {
    return [
      {
        source: '/auto-login',
        destination: '/ko/auto-login',
        permanent: false,
      },
    ]
  },

  images: {
    minimumCacheTTL: 2678400 * 12,
    remotePatterns: [
      // HTTPS: 외부 CDN/스토리지 전체 허용 (Supabase, S3 등 프로덕션 이미지)
      { protocol: 'https', hostname: '**', port: '', pathname: '/**' },
      // HTTP: 로컬 개발 환경만 허용 (외부 http 이미지 차단)
      { protocol: 'http', hostname: 'localhost', port: '', pathname: '/**' },
    ],
  },
}

export default withNextIntl(nextConfig)
