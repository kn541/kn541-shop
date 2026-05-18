'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import {
  getForceChangeSession,
  isAuthExemptPath,
  isPasswordReminderPending,
} from '@/lib/auth/passwordSession'
import { useEffect, type ReactNode } from 'react'

/**
 * 시나리오 B: 90일 권고 — 로그인 후 다른 페이지 접근 시 /password-reminder 로 유도
 * (시나리오 A는 access_token 없이 /force-change-password 만 허용)
 */
export default function PasswordRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isAuthExemptPath(pathname)) return

    const force = getForceChangeSession()
    if (force?.tempToken && !pathname.includes('/force-change-password')) {
      router.replace('/force-change-password')
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) return

    if (isPasswordReminderPending() && !pathname.includes('/password-reminder')) {
      router.replace('/password-reminder')
    }
  }, [pathname, router])

  return <>{children}</>
}
