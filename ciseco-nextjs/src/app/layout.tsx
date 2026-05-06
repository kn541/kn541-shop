import Aside from '@/components/aside'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
// 영문·숫자 보조: Poppins (변수). 본문 한글: Pretendard (CDN + tailwind.css body)
import { Poppins } from 'next/font/google'
import GlobalClient from './GlobalClient'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    template: '%s - KN541',
    default: 'KN541',
  },
  description: 'KN541 쇼핑몰',
  keywords: ['Next.js', 'Tailwind CSS', 'TypeScript', 'KN541', 'E-commerce', '이커머스', '쇼핑'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={poppins.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
        <Aside.Provider>
          {children}
          <GlobalClient />
        </Aside.Provider>
      </body>
    </html>
  )
}
