'use client'
// KN541 쇼핑몰 — 로그인 페이지
// fix: 간편로그인(카카오·네이버·구글) 섹션 전체 삭제

import { Suspense, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL
const LOGO_URL = 'https://ghtkropmnrelkxivzpim.supabase.co/storage/v1/object/public/brands/white_logo.png'

// useSearchParams를 사용하는 실제 폼 컴포넌트 — Suspense 안에서만 렌더링
function LoginForm() {
  const router = useRouter()
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
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    startTransition(async () => {
      try {
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
        const { access_token, refresh_token } = json?.data ?? {}
        if (access_token) {
          localStorage.setItem('access_token', access_token)
          if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
          try {
            const part = access_token.split('.')[1]
            if (part) {
              const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
              const ut = payload?.user_type
              if (ut != null && String(ut) !== '') localStorage.setItem('user_type', String(ut))
              else localStorage.removeItem('user_type')
            }
          } catch {
            localStorage.removeItem('user_type')
          }
          router.push(redirectTo)
        } else {
          setError('로그인 정보를 받아오지 못했습니다.')
        }
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
        placeholder="아이디 또는 이메일"
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

      <div className="text-right mt-0.5">
        <a href="/ko/forgot-password" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          비밀번호 찾기
        </a>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">

        {/* 로고 */}
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

        {/* 카드 */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 px-8 py-8">
          <h1 className="text-[22px] font-bold text-neutral-900 dark:text-white mb-6 text-center tracking-tight">
            로그인
          </h1>

          <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-neutral-400">로딩 중...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* 회원가입 링크 */}
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
