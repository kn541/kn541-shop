'use client'
// KN541 쇼핑몰 — 로그인 페이지
// 로고: Supabase Storage white_logo.png (가로 400px, 비율 유지)

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL
const LOGO_URL = 'https://qxmcbdqmmiyrrhenufaj.supabase.co/storage/v1/object/public/brands/white_logo.png'

function KakaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.59 2 11.01c0 2.832 1.695 5.317 4.265 6.82l-1.08 3.962a.25.25 0 0 0 .373.277L9.97 19.76A11.6 11.6 0 0 0 12 19.02c5.523 0 10-3.59 10-8.01S17.523 3 12 3z" />
    </svg>
  )
}

function NaverIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

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
          router.push('/')
        } else {
          setError('로그인 정보를 받아오지 못했습니다.')
        }
      } catch {
        setError('서버 연결에 실패했습니다.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">

        {/* ── 회사 로고 (가로 400px 기준, 비율 유지) ── */}
        <div className="flex justify-center mb-8">
          <a href="/" className="block">
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

        {/* ── 카드 ─────────────────────────────────── */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 px-8 py-8">

          <h1 className="text-[22px] font-bold text-neutral-900 dark:text-white mb-6 text-center tracking-tight">
            로그인
          </h1>

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
              <a href="/forgot-password" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                비밀번호 찾기
              </a>
            </div>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-neutral-400 font-medium tracking-wide">
                간편 로그인
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => alert('카카오 로그인 연동 예정')}
              title="카카오톡으로 로그인"
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
            >
              <KakaoIcon />
            </button>
            <button
              type="button"
              onClick={() => alert('네이버 로그인 연동 예정')}
              title="네이버로 로그인"
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#03C75A', color: '#ffffff' }}
            >
              <NaverIcon />
            </button>
            <button
              type="button"
              onClick={() => alert('구글 로그인 연동 예정')}
              title="구글로 로그인"
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <GoogleIcon />
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          아직 계정이 없으신가요?{' '}
          <a href="/signup" className="font-semibold text-neutral-900 dark:text-white hover:underline">
            회원가입
          </a>
        </p>

      </div>
    </div>
  )
}
