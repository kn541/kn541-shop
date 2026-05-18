'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'

/**
 * /signup/paid → /signup?type=paid 로 통일 (창업·유료 회원 가입 플로우)
 */
export default function SignupPaidRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const q = new URLSearchParams({ type: 'paid' })
    const ref = searchParams.get('ref')?.trim()
    if (ref) q.set('ref', ref)
    router.replace(`/signup?${q.toString()}`)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
      <p className="text-sm text-neutral-500">회원가입 페이지로 이동 중...</p>
    </div>
  )
}
