import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 빌드 에러 무시
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint 빌드 에러 무시
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 정적 페이지 생성 타임아웃 180초 (기본 60초)
  staticPageGenerationTimeout: 180,

  async redirects() {
    const pages = [
      'products',
      'vendor-inquiry',
      'cs/inquiry',
      'cs/notice',
      'faq',
      'contact',
      'about',
      'login',
      'signup',
      'mypage',
      'cart',
      'checkout',
      'search',
      'terms/order',
      'terms/delivery',
      'terms/return',
      'terms/point',
      'terms/membership',
      'terms/supplier',
      'terms/privacy',
      'terms/service',
    ]

    const redirects = []
    for (const page of pages) {
      redirects.push({
        source: `/${page}`,
        destination: `/ko/${page}`,
        permanent: false,
      })
      redirects.push({
        source: `/${page}/:path*`,
        destination: `/ko/${page}/:path*`,
        permanent: false,
      })
    }

    return redirects
  },

  images: {
    minimumCacheTTL: 2678400 * 12,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        // Supabase Storage — KN541 프로젝트
        protocol: 'https',
        hostname: 'qxmcbdqmmiyrrhenufaj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
