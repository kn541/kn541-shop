'use client'

import { useEffectiveUserType } from '@/hooks/useEffectiveUserType'
import { useLocale } from 'next-intl'
import type { ReactNode } from 'react'
import BackHeader from './BackHeader'
import LockedCard from './LockedCard'

interface Props {
  children: ReactNode
  title: string
  lockBenefits?: string[]
  /** (accounts) Ciseco 레이아웃 안에서 사용 시 BackHeader 생략 */
  embedded?: boolean
}

const DEFAULT_BENEFITS = [
  '수당·배당 현황 조회',
  '추천인 트리 · 내 쇼핑몰',
  '출금 신청',
]

/** 유료회원(user_type=006) 전용 페이지 가드 */
export default function L3Guard({ children, title, lockBenefits, embedded }: Props) {
  const locale = useLocale()
  const { loading, isPaidMember } = useEffectiveUserType()

  if (loading) {
    return (
      <>
        {!embedded && <BackHeader title={title} />}
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--mp-color-text-muted)' }}>
          불러오는 중…
        </div>
      </>
    )
  }

  if (!isPaidMember) {
    return (
      <>
        {!embedded && <BackHeader title={title} />}
        <div style={{ padding: 16 }}>
          <LockedCard
            icon="🔒"
            label={title}
            reason="유료회원 전용 메뉴입니다. 유료회원으로 전환하시면 이용하실 수 있습니다."
            benefitList={lockBenefits ?? DEFAULT_BENEFITS}
            actionLabel="유료회원 전환"
            actionHref={`/${locale}/upgrade-paid`}
          />
        </div>
      </>
    )
  }

  return <>{children}</>
}
