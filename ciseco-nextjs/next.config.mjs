import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // /products → /ko/products 하드 redirect
  // next-intl 미들웨어 rewrite가 Vercel static cache와 충돌하는 문제 우회
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/ko/products',
        permanent: false,
      },
      {
        source: '/products/:path*',
        destination: '/ko/products/:path*',
        permanent: false,
      },
    ]
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
