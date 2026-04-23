'use client'

import AccountProfileClient from '@/components/mypage/AccountProfileClient'
import { useTranslations } from 'next-intl'

export default function AccountPage() {
  const t = useTranslations('Account')

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('profile')}</h1>
      <AccountProfileClient />
    </div>
  )
}
