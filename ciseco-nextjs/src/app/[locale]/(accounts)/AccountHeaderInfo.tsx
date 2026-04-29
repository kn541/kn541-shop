'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

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
