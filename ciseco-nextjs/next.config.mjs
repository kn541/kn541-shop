import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // localePrefix: 'always' 설정으로 모든 페이지가 /ko/ prefix 필요
  // prefix 없는 URL 접근 시 /ko/ 로 redirect (Vercel static cache 충돌 우회)
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
      // 정확한 경로
      redirects.push({
        source: `/${page}`,
        destination: `/ko/${page}`,
        permanent: false,
      })
      // 하위 경로
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
    ],
  },
}

export default withNextIntl(nextConfig)
