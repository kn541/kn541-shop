'use client'
// KN541 쇼핑몰 — 관리자 대리접속(Impersonate) 자동 로그인 페이지
// 어드민에서 "접속" 버튼 클릭 시 ?token=xxx 파라미터로 진입
// 토큰을 저장하고 마이페이지로 리다이렉트
//
// 2026-06-19 신규 생성

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { persistLoginTokens } from '@/lib/auth/passwordSession'
import { persistHeaderUserCache } from '@/lib/auth/headerUser'
import { apiUrl } from '@/lib/api/base'

function AutoLoginHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('접속 중...')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('토큰이 없습니다.')
      return
    }

    async function doAutoLogin(accessToken: string) {
      try {
        // 1. 토큰 저장
        persistLoginTokens({
          access_token: accessToken,
          refresh_token: '',
          user_type: '006', // 기본 유료회원 — /auth/me에서 갱신됨
        })

        // 2. /auth/me로 사용자 정보 조회
        const res = await fetch(apiUrl('/auth/me'), {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (res.ok) {
          const json = await res.json()
          const d = json?.data ?? {}
          // user_type 갱신
          if (d.user_type) {
            persistLoginTokens({
              access_token: accessToken,
              refresh_token: '',
              user_type: d.user_type,
            })
          }
          // 헤더 캐시 갱신
          if (d.member_no) {
            persistHeaderUserCache(null, String(d.member_no))
          }
        }

        // 3. 마이페이지로 리다이렉트
        setStatus('로그인 성공! 이동 중...')
        router.replace('/mypage')
      } catch (err) {
        console.error('[auto-login] error:', err)
        setStatus('자동 로그인에 실패했습니다.')
      }
    }

    doAutoLogin(token)
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{status}</p>
      </div>
    </div>
  )
}

export default function AutoLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
          <p className="text-sm text-neutral-400">로딩 중...</p>
        </div>
      }
    >
      <AutoLoginHandler />
    </Suspense>
  )
}
