'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

/**
 * /signup/paid → /signup?type=paid 로 통일 (창업·유료 회원 가입 플로우)
 */
export default function SignupPaidRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/signup?type=paid')
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
      <p className="text-sm text-neutral-500">회원가입 페이지로 이동 중...</p>
    </div>
  )
}
