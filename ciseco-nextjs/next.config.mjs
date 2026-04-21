import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 180,

  async redirects() {
    const pages = [
      'products', 'vendor-inquiry', 'cs/inquiry', 'cs/notice', 'faq',
      'contact', 'about', 'login', 'signup', 'mypage', 'cart', 'checkout',
      'search', 'terms/order', 'terms/delivery', 'terms/return', 'terms/point',
      'terms/membership', 'terms/supplier', 'terms/privacy', 'terms/service',
    ]
    const redirects = []
    for (const page of pages) {
      redirects.push({ source: `/${page}`, destination: `/ko/${page}`, permanent: false })
      redirects.push({ source: `/${page}/:path*`, destination: `/ko/${page}/:path*`, permanent: false })
    }
    return redirects
  },

  images: {
    minimumCacheTTL: 2678400 * 12,
    // 외부 이미지 도메인 — 모든 https 도메인 허용 (공급사 이미지 서버 다양)
    remotePatterns: [
      { protocol: 'https', hostname: '**', port: '', pathname: '/**' },
      { protocol: 'http',  hostname: '**', port: '', pathname: '/**' },
    ],
  },
}

export default withNextIntl(nextConfig)
