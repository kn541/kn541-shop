'use client'
// KN541 쇼핑몰 — 로그인 페이지
// 비밀번호: 정책 미충족 → /force-change-password, 90일 경과 → /password-reminder

import { Suspense, useState, useTransition } from 'react'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import {
  persistLoginTokens,
  setForceChangeSession,
  setPasswordReminderPending,
} from '@/lib/auth/passwordSession'

const BASE = process.env.NEXT_PUBLIC_API_URL
const LOGO_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/brands/white_logo.png'

function LoginForm() {
  const router = useRouter()
  const t = useTranslations('Auth')
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('회원번호(아이디), 이메일, 또는 휴대폰과 비밀번호를 입력해주세요.')
      return
    }
    startTransition(async () => {
      try {
        if (!BASE) {
          setError('API 서버 주소가 설정되지 않았습니다.')
          return
        }
        const res = await fetch(`${BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json?.detail ?? '로그인에 실패했습니다.')
          return
        }

        const d = json?.data ?? {}

        if (json?.status === 'password_change_required' || d.force_change === true) {
          const token = typeof d.temp_token === 'string' ? d.temp_token : ''
          if (!token) {
            setError('비밀번호 변경이 필요하지만 임시 토큰을 받지 못했습니다.')
            return
          }
          setForceChangeSession(
            token,
            typeof d.message === 'string' ? d.message : undefined
          )
          router.replace('/force-change-password')
          return
        }

        const { access_token, refresh_token, user_type } = d
        if (!access_token) {
          setError('로그인 정보를 받아오지 못했습니다.')
          return
        }

        persistLoginTokens({ access_token, refresh_token, user_type })

        if (d.password_expired === true) {
          const days = Number(d.days_since_change ?? 0)
          setPasswordReminderPending(Number.isFinite(days) ? days : 90)
          router.replace('/password-reminder')
          return
        }

        router.push(redirectTo)
      } catch {
        setError('서버 연결에 실패했습니다.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="회원번호(8자리) · 아이디 · 이메일 · 휴대폰"
        autoComplete="username"
        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="비밀번호"
        autoComplete="current-password"
        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />

      {error && (
        <p className="text-xs text-red-500 text-center pt-0.5">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold py-3 text-sm hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {isPending ? '로그인 중...' : '로그인'}
      </button>

      <div className="mt-0.5 text-center text-xs text-neutral-400 dark:text-neutral-500">
        <Link href="/forgot-username" className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          {t('findUsernameLink')}
        </Link>
        <span className="mx-1.5 text-neutral-300 dark:text-neutral-600" aria-hidden>
          |
        </span>
        <Link href="/forgot-password" className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          {t('forgotPasswordLink')}
        </Link>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <div className="flex justify-center mb-8">
          <a href="/ko" className="block">
            <Image
              src={LOGO_URL}
              alt="KN541"
              width={400}
              height={133}
              style={{ width: '200px', height: 'auto' }}
              className="object-contain"
              priority
            />
          </a>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 px-8 py-8">
          <h1 className="text-[22px] font-bold text-neutral-900 dark:text-white mb-6 text-center tracking-tight">
            로그인
          </h1>
          <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-neutral-400">로딩 중...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          아직 계정이 없으신가요?{' '}
          <a href="/ko/signup" className="font-semibold text-neutral-900 dark:text-white hover:underline">
            회원가입
          </a>
        </p>
      </div>
    </div>
  )
}
