'use client'
/**
 * 관리자 대리접속 자동로그인 페이지
 * URL: /auto-login?token=xxx
 *
 * 어드민에서 회원 대리접속 시 이 페이지로 새 창이 열리고,
 * token을 localStorage에 저장한 후 마이페이지로 이동합니다.
 *
 * 보안: 토큰은 1시간 만료, impersonated_by 필드로 감사 추적
 */
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { clearHeaderUserCache } from '@/lib/auth/headerUser'

export default function AutoLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      return
    }

    // 기존 세션 초기화
    clearHeaderUserCache()

    // 토큰 저장
    localStorage.setItem('access_token', token)

    // 마이페이지(내정보)로 이동
    router.replace('/account')
  }, [searchParams, router])

  if (status === 'error') {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', flexDirection: 'column', gap: '16px',
      }}>
        <p style={{ fontSize: '18px', color: '#e53e3e' }}>
          유효하지 않은 접속 링크입니다.
        </p>
        <p style={{ fontSize: '14px', color: '#888' }}>
          관리자 페이지에서 다시 시도해주세요.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: 40, height: 40, border: '4px solid #e2e8f0',
        borderTopColor: '#3182ce', borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ fontSize: '16px', color: '#555' }}>접속 중...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
