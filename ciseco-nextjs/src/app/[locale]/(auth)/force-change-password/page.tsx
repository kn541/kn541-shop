'use client'

import { PasswordChangePanel } from '@/components/auth/PasswordChangePanel'
import {
  clearForceChangeSession,
  getForceChangeSession,
  persistLoginTokens,
} from '@/lib/auth/passwordSession'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const LOGO_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/brands/white_logo.png'

export default function ForceChangePasswordPage() {
  const router = useRouter()
  const [session, setSession] = useState<ReturnType<typeof getForceChangeSession>>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = getForceChangeSession()
    if (!s?.tempToken) {
      router.replace('/login')
      return
    }
    setSession(s)
    setReady(true)
  }, [router])

  useEffect(() => {
    const blockNav = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', blockNav)
    return () => window.removeEventListener('beforeunload', blockNav)
  }, [])

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <p className="text-sm text-neutral-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Image src={LOGO_URL} alt="KN541" width={200} height={67} className="h-auto w-[200px]" priority />
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white px-8 py-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-center text-xl font-bold text-neutral-900 dark:text-white">
            비밀번호 변경 필요
          </h1>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            현재 비밀번호가 보안 정책에 맞지 않습니다. 새 비밀번호를 설정해주세요.
          </p>
          <p className="mt-1 text-center text-xs text-neutral-500">
            8자리 이상, 숫자 또는 특수문자 포함 (한글 불가)
          </p>
          <div className="mt-6">
            <PasswordChangePanel
              variant="forced"
              tempToken={session.tempToken}
              requireCurrentPassword
              serverMessage={session.message}
              policyText="8자리 이상, 숫자 또는 특수문자 포함, 한글 불가"
              onComplete={({ access_token, refresh_token, user_type }) => {
                clearForceChangeSession()
                persistLoginTokens({ access_token, refresh_token, user_type })
                router.replace('/')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
