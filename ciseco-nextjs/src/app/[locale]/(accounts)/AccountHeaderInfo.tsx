'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'

/** signup 페이지 회원유형 코드와 동일 */
const MEMBER_TYPE_LABELS: Record<string, string> = {
  '001': '본사',
  '002': '알레카서울',
  '003': '아산청아',
  '004': '울산태화강',
  '005': '부산대박',
  '006': '서초그린케어',
  '007': '인천주안',
  '008': '창원미라클',
  '009': '대구',
}

export default function AccountHeaderInfo() {
  const t = useTranslations('Account')
  const { user, loading } = useAuth()

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

  const typeLabel =
    MEMBER_TYPE_LABELS[user.user_type] ||
    (user.user_type
      ? t('memberTypeCode', { code: user.user_type })
      : t('memberTypeUnknown'))

  return (
    <span className={lineClass}>
      <span className="font-semibold text-neutral-900 dark:text-neutral-200">{displayName}</span>
      {' · '}
      {typeLabel}
    </span>
  )
}
