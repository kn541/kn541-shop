'use client'
// M6-FE: 유료회원 전환 CTA 배너(PaidUpgradeBanner) 추가
// - 002(일반회원)에게만 h1 아래에 노출
// - 006(유료)·그 외는 배너 렌더링 없음(PaidUpgradeBanner 내부 처리)

import AccountProfileClient from '@/components/mypage/AccountProfileClient'
import PaidUpgradeBanner from '@/components/mypage/PaidUpgradeBanner'
import { useTranslations } from 'next-intl'

export default function AccountPage() {
  const t = useTranslations('Account')

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('profile')}</h1>
      {/* 유료전환 CTA — 002(일반회원)에게만 노출, 006·그 외는 null */}
      <PaidUpgradeBanner />
      <AccountProfileClient />
    </div>
  )
}
