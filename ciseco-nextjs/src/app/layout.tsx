import Aside from '@/components/aside'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
// 한국어 폰트: Noto Sans KR (KO), 영문 폰트: Poppins (EN)
import { Noto_Sans_KR, Poppins } from 'next/font/google'
import GlobalClient from './GlobalClient'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-kr',
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
    <html lang="ko" className={`${poppins.variable} ${notoSansKR.variable}`} suppressHydrationWarning>
      <body
        className={`${notoSansKR.className} bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200`}
      >
        <Aside.Provider>
          {children}
          <GlobalClient />
        </Aside.Provider>
      </body>
    </html>
  )
}
