'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

// NOTE: v_user_full.user_type_name에서 동적으로 가져오는 것이 이상적이나,
// useAuth()의 user 객체는 JWT 페이로드 기반이라 user_type_name 필드가 없어(/me 미호출)
// 하드코딩 fallback을 유지한다. user_type 코드(001~008)는 거의 변경되지 않음.
/** 시스템 회원 유형 (표시명) — 006은 유료회원으로 통일 */
const USER_TYPE_LABEL: Record<string, string> = {
  '001': '관리자',
  '002': '일반회원',
  '003': '오프관리자',
  '004': '공급사',
  '005': '강사',
  '006': '유료회원',
  '008': '셀러',
}

export default function AccountHeaderInfo() {
  const t = useTranslations('Account')
  const { user, loading } = useAuth()
  const [effectiveType, setEffectiveType] = useState('')

  useEffect(() => {
    const fromJwt = (user?.user_type || '').trim()
    const fromLs = typeof window !== 'undefined' ? localStorage.getItem('user_type')?.trim() || '' : ''
    setEffectiveType(fromJwt || fromLs)
  }, [user?.user_type])

  const lineClass =
    'mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400'

  if (loading) {
    return <span className={lineClass}>{t('accountHeaderLoading')}</span>
  }

  if (!user?.user_id) {
    return <span className={lineClass}>{t('accountLoginPlease')}</span>
  }

  const displayName =
    user.name?.trim() ||
    user.username?.trim() ||
    user.email?.split('@')[0]?.trim() ||
    t('defaultDisplayName')

  const typeCode = (effectiveType || user.user_type || '').trim()
  const typeLabel =
    USER_TYPE_LABEL[typeCode] ||
    (typeCode ? t('memberTypeCode', { code: typeCode }) : t('memberTypeUnknown'))

  return (
    <span className={lineClass}>
      <span className="font-semibold text-neutral-900 dark:text-neutral-200">{displayName}</span>
      {' · '}
      {typeLabel}
    </span>
  )
}
