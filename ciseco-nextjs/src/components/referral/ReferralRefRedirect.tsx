'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * shop.kn541.co.kr?ref={member_no} → /{locale}/signup?ref=… 로 이동 (회원가입 추천인 연결)
 */
export default function ReferralRefRedirect() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const ref = searchParams.get('ref')?.trim()
    if (!ref) return

    const segments = pathname.split('/').filter(Boolean)
    const locale = segments[0]
    if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
      return
    }

    const rest = segments.slice(1)
    const isHome = rest.length === 0
    if (!isHome) return

    const q = new URLSearchParams(searchParams.toString())
    router.replace(`/signup?${q.toString()}`)
  }, [pathname, router, searchParams])

  return null
}
